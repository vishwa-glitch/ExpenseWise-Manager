import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { dailyExpenseReminderService } from '../../services/dailyExpenseReminderService';

const DailyReminderSettingsScreen: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  useEffect(() => {
    loadSettings();
    checkTodayStatus();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await dailyExpenseReminderService.getSettings();
      setIsEnabled(settings.enabled);
      setReminderTime(settings.time);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayStatus = async () => {
    try {
      const hasLogged = await dailyExpenseReminderService.hasLoggedExpensesToday();
      setHasLoggedToday(hasLogged);
    } catch (error) {
      console.error('Error checking today status:', error);
    }
  };

  const toggleReminder = async (value: boolean) => {
    try {
      setLoading(true);
      
      if (value) {
        const success = await dailyExpenseReminderService.enableDailyReminders(reminderTime);
        if (success) {
          setIsEnabled(true);
          Alert.alert('Success', 'Daily expense reminders enabled! You\'ll receive a reminder at ' + reminderTime);
        } else {
          Alert.alert('Error', 'Failed to enable reminders. Please try again.');
        }
      } else {
        const success = await dailyExpenseReminderService.disableDailyReminders();
        if (success) {
          setIsEnabled(false);
          Alert.alert('Success', 'Daily expense reminders disabled.');
        } else {
          Alert.alert('Error', 'Failed to disable reminders. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changeReminderTime = () => {
    Alert.prompt(
      'Set Reminder Time',
      'Enter time in 24-hour format (e.g., 09:00 for 9 AM)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (time) => {
            if (time && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
              try {
                setLoading(true);
                const success = await dailyExpenseReminderService.updateReminderTime(time);
                if (success) {
                  setReminderTime(time);
                  Alert.alert('Success', `Reminder time updated to ${time}`);
                } else {
                  Alert.alert('Error', 'Failed to update reminder time.');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to update reminder time.');
              } finally {
                setLoading(false);
              }
            } else {
              Alert.alert('Invalid Time', 'Please enter a valid time in 24-hour format (e.g., 09:00)');
            }
          }
        }
      ],
      'plain-text',
      reminderTime
    );
  };

  const testReminder = async () => {
    try {
      setLoading(true);
      await dailyExpenseReminderService.sendManualReminder();
      Alert.alert('Success', 'Test reminder sent! Check your notifications.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test reminder.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Expense Reminder</Text>
        <Text style={styles.headerSubtitle}>
          Get a gentle reminder to log your daily expenses
        </Text>
      </View>

      <View style={styles.content}>
        {/* Enable/Disable Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Daily Reminders</Text>
            <Text style={styles.settingDescription}>
              Receive a daily reminder to log your expenses
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={toggleReminder}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* Reminder Time */}
        <TouchableOpacity
          style={[styles.settingItem, !isEnabled && styles.disabledItem]}
          onPress={changeReminderTime}
          disabled={!isEnabled}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Reminder Time</Text>
            <Text style={styles.settingDescription}>
              Currently set to {reminderTime}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Today's Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Today's Status</Text>
          <View style={styles.statusContent}>
            <Text style={styles.statusIcon}>
              {hasLoggedToday ? '✅' : '⏰'}
            </Text>
            <Text style={styles.statusText}>
              {hasLoggedToday 
                ? 'Great job! You\'ve logged expenses today.'
                : 'No expenses logged yet today.'
              }
            </Text>
          </View>
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={testReminder}
        >
          <Text style={styles.testButtonText}>Send Test Reminder</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            • You'll receive one gentle reminder per day at your chosen time{'\n'}
            • The reminder will encourage you to log your daily expenses{'\n'}
            • You can change the reminder time anytime{'\n'}
            • Reminders are sent even when the app is closed
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chevron: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  testButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  testButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default DailyReminderSettingsScreen;
