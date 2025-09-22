/**
 * Budget Monitoring Service
 * Automatically monitors budget metrics and triggers graceful warning notifications
 * Integrates with the existing notification service for seamless user experience
 */

import { store } from '../store';
import { fetchBudgets } from '../store/slices/budgetsSlice';
import { notificationService } from './notificationService';
import { notificationMemoryService } from './notificationMemoryService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';
import { calculateBudgetStatus } from '../utils/budgetStatus';
import { getBudgetDisplayName, getBudgetNotificationName } from '../utils/budgetDisplayUtils';
import { Budget, BudgetAnalyticsResponse } from '../types/api';

export interface BudgetAlert {
  id: string;
  type: 'approaching_limit' | 'over_budget' | 'daily_overspend' | 'multiple_over' | 'burn_rate_high';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  budgetId?: string;
  budgetName?: string;
  data: any;
}

export interface MonitoringThresholds {
  approachingLimitThreshold: number; // Default: 80%
  dailyOverspendThreshold: number; // Default: 120% of daily allowance
  burnRateThreshold: number; // Default: 150% of expected rate
  multipleOverBudgetCount: number; // Default: 3 budgets
}

class BudgetMonitoringService {
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastAlertTimestamps: Map<string, number> = new Map();
  private alertCooldownPeriod: number = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  private thresholds: MonitoringThresholds = {
    approachingLimitThreshold: 80,
    dailyOverspendThreshold: 120,
    burnRateThreshold: 150,
    multipleOverBudgetCount: 3,
  };

  /**
   * Start automatic budget monitoring
   * Checks budget metrics every 30 minutes during active hours
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('🔍 Budget monitoring already active');
      return;
    }

    console.log('🔍 Starting budget monitoring service...');
    this.isMonitoring = true;

    // Initial check after 30 seconds for immediate testing (was 5 minutes)
    setTimeout(async () => {
      console.log('🔍 Running initial budget check...');
      await this.checkBudgetMetrics();
    }, 30 * 1000);

    // Set up periodic monitoring (every 30 minutes)
    this.monitoringInterval = setInterval(async () => {
      await this.checkBudgetMetrics();
    }, 30 * 60 * 1000);

    console.log('✅ Budget monitoring service started');
  }

  /**
   * Stop budget monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🔍 Budget monitoring service stopped');
  }

  /**
   * Check budget metrics and generate alerts
   */
  private async checkBudgetMetrics() {
    try {
      console.log('🔍 Checking budget metrics...');
      
      // Get current budgets from the store
      const state = store.getState();
      const budgets = state.budgets.budgets;
      
      if (!budgets || budgets.length === 0) {
        console.log('🔍 No budgets found, skipping check');
        return;
      }

      console.log(`🔍 Found ${budgets.length} budgets to check:`);
      budgets.forEach((budget: any) => {
        const utilization = budget.amount > 0 ? (budget.spent_amount || 0) / budget.amount : 0;
        console.log(`🔍 Budget "${budget.name}": $${budget.spent_amount || 0}/$${budget.amount} (${Math.round(utilization * 100)}%)`);
      });

      // Filter active budgets
      const activeBudgets = budgets.filter((budget: Budget) => budget.is_active);

      // Check various budget metrics
      const alerts: BudgetAlert[] = [];

      // 1. Check individual budget thresholds
      for (const budget of activeBudgets) {
        const budgetAlerts = await this.checkIndividualBudget(budget);
        alerts.push(...budgetAlerts);
      }

      // 2. Check multiple budgets over limit
      const multipleOverAlert = this.checkMultipleBudgetsOver(activeBudgets);
      if (multipleOverAlert) {
        alerts.push(multipleOverAlert);
      }

      // 3. Check overall spending burn rate
      const burnRateAlert = await this.checkBurnRate(activeBudgets);
      if (burnRateAlert) {
        alerts.push(burnRateAlert);
      }

      // Send notifications for new alerts
      console.log(`🔍 Generated ${alerts.length} alerts:`);
      alerts.forEach(alert => {
        console.log(`🔍 Alert: ${alert.type} - ${alert.title}`);
      });
      
      await this.processAlerts(alerts);

    } catch (error) {
      console.error('❌ Error checking budget metrics:', error);
    }
  }

  /**
   * Check individual budget for threshold violations
   */
  private async checkIndividualBudget(budget: Budget): Promise<BudgetAlert[]> {
    const alerts: BudgetAlert[] = [];
    const utilizationRate = budget.amount > 0 ? (budget.spent_amount / budget.amount) * 100 : 0;
    const status = calculateBudgetStatus(utilizationRate);

    // Check if approaching limit (80% threshold)
    if (status === 'approaching_limit' && !this.hasRecentAlert(`approaching_${budget.id}`)) {
      alerts.push({
        id: `approaching_${budget.id}`,
        type: 'approaching_limit',
        severity: 'medium',
        title: `Budget Alert: ${getBudgetNotificationName(budget.category_name)}`,
        message: `You've used ${Math.round(utilizationRate)}% of your ${getBudgetNotificationName(budget.category_name)} budget. Consider monitoring your spending.`,
        budgetId: budget.id,
        budgetName: getBudgetNotificationName(budget.category_name),
        data: {
          utilizationRate,
          spentAmount: budget.spent_amount,
          budgetAmount: budget.amount,
          category: getBudgetNotificationName(budget.category_name),
        },
      });
    }

    // Check if over budget (100% threshold)
    if (status === 'over_budget' && !this.hasRecentAlert(`over_${budget.id}`)) {
      const overAmount = budget.spent_amount - budget.amount;
      alerts.push({
        id: `over_${budget.id}`,
        type: 'over_budget',
        severity: 'high',
        title: `Budget Exceeded: ${getBudgetNotificationName(budget.category_name)}`,
        message: `You've exceeded your ${getBudgetNotificationName(budget.category_name)} budget by $${overAmount.toFixed(2)}. Consider reviewing recent expenses.`,
        budgetId: budget.id,
        budgetName: getBudgetNotificationName(budget.category_name),
        data: {
          utilizationRate,
          spentAmount: budget.spent_amount,
          budgetAmount: budget.amount,
          overAmount,
          category: getBudgetNotificationName(budget.category_name),
        },
      });
    }

    // Check daily spending rate if budget has date range
    if (budget.start_date && budget.end_date) {
      const dailyAlert = this.checkDailySpendingRate(budget);
      if (dailyAlert) {
        alerts.push(dailyAlert);
      }
    }

    return alerts;
  }

  /**
   * Check if daily spending rate is too high
   */
  private checkDailySpendingRate(budget: Budget): BudgetAlert | null {
    const now = new Date();
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);
    
    // Calculate days elapsed and total days in period
    const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysElapsed <= 0 || totalDays <= 0) return null;

    const dailyBudgetAllowance = budget.amount / totalDays;
    const currentDailySpendingRate = budget.spent_amount / daysElapsed;
    const spendingRatePercentage = (currentDailySpendingRate / dailyBudgetAllowance) * 100;

    if (spendingRatePercentage > this.thresholds.dailyOverspendThreshold && 
        !this.hasRecentAlert(`daily_${budget.id}`)) {
      return {
        id: `daily_${budget.id}`,
        type: 'daily_overspend',
        severity: 'medium',
        title: `High Daily Spending: ${getBudgetNotificationName(budget.category_name)}`,
        message: `Your daily spending rate for ${getBudgetNotificationName(budget.category_name)} is ${Math.round(spendingRatePercentage)}% of your daily allowance. Consider slowing down.`,
        budgetId: budget.id,
        budgetName: getBudgetNotificationName(budget.category_name),
        data: {
          dailySpendingRate: currentDailySpendingRate,
          dailyAllowance: dailyBudgetAllowance,
          spendingRatePercentage,
          daysElapsed,
          totalDays,
        },
      };
    }

    return null;
  }

  /**
   * Check if multiple budgets are over limit
   */
  private checkMultipleBudgetsOver(budgets: Budget[]): BudgetAlert | null {
    const overBudgets = budgets.filter(budget => {
      const utilizationRate = budget.amount > 0 ? (budget.spent_amount / budget.amount) * 100 : 0;
      return utilizationRate > 100;
    });

    if (overBudgets.length >= this.thresholds.multipleOverBudgetCount && 
        !this.hasRecentAlert('multiple_over')) {
      const budgetNames = overBudgets.slice(0, 3).map(b => getBudgetNotificationName(b.category_name)).join(', ');
      const additionalCount = Math.max(0, overBudgets.length - 3);
      const namesText = additionalCount > 0 ? `${budgetNames} and ${additionalCount} more` : budgetNames;

      return {
        id: 'multiple_over',
        type: 'multiple_over',
        severity: 'high',
        title: 'Multiple Budgets Exceeded',
        message: `You have ${overBudgets.length} budgets over limit: ${namesText}. Consider reviewing your spending plan.`,
        data: {
          overBudgetCount: overBudgets.length,
          overBudgets: overBudgets.map(b => ({
            id: b.id,
            name: getBudgetNotificationName(b.category_name),
            overAmount: b.spent_amount - b.amount,
          })),
        },
      };
    }

    return null;
  }

  /**
   * Check overall spending burn rate
   */
  private async checkBurnRate(budgets: Budget[]): Promise<BudgetAlert | null> {
    // Calculate overall burn rate across all budgets
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);

    if (totalBudget === 0) return null;

    // Get average days into period (simplified calculation)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysIntoMonth = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const expectedSpendingRate = (daysIntoMonth / daysInMonth) * 100;
    const actualSpendingRate = (totalSpent / totalBudget) * 100;
    const burnRateRatio = actualSpendingRate / expectedSpendingRate;

    if (burnRateRatio > (this.thresholds.burnRateThreshold / 100) && 
        !this.hasRecentAlert('burn_rate_high')) {
      return {
        id: 'burn_rate_high',
        type: 'burn_rate_high',
        severity: 'medium',
        title: 'High Spending Rate Detected',
        message: `You're spending ${Math.round(burnRateRatio * 100)}% faster than expected this month. Consider reviewing your expenses.`,
        data: {
          burnRateRatio,
          expectedRate: expectedSpendingRate,
          actualRate: actualSpendingRate,
          totalBudget,
          totalSpent,
          daysIntoMonth,
          daysInMonth,
        },
      };
    }

    return null;
  }

  /**
   * Process and send notifications for alerts
   */
  private async processAlerts(alerts: BudgetAlert[]) {
    for (const alert of alerts) {
      try {
        // Check if this alert was already sent recently
        const wasRecentlySent = notificationMemoryService.wasRecentlySent(
          'budget',
          alert.type,
          alert.budgetId || 'unknown'
        );

        if (wasRecentlySent) {
          console.log(`🔔 Skipping duplicate budget alert: ${alert.title}`);
          continue;
        }

        // Send notification
        await notificationService.scheduleLocalNotification({
          id: alert.id,
          title: alert.title,
          body: alert.message,
          type: 'budget',
          priority: alert.severity === 'high' ? 'high' : 'normal',
          data: {
            alertType: alert.type,
            budgetId: alert.budgetId,
            budgetName: alert.budgetName,
            ...alert.data,
          },
        });

        // Record alert timestamp for cooldown (legacy)
        this.lastAlertTimestamps.set(alert.id, Date.now());

        // Record in memory service to prevent duplicates
        await notificationMemoryService.recordSentNotification(
          'budget',
          alert.type,
          alert.budgetId || 'unknown',
          alert.title,
          alert.message
        );

        console.log(`🔔 Sent budget alert: ${alert.title}`);
        console.log(`🔔 Alert details: ${alert.message}`);
        console.log(`🔔 Alert data:`, alert.data);
      } catch (error) {
        console.error(`❌ Failed to send budget alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Check if an alert was recently sent (within cooldown period)
   */
  private hasRecentAlert(alertId: string): boolean {
    const lastAlert = this.lastAlertTimestamps.get(alertId);
    if (!lastAlert) return false;
    
    return (Date.now() - lastAlert) < this.alertCooldownPeriod;
  }

  /**
   * Update monitoring thresholds
   */
  updateThresholds(newThresholds: Partial<MonitoringThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('🔍 Updated budget monitoring thresholds:', this.thresholds);
  }

  /**
   * Force check budget metrics (for testing or manual triggers)
   */
  async forceCheck() {
    console.log('🔍 Forcing budget metrics check...');
    await this.checkBudgetMetrics();
  }

  /**
   * Clear alert cooldowns (for testing)
   */
  clearAlertCooldowns() {
    this.lastAlertTimestamps.clear();
    console.log('🔍 Cleared all alert cooldowns');
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      thresholds: this.thresholds,
      alertCount: this.lastAlertTimestamps.size,
      lastCheck: this.monitoringInterval ? 'Active' : 'Inactive',
    };
  }

  /**
   * Generate a test budget notification for debugging
   */
  async generateTestNotification() {
    try {
      console.log('🔍 Generating test budget notification...');
      
      // Import notification service dynamically to avoid circular dependency
      const { notificationService } = await import('./notificationService');
      
      await notificationService.scheduleLocalNotification({
        id: `test-budget-${Date.now()}`,
        title: '🧪 Test Budget Alert',
        body: 'This is a test budget notification generated manually for debugging.',
        type: 'budget',
        priority: 'high',
        data: {
          alertType: 'test',
          category: 'Test Category',
          amount: 100,
          budgetId: 'test-budget',
        },
      });
      
      console.log('✅ Test budget notification generated');
    } catch (error) {
      console.error('❌ Error generating test budget notification:', error);
      throw error;
    }
  }

  /**
   * Manually trigger budget check immediately (for debugging)
   */
  async triggerImmediateCheck() {
    console.log('🔍 Manually triggering immediate budget check...');
    await this.checkBudgetMetrics();
  }
}

// Create singleton instance
export const budgetMonitoringService = new BudgetMonitoringService();

export default budgetMonitoringService;
