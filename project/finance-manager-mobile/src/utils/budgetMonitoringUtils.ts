/**
 * Budget Monitoring Utilities
 * Helper functions to integrate budget monitoring with transaction events
 */

import { budgetMonitoringService } from '../services/budgetMonitoringService';

/**
 * Trigger budget check after a transaction is added
 * This ensures immediate feedback when spending affects budgets
 */
export const checkBudgetsAfterTransaction = async (transactionData?: any) => {
  try {
    console.log('💰 Transaction detected, checking budget impacts...');
    
    // Force an immediate budget check
    await budgetMonitoringService.forceCheck();
    
    // Log transaction details if provided
    if (transactionData) {
      console.log('💰 Transaction details:', {
        amount: transactionData.amount,
        category: transactionData.category,
        type: transactionData.type,
      });
    }
  } catch (error) {
    console.error('❌ Error checking budgets after transaction:', error);
  }
};

/**
 * Initialize budget monitoring when app starts
 * Called from app initialization flow
 */
export const initializeBudgetMonitoring = async () => {
  try {
    console.log('🔍 Initializing budget monitoring...');
    await budgetMonitoringService.startMonitoring();
    console.log('✅ Budget monitoring initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize budget monitoring:', error);
  }
};

/**
 * Stop budget monitoring when app is backgrounded or user logs out
 */
export const stopBudgetMonitoring = () => {
  try {
    console.log('🔍 Stopping budget monitoring...');
    budgetMonitoringService.stopMonitoring();
    console.log('✅ Budget monitoring stopped');
  } catch (error) {
    console.error('❌ Error stopping budget monitoring:', error);
  }
};

/**
 * Get current monitoring status for debugging
 */
export const getBudgetMonitoringStatus = () => {
  return budgetMonitoringService.getStatus();
};

/**
 * Update monitoring thresholds (for settings screen)
 */
export const updateMonitoringThresholds = (thresholds: any) => {
  budgetMonitoringService.updateThresholds(thresholds);
};

/**
 * Clear alert cooldowns (for testing or user request)
 */
export const clearBudgetAlertCooldowns = () => {
  budgetMonitoringService.clearAlertCooldowns();
};
