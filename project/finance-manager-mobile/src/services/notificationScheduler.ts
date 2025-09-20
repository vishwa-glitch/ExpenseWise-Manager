/**
 * Notification Scheduler Service
 * Manages queuing and scheduling of budget/goal notifications at proper intervals
 * Prevents immediate notifications on app launch and schedules them appropriately
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';

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
  private static readonly MIN_DELAY_AFTER_LAUNCH = 5 * 60 * 1000; // 5 minutes after app launch
  
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
    
    // Start processing interval (check every 30 minutes)
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
    
    // Check every 30 minutes for due notifications
    this.processingInterval = setInterval(async () => {
      await this.processQueuedNotifications();
    }, 30 * 60 * 1000);
    
    console.log('📅 Started notification processing interval');
  }

  /**
   * Process notifications that are due to be sent
   */
  private async processQueuedNotifications() {
    try {
      const now = Date.now();
      const dueNotifications = this.queue.notifications.filter(n => n.scheduledFor <= now);
      
      if (dueNotifications.length === 0) {
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
      
      await notificationService.scheduleLocalNotification({
        id: notificationToSend.id,
        title: notificationToSend.title,
        body: notificationToSend.message,
        type: notificationToSend.type,
        priority: notificationToSend.priority,
        data: notificationToSend.data,
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
    // Don't queue daily reminders - they should be sent immediately
    if (notificationType === 'reminder') {
      return false;
    }
    
    // Don't queue system notifications
    if (notificationType === 'system') {
      return false;
    }
    
    // Queue budget and goal notifications
    if (notificationType === 'budget' || notificationType === 'goal') {
      return true;
    }
    
    // Default to not queuing
    return false;
  }
}

// Create singleton instance
export const notificationScheduler = new NotificationScheduler();

export default notificationScheduler;
