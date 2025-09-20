/**
 * Goal Monitoring Service
 * Automatically monitors goal activity and triggers encouraging notifications
 * Includes smart triggers for goal creation and contribution reminders
 */

import { store } from '../store';
import { fetchGoals } from '../store/slices/goalsSlice';
import { notificationService } from './notificationService';
import { Goal, GoalContribution } from '../types/goals';
import { apiService } from './api';

export interface GoalAlert {
  id: string;
  type: 'no_goals' | 'contribution_reminder' | 'milestone_approaching' | 'goal_stagnant' | 'goal_completion_near';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  goalId?: string;
  goalTitle?: string;
  data: any;
}

export interface GoalMonitoringThresholds {
  noGoalsReminderDays: number; // Default: 7 days after registration
  contributionReminderDays: number; // Default: 14 days without contribution
  milestoneApproachingDays: number; // Default: 30 days before milestone
  goalStagnantDays: number; // Default: 30 days without progress
  completionNearPercentage: number; // Default: 90% completion
}

class GoalMonitoringService {
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastAlertTimestamps: Map<string, number> = new Map();
  private alertCooldownPeriod: number = 24 * 60 * 60 * 1000; // 24 hours for goals (less frequent than budgets)

  private thresholds: GoalMonitoringThresholds = {
    noGoalsReminderDays: 7,
    contributionReminderDays: 14,
    milestoneApproachingDays: 30,
    goalStagnantDays: 30,
    completionNearPercentage: 90,
  };

  /**
   * Start automatic goal monitoring
   * Checks goal activity every 6 hours (less frequent than budget monitoring)
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('🎯 Goal monitoring already active');
      return;
    }

    console.log('🎯 Starting goal monitoring service...');
    this.isMonitoring = true;

    // Initial check after 10 minutes to avoid immediate notifications on app launch
    setTimeout(async () => {
      await this.checkGoalMetrics();
    }, 10 * 60 * 1000);

    // Set up periodic monitoring (every 6 hours)
    this.monitoringInterval = setInterval(async () => {
      await this.checkGoalMetrics();
    }, 6 * 60 * 60 * 1000);

    console.log('✅ Goal monitoring service started');
  }

  /**
   * Stop goal monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🎯 Goal monitoring service stopped');
  }

  /**
   * Check all goal metrics and trigger notifications if needed
   */
  private async checkGoalMetrics() {
    try {
      console.log('🎯 Checking goal metrics...');

      // Fetch current goals data
      const goalsResponse = await apiService.getGoals();
      const goals = goalsResponse.goals || [];

      const alerts: GoalAlert[] = [];

      // 1. Check if user has no goals
      if (goals.length === 0) {
        const noGoalsAlert = this.checkNoGoals();
        if (noGoalsAlert) {
          alerts.push(noGoalsAlert);
        }
      } else {
        // 2. Check active goals for various conditions
        const activeGoals = goals.filter((goal: Goal) => goal.status === 'active');
        
        for (const goal of activeGoals) {
          // Check contribution reminders
          const contributionAlert = await this.checkContributionReminder(goal);
          if (contributionAlert) {
            alerts.push(contributionAlert);
          }

          // Check milestone approaching
          const milestoneAlert = this.checkMilestoneApproaching(goal);
          if (milestoneAlert) {
            alerts.push(milestoneAlert);
          }

          // Check goal stagnation
          const stagnantAlert = this.checkGoalStagnant(goal);
          if (stagnantAlert) {
            alerts.push(stagnantAlert);
          }

          // Check near completion
          const completionAlert = this.checkNearCompletion(goal);
          if (completionAlert) {
            alerts.push(completionAlert);
          }
        }
      }

      // Send notifications for new alerts
      await this.processAlerts(alerts);

    } catch (error) {
      console.error('❌ Error checking goal metrics:', error);
    }
  }

  /**
   * Check if user has no goals and should be encouraged to create one
   */
  private checkNoGoals(): GoalAlert | null {
    // Check if we've already sent this reminder recently
    if (this.hasRecentAlert('no_goals')) {
      return null;
    }

    // Get user registration date or use a fallback
    const userCreatedAt = this.getUserCreationDate();
    const daysSinceRegistration = this.getDaysSince(userCreatedAt);

    // Only send reminder after user has been registered for the threshold days
    if (daysSinceRegistration >= this.thresholds.noGoalsReminderDays) {
      return {
        id: 'no_goals',
        type: 'no_goals',
        severity: 'medium',
        title: '🎯 Set Your First Financial Goal!',
        message: 'Start your journey to financial success by setting a savings goal. Whether it\'s for a vacation, emergency fund, or dream purchase - every goal begins with a single step!',
        data: {
          daysSinceRegistration,
          suggestedGoals: ['Emergency Fund', 'Vacation', 'New Car', 'House Down Payment'],
          callToAction: 'Create Your First Goal',
        },
      };
    }

    return null;
  }

  /**
   * Check if a goal needs a contribution reminder
   */
  private async checkContributionReminder(goal: Goal): Promise<GoalAlert | null> {
    const alertId = `contribution_${goal.id}`;
    
    if (this.hasRecentAlert(alertId)) {
      return null;
    }

    try {
      // Get recent contributions for this goal
      const contributions = await this.getRecentContributions(goal.id);
      
      if (contributions.length === 0) {
        // No contributions ever - check how long goal has existed
        const daysSinceCreation = this.getDaysSince(goal.created_at);
        
        if (daysSinceCreation >= 7) { // Goal exists for a week without contributions
          return {
            id: alertId,
            type: 'contribution_reminder',
            severity: 'medium',
            title: `💰 Time to fund your ${goal.title}!`,
            message: `Your "${goal.title}" goal is waiting for its first contribution. Even a small amount can get you started on the path to success!`,
            goalId: goal.id,
            goalTitle: goal.title,
            data: {
              goalCategory: goal.category,
              targetAmount: goal.target_amount,
              daysSinceCreation,
              suggestedAmount: Math.min(50, goal.target_amount * 0.05), // 5% or $50, whichever is smaller
            },
          };
        }
      } else {
        // Check last contribution date
        const lastContribution = contributions[0]; // Assuming sorted by date desc
        const daysSinceLastContribution = this.getDaysSince(lastContribution.created_at);
        
        if (daysSinceLastContribution >= this.thresholds.contributionReminderDays) {
          const progressPercentage = Math.round(goal.progress_percentage);
          
          return {
            id: alertId,
            type: 'contribution_reminder',
            severity: 'low',
            title: `🎯 Keep building your ${goal.title}!`,
            message: `You're ${progressPercentage}% towards your ${goal.title} goal! A small contribution today keeps you on track for success.`,
            goalId: goal.id,
            goalTitle: goal.title,
            data: {
              goalCategory: goal.category,
              currentAmount: goal.current_amount,
              targetAmount: goal.target_amount,
              progressPercentage,
              daysSinceLastContribution,
              monthlyTarget: goal.monthly_target,
            },
          };
        }
      }
    } catch (error) {
      console.error(`❌ Error checking contributions for goal ${goal.id}:`, error);
    }

    return null;
  }

  /**
   * Check if a milestone is approaching
   */
  private checkMilestoneApproaching(goal: Goal): GoalAlert | null {
    const alertId = `milestone_${goal.id}`;
    
    if (this.hasRecentAlert(alertId) || goal.days_remaining <= 0) {
      return null;
    }

    // Check if goal deadline is approaching and progress is behind
    if (goal.days_remaining <= this.thresholds.milestoneApproachingDays && 
        goal.progress_percentage < 70) { // Less than 70% complete with 30 days left
      
      const monthlyNeeded = goal.monthly_savings_needed || 0;
      
      return {
        id: alertId,
        type: 'milestone_approaching',
        severity: 'high',
        title: `⏰ ${goal.title} deadline approaching!`,
        message: `Only ${goal.days_remaining} days left for your ${goal.title} goal. You'll need about $${monthlyNeeded.toFixed(0)} monthly to stay on track.`,
        goalId: goal.id,
        goalTitle: goal.title,
        data: {
          daysRemaining: goal.days_remaining,
          progressPercentage: goal.progress_percentage,
          monthlyNeeded,
          remainingAmount: goal.remaining_amount,
        },
      };
    }

    return null;
  }

  /**
   * Check if a goal has been stagnant (no progress for a while)
   */
  private checkGoalStagnant(goal: Goal): GoalAlert | null {
    const alertId = `stagnant_${goal.id}`;
    
    if (this.hasRecentAlert(alertId)) {
      return null;
    }

    const daysSinceUpdate = this.getDaysSince(goal.updated_at);
    
    // Goal hasn't been updated in threshold days and has low progress
    if (daysSinceUpdate >= this.thresholds.goalStagnantDays && 
        goal.progress_percentage < 25) {
      
      return {
        id: alertId,
        type: 'goal_stagnant',
        severity: 'low',
        title: `🌱 Revive your ${goal.title} goal!`,
        message: `Your ${goal.title} goal has been quiet lately. Small consistent steps lead to big achievements - consider making a contribution today!`,
        goalId: goal.id,
        goalTitle: goal.title,
        data: {
          daysSinceUpdate,
          progressPercentage: goal.progress_percentage,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount,
        },
      };
    }

    return null;
  }

  /**
   * Check if a goal is near completion
   */
  private checkNearCompletion(goal: Goal): GoalAlert | null {
    const alertId = `completion_${goal.id}`;
    
    if (this.hasRecentAlert(alertId)) {
      return null;
    }

    if (goal.progress_percentage >= this.thresholds.completionNearPercentage) {
      const remainingAmount = goal.remaining_amount || 0;
      
      return {
        id: alertId,
        type: 'goal_completion_near',
        severity: 'high',
        title: `🎉 Almost there with ${goal.title}!`,
        message: `You're ${Math.round(goal.progress_percentage)}% complete! Just $${remainingAmount.toFixed(0)} more to achieve your ${goal.title} goal!`,
        goalId: goal.id,
        goalTitle: goal.title,
        data: {
          progressPercentage: goal.progress_percentage,
          remainingAmount,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount,
        },
      };
    }

    return null;
  }

  /**
   * Get recent contributions for a goal
   */
  private async getRecentContributions(goalId: string): Promise<GoalContribution[]> {
    try {
      // This would call the API to get recent contributions
      // For now, we'll simulate this based on goal data
      return [];
    } catch (error) {
      console.error('Error fetching contributions:', error);
      return [];
    }
  }

  /**
   * Process and send notifications for alerts
   */
  private async processAlerts(alerts: GoalAlert[]) {
    for (const alert of alerts) {
      try {
        // Send notification
        await notificationService.scheduleLocalNotification({
          id: alert.id,
          title: alert.title,
          body: alert.message,
          type: 'goal',
          priority: alert.severity === 'high' ? 'high' : 'normal',
          data: {
            alertType: alert.type,
            goalId: alert.goalId,
            goalTitle: alert.goalTitle,
            ...alert.data,
          },
        });

        // Record alert timestamp for cooldown
        this.lastAlertTimestamps.set(alert.id, Date.now());

        console.log(`🎯 Sent goal alert: ${alert.title}`);
      } catch (error) {
        console.error(`❌ Failed to send goal alert ${alert.id}:`, error);
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
   * Get user creation date (fallback to 30 days ago if not available)
   */
  private getUserCreationDate(): string {
    // This would ideally come from user profile or auth state
    // For now, fallback to 30 days ago
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() - 30);
    return fallbackDate.toISOString();
  }

  /**
   * Calculate days since a given date
   */
  private getDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update monitoring thresholds
   */
  updateThresholds(newThresholds: Partial<GoalMonitoringThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('🎯 Updated goal monitoring thresholds:', this.thresholds);
  }

  /**
   * Force check goal metrics (for testing or manual triggers)
   */
  async forceCheck() {
    console.log('🎯 Forcing goal metrics check...');
    await this.checkGoalMetrics();
  }

  /**
   * Clear alert cooldowns (for testing)
   */
  clearAlertCooldowns() {
    this.lastAlertTimestamps.clear();
    console.log('🎯 Cleared all goal alert cooldowns');
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
   * Trigger goal check after goal creation or contribution
   */
  async checkAfterGoalActivity(activityType: 'goal_created' | 'contribution_made', goalData?: any) {
    try {
      console.log(`🎯 Goal activity detected: ${activityType}`);
      
      // Clear no-goals alert if a goal was created
      if (activityType === 'goal_created') {
        this.lastAlertTimestamps.delete('no_goals');
        console.log('🎯 Cleared no-goals alert after goal creation');
      }
      
      // Clear contribution reminder if contribution was made
      if (activityType === 'contribution_made' && goalData?.goalId) {
        this.lastAlertTimestamps.delete(`contribution_${goalData.goalId}`);
        console.log(`🎯 Cleared contribution reminder for goal ${goalData.goalId}`);
      }
      
      // Force a check to update other alerts
      await this.forceCheck();
    } catch (error) {
      console.error('❌ Error checking goals after activity:', error);
    }
  }
}

// Create singleton instance
export const goalMonitoringService = new GoalMonitoringService();

export default goalMonitoringService;
