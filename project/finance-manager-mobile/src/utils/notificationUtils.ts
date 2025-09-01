import { notificationService } from '../services/notificationService';

export interface NotificationTrigger {
  type: 'transaction' | 'budget' | 'goal' | 'reminder' | 'system';
  title: string;
  body: string;
  data?: any;
  immediate?: boolean;
  scheduledDate?: Date;
}

/**
 * Utility class for managing notifications throughout the app
 */
export class NotificationUtils {
  /**
   * Send a transaction-related notification
   */
  static async sendTransactionNotification(
    amount: number,
    category: string,
    merchant?: string
  ) {
    const title = 'New Transaction';
    const body = merchant 
      ? `You spent $${amount.toFixed(2)} at ${merchant} (${category})`
      : `You spent $${amount.toFixed(2)} on ${category}`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'transaction',
      amount,
      category,
      merchant,
    });
  }

  /**
   * Send a budget alert notification
   */
  static async sendBudgetAlert(
    categoryName: string,
    currentAmount: number,
    budgetAmount: number,
    percentage: number
  ) {
    const title = `Budget Alert: ${categoryName}`;
    const body = `You've used ${percentage}% of your ${categoryName} budget ($${currentAmount.toFixed(2)} / $${budgetAmount.toFixed(2)})`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'budget',
      category: categoryName,
      currentAmount,
      budgetAmount,
      percentage,
    });
  }

  /**
   * Send a budget exceeded notification
   */
  static async sendBudgetExceededAlert(
    categoryName: string,
    currentAmount: number,
    budgetAmount: number
  ) {
    const title = `Budget Exceeded: ${categoryName}`;
    const body = `You've exceeded your ${categoryName} budget by $${(currentAmount - budgetAmount).toFixed(2)}`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'budget',
      category: categoryName,
      currentAmount,
      budgetAmount,
      exceeded: true,
    });
  }

  /**
   * Send a goal milestone notification
   */
  static async sendGoalMilestone(
    goalName: string,
    milestone: string,
    currentAmount: number,
    targetAmount: number
  ) {
    const percentage = Math.round((currentAmount / targetAmount) * 100);
    const title = `Goal Milestone: ${goalName}`;
    const body = `Congratulations! You've reached ${percentage}% of your goal: ${milestone}`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'goal',
      goalName,
      milestone,
      currentAmount,
      targetAmount,
      percentage,
    });
  }

  /**
   * Send a goal completed notification
   */
  static async sendGoalCompleted(goalName: string, targetAmount: number) {
    const title = `🎉 Goal Achieved: ${goalName}`;
    const body = `Congratulations! You've successfully reached your goal of $${targetAmount.toFixed(2)}`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'goal',
      goalName,
      targetAmount,
      completed: true,
    });
  }

  /**
   * Schedule a bill reminder
   */
  static async scheduleBillReminder(
    billName: string,
    amount: number,
    dueDate: Date,
    daysInAdvance: number = 3
  ) {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysInAdvance);

    return notificationService.scheduleBillReminder(billName, amount, reminderDate);
  }

  /**
   * Schedule a recurring budget review reminder
   */
  static async scheduleBudgetReviewReminder(
    dayOfWeek: number = 1, // Monday
    hour: number = 9,
    minute: number = 0
  ) {
    return notificationService.scheduleRecurringNotification(
      'Weekly Budget Review',
      'Take time to review your spending and adjust your budget for the week ahead!',
      hour,
      minute,
      dayOfWeek,
      { type: 'reminder' }
    );
  }

  /**
   * Schedule a monthly finance summary reminder
   */
  static async scheduleMonthlySummaryReminder(
    dayOfMonth: number = 1,
    hour: number = 10,
    minute: number = 0
  ) {
    const title = 'Monthly Finance Summary';
    const body = 'Review your spending patterns and financial progress for the past month';

    return notificationService.scheduleLocalNotification(
      {
        id: `monthly-summary-${Date.now()}`,
        title,
        body,
        type: 'reminder',
      },
      {
        day: dayOfMonth,
        hour,
        minute,
        repeats: true,
      }
    );
  }

  /**
   * Send a spending pattern alert
   */
  static async sendSpendingPatternAlert(
    category: string,
    amount: number,
    pattern: 'increase' | 'decrease' | 'unusual'
  ) {
    let title = '';
    let body = '';

    switch (pattern) {
      case 'increase':
        title = 'Spending Increase Detected';
        body = `Your ${category} spending has increased by $${amount.toFixed(2)} this month`;
        break;
      case 'decrease':
        title = 'Spending Decrease Detected';
        body = `Great job! Your ${category} spending has decreased by $${amount.toFixed(2)} this month`;
        break;
      case 'unusual':
        title = 'Unusual Spending Detected';
        body = `We noticed unusual spending activity in your ${category} category`;
        break;
    }

    return notificationService.sendImmediateNotification(title, body, {
      type: 'transaction',
      category,
      amount,
      pattern,
    });
  }

  /**
   * Send a low balance alert
   */
  static async sendLowBalanceAlert(
    accountName: string,
    currentBalance: number,
    threshold: number
  ) {
    const title = `Low Balance Alert: ${accountName}`;
    const body = `Your ${accountName} balance is $${currentBalance.toFixed(2)} (below $${threshold.toFixed(2)})`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'system',
      accountName,
      currentBalance,
      threshold,
    });
  }

  /**
   * Send a large transaction alert
   */
  static async sendLargeTransactionAlert(
    amount: number,
    category: string,
    merchant?: string,
    threshold: number = 100
  ) {
    const title = 'Large Transaction Alert';
    const body = merchant
      ? `Large transaction detected: $${amount.toFixed(2)} at ${merchant} (${category})`
      : `Large transaction detected: $${amount.toFixed(2)} on ${category}`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'transaction',
      amount,
      category,
      merchant,
      largeTransaction: true,
      threshold,
    });
  }

  /**
   * Send a weekly spending summary
   */
  static async sendWeeklySpendingSummary(
    totalSpent: number,
    topCategory: string,
    topCategoryAmount: number
  ) {
    const title = 'Weekly Spending Summary';
    const body = `You spent $${totalSpent.toFixed(2)} this week. Top category: ${topCategory} ($${topCategoryAmount.toFixed(2)})`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'system',
      totalSpent,
      topCategory,
      topCategoryAmount,
      weeklySummary: true,
    });
  }

  /**
   * Send a savings milestone notification
   */
  static async sendSavingsMilestone(
    milestone: string,
    currentSavings: number,
    nextMilestone?: number
  ) {
    const title = `Savings Milestone: ${milestone}`;
    const body = nextMilestone
      ? `You've saved $${currentSavings.toFixed(2)}! Next milestone: $${nextMilestone.toFixed(2)}`
      : `Congratulations! You've saved $${currentSavings.toFixed(2)}`;

    return notificationService.sendImmediateNotification(title, body, {
      type: 'goal',
      milestone,
      currentSavings,
      nextMilestone,
    });
  }

  /**
   * Send a custom notification
   */
  static async sendCustomNotification(trigger: NotificationTrigger) {
    if (trigger.immediate) {
      return notificationService.sendImmediateNotification(
        trigger.title,
        trigger.body,
        trigger.data
      );
    } else if (trigger.scheduledDate) {
      return notificationService.scheduleReminder(
        trigger.title,
        trigger.body,
        trigger.scheduledDate,
        trigger.data
      );
    } else {
      return notificationService.sendImmediateNotification(
        trigger.title,
        trigger.body,
        trigger.data
      );
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications() {
    return notificationService.cancelAllNotifications();
  }

  /**
   * Get scheduled notifications
   */
  static async getScheduledNotifications() {
    return notificationService.getScheduledNotifications();
  }
}

export default NotificationUtils;
