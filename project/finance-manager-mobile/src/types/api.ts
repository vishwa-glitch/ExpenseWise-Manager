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
  name: string;
  amount: number;
  spent_amount: number;
  category_id?: string;
  is_active: boolean;
  period: 'monthly' | 'weekly' | 'yearly';
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