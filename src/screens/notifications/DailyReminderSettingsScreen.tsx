import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { dailyExpenseReminderService } from '../../services/dailyExpenseReminderService';

const parseTime = (time: string) => {
  const [hourString = '21', minuteString = '00'] = time.split(':');
  return {
    hour: Number(hourString),
    minute: Number(minuteString),
  };
};

const formatTimeValue = (hour: number, minute: number) =>
  `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

const formatTimeLabel = (time: string) => {
  const { hour, minute } = parseTime(time);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHours = hour % 12 || 12;
  return `${displayHours}:${minute.toString().padStart(2, '0')} ${period}`;
};

const DailyReminderSettingsScreen: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [loading, setLoading] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(21);
  const [pickerMinute, setPickerMinute] = useState(0);

  useEffect(() => {
    loadSettings();
    checkTodayStatus();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await dailyExpenseReminderService.getSettings();
      const parsedTime = parseTime(settings.time);
      setIsEnabled(settings.enabled);
      setReminderTime(settings.time);
      setPickerHour(parsedTime.hour);
      setPickerMinute(parsedTime.minute);
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
        const success =
          await dailyExpenseReminderService.enableDailyReminders(reminderTime);
        if (success) {
          setIsEnabled(true);
          Alert.alert(
            'Success',
            `Daily expense reminder enabled for ${formatTimeLabel(reminderTime)}.`
          );
        } else {
          Alert.alert(
            'Error',
            'Failed to enable reminders. Make sure notification permission is granted.'
          );
        }
      } else {
        const success = await dailyExpenseReminderService.disableDailyReminders();
        if (success) {
          setIsEnabled(false);
          Alert.alert('Success', 'Daily expense reminder disabled.');
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

  const openTimePicker = () => {
    const parsedTime = parseTime(reminderTime);
    setPickerHour(parsedTime.hour);
    setPickerMinute(parsedTime.minute);
    setShowTimePicker(true);
  };

  const adjustHour = (delta: number) => {
    setPickerHour((current) => (current + delta + 24) % 24);
  };

  const adjustMinute = (delta: number) => {
    setPickerMinute((current) => (current + delta + 60) % 60);
  };

  const saveReminderTime = async () => {
    const nextTime = formatTimeValue(pickerHour, pickerMinute);

    try {
      setLoading(true);
      const success = await dailyExpenseReminderService.updateReminderTime(nextTime);

      if (success) {
        setReminderTime(nextTime);
        setShowTimePicker(false);
        Alert.alert(
          'Success',
          `Reminder time updated to ${formatTimeLabel(nextTime)}.`
        );
      } else {
        Alert.alert('Error', 'Failed to update reminder time.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update reminder time.');
    } finally {
      setLoading(false);
    }
  };

  const testReminder = async () => {
    try {
      setLoading(true);
      await dailyExpenseReminderService.sendManualReminder();
      Alert.alert('Success', 'Test reminder sent. Check your notification tray.');
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
          Schedule one local reminder to log your daily expenses
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Daily Reminder</Text>
            <Text style={styles.settingDescription}>
              Turn your recurring on-device reminder on or off.
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={toggleReminder}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingItem, !isEnabled && styles.disabledItem]}
          onPress={openTimePicker}
          disabled={!isEnabled}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Reminder Time</Text>
            <Text style={styles.settingDescription}>
              Currently set to {formatTimeLabel(reminderTime)}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Today's Status</Text>
          <View style={styles.statusContent}>
            <Text style={styles.statusIcon}>{hasLoggedToday ? '✓' : '⏰'}</Text>
            <Text style={styles.statusText}>
              {hasLoggedToday
                ? "You've already logged expenses today."
                : 'No expenses logged yet today.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={testReminder}>
          <Text style={styles.testButtonText}>Send Test Reminder</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            • The reminder is scheduled locally on your device.{'\n'}
            • It fires every day at the time shown above.{'\n'}
            • Changing the time reschedules the existing reminder.{'\n'}
            • The app does not need a backend to show this reminder.
          </Text>
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Reminder Time</Text>
            <Text style={styles.modalSubtitle}>
              The app will schedule one recurring local notification at this time.
            </Text>

            <View style={styles.timePickerRow}>
              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustHour(1)}
                >
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {pickerHour.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustHour(-1)}
                >
                  <Text style={styles.adjustButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.timeLabel}>Hour</Text>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustMinute(1)}
                >
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {pickerMinute.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustMinute(-1)}
                >
                  <Text style={styles.adjustButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.timeLabel}>Minute</Text>
              </View>
            </View>

            <Text style={styles.previewText}>
              Scheduled for {formatTimeLabel(formatTimeValue(pickerHour, pickerMinute))}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveReminderTime}
              >
                <Text style={styles.saveButtonText}>Save Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeColumn: {
    alignItems: 'center',
  },
  adjustButton: {
    width: 48,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  adjustButtonText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  timeValue: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
    minWidth: 60,
    textAlign: 'center',
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timeSeparator: {
    ...typography.h1,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  previewText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default DailyReminderSettingsScreen;
