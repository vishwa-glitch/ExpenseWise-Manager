import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { BudgetAnalyticsResponse, BudgetVarianceReportResponse } from '../../types/api';

const getSafeNumber = (value: any, fallback = 0) => {
  const parsedValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const normalizeBudgetAnalytics = (analytics: BudgetAnalyticsResponse | null): BudgetAnalyticsResponse | null => {
  if (!analytics) {
    return null;
  }

  if (analytics.budget_health) {
    return analytics;
  }

  const efficiencyMetrics = analytics.efficiency_metrics;

  if (!efficiencyMetrics) {
    return analytics;
  }

  const budgetsOnTrack = getSafeNumber(efficiencyMetrics.budgets_on_track);
  const budgetsAtRisk = getSafeNumber(efficiencyMetrics.budgets_at_risk);
  const budgetsOverLimit = getSafeNumber(efficiencyMetrics.budgets_over_limit);

  const overallStatus =
    budgetsOverLimit > 0
      ? 'review_required'
      : budgetsAtRisk > 0
        ? 'monitor_closely'
        : 'on_track';

  return {
    ...analytics,
    budget_health: {
      utilization_rate: getSafeNumber(efficiencyMetrics.overall_efficiency),
      budgets_under_budget: 0,
      budgets_on_track: budgetsOnTrack,
      budgets_approaching_limit: budgetsAtRisk,
      budgets_over_budget: budgetsOverLimit,
      avg_days_remaining: 0,
      daily_spending_rate: 0,
      daily_budget_allowance: 0,
      overall_status: overallStatus,
    },
  };
};

interface BudgetAnalyticsState {
  analytics: BudgetAnalyticsResponse | null;
  varianceReport: BudgetVarianceReportResponse | null;
  analyticsLoading: boolean;
  varianceReportLoading: boolean;
  analyticsError: string | null;
  varianceReportError: string | null;
  lastFetched: {
    analytics: string | null;
    varianceReport: string | null;
  };
}

const initialState: BudgetAnalyticsState = {
  analytics: null,
  varianceReport: null,
  analyticsLoading: false,
  varianceReportLoading: false,
  analyticsError: null,
  varianceReportError: null,
  lastFetched: {
    analytics: null,
    varianceReport: null,
  },
};

export const fetchBudgetAnalytics = createAsyncThunk(
  'budgetAnalytics/fetchAnalytics',
  async ({ period = "current_month", months = 6 }: { period?: string; months?: number }) => {
    console.log('🔍 fetchBudgetAnalytics - Starting fetch with params:', { period, months });
    const response = await apiService.getBudgetAnalytics(period, months);
    console.log('✅ fetchBudgetAnalytics - Response received:', JSON.stringify(response, null, 2));
    return response;
  }
);

export const fetchBudgetVarianceReport = createAsyncThunk(
  'budgetAnalytics/fetchVarianceReport',
  async ({ 
    startDate, 
    endDate, 
    includeInactive = false 
  }: { 
    startDate?: string; 
    endDate?: string; 
    includeInactive?: boolean 
  }) => {
    console.log('🔍 fetchBudgetVarianceReport - Starting fetch with params:', { startDate, endDate, includeInactive });
    const response = await apiService.getBudgetVarianceReport(startDate, endDate, includeInactive);
    console.log('✅ fetchBudgetVarianceReport - Response received:', JSON.stringify(response, null, 2));
    return response;
  }
);

const budgetAnalyticsSlice = createSlice({
  name: 'budgetAnalytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.analytics = null;
      state.analyticsError = null;
      state.lastFetched.analytics = null;
    },
    clearVarianceReport: (state) => {
      state.varianceReport = null;
      state.varianceReportError = null;
      state.lastFetched.varianceReport = null;
    },
    clearAll: (state) => {
      state.analytics = null;
      state.varianceReport = null;
      state.analyticsError = null;
      state.varianceReportError = null;
      state.lastFetched.analytics = null;
      state.lastFetched.varianceReport = null;
    },
  },
  extraReducers: (builder) => {
    // Budget Analytics
    builder
      .addCase(fetchBudgetAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchBudgetAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = normalizeBudgetAnalytics(action.payload);
        state.lastFetched.analytics = new Date().toISOString();
      })
      .addCase(fetchBudgetAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.error.message || 'Failed to fetch budget analytics';
      });

    // Budget Variance Report
    builder
      .addCase(fetchBudgetVarianceReport.pending, (state) => {
        state.varianceReportLoading = true;
        state.varianceReportError = null;
      })
      .addCase(fetchBudgetVarianceReport.fulfilled, (state, action) => {
        state.varianceReportLoading = false;
        state.varianceReport = action.payload;
        state.lastFetched.varianceReport = new Date().toISOString();
      })
      .addCase(fetchBudgetVarianceReport.rejected, (state, action) => {
        state.varianceReportLoading = false;
        state.varianceReportError = action.error.message || 'Failed to fetch variance report';
      });
  },
});

export const { clearAnalytics, clearVarianceReport, clearAll } = budgetAnalyticsSlice.actions;
export default budgetAnalyticsSlice.reducer;
