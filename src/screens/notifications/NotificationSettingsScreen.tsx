import React, { useState, useEffect } from 'react';
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
import { colors, typography, spacing } from '../../constants/colors';
import { dailyExpenseReminderService } from '../../services/dailyExpenseReminderService';
import * as Notifications from 'expo-notifications';

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const [isDailyReminderEnabled, setIsDailyReminderEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
    loadDailyReminderSettings();
  }, []);

  // Check permissions when app comes back to foreground
  useEffect(() => {
    const checkPermissionsOnFocus = () => {
      checkNotificationPermissions();
    };

    // Add event listener for when app comes back to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissionsOnFocus();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        Alert.alert('Success', 'Notification permissions granted!');
        // Enable daily reminders by default when permissions are granted
        await enableDailyReminders();
      } else {
        // If permission is denied, show alert with option to open settings
        Alert.alert(
          'Permission Required',
          'Notification permissions are required for daily expense reminders. Please enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: openAppSettings 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setLoading(false);
    }
  };

  const openAppSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, open the app's settings page
        await Linking.openURL('app-settings:');
      } else {
        // For Android, open the app's info page
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening app settings:', error);
      Alert.alert('Error', 'Unable to open app settings. Please manually enable notifications in your device settings.');
    }
  };

  const loadDailyReminderSettings = async () => {
    try {
      const settings = await dailyExpenseReminderService.getSettings();
      setIsDailyReminderEnabled(settings.enabled);
    } catch (error) {
      console.error('Error loading daily reminder settings:', error);
    }
  };

  const toggleDailyReminder = async (value: boolean) => {
    try {
      setLoading(true);
      
      if (value) {
        const success = await dailyExpenseReminderService.enableDailyReminders();
        if (success) {
          setIsDailyReminderEnabled(true);
          Alert.alert('Success', 'Daily expense reminders enabled! You\'ll receive reminders at 10 AM, 5 PM, and 9 PM.');
        } else {
          Alert.alert('Error', 'Failed to enable reminders. Please try again.');
        }
      } else {
        const success = await dailyExpenseReminderService.disableDailyReminders();
        if (success) {
          setIsDailyReminderEnabled(false);
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

  const enableDailyReminders = async () => {
    try {
      const success = await dailyExpenseReminderService.enableDailyReminders();
      if (success) {
        setIsDailyReminderEnabled(true);
      }
    } catch (error) {
      console.error('Error enabling daily reminders:', error);
    }
  };



  const renderPermissionSection = () => {
    // Only show permission section if permissions are not granted
    if (permissionStatus === 'granted') {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Permissions</Text>
        <View style={styles.permissionCard}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>
              ❌ Permissions Required
            </Text>
            <Text style={styles.permissionDescription}>
              Enable notifications to receive daily expense reminders
            </Text>
          </View>
                     <TouchableOpacity
             style={styles.permissionButton}
             onPress={openAppSettings}
             disabled={loading}
           >
                           {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.permissionButtonText}>Enable</Text>
              )}
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDailyReminderSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Expense Reminders</Text>
      
      <View style={styles.reminderCard}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle}>Daily Reminders</Text>
          <Text style={styles.reminderDescription}>
            Receive gentle reminders at 10 AM, 5 PM, and 9 PM to log your daily expenses
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

             {isDailyReminderEnabled && (
         <View style={styles.reminderSchedule}>
           <Text style={styles.scheduleTitle}>Reminder Schedule:</Text>
           <View style={styles.scheduleItem}>
             <Text style={styles.scheduleTime}>🌅 10:00 AM</Text>
             <Text style={styles.scheduleText}>Morning reminder</Text>
           </View>
           <View style={styles.scheduleItem}>
             <Text style={styles.scheduleTime}>🌆 5:00 PM</Text>
             <Text style={styles.scheduleText}>Afternoon reminder</Text>
           </View>
           <View style={styles.scheduleItem}>
             <Text style={styles.scheduleTime}>🌙 9:00 PM</Text>
             <Text style={styles.scheduleText}>Evening reminder</Text>
           </View>
         </View>
       )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your daily expense reminders
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
    minWidth: 80,
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
    marginBottom: spacing.md,
  },
  scheduleTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scheduleTime: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    width: 80,
  },
  scheduleText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  settingsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
