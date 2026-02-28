import { notificationService } from './notificationService';

interface PushNotificationPayload {
  to: string | string[]; // Expo push token(s)
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  subtitle?: string;
  ttl?: number;
  expiration?: number;
}

class PushNotificationService {
  private expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  /**
   * Send a push notification to one or more users
   */
  async sendPushNotification(payload: PushNotificationPayload) {
    try {
      const response = await fetch(this.expoPushUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Push notification sent successfully:', result);
        return result;
      } else {
        console.error('❌ Failed to send push notification:', result);
        throw new Error(result.errors?.[0]?.message || 'Failed to send push notification');
      }
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send transaction notification to user
   */
  async sendTransactionNotification(
    pushToken: string,
    amount: number,
    category: string,
    merchant?: string
  ) {
    const title = 'New Transaction';
    const body = merchant 
      ? `You spent $${amount.toFixed(2)} at ${merchant} (${category})`
      : `You spent $${amount.toFixed(2)} on ${category}`;

    return this.sendPushNotification({
      to: pushToken,
      title,
      body,
      data: {
        type: 'transaction',
        amount,
        category,
        merchant,
        screen: 'Transactions',
      },
      sound: 'default',
      priority: 'high',
    });
  }

  /**
   * Send budget alert notification
   */
  async sendBudgetAlert(
    pushToken: string,
    categoryName: string,
    currentAmount: number,
    budgetAmount: number,
    percentage: number
  ) {
    const title = `Budget Alert: ${categoryName}`;
    const body = `You've used ${percentage}% of your ${categoryName} budget ($${currentAmount.toFixed(2)} / $${budgetAmount.toFixed(2)})`;

    return this.sendPushNotification({
      to: pushToken,
      title,
      body,
      data: {
        type: 'budget',
        category: categoryName,
        currentAmount,
        budgetAmount,
        percentage,
        screen: 'Budgets',
      },
      sound: 'default',
      priority: 'high',
    });
  }

  /**
   * Send goal milestone notification
   */
  async sendGoalMilestone(
    pushToken: string,
    goalName: string,
    milestone: string,
    currentAmount: number,
    targetAmount: number
  ) {
    const percentage = Math.round((currentAmount / targetAmount) * 100);
    const title = `Goal Milestone: ${goalName}`;
    const body = `Congratulations! You've reached ${percentage}% of your goal: ${milestone}`;

    return this.sendPushNotification({
      to: pushToken,
      title,
      body,
      data: {
        type: 'goal',
        goalName,
        milestone,
        currentAmount,
        targetAmount,
        percentage,
        screen: 'Goals',
      },
      sound: 'default',
      priority: 'normal',
    });
  }

  /**
   * Send bill reminder notification
   */
  async sendBillReminder(
    pushToken: string,
    billName: string,
    amount: number,
    dueDate: string
  ) {
    const title = `Bill Reminder: ${billName}`;
    const body = `Your ${billName} bill of $${amount.toFixed(2)} is due on ${dueDate}`;

    return this.sendPushNotification({
      to: pushToken,
      title,
      body,
      data: {
        type: 'reminder',
        billName,
        amount,
        dueDate,
        screen: 'Bills',
      },
      sound: 'default',
      priority: 'high',
    });
  }

  /**
   * Send large transaction alert
   */
  async sendLargeTransactionAlert(
    pushToken: string,
    amount: number,
    category: string,
    merchant?: string,
    threshold: number = 100
  ) {
    const title = 'Large Transaction Alert';
    const body = merchant
      ? `Large transaction detected: $${amount.toFixed(2)} at ${merchant} (${category})`
      : `Large transaction detected: $${amount.toFixed(2)} on ${category}`;

    return this.sendPushNotification({
      to: pushToken,
      title,
      body,
      data: {
        type: 'transaction',
        amount,
        category,
        merchant,
        largeTransaction: true,
        threshold,
        screen: 'Transactions',
      },
      sound: 'default',
      priority: 'high',
    });
  }

  /**
   * Send weekly spending summary
   */
  async sendWeeklySpendingSummary(
    pushToken: string,
    totalSpent: number,
    topCategory: string,
    topCategoryAmount: number
  ) {
    const title = 'Weekly Spending Summary';
    const body = `You spent $${totalSpent.toFixed(2)} this week. Top category: ${topCategory} ($${topCategoryAmount.toFixed(2)})`;

    return this.sendPushNotification({
      to: pushToken,
      title,
      body,
      data: {
        type: 'system',
        totalSpent,
        topCategory,
        topCategoryAmount,
        weeklySummary: true,
        screen: 'Dashboard',
      },
      sound: 'default',
      priority: 'normal',
    });
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: any
  ) {
    return this.sendPushNotification({
      to: pushToken,
      title,
      body,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      sound: 'default',
      priority: 'normal',
    });
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultipleUsers(
    pushTokens: string[],
    title: string,
    body: string,
    data?: any
  ) {
    return this.sendPushNotification({
      to: pushTokens,
      title,
      body,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      sound: 'default',
      priority: 'normal',
    });
  }

  /**
   * Get the current user's push token
   */
  async getCurrentUserPushToken(): Promise<string | null> {
    return await notificationService.getPushToken();
  }

  /**
   * Test push notification (for development)
   */
  async testPushNotification(pushToken: string) {
    return this.sendCustomNotification(
      pushToken,
      'Test Push Notification',
      'This is a test push notification from your finance app!',
      {
        type: 'test',
        timestamp: new Date().toISOString(),
      }
    );
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
