import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  AppState,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { colors, typography, spacing } from '../../constants/colors';
import { dailyExpenseReminderService } from '../../services/dailyExpenseReminderService';

interface NotificationSettingsScreenProps {
  navigation: any;
}

const formatTimeLabel = (time: string) => {
  const [hoursString, minutesString] = time.split(':');
  const hours = Number(hoursString);
  const minutes = Number(minutesString);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  navigation,
}) => {
  const [isDailyReminderEnabled, setIsDailyReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [loading, setLoading] = useState(false);

  const checkNotificationPermissions = useCallback(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  }, []);

  const loadDailyReminderSettings = useCallback(async () => {
    try {
      const settings = await dailyExpenseReminderService.getSettings();
      setIsDailyReminderEnabled(settings.enabled);
      setReminderTime(settings.time);
    } catch (error) {
      console.error('Error loading daily reminder settings:', error);
    }
  }, []);

  useEffect(() => {
    checkNotificationPermissions();
    loadDailyReminderSettings();
  }, [checkNotificationPermissions, loadDailyReminderSettings]);

  useFocusEffect(
    useCallback(() => {
      checkNotificationPermissions();
      loadDailyReminderSettings();
    }, [checkNotificationPermissions, loadDailyReminderSettings])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkNotificationPermissions();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [checkNotificationPermissions]);

  const openAppSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening app settings:', error);
      Alert.alert(
        'Error',
        'Unable to open app settings. Please enable notifications manually in your device settings.'
      );
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        const success =
          await dailyExpenseReminderService.enableDailyReminders(reminderTime);

        if (success) {
          setIsDailyReminderEnabled(true);
          Alert.alert(
            'Success',
            `Daily expense reminder enabled for ${formatTimeLabel(reminderTime)}.`
          );
        } else {
          Alert.alert(
            'Permission Granted',
            'Notifications are enabled, but the reminder could not be scheduled. Please try again.'
          );
        }
        return;
      }

      Alert.alert(
        'Permission Required',
        'Notification permissions are required for daily reminders. Please enable them in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openAppSettings },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setLoading(false);
    }
  };

  const toggleDailyReminder = async (value: boolean) => {
    try {
      setLoading(true);

      if (value) {
        const success =
          await dailyExpenseReminderService.enableDailyReminders(reminderTime);

        if (success) {
          setIsDailyReminderEnabled(true);
          Alert.alert(
            'Success',
            `Daily expense reminder enabled for ${formatTimeLabel(reminderTime)}.`
          );
        } else if (permissionStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please grant notification permission before enabling reminders.'
          );
        } else {
          Alert.alert('Error', 'Failed to enable reminders. Please try again.');
        }
      } else {
        const success = await dailyExpenseReminderService.disableDailyReminders();

        if (success) {
          setIsDailyReminderEnabled(false);
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

  const renderPermissionSection = () => {
    if (permissionStatus === 'granted') {
      return null;
    }

    const canPrompt = permissionStatus === 'undetermined';

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Permissions</Text>
        <View style={styles.permissionCard}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Permissions Required</Text>
            <Text style={styles.permissionDescription}>
              Enable notifications to receive your daily expense reminder.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={canPrompt ? requestPermissions : openAppSettings}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.permissionButtonText}>
                {canPrompt ? 'Allow' : 'Settings'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDailyReminderSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Expense Reminder</Text>

      <View style={styles.reminderCard}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle}>Reminder Enabled</Text>
          <Text style={styles.reminderDescription}>
            Receive one daily reminder to log your expenses at your chosen time.
          </Text>
        </View>
        <Switch
          value={isDailyReminderEnabled}
          onValueChange={toggleDailyReminder}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
          disabled={loading || permissionStatus !== 'granted'}
        />
      </View>

      <View style={styles.reminderSchedule}>
        <Text style={styles.scheduleTitle}>Scheduled Time</Text>
        <Text style={styles.scheduleTime}>{formatTimeLabel(reminderTime)}</Text>
        <Text style={styles.scheduleText}>
          This is the local device time used when the reminder is scheduled.
        </Text>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate('DailyReminderSettings')}
        >
          <Text style={styles.manageButtonText}>Edit Reminder Time</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your local expense reminder schedule
          </Text>
        </View>

        {renderPermissionSection()}
        {renderDailyReminderSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  permissionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reminderDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reminderSchedule: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  scheduleTime: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  scheduleText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  manageButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
