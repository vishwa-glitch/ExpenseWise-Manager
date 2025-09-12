import { notificationService } from "./notificationService";
import * as SecureStore from "expo-secure-store";

interface DailyReminderSettings {
  enabled: boolean;
  time: string; // "09:00" format
  timezone: string;
  lastSentDate?: string;
}

class DailyExpenseReminderService {
  private readonly STORAGE_KEY = "daily_expense_reminder_settings";
  private readonly LAST_SENT_KEY = "daily_reminder_last_sent";

  /**
   * Initialize daily expense reminder
   */
  async initialize() {
    try {
      // Set up daily reminder
      await this.setupDailyReminder();

      console.log("✅ Daily expense reminder initialized");
    } catch (error) {
      console.error("❌ Error initializing daily reminder:", error);
    }
  }

  /**
   * Set up multiple daily reminders throughout the day
   */
  private async setupDailyReminder() {
    try {
      // Schedule multiple daily reminders
      const reminders = [
        {
          time: "10:00",
          title: "Morning Expense Check",
          body: "Good morning! Don't forget to log any expenses from yesterday or this morning 💰",
        },
        {
          time: "17:00",
          title: "Afternoon Expense Check",
          body: "Afternoon reminder: Log your expenses to stay on top of your budget! 💰",
        },
        {
          time: "21:00",
          title: "Evening Expense Check",
          body: "Evening reminder: Log today's expenses before you wrap up for the day 💰",
        },
      ];

      for (const reminder of reminders) {
        const [hour, minute] = reminder.time.split(":").map(Number);

        await notificationService.scheduleRecurringNotification(
          reminder.title,
          reminder.body,
          hour,
          minute,
          1 // Every day (no specific weekday)
        );

        console.log(`✅ Daily reminder scheduled for ${reminder.time}`);
      }

      console.log("✅ All daily reminders scheduled successfully");
    } catch (error) {
      console.error("❌ Error scheduling daily reminders:", error);
    }
  }

  /**
   * Enable daily expense reminders
   */
  async enableDailyReminders(time: string = "09:00") {
    try {
      const settings: DailyReminderSettings = {
        enabled: true,
        time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastSentDate: new Date().toISOString().split("T")[0],
      };

      // Save settings locally
      await this.saveSettings(settings);

      // Reschedule all daily reminders
      await this.rescheduleReminder(time);

      console.log("✅ Daily expense reminders enabled");
      return true;
    } catch (error) {
      console.error("❌ Error enabling daily reminders:", error);
      return false;
    }
  }

  /**
   * Disable daily expense reminders
   */
  async disableDailyReminders() {
    try {
      const settings: DailyReminderSettings = {
        enabled: false,
        time: "09:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Save settings locally
      await this.saveSettings(settings);

      // Cancel scheduled reminder
      await notificationService.cancelAllNotifications();

      console.log("✅ Daily expense reminders disabled");
      return true;
    } catch (error) {
      console.error("❌ Error disabling daily reminders:", error);
      return false;
    }
  }

  /**
   * Check if user has logged expenses today
   */
  async hasLoggedExpensesToday(): Promise<boolean> {
    try {
      // For now, return false since we don't have backend integration
      // This can be enhanced later with local storage checking
      return false;
    } catch (error) {
      console.error("❌ Error checking today's expenses:", error);
      return false;
    }
  }

  /**
   * Send manual reminder (for testing)
   */
  async sendManualReminder() {
    try {
      const hasLogged = await this.hasLoggedExpensesToday();

      let title = "Log Today's Expenses";
      let body =
        "Take a moment to log your expenses for today and stay on track with your budget! 💰";

      if (hasLogged) {
        title = "Great Job! 🎉";
        body =
          "You've already logged your expenses today. Keep up the good work!";
      }

      // Send immediate notification
      await notificationService.sendImmediateNotification(title, body, {
        type: "daily_reminder",
        has_logged_today: hasLogged,
        screen: "Transactions",
      });

      console.log("✅ Manual reminder sent");
      return true;
    } catch (error) {
      console.error("❌ Error sending manual reminder:", error);
      return false;
    }
  }

  /**
   * Get reminder settings
   */
  async getSettings(): Promise<DailyReminderSettings> {
    try {
      const settings = await this.getStoredSettings();
      return settings;
    } catch (error) {
      console.error("❌ Error getting settings:", error);
      return {
        enabled: true,
        time: "09:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }

  /**
   * Update reminder time
   */
  async updateReminderTime(time: string) {
    try {
      const settings = await this.getSettings();
      settings.time = time;

      await this.saveSettings(settings);
      await this.rescheduleReminder(time);

      console.log("✅ Reminder time updated to", time);
      return true;
    } catch (error) {
      console.error("❌ Error updating reminder time:", error);
      return false;
    }
  }

  /**
   * Reschedule all daily reminders
   */
  private async rescheduleReminder(time: string) {
    try {
      // Cancel existing reminders
      await notificationService.cancelAllNotifications();

      // Schedule multiple daily reminders
      const reminders = [
        {
          time: "10:00",
          title: "Morning Expense Check",
          body: "Good morning! Don't forget to log any expenses from yesterday or this morning 💰",
        },
        {
          time: "17:00",
          title: "Afternoon Expense Check",
          body: "Afternoon reminder: Log your expenses to stay on top of your budget! 💰",
        },
        {
          time: "21:00",
          title: "Evening Expense Check",
          body: "Evening reminder: Log today's expenses before you wrap up for the day 💰",
        },
      ];

      for (const reminder of reminders) {
        const [hour, minute] = reminder.time.split(":").map(Number);

        await notificationService.scheduleRecurringNotification(
          reminder.title,
          reminder.body,
          hour,
          minute,
          1 // Every day
        );

        console.log(`✅ Reminder rescheduled for ${reminder.time}`);
      }

      console.log("✅ All daily reminders rescheduled successfully");
    } catch (error) {
      console.error("❌ Error rescheduling reminders:", error);
    }
  }

  /**
   * Save settings to local storage
   */
  private async saveSettings(settings: DailyReminderSettings) {
    try {
      await SecureStore.setItemAsync(
        this.STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("❌ Error saving settings:", error);
    }
  }

  /**
   * Get stored settings
   */
  private async getStoredSettings(): Promise<DailyReminderSettings> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      return {
        enabled: true,
        time: "09:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      console.error("❌ Error getting stored settings:", error);
      return {
        enabled: true,
        time: "09:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }

  /**
   * Check if reminder was already sent today
   */
  async wasReminderSentToday(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const lastSent = await SecureStore.getItemAsync(this.LAST_SENT_KEY);

      return lastSent === today;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark reminder as sent today
   */
  async markReminderSentToday() {
    try {
      const today = new Date().toISOString().split("T")[0];
      await SecureStore.setItemAsync(this.LAST_SENT_KEY, today);
    } catch (error) {
      console.error("❌ Error marking reminder as sent:", error);
    }
  }

  /**
   * Get all scheduled daily reminders
   */
  async getScheduledReminders() {
    try {
      const notifications =
        await notificationService.getScheduledNotifications();
      return notifications.filter(
        (notification) =>
          notification.content.title &&
          notification.content.title.includes("Expense Check")
      );
    } catch (error) {
      console.error("❌ Error getting scheduled reminders:", error);
      return [];
    }
  }

  /**
   * Get reminder schedule info
   */
  getReminderSchedule() {
    return [
      { time: "10:00", period: "Morning", title: "Morning Expense Check" },
      { time: "17:00", period: "Afternoon", title: "Afternoon Expense Check" },
      { time: "21:00", period: "Evening", title: "Evening Expense Check" },
    ];
  }
}

// Create singleton instance
export const dailyExpenseReminderService = new DailyExpenseReminderService();

export default dailyExpenseReminderService;
