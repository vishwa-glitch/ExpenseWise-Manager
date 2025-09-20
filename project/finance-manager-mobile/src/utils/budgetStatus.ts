// Budget Status Utility Functions
// Implements the new UX-friendly status system without guilt-inducing language

export type BudgetStatus = 'under_budget' | 'on_track' | 'approaching_limit' | 'over_budget';
export type OverallStatus = 'on_track' | 'monitor_closely' | 'review_required';

export interface StatusDisplay {
  color: string;
  text: string;
  icon: string;
  description: string;
}

export interface StatusColors {
  green: string;
  blue: string;
  orange: string;
  red: string;
}

/**
 * Get display configuration for a budget status
 * @param status The budget status
 * @param colors Color palette object
 * @returns StatusDisplay configuration
 */
export const getStatusDisplay = (status: BudgetStatus, colors: StatusColors): StatusDisplay => {
  const statusConfig: Record<BudgetStatus, StatusDisplay> = {
    'under_budget': { 
      color: colors.green, 
      text: 'On Track', 
      icon: '✅',
      description: 'You\'re doing great! Plenty of budget remaining.'
    },
    'on_track': { 
      color: colors.blue, 
      text: 'On Track', 
      icon: '📊',
      description: 'Good progress on your budget goals.'
    },
    'approaching_limit': { 
      color: colors.orange, 
      text: 'Watch Spending', 
      icon: '⚠️',
      description: 'You\'re approaching your budget limit.'
    },
    'over_budget': { 
      color: colors.red, 
      text: 'Over Budget', 
      icon: '🚨',
      description: 'Consider reviewing recent expenses.'
    }
  };
  return statusConfig[status] || statusConfig['under_budget'];
};

/**
 * Format utilization rate as a percentage
 * @param rate The utilization rate (0-100)
 * @returns Formatted percentage string
 */
export const formatUtilizationRate = (rate: number): string => {
  return `${Math.round(rate)}%`;
};

/**
 * Get message for overall budget status
 * @param status The overall status
 * @returns User-friendly message
 */
export const getOverallStatusMessage = (status: OverallStatus): string => {
  const messages: Record<OverallStatus, string> = {
    'on_track': 'Your budgets are looking good! Keep up the great work.',
    'monitor_closely': 'Some budgets need attention. Review your spending when convenient.',
    'review_required': 'A few budgets are over limit. Consider adjusting your spending plan.'
  };
  return messages[status] || messages['on_track'];
};

/**
 * Calculate budget status based on utilization rate and alert threshold
 * @param utilizationRate Percentage of budget used (0-100)
 * @param alertThreshold Alert threshold percentage (default 80)
 * @returns Budget status
 */
export const calculateBudgetStatus = (
  utilizationRate: number, 
  alertThreshold: number = 80
): BudgetStatus => {
  if (utilizationRate > 100) return 'over_budget';
  if (utilizationRate >= alertThreshold) return 'approaching_limit';
  if (utilizationRate >= 70) return 'on_track';
  return 'under_budget';
};

/**
 * Get progress color based on budget status
 * @param status Budget status
 * @param colors Color palette
 * @returns Color string
 */
export const getProgressColor = (status: BudgetStatus, colors: StatusColors): string => {
  return getStatusDisplay(status, colors).color;
};

/**
 * Calculate days remaining in budget period
 * @param endDate Budget end date string
 * @returns Number of days remaining
 */
export const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Get contextual spending advice based on budget status and remaining days
 * @param status Budget status
 * @param utilizationRate Current utilization rate
 * @param daysRemaining Days left in budget period
 * @param dailySpendingRate Current daily spending rate
 * @param dailyBudgetAllowance Daily budget allowance
 * @returns Helpful advice string
 */
export const getSpendingAdvice = (
  status: BudgetStatus,
  utilizationRate: number,
  daysRemaining: number,
  dailySpendingRate: number,
  dailyBudgetAllowance: number
): string => {
  if (status === 'over_budget') {
    return 'Consider reviewing recent purchases to get back on track.';
  }
  
  if (status === 'approaching_limit') {
    return `You have ${daysRemaining} days remaining. Consider slowing down spending.`;
  }
  
  if (dailySpendingRate > dailyBudgetAllowance) {
    return `Current daily spending (${dailySpendingRate.toFixed(2)}) is above your daily allowance (${dailyBudgetAllowance.toFixed(2)}).`;
  }
  
  return 'You\'re on track! Keep up the good work.';
};

/**
 * Format currency amount with proper locale
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export const formatBudgetCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
