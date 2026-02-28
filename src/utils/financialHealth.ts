/**
 * Financial Health Calculation Utilities
 * 
 * This module provides functions to calculate financial health scores,
 * generate insights, and process financial data for dashboard components.
 */

// Type definitions for financial health calculations
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  category_name?: string;
  transaction_date: string;
  description: string;
  account_id: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent_amount?: number;
  category_id: string;
  category_name?: string;
  period: 'weekly' | 'monthly' | 'yearly';
  is_active: boolean;
  start_date: string;
  end_date?: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  is_active: boolean;
  created_at: string;
}

export interface GoalProgress {
  goal_id: string;
  progress_percentage: number;
  amount_contributed: number;
  days_remaining: number;
  on_track: boolean;
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

export interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  goalProgress: GoalProgress[];
  weeklySpending: number;
  monthlyBudget: number;
}

export interface HealthScoreComponents {
  budgetAdherence: {
    score: number;
    weight: number;
    details: string;
  };
  goalProgress: {
    score: number;
    weight: number;
    details: string;
  };
  spendingConsistency: {
    score: number;
    weight: number;
    details: string;
  };
  financialHabits: {
    score: number;
    weight: number;
    details: string;
  };
}

// Constants for scoring weights
const SCORE_WEIGHTS = {
  BUDGET_ADHERENCE: 0.4,
  GOAL_PROGRESS: 0.3,
  SPENDING_CONSISTENCY: 0.2,
  FINANCIAL_HABITS: 0.1,
} as const;

const MAX_SCORE = 100;

/**
 * Calculate overall financial health score based on multiple factors
 */
export function calculateOverallScore(data: FinancialData): number {
  const components = calculateScoreComponents(data);
  
  const weightedScore = 
    components.budgetAdherence.score * components.budgetAdherence.weight +
    components.goalProgress.score * components.goalProgress.weight +
    components.spendingConsistency.score * components.spendingConsistency.weight +
    components.financialHabits.score * components.financialHabits.weight;
  
  return Math.round(Math.min(MAX_SCORE, Math.max(0, weightedScore)));
}

/**
 * Calculate individual score components for detailed analysis
 */
export function calculateScoreComponents(data: FinancialData): HealthScoreComponents {
  return {
    budgetAdherence: calculateBudgetAdherenceScore(data),
    goalProgress: calculateGoalProgressScore(data),
    spendingConsistency: calculateSpendingConsistencyScore(data),
    financialHabits: calculateFinancialHabitsScore(data),
  };
}

/**
 * Calculate budget adherence score (40% weight)
 */
function calculateBudgetAdherenceScore(data: FinancialData): HealthScoreComponents['budgetAdherence'] {
  const { budgets, transactions } = data;
  
  if (!budgets.length) {
    return {
      score: 0,
      weight: SCORE_WEIGHTS.BUDGET_ADHERENCE,
      details: 'No active budgets found',
    };
  }
  
  const activeBudgets = budgets.filter(budget => budget.is_active);
  if (!activeBudgets.length) {
    return {
      score: 0,
      weight: SCORE_WEIGHTS.BUDGET_ADHERENCE,
      details: 'No active budgets',
    };
  }
  
  let totalScore = 0;
  let budgetCount = 0;
  
  for (const budget of activeBudgets) {
    const budgetSpending = calculateBudgetSpending(budget, transactions);
    const utilizationRate = budgetSpending / budget.amount;
    
    let budgetScore: number;
    if (utilizationRate <= 0.8) {
      // Excellent: Under 80% of budget
      budgetScore = 100;
    } else if (utilizationRate <= 0.95) {
      // Good: 80-95% of budget
      budgetScore = 80;
    } else if (utilizationRate <= 1.0) {
      // Fair: 95-100% of budget
      budgetScore = 60;
    } else if (utilizationRate <= 1.2) {
      // Poor: 100-120% of budget
      budgetScore = 30;
    } else {
      // Very poor: Over 120% of budget
      budgetScore = 0;
    }
    
    totalScore += budgetScore;
    budgetCount++;
  }
  
  const averageScore = budgetCount > 0 ? totalScore / budgetCount : 0;
  const overBudgetCount = activeBudgets.filter(budget => {
    const spending = calculateBudgetSpending(budget, transactions);
    return spending > budget.amount;
  }).length;
  
  let details: string;
  if (overBudgetCount === 0) {
    details = `All ${budgetCount} budgets on track`;
  } else {
    details = `${overBudgetCount} of ${budgetCount} budgets exceeded`;
  }
  
  return {
    score: Math.round(averageScore),
    weight: SCORE_WEIGHTS.BUDGET_ADHERENCE,
    details,
  };
}

/**
 * Calculate goal progress score (30% weight)
 */
function calculateGoalProgressScore(data: FinancialData): HealthScoreComponents['goalProgress'] {
  const { goals, goalProgress } = data;
  
  if (!goals.length) {
    return {
      score: 0,
      weight: SCORE_WEIGHTS.GOAL_PROGRESS,
      details: 'No active goals found',
    };
  }
  
  const activeGoals = goals.filter(goal => goal.is_active);
  if (!activeGoals.length) {
    return {
      score: 0,
      weight: SCORE_WEIGHTS.GOAL_PROGRESS,
      details: 'No active goals',
    };
  }
  
  let totalScore = 0;
  let goalCount = 0;
  
  for (const goal of activeGoals) {
    const progress = goalProgress.find(p => p.goal_id === goal.id);
    if (!progress) continue;
    
    let goalScore: number;
    if (progress.on_track && progress.progress_percentage >= 25) {
      // Excellent: On track and making good progress
      goalScore = 100;
    } else if (progress.on_track) {
      // Good: On track but early stages
      goalScore = 80;
    } else if (progress.progress_percentage >= 50) {
      // Fair: Behind schedule but significant progress
      goalScore = 60;
    } else if (progress.progress_percentage >= 10) {
      // Poor: Behind schedule with minimal progress
      goalScore = 30;
    } else {
      // Very poor: No meaningful progress
      goalScore = 0;
    }
    
    totalScore += goalScore;
    goalCount++;
  }
  
  const averageScore = goalCount > 0 ? totalScore / goalCount : 0;
  const onTrackCount = goalProgress.filter(p => p.on_track).length;
  
  let details: string;
  if (onTrackCount === goalCount) {
    details = `All ${goalCount} goals on track`;
  } else {
    details = `${onTrackCount} of ${goalCount} goals on track`;
  }
  
  return {
    score: Math.round(averageScore),
    weight: SCORE_WEIGHTS.GOAL_PROGRESS,
    details,
  };
}

/**
 * Calculate spending consistency score (20% weight)
 */
function calculateSpendingConsistencyScore(data: FinancialData): HealthScoreComponents['spendingConsistency'] {
  const { transactions } = data;
  
  if (transactions.length < 7) {
    return {
      score: 0,
      weight: SCORE_WEIGHTS.SPENDING_CONSISTENCY,
      details: 'Insufficient data for analysis',
    };
  }
  
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  if (expenseTransactions.length < 7) {
    return {
      score: 0,
      weight: SCORE_WEIGHTS.SPENDING_CONSISTENCY,
      details: 'Insufficient expense data',
    };
  }
  
  // Calculate daily spending amounts for the last 30 days
  const dailySpending = calculateDailySpending(expenseTransactions, 30);
  const spendingAmounts = Object.values(dailySpending);
  
  if (spendingAmounts.length < 7) {
    return {
      score: 0,
      weight: SCORE_WEIGHTS.SPENDING_CONSISTENCY,
      details: 'Insufficient spending history',
    };
  }
  
  // Calculate coefficient of variation (CV) to measure consistency
  const mean = spendingAmounts.reduce((sum, amount) => sum + amount, 0) / spendingAmounts.length;
  const variance = spendingAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / spendingAmounts.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;
  
  let score: number;
  if (coefficientOfVariation <= 0.3) {
    // Excellent: Very consistent spending
    score = 100;
  } else if (coefficientOfVariation <= 0.5) {
    // Good: Moderately consistent
    score = 80;
  } else if (coefficientOfVariation <= 0.8) {
    // Fair: Somewhat inconsistent
    score = 60;
  } else if (coefficientOfVariation <= 1.2) {
    // Poor: Inconsistent spending
    score = 30;
  } else {
    // Very poor: Highly erratic spending
    score = 0;
  }
  
  const details = coefficientOfVariation <= 0.5 ? 
    'Consistent spending patterns' : 
    'Irregular spending detected';
  
  return {
    score: Math.round(score),
    weight: SCORE_WEIGHTS.SPENDING_CONSISTENCY,
    details,
  };
}

/**
 * Calculate financial habits score (10% weight)
 */
function calculateFinancialHabitsScore(data: FinancialData): HealthScoreComponents['financialHabits'] {
  const { transactions, budgets, goals } = data;
  
  let score = 0;
  const maxPoints = 100;
  
  // Points for having active budgets (25 points)
  const activeBudgets = budgets.filter(b => b.is_active);
  if (activeBudgets.length > 0) {
    score += 25;
  }
  
  // Points for having active goals (25 points)
  const activeGoals = goals.filter(g => g.is_active);
  if (activeGoals.length > 0) {
    score += 25;
  }
  
  // Points for transaction categorization (25 points)
  const categorizedTransactions = transactions.filter(t => t.category_id && t.category_id !== '');
  const categorizationRate = transactions.length > 0 ? categorizedTransactions.length / transactions.length : 0;
  score += Math.round(25 * categorizationRate);
  
  // Points for regular transaction activity (25 points)
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return transactionDate >= thirtyDaysAgo;
  });
  
  if (recentTransactions.length >= 10) {
    score += 25;
  } else if (recentTransactions.length >= 5) {
    score += 15;
  } else if (recentTransactions.length >= 1) {
    score += 5;
  }
  
  const details = score >= 75 ? 
    'Excellent financial habits' : 
    score >= 50 ? 
    'Good financial habits' : 
    'Room for improvement';
  
  return {
    score: Math.min(maxPoints, score),
    weight: SCORE_WEIGHTS.FINANCIAL_HABITS,
    details,
  };
}

/**
 * Generate achievements based on real data patterns
 */
export function generateAchievements(data: FinancialData): HealthItem[] {
  const achievements: HealthItem[] = [];
  const { budgets, goals, transactions, goalProgress } = data;
  
  // Budget achievements
  const activeBudgets = budgets.filter(b => b.is_active);
  const budgetsOnTrack = activeBudgets.filter(budget => {
    const spending = calculateBudgetSpending(budget, transactions);
    return spending <= budget.amount * 0.8; // Under 80% of budget
  });
  
  if (budgetsOnTrack.length > 0) {
    achievements.push({
      type: 'success',
      text: `${budgetsOnTrack.length} budget${budgetsOnTrack.length > 1 ? 's' : ''} under 80% usage`,
    });
  }
  
  // Goal achievements
  const goalsOnTrack = goalProgress.filter(p => p.on_track && p.progress_percentage >= 25);
  if (goalsOnTrack.length > 0) {
    achievements.push({
      type: 'success',
      text: `${goalsOnTrack.length} goal${goalsOnTrack.length > 1 ? 's' : ''} on track`,
    });
  }
  
  // Spending consistency achievement
  const components = calculateScoreComponents(data);
  if (components.spendingConsistency.score >= 80) {
    achievements.push({
      type: 'success',
      text: 'Consistent spending patterns maintained',
    });
  }
  
  // Savings achievement
  const recentIncome = calculateRecentIncome(transactions, 30);
  const recentExpenses = calculateRecentExpenses(transactions, 30);
  const savingsRate = recentIncome > 0 ? ((recentIncome - recentExpenses) / recentIncome) * 100 : 0;
  
  if (savingsRate >= 20) {
    achievements.push({
      type: 'success',
      text: `${Math.round(savingsRate)}% savings rate this month`,
      amount: recentIncome - recentExpenses,
    });
  }
  
  return achievements;
}

/**
 * Generate warnings based on real data patterns
 */
export function generateWarnings(data: FinancialData): HealthItem[] {
  const warnings: HealthItem[] = [];
  const { budgets, goals, transactions, goalProgress } = data;
  
  // Budget warnings
  const activeBudgets = budgets.filter(b => b.is_active);
  const budgetsNearLimit = activeBudgets.filter(budget => {
    const spending = calculateBudgetSpending(budget, transactions);
    const utilizationRate = spending / budget.amount;
    return utilizationRate > 0.8 && utilizationRate <= 1.0;
  });
  
  if (budgetsNearLimit.length > 0) {
    warnings.push({
      type: 'warning',
      text: `${budgetsNearLimit.length} budget${budgetsNearLimit.length > 1 ? 's' : ''} near limit`,
    });
  }
  
  // Goal warnings
  const goalsOffTrack = goalProgress.filter(p => !p.on_track && p.progress_percentage < 50);
  if (goalsOffTrack.length > 0) {
    warnings.push({
      type: 'warning',
      text: `${goalsOffTrack.length} goal${goalsOffTrack.length > 1 ? 's' : ''} behind schedule`,
    });
  }
  
  // Spending spike warning
  const weeklyStats = calculateWeeklyStats(transactions, budgets);
  if (weeklyStats.changeFromLastWeek > 50) {
    warnings.push({
      type: 'warning',
      text: `Spending increased ${Math.round(weeklyStats.changeFromLastWeek)}% from last week`,
      amount: weeklyStats.thisWeek - weeklyStats.lastWeek,
    });
  }
  
  // Low savings warning
  const recentIncome = calculateRecentIncome(transactions, 30);
  const recentExpenses = calculateRecentExpenses(transactions, 30);
  const savingsRate = recentIncome > 0 ? ((recentIncome - recentExpenses) / recentIncome) * 100 : 0;
  
  if (savingsRate < 10 && savingsRate >= 0) {
    warnings.push({
      type: 'warning',
      text: `Low savings rate: ${Math.round(savingsRate)}%`,
    });
  }
  
  return warnings;
}

/**
 * Generate issues based on real data patterns
 */
export function generateIssues(data: FinancialData): HealthItem[] {
  const issues: HealthItem[] = [];
  const { budgets, transactions } = data;
  
  // Budget overruns
  const activeBudgets = budgets.filter(b => b.is_active);
  const overBudgets = activeBudgets.filter(budget => {
    const spending = calculateBudgetSpending(budget, transactions);
    return spending > budget.amount;
  });
  
  if (overBudgets.length > 0) {
    const totalOverrun = overBudgets.reduce((sum, budget) => {
      const spending = calculateBudgetSpending(budget, transactions);
      return sum + (spending - budget.amount);
    }, 0);
    
    issues.push({
      type: 'error',
      text: `${overBudgets.length} budget${overBudgets.length > 1 ? 's' : ''} exceeded`,
      amount: totalOverrun,
    });
  }
  
  // Negative savings
  const recentIncome = calculateRecentIncome(transactions, 30);
  const recentExpenses = calculateRecentExpenses(transactions, 30);
  const netAmount = recentIncome - recentExpenses;
  
  if (netAmount < 0) {
    issues.push({
      type: 'error',
      text: 'Spending exceeds income this month',
      amount: Math.abs(netAmount),
    });
  }
  
  // No financial planning
  if (budgets.length === 0 && data.goals.length === 0) {
    issues.push({
      type: 'error',
      text: 'No budgets or goals set up',
    });
  }
  
  return issues;
}

/**
 * Calculate weekly statistics for dashboard display
 */
export function calculateWeeklyStats(transactions: Transaction[], budgets: Budget[]): WeeklyStats {
  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  
  // Calculate this week's spending
  const thisWeekTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date + 'T00:00:00');
    return t.type === 'expense' && transactionDate >= thisWeekStart && transactionDate < thisWeekEnd;
  });
  const thisWeek = thisWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate last week's spending
  const lastWeekTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date + 'T00:00:00');
    return t.type === 'expense' && transactionDate >= lastWeekStart && transactionDate < lastWeekEnd;
  });
  const lastWeek = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate weekly budget
  const weeklyBudgets = budgets.filter(b => b.is_active && b.period === 'weekly');
  const monthlyBudgets = budgets.filter(b => b.is_active && b.period === 'monthly');
  const budget = weeklyBudgets.reduce((sum, b) => sum + b.amount, 0) + 
                monthlyBudgets.reduce((sum, b) => sum + (b.amount / 4), 0);
  
  // Calculate monthly average (last 4 weeks)
  const fourWeeksAgo = new Date(thisWeekStart);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    return t.type === 'expense' && transactionDate >= fourWeeksAgo && transactionDate < now;
  });
  const monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyAvg = monthlyTotal / 4;
  
  // Calculate over-budget amount
  const overBudget = Math.max(0, thisWeek - budget);
  
  // Calculate percentage changes
  const changeFromLastWeek = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
  const changeFromMonthlyAvg = monthlyAvg > 0 ? ((thisWeek - monthlyAvg) / monthlyAvg) * 100 : 0;
  
  return {
    thisWeek: Math.round(thisWeek),
    budget: Math.round(budget),
    lastWeek: Math.round(lastWeek),
    monthlyAvg: Math.round(monthlyAvg),
    overBudget: Math.round(overBudget),
    changeFromLastWeek: Math.round(changeFromLastWeek),
    changeFromMonthlyAvg: Math.round(changeFromMonthlyAvg),
  };
}

// Helper functions

/**
 * Calculate spending for a specific budget
 */
function calculateBudgetSpending(budget: Budget, transactions: Transaction[]): number {
  const budgetStart = new Date(budget.start_date);
  const budgetEnd = budget.end_date ? new Date(budget.end_date) : new Date();
  
  return transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return t.type === 'expense' && 
             t.category_id === budget.category_id &&
             transactionDate >= budgetStart && 
             transactionDate <= budgetEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate daily spending amounts for a given period
 */
function calculateDailySpending(transactions: Transaction[], days: number): Record<string, number> {
  const dailySpending: Record<string, number> = {};
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .forEach(t => {
      const dateKey = t.transaction_date.split('T')[0]; // Get YYYY-MM-DD format
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + t.amount;
    });
  
  return dailySpending;
}

/**
 * Calculate recent income for a given period
 */
function calculateRecentIncome(transactions: Transaction[], days: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return t.type === 'income' && transactionDate >= cutoffDate;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate recent expenses for a given period
 */
function calculateRecentExpenses(transactions: Transaction[], days: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return t.type === 'expense' && transactionDate >= cutoffDate;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0); // Set to start of day
  return weekStart;
}