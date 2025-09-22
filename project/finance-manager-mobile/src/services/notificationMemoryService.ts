/**
 * Notification Memory Service
 * Tracks sent notifications to prevent duplicates and manages daily reminders
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SentNotification {
  id: string;
  type: 'budget' | 'goal' | 'daily_reminder';
  alertType: string;
  entityId: string; // budgetId or goalId
  sentAt: number;
  title: string;
  message: string;
}

export interface NotificationMemory {
  sentNotifications: SentNotification[];
  lastDailyReminderCheck: number;
}

class NotificationMemoryService {
  private static readonly STORAGE_KEY = 'notification_memory';
  private static readonly DUPLICATE_PREVENTION_HOURS = 24; // Don't send same notification for 24 hours
  private static readonly DAILY_REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  private memory: NotificationMemory = {
    sentNotifications: [],
    lastDailyReminderCheck: 0,
  };

  /**
   * Initialize the memory service
   */
  async initialize() {
    console.log('💭 Initializing notification memory service...');
    await this.loadMemory();
    this.cleanupOldNotifications();
    console.log('✅ Notification memory service initialized');
  }

  /**
   * Check if a notification was already sent recently
   */
  wasRecentlySent(type: 'budget' | 'goal', alertType: string, entityId: string): boolean {
    const now = Date.now();
    const cutoffTime = now - (NotificationMemoryService.DUPLICATE_PREVENTION_HOURS * 60 * 60 * 1000);
    
    const recentNotification = this.memory.sentNotifications.find(notification => 
      notification.type === type &&
      notification.alertType === alertType &&
      notification.entityId === entityId &&
      notification.sentAt > cutoffTime
    );

    if (recentNotification) {
      const hoursAgo = Math.round((now - recentNotification.sentAt) / (60 * 60 * 1000));
      console.log(`💭 Skipping duplicate ${type} notification for ${entityId} (sent ${hoursAgo}h ago)`);
      return true;
    }

    return false;
  }

  /**
   * Record that a notification was sent
   */
  async recordSentNotification(
    type: 'budget' | 'goal' | 'daily_reminder',
    alertType: string,
    entityId: string,
    title: string,
    message: string
  ) {
    const sentNotification: SentNotification = {
      id: `${type}_${alertType}_${entityId}_${Date.now()}`,
      type,
      alertType,
      entityId,
      sentAt: Date.now(),
      title,
      message,
    };

    this.memory.sentNotifications.push(sentNotification);
    await this.saveMemory();
    
    console.log(`💭 Recorded sent notification: ${type} - ${alertType} for ${entityId}`);
  }

  /**
   * Check if daily goal reminders should be sent
   */
  shouldSendDailyReminders(): boolean {
    const now = Date.now();
    const timeSinceLastCheck = now - this.memory.lastDailyReminderCheck;
    
    if (timeSinceLastCheck >= NotificationMemoryService.DAILY_REMINDER_INTERVAL) {
      console.log('💭 Time for daily goal contribution reminders');
      return true;
    }

    const hoursUntilNext = Math.round((NotificationMemoryService.DAILY_REMINDER_INTERVAL - timeSinceLastCheck) / (60 * 60 * 1000));
    console.log(`💭 Daily reminders not due yet (${hoursUntilNext}h remaining)`);
    return false;
  }

  /**
   * Mark that daily reminders were checked
   */
  async markDailyRemindersChecked() {
    this.memory.lastDailyReminderCheck = Date.now();
    await this.saveMemory();
    console.log('💭 Marked daily reminders as checked');
  }

  /**
   * Check if a daily reminder was sent for a specific goal today
   */
  wasDailyReminderSentToday(goalId: string): boolean {
    const now = Date.now();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    
    const todayReminder = this.memory.sentNotifications.find(notification =>
      notification.type === 'daily_reminder' &&
      notification.entityId === goalId &&
      notification.sentAt >= todayStart
    );

    return !!todayReminder;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentNotifications = this.memory.sentNotifications.filter(n => n.sentAt > last24Hours);
    const budgetNotifications = recentNotifications.filter(n => n.type === 'budget');
    const goalNotifications = recentNotifications.filter(n => n.type === 'goal');
    const dailyReminders = recentNotifications.filter(n => n.type === 'daily_reminder');

    return {
      totalSentNotifications: this.memory.sentNotifications.length,
      recentNotifications: recentNotifications.length,
      budgetNotifications: budgetNotifications.length,
      goalNotifications: goalNotifications.length,
      dailyReminders: dailyReminders.length,
      lastDailyReminderCheck: this.memory.lastDailyReminderCheck,
      lastDailyReminderDate: this.memory.lastDailyReminderCheck ? 
        new Date(this.memory.lastDailyReminderCheck).toLocaleString() : 'Never',
    };
  }

  /**
   * Clean up old notifications (older than 7 days)
   */
  private cleanupOldNotifications() {
    const now = Date.now();
    const cutoffTime = now - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    const initialCount = this.memory.sentNotifications.length;
    this.memory.sentNotifications = this.memory.sentNotifications.filter(
      notification => notification.sentAt > cutoffTime
    );
    
    const removedCount = initialCount - this.memory.sentNotifications.length;
    if (removedCount > 0) {
      console.log(`💭 Cleaned up ${removedCount} old notification records`);
    }
  }

  /**
   * Load memory from AsyncStorage
   */
  private async loadMemory() {
    try {
      const storedMemory = await AsyncStorage.getItem(NotificationMemoryService.STORAGE_KEY);
      if (storedMemory) {
        this.memory = JSON.parse(storedMemory);
        console.log(`💭 Loaded ${this.memory.sentNotifications.length} notification records from storage`);
      }
    } catch (error) {
      console.error('❌ Error loading notification memory:', error);
      // Reset to default on error
      this.memory = {
        sentNotifications: [],
        lastDailyReminderCheck: 0,
      };
    }
  }

  /**
   * Save memory to AsyncStorage
   */
  private async saveMemory() {
    try {
      await AsyncStorage.setItem(NotificationMemoryService.STORAGE_KEY, JSON.stringify(this.memory));
    } catch (error) {
      console.error('❌ Error saving notification memory:', error);
    }
  }

  /**
   * Clear all memory (for testing)
   */
  async clearMemory() {
    this.memory = {
      sentNotifications: [],
      lastDailyReminderCheck: 0,
    };
    await this.saveMemory();
    console.log('💭 Cleared notification memory');
  }

  /**
   * Get recent notifications for debugging
   */
  getRecentNotifications(hours: number = 24) {
    const now = Date.now();
    const cutoffTime = now - (hours * 60 * 60 * 1000);
    
    return this.memory.sentNotifications
      .filter(n => n.sentAt > cutoffTime)
      .sort((a, b) => b.sentAt - a.sentAt)
      .map(n => ({
        ...n,
        sentAtFormatted: new Date(n.sentAt).toLocaleString(),
        hoursAgo: Math.round((now - n.sentAt) / (60 * 60 * 1000)),
      }));
  }
}

// Create singleton instance
export const notificationMemoryService = new NotificationMemoryService();

export default notificationMemoryService;
