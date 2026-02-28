// API Response Types for Budget and Financial Health Features

export interface BudgetStatusResponse {
  budgetStatus: {
    totalBudget: number;
    totalSpent: number;
    percentage: number;
    daysLeft: number;
    isOverBudget: boolean;
    budgetCount: number;
    overBudgetAmount?: number;
  };
  budgets: Budget[];
}

export interface Budget {
  id: string;
  amount: number;
  spent_amount: number;
  category_id: string;
  category_name: string;
  category_color?: string;
  is_active: boolean;
  period: 'monthly' | 'weekly' | 'yearly' | 'custom';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface HealthItem {
  type: 'success' | 'warning' | 'error';
  text: string;
  amount?: number;
}

export interface WeeklyStats {
  thisWeek: number;
  budget: number;
  lastWeek: number;
  monthlyAvg: number;
  overBudget: number;
  changeFromLastWeek: number;
  changeFromMonthlyAvg: number;
}

export interface WeeklyHealthResponse {
  financial_health: {
    overall_score: number;
    max_score: number;
    achievements: HealthItem[];
    warnings: HealthItem[];
    issues: HealthItem[];
    weekly_stats: WeeklyStats;
    next_week_goal: number;
    data_availability: {
      hasTransactions: boolean;
      hasBudgets: boolean;
      hasGoals: boolean;
    };
  };
  week_period: {
    start_date: string;
    end_date: string;
  };
  generated_at: string;
}

export interface DashboardInsightsResponse {
  overview: {
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    savings_rate: number;
    active_recommendations: number;
    active_goals: number;
    active_budgets: number;
  };
  spending_trend: {
    change_percentage: number;
    trend_direction: 'increasing' | 'decreasing' | 'stable';
  } | null;
  top_categories: Array<{
    name: string;
    amount: number;
    percentage?: number;
  }>;
  upcoming_bills: Array<{
    id: string;
    name: string;
    amount: number;
    due_date: string;
  }>;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Budget Analytics Types
export interface BudgetAnalyticsResponse {
  summary: {
    total_budgets: number;
    active_budgets: number;
    total_budget_amount: number;
    total_spent_amount: number;
    total_remaining_amount: number;
    avg_alert_threshold: number;
  };
  category_performance: Array<{
    category_id: string;
    category_name: string;
    category_color: string;
    budget_count: number;
    total_budget_amount: number;
    total_spent_amount: number;
    total_remaining_amount: number;
    percentage_used: number;
    variance: number;
    variance_percentage: number;
    status: 'under_budget' | 'on_track' | 'approaching_limit' | 'over_budget';
    avg_alert_threshold: number;
    earliest_start: string;
    latest_end: string;
  }>;
  monthly_trends: Array<{
    month: string;
    budget_count: number;
    total_budget_amount: number;
    total_spent_amount: number;
    total_remaining_amount: number;
    percentage_used: number;
    avg_alert_threshold: number;
  }>;
  budget_health: {
    utilization_rate: number;
    budgets_under_budget: number;
    budgets_on_track: number;
    budgets_approaching_limit: number;
    budgets_over_budget: number;
    avg_days_remaining: number;
    daily_spending_rate: number;
    daily_budget_allowance: number;
    overall_status: 'on_track' | 'monitor_closely' | 'review_required';
  };
  period: string;
  analysis_date: string;
}

export interface BudgetVarianceReportResponse {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_budgets: number;
    total_budget_amount: number;
    total_actual_spent: number;
    total_variance: number;
    overall_utilization_rate: number;
    variance_distribution: {
      under_budget: number;
      on_budget: number;
      over_budget: number;
      high_variance: number;
      medium_variance: number;
      low_variance: number;
    };
  };
  detailed_analysis: Array<{
    budget_id: string;
    category_id: string;
    category_name: string;
    category_color: string;
    period: string;
    start_date: string;
    end_date: string;
    budget_amount: number;
    actual_spent: number;
    variance: number;
    variance_percentage: number;
    utilization_rate: number;
    status: 'under_budget' | 'on_track' | 'approaching_limit' | 'over_budget';
    variance_severity: 'high' | 'medium' | 'low' | 'none';
    alert_threshold: number;
    is_active: boolean;
    transaction_count: number;
    avg_transaction_amount: number;
    min_transaction_amount: number;
    max_transaction_amount: number;
  }>;
  top_over_budgets: Array<{
    budget_id: string;
    category_name: string;
    budget_amount: number;
    actual_spent: number;
    variance: number;
    variance_percentage: number;
  }>;
  top_under_budgets: Array<{
    budget_id: string;
    category_name: string;
    budget_amount: number;
    actual_spent: number;
    variance: number;
    variance_percentage: number;
  }>;
  category_summary: Array<{
    category_name: string;
    category_color: string;
    budget_count: number;
    total_budget_amount: number;
    total_actual_spent: number;
    total_variance: number;
    avg_utilization_rate: number;
  }>;
  report_generated: string;
}