/**
 * Budget utility functions for date calculations and recurring logic
 */

export interface BudgetDateRange {
  start_date: string;
  end_date: string;
}

/**
 * Calculate the next budget period dates based on the current period and budget type
 */
export const calculateNextBudgetPeriod = (
  currentStartDate: string, 
  currentEndDate: string, 
  period: 'weekly' | 'monthly' | 'yearly' | 'custom'
): BudgetDateRange | null => {
  // Custom periods don't auto-renew
  if (period === 'custom') {
    return null;
  }

  const currentStart = new Date(currentStartDate);
  const currentEnd = new Date(currentEndDate);
  
  let nextStart = new Date(currentStart);
  let nextEnd = new Date(currentEnd);

  switch (period) {
    case 'weekly':
      nextStart.setDate(currentStart.getDate() + 7);
      nextEnd.setDate(currentEnd.getDate() + 7);
      break;
    
    case 'monthly':
      // Move to first day of next month
      nextStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 1);
      // Last day of next month
      nextEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 2, 0);
      break;
    
    case 'yearly':
      nextStart.setFullYear(currentStart.getFullYear() + 1);
      nextEnd.setFullYear(currentEnd.getFullYear() + 1);
      break;
  }

  return {
    start_date: nextStart.toISOString().split('T')[0],
    end_date: nextEnd.toISOString().split('T')[0],
  };
};

/**
 * Check if a budget period has ended and needs to be renewed
 */
export const shouldRenewBudget = (
  endDate: string, 
  period: 'weekly' | 'monthly' | 'yearly' | 'custom'
): boolean => {
  // Custom periods don't auto-renew
  if (period === 'custom') {
    return false;
  }

  const budgetEndDate = new Date(endDate);
  const today = new Date();
  
  // Reset time to compare only dates
  budgetEndDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return today > budgetEndDate;
};

/**
 * Check if a budget is currently active (within its date range)
 */
export const isBudgetCurrentlyActive = (startDate: string, endDate: string): boolean => {
  const budgetStart = new Date(startDate);
  const budgetEnd = new Date(endDate);
  const today = new Date();
  
  // Reset time to compare only dates
  budgetStart.setHours(0, 0, 0, 0);
  budgetEnd.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);
  
  return today >= budgetStart && today <= budgetEnd;
};

/**
 * Get default dates for a given budget period
 */
export const getDefaultBudgetDates = (period: 'weekly' | 'monthly' | 'yearly' | 'custom'): BudgetDateRange | null => {
  if (period === 'custom') {
    return null; // Custom periods require user to set dates
  }

  const today = new Date();
  let startDate = new Date(today);
  let endDate = new Date(today);

  switch (period) {
    case 'weekly':
      // Start from Monday of current week
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(today.getDate() - daysToMonday);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
      
    case 'monthly':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
      
    case 'yearly':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
  }

  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  };
};

/**
 * Calculate remaining days in a budget period
 */
export const calculateRemainingDays = (endDate: string): number => {
  const budgetEndDate = new Date(endDate);
  const today = new Date();
  
  // Reset time to compare only dates
  budgetEndDate.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = budgetEndDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysDiff);
};

/**
 * Format a budget period for display
 */
export const formatBudgetPeriod = (period: string, startDate: string, endDate: string): string => {
  if (period === 'custom') {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }
  
  const periodLabels = {
    weekly: 'Weekly',
    monthly: 'Monthly', 
    yearly: 'Yearly'
  };
  
  return periodLabels[period as keyof typeof periodLabels] || period;
};

/**
 * Check if budget dates are within valid range for the period type
 */
export const validateBudgetDates = (
  startDate: string, 
  endDate: string, 
  period: 'weekly' | 'monthly' | 'yearly' | 'custom'
): { isValid: boolean; error?: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
  
  switch (period) {
    case 'weekly':
      if (daysDiff < 6 || daysDiff > 8) {
        return { isValid: false, error: 'Weekly budget should be approximately 7 days' };
      }
      break;
    case 'monthly':
      if (daysDiff < 28 || daysDiff > 32) {
        return { isValid: false, error: 'Monthly budget should be approximately 30 days' };
      }
      break;
    case 'yearly':
      if (daysDiff < 360 || daysDiff > 370) {
        return { isValid: false, error: 'Yearly budget should be approximately 365 days' };
      }
      break;
    case 'custom':
      // Custom periods can be any length
      break;
  }
  
  return { isValid: true };
};

