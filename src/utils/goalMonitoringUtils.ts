/**
 * Goal Monitoring Utilities
 * Helper functions to integrate goal monitoring with app events
 */

import { goalMonitoringService } from '../services/goalMonitoringService';

/**
 * Trigger goal check after a goal is created
 */
export const checkGoalsAfterGoalCreation = async (goalData?: any) => {
  try {
    console.log('🎯 Goal creation detected, updating monitoring...');
    
    // Trigger immediate goal check
    await goalMonitoringService.checkAfterGoalActivity('goal_created', goalData);
    
    // Log goal details if provided
    if (goalData) {
      console.log('🎯 Goal creation details:', {
        goalId: goalData.goalId,
        title: goalData.goalTitle,
        category: goalData.goalData?.category,
      });
    }
  } catch (error) {
    console.error('❌ Error checking goals after creation:', error);
  }
};

/**
 * Trigger goal check after a contribution is made
 */
export const checkGoalsAfterContribution = async (contributionData?: any) => {
  try {
    console.log('💰 Goal contribution detected, updating monitoring...');
    
    // Trigger immediate goal check
    await goalMonitoringService.checkAfterGoalActivity('contribution_made', contributionData);
    
    // Log contribution details if provided
    if (contributionData) {
      console.log('💰 Contribution details:', {
        goalId: contributionData.goalId,
        amount: contributionData.amount,
        description: contributionData.description,
      });
    }
  } catch (error) {
    console.error('❌ Error checking goals after contribution:', error);
  }
};

/**
 * Initialize goal monitoring when app starts
 */
export const initializeGoalMonitoring = async () => {
  try {
    console.log('🎯 Initializing goal monitoring...');
    await goalMonitoringService.startMonitoring();
    console.log('✅ Goal monitoring initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize goal monitoring:', error);
  }
};

/**
 * Stop goal monitoring when app is backgrounded or user logs out
 */
export const stopGoalMonitoring = () => {
  try {
    console.log('🎯 Stopping goal monitoring...');
    goalMonitoringService.stopMonitoring();
    console.log('✅ Goal monitoring stopped');
  } catch (error) {
    console.error('❌ Error stopping goal monitoring:', error);
  }
};

/**
 * Get current goal monitoring status for debugging
 */
export const getGoalMonitoringStatus = () => {
  return goalMonitoringService.getStatus();
};

/**
 * Update goal monitoring thresholds (for settings screen)
 */
export const updateGoalMonitoringThresholds = (thresholds: any) => {
  goalMonitoringService.updateThresholds(thresholds);
};

/**
 * Clear goal alert cooldowns (for testing or user request)
 */
export const clearGoalAlertCooldowns = () => {
  goalMonitoringService.clearAlertCooldowns();
};

/**
 * Force check goal metrics (for testing or manual triggers)
 */
export const forceGoalCheck = async () => {
  try {
    console.log('🎯 Forcing goal metrics check...');
    await goalMonitoringService.forceCheck();
    console.log('✅ Goal check completed');
  } catch (error) {
    console.error('❌ Error forcing goal check:', error);
  }
};
