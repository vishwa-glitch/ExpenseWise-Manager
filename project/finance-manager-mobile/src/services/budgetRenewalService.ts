/**
 * Budget Renewal Service
 * Handles automatic renewal of recurring budgets (monthly, weekly, yearly)
 */

import { apiService } from './api';
import { shouldRenewBudget, calculateNextBudgetPeriod } from '../utils/budgetUtils';
import { Budget } from '../types/api';

export class BudgetRenewalService {
  /**
   * Check all active budgets and renew those that have expired
   */
  static async renewExpiredBudgets(): Promise<{
    renewed: string[];
    errors: string[];
  }> {
    const renewed: string[] = [];
    const errors: string[] = [];

    try {
      // Fetch current budgets
      const budgetsResponse = await apiService.getBudgets();
      const budgets = budgetsResponse.budgets || [];

      // Find budgets that need renewal
      const budgetsToRenew = budgets.filter((budget: Budget) => {
        return (
          budget.is_active &&
          budget.end_date &&
          budget.period !== 'custom' &&
          shouldRenewBudget(budget.end_date, budget.period)
        );
      });

      console.log(`Found ${budgetsToRenew.length} budgets that need renewal`);

      // Renew each budget
      for (const budget of budgetsToRenew) {
        try {
          const nextPeriod = calculateNextBudgetPeriod(
            budget.start_date,
            budget.end_date,
            budget.period
          );

          if (nextPeriod) {
            // Update the budget with new dates and reset spent amount
            await apiService.updateBudget(budget.id, {
              ...budget,
              start_date: nextPeriod.start_date,
              end_date: nextPeriod.end_date,
              spent_amount: 0, // Reset spending for new period
            });

            renewed.push(budget.id);
            console.log(`✅ Renewed budget: ${budget.name} (${budget.period})`);
          }
        } catch (error) {
          console.error(`❌ Failed to renew budget ${budget.id}:`, error);
          errors.push(`Failed to renew budget ${budget.name}: ${error}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch budgets for renewal:', error);
      errors.push(`Failed to fetch budgets: ${error}`);
    }

    return { renewed, errors };
  }

  /**
   * Check if any budget needs renewal soon (within next 3 days)
   */
  static async checkUpcomingRenewals(): Promise<Budget[]> {
    try {
      const budgetsResponse = await apiService.getBudgets();
      const budgets = budgetsResponse.budgets || [];

      const upcomingRenewals = budgets.filter((budget: Budget) => {
        if (!budget.is_active || !budget.end_date || budget.period === 'custom') {
          return false;
        }

        const endDate = new Date(budget.end_date);
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        // Reset time for accurate comparison
        endDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        threeDaysFromNow.setHours(23, 59, 59, 999);

        return endDate >= today && endDate <= threeDaysFromNow;
      });

      return upcomingRenewals;
    } catch (error) {
      console.error('❌ Failed to check upcoming renewals:', error);
      return [];
    }
  }

  /**
   * Initialize budget renewal service - typically called on app start
   */
  static async initializeRenewalService(): Promise<void> {
    console.log('🔄 Initializing budget renewal service...');
    
    try {
      // Check and renew expired budgets
      const result = await this.renewExpiredBudgets();
      
      if (result.renewed.length > 0) {
        console.log(`✅ Successfully renewed ${result.renewed.length} budget(s)`);
      }
      
      if (result.errors.length > 0) {
        console.warn(`⚠️ ${result.errors.length} error(s) during renewal:`, result.errors);
      }

      // Check for upcoming renewals
      const upcoming = await this.checkUpcomingRenewals();
      if (upcoming.length > 0) {
        console.log(`📅 ${upcoming.length} budget(s) will expire within 3 days`);
        // You could send notifications here
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize budget renewal service:', error);
    }
  }

  /**
   * Schedule periodic renewal checks (e.g., daily at midnight)
   * This would typically be implemented with a background task scheduler
   */
  static schedulePeriodicRenewal(): void {
    // This is a placeholder for scheduling logic
    // In a real app, you'd use:
    // - React Native Background Job for Android
    // - iOS Background App Refresh
    // - Push notifications to trigger checks
    // - Server-side cron jobs
    
    console.log('📅 Scheduled periodic budget renewal checks');
    
    // Example: Check every 24 hours (in a real implementation)
    // setInterval(() => {
    //   this.renewExpiredBudgets();
    // }, 24 * 60 * 60 * 1000);
  }
}

// Export a convenient function for immediate use
export const renewExpiredBudgets = () => BudgetRenewalService.renewExpiredBudgets();
export const checkUpcomingRenewals = () => BudgetRenewalService.checkUpcomingRenewals();
export const initializeBudgetRenewal = () => BudgetRenewalService.initializeRenewalService();

