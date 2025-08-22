import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface BudgetStatusData {
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  daysLeft: number;
  isOverBudget: boolean;
  budgetCount: number;
  overBudgetAmount?: number;
}

interface BudgetsState {
  budgets: any[];
  selectedBudget: any | null;
  budgetStatus: BudgetStatusData | null;
  budgetStatusLoading: boolean;
  budgetStatusError: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  selectedBudget: null,
  budgetStatus: null,
  budgetStatusLoading: false,
  budgetStatusError: null,
  isLoading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async () => {
    const response = await apiService.getBudgets();
    return response;
  }
);

export const fetchBudget = createAsyncThunk(
  'budgets/fetchBudget',
  async (id: string) => {
    const response = await apiService.getBudget(id);
    return response;
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: any) => {
    const response = await apiService.createBudget(budgetData);
    return response;
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await apiService.updateBudget(id, data);
    return response;
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string) => {
    await apiService.deleteBudget(id);
    return id;
  }
);

export const toggleBudget = createAsyncThunk(
  'budgets/toggleBudget',
  async ({ id, isActive }: { id: string; isActive: boolean }) => {
    const response = await apiService.toggleBudget(id, isActive);
    return response;
  }
);

// Helper function to calculate budget status from budget data
const calculateBudgetStatus = (budgets: any[]): BudgetStatusData => {
  if (!budgets || budgets.length === 0) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      percentage: 0,
      daysLeft: 0,
      isOverBudget: false,
      budgetCount: 0,
    };
  }

  const activeBudgets = budgets.filter(budget => budget.is_active !== false);
  const totalBudget = activeBudgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
  const totalSpent = activeBudgets.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0);
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const isOverBudget = totalSpent > totalBudget;
  const overBudgetAmount = isOverBudget ? totalSpent - totalBudget : undefined;

  // Calculate days left in current month
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(0, lastDayOfMonth.getDate() - now.getDate());

  return {
    totalBudget,
    totalSpent,
    percentage,
    daysLeft,
    isOverBudget,
    budgetCount: activeBudgets.length,
    overBudgetAmount,
  };
};

export const fetchBudgetStatus = createAsyncThunk(
  'budgets/fetchBudgetStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getBudgets();
      const budgets = response.budgets || [];
      return calculateBudgetStatus(budgets);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch budget status');
    }
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBudget: (state, action) => {
      state.selectedBudget = action.payload;
    },
    fetchBudgetStatusStart: (state) => {
      state.budgetStatusLoading = true;
      state.budgetStatusError = null;
    },
    fetchBudgetStatusSuccess: (state, action) => {
      state.budgetStatus = action.payload;
      state.budgetStatusLoading = false;
      state.budgetStatusError = null;
    },
    fetchBudgetStatusFailure: (state, action) => {
      state.budgetStatusError = action.payload;
      state.budgetStatusLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload.budgets || [];
        // Automatically calculate budget status when budgets are fetched
        state.budgetStatus = calculateBudgetStatus(state.budgets);
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
        state.budgets = [];
        state.budgetStatus = calculateBudgetStatus([]);
      })
      // Fetch single budget
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.selectedBudget = action.payload.budget;
      })
      // Create budget
      .addCase(createBudget.fulfilled, (state, action) => {
        const newBudget = action.payload.budget || action.payload;
        if (newBudget) {
          state.budgets.push(newBudget);
          // Recalculate budget status when new budget is created
          state.budgetStatus = calculateBudgetStatus(state.budgets);
        }
      })
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const updatedBudget = action.payload.budget || action.payload;
        if (updatedBudget) {
          const index = state.budgets.findIndex(b => b.id === updatedBudget.id);
          if (index !== -1) {
            state.budgets[index] = updatedBudget;
          }
          
          // Also update selected budget if it matches
          if (state.selectedBudget && state.selectedBudget.id === updatedBudget.id) {
            state.selectedBudget = updatedBudget;
          }

          // Recalculate budget status when budget is updated
          state.budgetStatus = calculateBudgetStatus(state.budgets);
        }
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter(b => b.id !== action.payload);
        if (state.selectedBudget && state.selectedBudget.id === action.payload) {
          state.selectedBudget = null;
        }
        // Recalculate budget status when budget is deleted
        state.budgetStatus = calculateBudgetStatus(state.budgets);
      })
      // Toggle budget
      .addCase(toggleBudget.fulfilled, (state, action) => {
        const updatedBudget = action.payload.budget || action.payload;
        if (updatedBudget) {
          const index = state.budgets.findIndex(b => b.id === updatedBudget.id);
          if (index !== -1) {
            state.budgets[index] = updatedBudget;
          }
          
          // Also update selected budget if it matches
          if (state.selectedBudget && state.selectedBudget.id === updatedBudget.id) {
            state.selectedBudget = updatedBudget;
          }

          // Recalculate budget status when budget is toggled
          state.budgetStatus = calculateBudgetStatus(state.budgets);
        }
      })
      // Fetch budget status
      .addCase(fetchBudgetStatus.pending, (state) => {
        state.budgetStatusLoading = true;
        state.budgetStatusError = null;
      })
      .addCase(fetchBudgetStatus.fulfilled, (state, action) => {
        state.budgetStatus = action.payload;
        state.budgetStatusLoading = false;
        state.budgetStatusError = null;
      })
      .addCase(fetchBudgetStatus.rejected, (state, action) => {
        state.budgetStatusError = action.payload as string || 'Failed to fetch budget status';
        state.budgetStatusLoading = false;
      });
  },
});

export const { 
  clearError, 
  setSelectedBudget, 
  fetchBudgetStatusStart, 
  fetchBudgetStatusSuccess, 
  fetchBudgetStatusFailure 
} = budgetsSlice.actions;
export default budgetsSlice.reducer;