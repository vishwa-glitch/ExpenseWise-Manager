import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { store } from '../store';
import { fetchNotifications, fetchUnreadNotifications } from '../store/slices/notificationsSlice';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type?: 'transaction' | 'budget' | 'goal' | 'reminder' | 'system';
  priority?: 'high' | 'normal' | 'low';
}

class NotificationService {
  private expoPushToken: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.registerForPushNotificationsAsync();
    this.setupNotificationListeners();
  }

  private async registerForPushNotificationsAsync() {
    let token;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('❌ Failed to get push token: permissions not granted');
          return;
        }
        
        console.log('🔔 Getting Expo push token...');
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: '08cb1df3-0c2c-4482-9bcc-68006b5f2ab8',
        })).data;
        console.log('✅ Expo push token obtained:', token);
      } else {
        console.log('⚠️ Must use physical device for Push Notifications');
      }

      this.expoPushToken = token || null;
      return token;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  private setupNotificationListeners() {
    // Handle notification received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      // Refresh notifications in store
      store.dispatch(fetchNotifications());
      store.dispatch(fetchUnreadNotifications());
    });

    // Handle notification response (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification response:', response);
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      this.handleNotificationNavigation(data);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  private handleNotificationNavigation(data: any) {
    // Navigate based on notification type
    switch (data?.type) {
      case 'transaction':
        // Navigate to transactions screen
        break;
      case 'budget':
        // Navigate to budgets screen
        break;
      case 'goal':
        // Navigate to goals screen
        break;
      default:
        // Navigate to notifications screen
        break;
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(notification: NotificationData, trigger?: Notifications.NotificationTriggerInput) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          priority: notification.priority === 'high' ? Notifications.AndroidNotificationPriority.HIGH : Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: trigger || null, // null means show immediately
      });
      
      console.log('🔔 Scheduled notification:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      throw error;
    }
  }

  // Schedule a reminder notification
  async scheduleReminder(title: string, body: string, date: Date, data?: any) {
    return this.scheduleLocalNotification(
      {
        id: `reminder-${Date.now()}`,
        title,
        body,
        data,
        type: 'reminder',
      },
      {
        date,
      }
    );
  }

  // Schedule a recurring notification (e.g., weekly budget reminder)
  async scheduleRecurringNotification(
    title: string,
    body: string,
    hour: number,
    minute: number,
    weekday?: number, // 1-7 (Monday-Sunday)
    data?: any
  ) {
    const trigger: any = {
      hour,
      minute,
      repeats: true,
    };

    if (weekday) {
      trigger.weekday = weekday;
    }

    return this.scheduleLocalNotification(
      {
        id: `recurring-${Date.now()}`,
        title,
        body,
        data,
        type: 'reminder',
      },
      trigger
    );
  }

  // Cancel a specific notification
  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Get push token
  async getPushToken(): Promise<string | null> {
    if (!this.expoPushToken) {
      // Try to register for push notifications again if token is not available
      await this.registerForPushNotificationsAsync();
    }
    return this.expoPushToken;
  }

  // Send immediate notification (for testing)
  async sendImmediateNotification(title: string, body: string, data?: any) {
    return this.scheduleLocalNotification(
      {
        id: `immediate-${Date.now()}`,
        title,
        body,
        data,
        type: 'system',
      }
    );
  }

  // Schedule budget alert notification
  async scheduleBudgetAlert(categoryName: string, currentAmount: number, budgetAmount: number, date: Date) {
    const percentage = Math.round((currentAmount / budgetAmount) * 100);
    const title = `Budget Alert: ${categoryName}`;
    const body = `You've spent ${percentage}% of your ${categoryName} budget ($${currentAmount.toFixed(2)} / $${budgetAmount.toFixed(2)})`;

    return this.scheduleReminder(title, body, date, {
      type: 'budget',
      category: categoryName,
      currentAmount,
      budgetAmount,
    });
  }

  // Schedule bill reminder
  async scheduleBillReminder(billName: string, amount: number, dueDate: Date) {
    const title = `Bill Reminder: ${billName}`;
    const body = `Your ${billName} bill of $${amount.toFixed(2)} is due soon`;

    return this.scheduleReminder(title, body, dueDate, {
      type: 'reminder',
      billName,
      amount,
    });
  }

  // Schedule goal milestone notification
  async scheduleGoalMilestone(goalName: string, milestone: string, date: Date) {
    const title = `Goal Milestone: ${goalName}`;
    const body = `Congratulations! You've reached: ${milestone}`;

    return this.scheduleReminder(title, body, date, {
      type: 'goal',
      goalName,
      milestone,
    });
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

export default notificationService;
