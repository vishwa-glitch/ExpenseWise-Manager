import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, typography, spacing } from '../../constants/colors';
import { RootState } from '../../store';
import {
  fetchNotifications,
  fetchUnreadNotifications,
  markAsRead,
  clearError,
} from '../../store/slices/notificationsSlice';
import { notificationService } from '../../services/notificationService';
import { format } from 'date-fns';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'transaction' | 'budget' | 'goal' | 'reminder' | 'system';
  read: boolean;
  createdAt: string;
  data?: any;
}

const NotificationCenterScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading, error } = useSelector(
    (state: RootState) => state.notifications
  );
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
    loadScheduledNotifications();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadNotifications = async () => {
    await Promise.all([
      dispatch(fetchNotifications()),
      dispatch(fetchUnreadNotifications()),
    ]);
  };

  const loadScheduledNotifications = async () => {
    try {
      const scheduled = await notificationService.getScheduledNotifications();
      setScheduledNotifications(scheduled);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadNotifications(),
      loadScheduledNotifications(),
    ]);
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markAsRead(notificationId));
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        'Test Notification',
        'This is a test notification from your finance app!',
        { type: 'system' }
      );
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleScheduleReminder = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    try {
      await notificationService.scheduleReminder(
        'Daily Finance Check-in',
        'Take a moment to review your spending and budget today!',
        tomorrow,
        { type: 'reminder' }
      );
      Alert.alert('Success', 'Reminder scheduled for tomorrow at 9 AM!');
      loadScheduledNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule reminder');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return '💰';
      case 'budget':
        return '📊';
      case 'goal':
        return '🎯';
      case 'reminder':
        return '⏰';
      case 'system':
        return '🔔';
      default:
        return '📱';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'transaction':
        return colors.primary;
      case 'budget':
        return colors.warning;
      case 'goal':
        return colors.success;
      case 'reminder':
        return colors.info;
      case 'system':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const formatScheduledTrigger = (trigger: any) => {
    if (!trigger) {
      return 'Trigger unavailable';
    }

    if (trigger.type === 'date' && trigger.date) {
      return format(new Date(trigger.date), 'MMM dd, yyyy HH:mm');
    }

    if (typeof trigger.hour === 'number' && typeof trigger.minute === 'number') {
      const hour = trigger.hour;
      const minute = trigger.minute;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const formattedTime = `${displayHour}:${minute
        .toString()
        .padStart(2, '0')} ${period}`;

      if (trigger.weekday) {
        return `Weekly at ${formattedTime}`;
      }

      if (trigger.repeats) {
        return `Every day at ${formattedTime}`;
      }

      return formattedTime;
    }

    return 'Scheduled trigger configured';
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleMarkAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </Text>
        <View style={styles.notificationMeta}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>
            {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
    </TouchableOpacity>
  );

  const renderScheduledNotification = ({ item }: { item: any }) => (
    <View style={styles.scheduledItem}>
      <Text style={styles.scheduledIcon}>⏰</Text>
      <View style={styles.scheduledContent}>
        <Text style={styles.scheduledTitle}>{item.content.title}</Text>
        <Text style={styles.scheduledBody}>{item.content.body}</Text>
        <Text style={styles.scheduledTime}>
          Scheduled for: {formatScheduledTrigger(item.trigger)}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        You'll see important updates about your finances here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notifications</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleTestNotification}
      >
        <Text style={styles.actionButtonText}>Test Notification</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleScheduleReminder}
      >
        <Text style={styles.actionButtonText}>Schedule Reminder</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderActionButtons()}
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {scheduledNotifications.length > 0 && (
        <View style={styles.scheduledSection}>
          <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
          <FlatList
            data={scheduledNotifications}
            renderItem={renderScheduledNotification}
            keyExtractor={(item) => item.identifier}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scheduledList}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
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
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  notificationItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  notificationMeta: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 2,
  },
  notificationTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  scheduledSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scheduledList: {
    paddingRight: spacing.lg,
  },
  scheduledItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginRight: spacing.sm,
    minWidth: 200,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduledIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  scheduledContent: {
    flex: 1,
  },
  scheduledTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  scheduledBody: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  scheduledTime: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10,
  },
});

export default NotificationCenterScreen;
