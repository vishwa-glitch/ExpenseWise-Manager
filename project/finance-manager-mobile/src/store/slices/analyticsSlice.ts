import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

export type TimePeriod = 'weekly' | 'monthly' | '6months' | 'yearly';

interface SpendingTrendData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity: number) => string;
    strokeWidth: number;
  }>;
  period: TimePeriod;
  totalSpending: number;
  changePercentage: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
}

interface CategoryBreakdownData {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  period: TimePeriod;
  totalAmount: number;
}

interface HealthItem {
  type: 'success' | 'warning' | 'error';
  text: string;
  amount?: number;
}

interface WeeklyStats {
  thisWeek: number;
  budget: number;
  lastWeek: number;
  monthlyAvg: number;
  overBudget: number;
  changeFromLastWeek: number;
  changeFromMonthlyAvg: number;
}

interface WeeklyHealthData {
  overallScore: number;
  maxScore: number;
  achievements: HealthItem[];
  warnings: HealthItem[];
  issues: HealthItem[];
  weeklyStats: WeeklyStats;
  nextWeekGoal: number;
  dataAvailability: {
    hasTransactions: boolean;
    hasBudgets: boolean;
    hasGoals: boolean;
  };
}

interface AnalyticsState {
  spendingTrends: any[];
  categoryBreakdown: any[];
  dashboardInsights: any | null;
  weeklyReport: any | null;
  weeklyHealth: WeeklyHealthData | null;
  weeklyHealthLoading: boolean;
  weeklyHealthError: string | null;
  selectedTimePeriod: TimePeriod;
  spendingTrendsByPeriod: Record<TimePeriod, SpendingTrendData | null>;
  categoryBreakdownByPeriod: Record<TimePeriod, CategoryBreakdownData | null>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  spendingTrends: [],
  categoryBreakdown: [],
  dashboardInsights: null,
  weeklyReport: null,
  weeklyHealth: null,
  weeklyHealthLoading: false,
  weeklyHealthError: null,
  selectedTimePeriod: 'monthly',
  spendingTrendsByPeriod: {
    weekly: null,
    monthly: null,
    '6months': null,
    yearly: null,
  },
  categoryBreakdownByPeriod: {
    weekly: null,
    monthly: null,
    '6months': null,
    yearly: null,
  },
  isLoading: false,
  isRefreshing: false,
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

export const fetchSpendingTrendsByPeriod = createAsyncThunk(
  'analytics/fetchSpendingTrendsByPeriod',
  async (period: TimePeriod, { rejectWithValue }) => {
    try {
      const months = period === '6months' ? 6 : period === 'yearly' ? 12 : 1;
      const response = await apiService.getSpendingTrends(months);
      return { period, data: response };
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`📊 Spending trends for ${period} not available (404) - using fallback data`);
        return { period, data: null };
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryBreakdownByPeriod = createAsyncThunk(
  'analytics/fetchCategoryBreakdownByPeriod',
  async ({ period, startDate, endDate }: { period: TimePeriod; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategoryBreakdown(startDate, endDate);
      return { period, data: response };
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`📊 Category breakdown for ${period} not available (404) - using fallback data`);
        return { period, data: null };
      }
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to generate fallback weekly health data from dashboard insights
const generateWeeklyHealthFromDashboard = (dashboardInsights: any): WeeklyHealthData => {
  const overview = dashboardInsights?.overview || {};
  const monthlyExpenses = overview.monthly_expenses || 0;
  const weeklySpending = Math.round(monthlyExpenses / 4);
  const monthlyBudget = monthlyExpenses * 1.2; // Assume 20% buffer
  const weeklyBudget = Math.round(monthlyBudget / 4);
  
  // Generate basic health score based on spending vs budget
  const spendingRatio = weeklyBudget > 0 ? weeklySpending / weeklyBudget : 0;
  const overallScore = Math.max(0, Math.min(100, Math.round((1 - Math.max(0, spendingRatio - 1)) * 100)));
  
  const achievements: HealthItem[] = [];
  const warnings: HealthItem[] = [];
  const issues: HealthItem[] = [];
  
  if (spendingRatio <= 0.8) {
    achievements.push({
      type: 'success',
      text: 'Staying within budget this week',
      amount: weeklyBudget - weeklySpending,
    });
  } else if (spendingRatio <= 1.0) {
    warnings.push({
      type: 'warning',
      text: 'Close to budget limit',
      amount: weeklyBudget - weeklySpending,
    });
  } else {
    issues.push({
      type: 'error',
      text: 'Over budget this week',
      amount: weeklySpending - weeklyBudget,
    });
  }
  
  return {
    overallScore,
    maxScore: 100,
    achievements,
    warnings,
    issues,
    weeklyStats: {
      thisWeek: weeklySpending,
      budget: weeklyBudget,
      lastWeek: Math.round(weeklySpending * (0.9 + Math.random() * 0.2)),
      monthlyAvg: weeklySpending,
      overBudget: Math.max(0, weeklySpending - weeklyBudget),
      changeFromLastWeek: Math.round((Math.random() - 0.5) * 20),
      changeFromMonthlyAvg: 0,
    },
    nextWeekGoal: Math.round(weeklyBudget * 0.9),
    dataAvailability: {
      hasTransactions: monthlyExpenses > 0,
      hasBudgets: overview.active_budgets > 0,
      hasGoals: overview.active_goals > 0,
    },
  };
};

export const fetchWeeklyHealth = createAsyncThunk(
  'analytics/fetchWeeklyHealth',
  async (_, { rejectWithValue, getState }) => {
    try {
      // First try to get weekly report
      const response = await apiService.getWeeklyReport();
      
      if (response && response.financial_health) {
        // Transform weekly report data to WeeklyHealthData format
        const healthData = response.financial_health;
        return {
          overallScore: healthData.overall_score || 0,
          maxScore: healthData.max_score || 100,
          achievements: healthData.achievements || [],
          warnings: healthData.warnings || [],
          issues: healthData.issues || [],
          weeklyStats: healthData.weekly_stats || {
            thisWeek: 0,
            budget: 0,
            lastWeek: 0,
            monthlyAvg: 0,
            overBudget: 0,
            changeFromLastWeek: 0,
            changeFromMonthlyAvg: 0,
          },
          nextWeekGoal: healthData.next_week_goal || 0,
          dataAvailability: healthData.data_availability || {
            hasTransactions: false,
            hasBudgets: false,
            hasGoals: false,
          },
        };
      }
      
      // If weekly report is not available or doesn't have health data, return null
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('📊 Weekly health report endpoint not available (404) - will use dashboard insights fallback');
        
        // Try to get dashboard insights as fallback
        try {
          const dashboardResponse = await apiService.getDashboardInsights();
          return generateWeeklyHealthFromDashboard(dashboardResponse);
        } catch (dashboardError: any) {
          console.log('📊 Dashboard insights also not available - using minimal fallback data');
          return generateWeeklyHealthFromDashboard({});
        }
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
    setSelectedTimePeriod: (state, action) => {
      state.selectedTimePeriod = action.payload;
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    fetchWeeklyHealthStart: (state) => {
      state.weeklyHealthLoading = true;
      state.weeklyHealthError = null;
    },
    fetchWeeklyHealthSuccess: (state, action) => {
      state.weeklyHealth = action.payload;
      state.weeklyHealthLoading = false;
      state.weeklyHealthError = null;
    },
    fetchWeeklyHealthFailure: (state, action) => {
      state.weeklyHealthError = action.payload;
      state.weeklyHealthLoading = false;
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
          spending_trend: {
            change_percentage: 0,
            trend_direction: 'stable',
          },
          top_categories: [
            { name: 'Food & Dining', amount: 15000 },
            { name: 'Transportation', amount: 8000 },
            { name: 'Shopping', amount: 5000 },
          ],
          upcoming_bills: [],
        };
      })
      // Fetch weekly report
      .addCase(fetchWeeklyReport.fulfilled, (state, action) => {
        state.weeklyReport = action.payload;
      })
      .addCase(fetchWeeklyReport.rejected, (state, action) => {
        state.weeklyReport = null;
      })
      // Fetch spending trends by period
      .addCase(fetchSpendingTrendsByPeriod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpendingTrendsByPeriod.fulfilled, (state, action) => {
        state.isLoading = false;
        const { period, data } = action.payload;
        state.spendingTrendsByPeriod[period] = data;
      })
      .addCase(fetchSpendingTrendsByPeriod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch spending trends by period';
      })
      // Fetch category breakdown by period
      .addCase(fetchCategoryBreakdownByPeriod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryBreakdownByPeriod.fulfilled, (state, action) => {
        state.isLoading = false;
        const { period, data } = action.payload;
        state.categoryBreakdownByPeriod[period] = data;
      })
      .addCase(fetchCategoryBreakdownByPeriod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch category breakdown by period';
      })
      // Fetch weekly health
      .addCase(fetchWeeklyHealth.pending, (state) => {
        state.weeklyHealthLoading = true;
        state.weeklyHealthError = null;
      })
      .addCase(fetchWeeklyHealth.fulfilled, (state, action) => {
        state.weeklyHealth = action.payload;
        state.weeklyHealthLoading = false;
        state.weeklyHealthError = null;
      })
      .addCase(fetchWeeklyHealth.rejected, (state, action) => {
        state.weeklyHealthError = action.payload as string || 'Failed to fetch weekly health data';
        state.weeklyHealthLoading = false;
      });
  },
});

export const { 
  clearError, 
  setSelectedTimePeriod, 
  setRefreshing,
  fetchWeeklyHealthStart,
  fetchWeeklyHealthSuccess,
  fetchWeeklyHealthFailure
} = analyticsSlice.actions;
export default analyticsSlice.reducer;