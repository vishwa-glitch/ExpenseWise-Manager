import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface BudgetsState {
  budgets: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
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

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: any) => {
    const response = await apiService.createBudget(budgetData);
    return response;
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
        state.budgets = action.payload.budgets;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
      })
      // Create budget
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload.budget);
      });
  },
});

export const { clearError } = budgetsSlice.actions;
export default budgetsSlice.reducer;