import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface AnalyticsState {
  spendingTrends: any[];
  categoryBreakdown: any[];
  dashboardInsights: any | null;
  weeklyReport: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  spendingTrends: [],
  categoryBreakdown: [],
  dashboardInsights: null,
  weeklyReport: null,
  isLoading: false,
  error: null,
};

export const fetchSpendingTrends = createAsyncThunk(
  'analytics/fetchSpendingTrends',
  async (months: number = 6) => {
    const response = await apiService.getSpendingTrends(months);
    return response;
  }
);

export const fetchCategoryBreakdown = createAsyncThunk(
  'analytics/fetchCategoryBreakdown',
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await apiService.getCategoryBreakdown(startDate, endDate);
    return response;
  }
);

export const fetchDashboardInsights = createAsyncThunk(
  'analytics/fetchDashboardInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDashboardInsights();
      return response;
    } catch (error: any) {
      // Handle 404 errors gracefully for dashboard insights
      if (error.response?.status === 404) {
        console.log('📊 Dashboard insights endpoint not available (404) - using fallback data');
        return {
          overview: {
            monthly_income: 0,
            monthly_expenses: 0,
            monthly_savings: 0,
            savings_rate: 0,
            active_recommendations: 0,
            active_goals: 0,
            active_budgets: 0,
          },
          spending_trend: null,
          top_categories: [],
          upcoming_bills: [],
        };
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWeeklyReport = createAsyncThunk(
  'analytics/fetchWeeklyReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWeeklyReport();
      return response;
    } catch (error: any) {
      // Handle 404 errors gracefully
      if (error.response?.status === 404) {
        console.log('📊 Weekly report endpoint not available (404) - using fallback data');
        return null;
      }
      return rejectWithValue(error.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch spending trends
      .addCase(fetchSpendingTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpendingTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spendingTrends = action.payload.trends || [];
      })
      .addCase(fetchSpendingTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch spending trends';
      })
      // Fetch category breakdown
      .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
        state.categoryBreakdown = action.payload.breakdown || [];
      })
      // Fetch dashboard insights
      .addCase(fetchDashboardInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardInsights = action.payload;
      })
      .addCase(fetchDashboardInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch dashboard insights';
        // Set fallback data on error
        state.dashboardInsights = {
          overview: {
            monthly_income: 0,
            monthly_expenses: 0,
            monthly_savings: 0,
            savings_rate: 0,
            active_recommendations: 0,
            active_goals: 0,
            active_budgets: 0,
          },
          spending_trend: null,
          top_categories: [],
          upcoming_bills: [],
        };
      })
      // Fetch weekly report
      .addCase(fetchWeeklyReport.fulfilled, (state, action) => {
        state.weeklyReport = action.payload;
      })
      .addCase(fetchWeeklyReport.rejected, (state, action) => {
        state.weeklyReport = null;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;