import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { notificationService } from "./notificationService";

interface DailyReminderSettings {
  enabled: boolean;
  time: string; // "09:00" format
  timezone: string;
  lastSentDate?: string;
}

class DailyExpenseReminderService {
  private readonly STORAGE_KEY = "daily_expense_reminder_settings";
  private readonly LAST_SENT_KEY = "daily_reminder_last_sent";
  private readonly REMINDER_NOTIFICATION_IDS_KEY =
    "daily_expense_reminder_notification_ids";
  private readonly DEFAULT_TIME = "21:00";

  /**
   * Initialize the daily expense reminder using saved settings.
   */
  async initialize() {
    try {
      const settings = await this.getSettings();

      if (!settings.enabled) {
        console.log("🔕 Daily expense reminders are disabled");
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.log(
          "⚠️ Notification permissions not granted, skipping daily reminder initialization"
        );
        return;
      }

      await this.rescheduleReminder(settings.time);
      console.log("✅ Daily expense reminder initialized");
    } catch (error) {
      console.error("❌ Error initializing daily reminder:", error);
    }
  }

  /**
   * Enable a single daily reminder at the chosen time.
   */
  async enableDailyReminders(time: string = this.DEFAULT_TIME) {
    try {
      const normalizedTime = this.normalizeTime(time);
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        console.log("⚠️ Cannot enable reminders without notification permission");
        return false;
      }

      const settings: DailyReminderSettings = {
        enabled: true,
        time: normalizedTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastSentDate: new Date().toISOString().split("T")[0],
      };

      await this.saveSettings(settings);
      await this.rescheduleReminder(normalizedTime);

      console.log("✅ Daily expense reminders enabled");
      return true;
    } catch (error) {
      console.error("❌ Error enabling daily reminders:", error);
      return false;
    }
  }

  /**
   * Disable the daily reminder.
   */
  async disableDailyReminders() {
    try {
      const existingSettings = await this.getSettings();
      const settings: DailyReminderSettings = {
        enabled: false,
        time: existingSettings.time || this.DEFAULT_TIME,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await this.saveSettings(settings);
      await this.cancelScheduledDailyReminders();

      console.log("✅ Daily expense reminders disabled");
      return true;
    } catch (error) {
      console.error("❌ Error disabling daily reminders:", error);
      return false;
    }
  }

  /**
   * Check if user has logged expenses today.
   * Placeholder until true local/backend transaction lookups are added.
   */
  async hasLoggedExpensesToday(): Promise<boolean> {
    try {
      return false;
    } catch (error) {
      console.error("❌ Error checking today's expenses:", error);
      return false;
    }
  }

  /**
   * Send an immediate reminder for testing.
   */
  async sendManualReminder() {
    try {
      const hasLogged = await this.hasLoggedExpensesToday();

      let title = "Log Today's Expenses";
      let body =
        "Take a moment to log your expenses for today and stay on track with your budget.";

      if (hasLogged) {
        title = "Great Job!";
        body = "You've already logged your expenses today. Keep it up.";
      }

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
   * Get reminder settings.
   */
  async getSettings(): Promise<DailyReminderSettings> {
    try {
      return await this.getStoredSettings();
    } catch (error) {
      console.error("❌ Error getting settings:", error);
      return {
        enabled: false,
        time: this.DEFAULT_TIME,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }

  /**
   * Update reminder time and reschedule if currently enabled.
   */
  async updateReminderTime(time: string) {
    try {
      const settings = await this.getSettings();
      settings.time = this.normalizeTime(time);

      await this.saveSettings(settings);

      if (settings.enabled) {
        await this.rescheduleReminder(settings.time);
      }

      console.log("✅ Reminder time updated to", settings.time);
      return true;
    } catch (error) {
      console.error("❌ Error updating reminder time:", error);
      return false;
    }
  }

  /**
   * Check if reminder was already sent today.
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
   * Mark reminder as sent today.
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
   * Get scheduled reminder notifications tracked by this service.
   */
  async getScheduledReminders() {
    try {
      const notifications = await notificationService.getScheduledNotifications();
      const scheduledIds = await this.getReminderNotificationIds();

      return notifications.filter((notification) => {
        if (scheduledIds.length > 0) {
          return scheduledIds.includes(notification.identifier);
        }

        return notification.content.data?.id === "daily-expense-reminder";
      });
    } catch (error) {
      console.error("❌ Error getting scheduled reminders:", error);
      return [];
    }
  }

  /**
   * Get displayable schedule metadata for the current reminder.
   */
  async getReminderSchedule() {
    const settings = await this.getSettings();

    return [
      {
        time: settings.time,
        period: "Daily",
        title: "Daily Expense Reminder",
      },
    ];
  }

  private async rescheduleReminder(time: string) {
    try {
      await this.setupDailyReminder(time);

      const scheduled = await this.getScheduledReminders();
      console.log(`📅 Daily reminder count after reschedule: ${scheduled.length}`);
    } catch (error) {
      console.error("❌ Error rescheduling reminders:", error);
    }
  }

  private async setupDailyReminder(time: string) {
    try {
      await this.cancelScheduledDailyReminders();

      const normalizedTime = this.normalizeTime(time);
      const [hour, minute] = normalizedTime.split(":").map(Number);

      const notificationId =
        await notificationService.scheduleRecurringNotification(
          "Daily Expense Reminder",
          "Log today's expenses and keep your budget up to date.",
          hour,
          minute,
          undefined,
          {
            type: "daily_reminder",
            reminderType: "daily",
            id: "daily-expense-reminder",
            scheduledTime: normalizedTime,
            screen: "Transactions",
          }
        );

      await this.saveReminderNotificationIds([notificationId]);
      console.log(`✅ Daily reminder scheduled for ${normalizedTime}`);
    } catch (error) {
      console.error("❌ Error scheduling daily reminder:", error);
    }
  }

  private normalizeTime(time: string) {
    const trimmed = time.trim();
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);

    if (!match) {
      return this.DEFAULT_TIME;
    }

    const [, hours, minutes] = match;
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  private async saveSettings(settings: DailyReminderSettings) {
    try {
      await SecureStore.setItemAsync(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("❌ Error saving settings:", error);
    }
  }

  private async getStoredSettings(): Promise<DailyReminderSettings> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      return {
        enabled: false,
        time: this.DEFAULT_TIME,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      console.error("❌ Error getting stored settings:", error);
      return {
        enabled: false,
        time: this.DEFAULT_TIME,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }

  private async cancelScheduledDailyReminders() {
    try {
      const scheduledIds = await this.getReminderNotificationIds();

      await Promise.all(
        scheduledIds.map((notificationId) =>
          notificationService.cancelNotification(notificationId).catch((error) => {
            console.error(
              `❌ Failed to cancel daily reminder ${notificationId}:`,
              error
            );
          })
        )
      );

      await this.clearReminderNotificationIds();
    } catch (error) {
      console.error("❌ Error cancelling scheduled daily reminders:", error);
    }
  }

  private async saveReminderNotificationIds(notificationIds: string[]) {
    try {
      await SecureStore.setItemAsync(
        this.REMINDER_NOTIFICATION_IDS_KEY,
        JSON.stringify(notificationIds)
      );
    } catch (error) {
      console.error("❌ Error saving daily reminder identifiers:", error);
    }
  }

  private async clearReminderNotificationIds() {
    try {
      await SecureStore.deleteItemAsync(this.REMINDER_NOTIFICATION_IDS_KEY);
    } catch (error) {
      console.error("❌ Error clearing daily reminder identifiers:", error);
    }
  }

  private async getReminderNotificationIds() {
    try {
      const storedIds = await SecureStore.getItemAsync(
        this.REMINDER_NOTIFICATION_IDS_KEY
      );
      return storedIds ? (JSON.parse(storedIds) as string[]) : [];
    } catch (error) {
      console.error("❌ Error loading daily reminder identifiers:", error);
      return [];
    }
  }
}

export const dailyExpenseReminderService = new DailyExpenseReminderService();

export default dailyExpenseReminderService;
