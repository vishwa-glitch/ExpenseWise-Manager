/**
 * Notification Scheduler Service
 * Manages queuing and scheduling of budget/goal notifications at proper intervals
 * Prevents immediate notifications on app launch and schedules them appropriately
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface ScheduledNotification {
  id: string;
  type: 'budget' | 'goal';
  title: string;
  message: string;
  data: any;
  priority: 'high' | 'normal' | 'low';
  scheduledFor: number; // timestamp
  createdAt: number;
}

export interface NotificationQueue {
  notifications: ScheduledNotification[];
  lastProcessed: number;
  nextScheduledTime: number;
}

class NotificationScheduler {
  private static readonly STORAGE_KEY = 'notification_queue';
  private static readonly NOTIFICATION_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  private static readonly MIN_DELAY_AFTER_LAUNCH = 2 * 60 * 1000; // 2 minutes after app launch (reduced for testing)
  
  private queue: NotificationQueue = {
    notifications: [],
    lastProcessed: 0,
    nextScheduledTime: 0,
  };
  
  private processingInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize the notification scheduler
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('📅 Notification scheduler already initialized');
      return;
    }

    console.log('📅 Initializing notification scheduler...');
    
    // Load existing queue from storage
    await this.loadQueue();
    
    // Clean up expired notifications
    this.cleanupExpiredNotifications();
    
    // Check for due notifications immediately
    await this.processQueuedNotifications();
    
    // Start processing interval (check every 5 minutes for better responsiveness)
    this.startProcessingInterval();
    
    this.isInitialized = true;
    console.log('✅ Notification scheduler initialized');
  }

  /**
   * Add a notification to the queue instead of sending immediately
   */
  async queueNotification(notification: Omit<ScheduledNotification, 'scheduledFor' | 'createdAt'>) {
    try {
      const now = Date.now();
      
      // Check if this notification already exists in queue
      const existingIndex = this.queue.notifications.findIndex(n => n.id === notification.id);
      
      if (existingIndex !== -1) {
        // Update existing notification
        this.queue.notifications[existingIndex] = {
          ...notification,
          scheduledFor: this.calculateNextScheduleTime(),
          createdAt: now,
        };
        console.log(`📅 Updated queued notification: ${notification.title}`);
      } else {
        // Add new notification to queue
        const scheduledNotification: ScheduledNotification = {
          ...notification,
          scheduledFor: this.calculateNextScheduleTime(),
          createdAt: now,
        };
        
        this.queue.notifications.push(scheduledNotification);
        console.log(`📅 Queued notification: ${notification.title} for ${new Date(scheduledNotification.scheduledFor).toLocaleString()}`);
      }
      
      // Save queue to storage
      await this.saveQueue();
      
      // Update next scheduled time
      this.updateNextScheduledTime();
      
    } catch (error) {
      console.error('❌ Error queuing notification:', error);
    }
  }

  /**
   * Calculate the next appropriate time to schedule a notification
   */
  private calculateNextScheduleTime(): number {
    const now = Date.now();
    const minDelayTime = now + NotificationScheduler.MIN_DELAY_AFTER_LAUNCH;
    
    // If no notifications have been processed yet, schedule for minimum delay
    if (this.queue.lastProcessed === 0) {
      return minDelayTime;
    }
    
    // Calculate next 2-hour interval from last processed time
    const nextIntervalTime = this.queue.lastProcessed + NotificationScheduler.NOTIFICATION_INTERVAL;
    
    // Use whichever is later: minimum delay or next interval
    return Math.max(minDelayTime, nextIntervalTime);
  }

  /**
   * Update the next scheduled time based on queued notifications
   */
  private updateNextScheduledTime() {
    if (this.queue.notifications.length === 0) {
      this.queue.nextScheduledTime = 0;
      return;
    }
    
    // Find the earliest scheduled notification
    const earliestTime = Math.min(...this.queue.notifications.map(n => n.scheduledFor));
    this.queue.nextScheduledTime = earliestTime;
  }

  /**
   * Start the processing interval to check for due notifications
   */
  private startProcessingInterval() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    // Check every 5 minutes for due notifications (more responsive for testing)
    this.processingInterval = setInterval(async () => {
      await this.processQueuedNotifications();
    }, 5 * 60 * 1000);
    
    console.log('📅 Started notification processing interval');
  }

  /**
   * Process notifications that are due to be sent
   */
  private async processQueuedNotifications() {
    try {
      const now = Date.now();
      const dueNotifications = this.queue.notifications.filter(n => n.scheduledFor <= now);
      
      console.log(`📅 Checking queue: ${this.queue.notifications.length} total, ${dueNotifications.length} due`);
      
      if (dueNotifications.length === 0) {
        if (this.queue.notifications.length > 0) {
          const nextDue = Math.min(...this.queue.notifications.map(n => n.scheduledFor));
          const minutesUntilNext = Math.round((nextDue - now) / (60 * 1000));
          console.log(`📅 Next notification due in ${minutesUntilNext} minutes`);
        }
        return;
      }
      
      console.log(`📅 Processing ${dueNotifications.length} due notifications`);
      
      // Sort by priority (high first) and creation time
      dueNotifications.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt - b.createdAt;
      });
      
      // Send the highest priority notification
      const notificationToSend = dueNotifications[0];
      
      // Send notification directly using Expo Notifications to avoid circular dependency
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationToSend.title,
          body: notificationToSend.message,
          data: {
            type: notificationToSend.type,
            ...notificationToSend.data,
          },
          sound: true,
          priority: notificationToSend.priority === 'high' 
            ? Notifications.AndroidNotificationPriority.HIGH 
            : Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null, // Send immediately
      });
      
      console.log(`📅 Sent scheduled notification: ${notificationToSend.title}`);
      
      // Remove sent notification from queue
      this.queue.notifications = this.queue.notifications.filter(n => n.id !== notificationToSend.id);
      
      // Update last processed time
      this.queue.lastProcessed = now;
      
      // Reschedule remaining notifications for next interval
      if (dueNotifications.length > 1) {
        const remainingNotifications = dueNotifications.slice(1);
        const nextScheduleTime = now + NotificationScheduler.NOTIFICATION_INTERVAL;
        
        remainingNotifications.forEach(notification => {
          const index = this.queue.notifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            this.queue.notifications[index].scheduledFor = nextScheduleTime;
          }
        });
        
        console.log(`📅 Rescheduled ${remainingNotifications.length} notifications for next interval`);
      }
      
      // Update next scheduled time
      this.updateNextScheduledTime();
      
      // Save updated queue
      await this.saveQueue();
      
    } catch (error) {
      console.error('❌ Error processing queued notifications:', error);
    }
  }

  /**
   * Clean up expired notifications (older than 24 hours)
   */
  private cleanupExpiredNotifications() {
    const now = Date.now();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
    
    const initialCount = this.queue.notifications.length;
    this.queue.notifications = this.queue.notifications.filter(
      n => (now - n.createdAt) < expirationTime
    );
    
    const removedCount = initialCount - this.queue.notifications.length;
    if (removedCount > 0) {
      console.log(`📅 Cleaned up ${removedCount} expired notifications`);
    }
  }

  /**
   * Load queue from AsyncStorage
   */
  private async loadQueue() {
    try {
      const storedQueue = await AsyncStorage.getItem(NotificationScheduler.STORAGE_KEY);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
        console.log(`📅 Loaded ${this.queue.notifications.length} notifications from storage`);
      }
    } catch (error) {
      console.error('❌ Error loading notification queue:', error);
      // Reset to default queue on error
      this.queue = {
        notifications: [],
        lastProcessed: 0,
        nextScheduledTime: 0,
      };
    }
  }

  /**
   * Save queue to AsyncStorage
   */
  private async saveQueue() {
    try {
      await AsyncStorage.setItem(NotificationScheduler.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('❌ Error saving notification queue:', error);
    }
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      queuedNotifications: this.queue.notifications.length,
      nextScheduledTime: this.queue.nextScheduledTime,
      nextScheduledDate: this.queue.nextScheduledTime ? new Date(this.queue.nextScheduledTime).toLocaleString() : 'None',
      lastProcessed: this.queue.lastProcessed,
      lastProcessedDate: this.queue.lastProcessed ? new Date(this.queue.lastProcessed).toLocaleString() : 'Never',
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Clear all queued notifications (for testing)
   */
  async clearQueue() {
    this.queue = {
      notifications: [],
      lastProcessed: 0,
      nextScheduledTime: 0,
    };
    await this.saveQueue();
    console.log('📅 Cleared notification queue');
  }

  /**
   * Force process queue immediately (for testing)
   */
  async forceProcessQueue() {
    console.log('📅 Force processing notification queue...');
    await this.processQueuedNotifications();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isInitialized = false;
    console.log('📅 Notification scheduler stopped');
  }

  /**
   * Check if a notification type should be queued or sent immediately
   * Daily reminders and system notifications are sent immediately
   */
  shouldQueue(notificationType: string, alertType?: string): boolean {
    // Send all notifications immediately now (user requested change)
    return false;
    
    // Previous queuing logic (disabled):
    // - Budget and goal notifications are now sent immediately
    // - App will remember sent notifications to avoid duplicates
  }

  /**
   * Add a test notification for immediate testing (bypasses normal delays)
   */
  async addTestNotification(type: 'budget' | 'goal', title: string, message: string) {
    const testNotification: ScheduledNotification = {
      id: `test-${type}-${Date.now()}`,
      type,
      title,
      message,
      data: { test: true, alertType: 'test' },
      priority: 'high',
      scheduledFor: Date.now() + 30000, // 30 seconds from now
      createdAt: Date.now(),
    };
    
    this.queue.notifications.push(testNotification);
    await this.saveQueue();
    this.updateNextScheduledTime();
    
    console.log(`📅 Added test notification: ${title} (due in 30 seconds)`);
    return testNotification.id;
  }

  /**
   * Send an immediate test notification to verify the notification system works
   */
  async sendImmediateTestNotification() {
    try {
      console.log('📅 Sending immediate test notification...');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Immediate Test Notification',
          body: 'If you see this, the notification system is working! This bypasses all queuing.',
          data: {
            type: 'test',
            immediate: true,
            timestamp: Date.now(),
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
      
      console.log(`📅 Sent immediate test notification with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to send immediate test notification:', error);
      throw error;
    }
  }

  /**
   * Get detailed debug information about the scheduler state
   */
  getDetailedStatus() {
    const now = Date.now();
    return {
      isInitialized: this.isInitialized,
      queuedNotifications: this.queue.notifications.length,
      nextScheduledTime: this.queue.nextScheduledTime,
      nextScheduledDate: this.queue.nextScheduledTime ? new Date(this.queue.nextScheduledTime).toLocaleString() : 'None',
      lastProcessed: this.queue.lastProcessed,
      lastProcessedDate: this.queue.lastProcessed ? new Date(this.queue.lastProcessed).toLocaleString() : 'Never',
      currentTime: new Date(now).toLocaleString(),
      notifications: this.queue.notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        priority: n.priority,
        scheduledFor: new Date(n.scheduledFor).toLocaleString(),
        isDue: n.scheduledFor <= now,
        minutesUntilDue: Math.round((n.scheduledFor - now) / (60 * 1000)),
      })),
      intervals: {
        notificationInterval: NotificationScheduler.NOTIFICATION_INTERVAL / (60 * 60 * 1000) + ' hours',
        minDelayAfterLaunch: NotificationScheduler.MIN_DELAY_AFTER_LAUNCH / (60 * 1000) + ' minutes',
        processingInterval: '5 minutes',
      },
    };
  }
}

// Create singleton instance
export const notificationScheduler = new NotificationScheduler();

export default notificationScheduler;
