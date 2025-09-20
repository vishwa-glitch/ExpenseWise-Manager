/**
 * Notification Scheduler Test Component
 * For testing and debugging the notification scheduling system
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { notificationScheduler } from '../../services/notificationScheduler';
import { notificationService } from '../../services/notificationService';

export const NotificationSchedulerTest: React.FC = () => {
  const [status, setStatus] = useState<any>(null);

  const handleGetStatus = () => {
    const currentStatus = notificationScheduler.getQueueStatus();
    setStatus(currentStatus);
    Alert.alert('Scheduler Status', JSON.stringify(currentStatus, null, 2));
  };

  const handleQueueBudgetNotification = async () => {
    try {
      await notificationScheduler.queueNotification({
        id: `test-budget-${Date.now()}`,
        type: 'budget',
        title: '🔔 Test Budget Alert',
        message: 'This is a test budget notification that should be queued and sent later.',
        data: { alertType: 'test', category: 'Groceries' },
        priority: 'normal',
      });
      Alert.alert('Success', 'Budget notification queued successfully!');
      handleGetStatus(); // Refresh status
    } catch (error) {
      Alert.alert('Error', `Failed to queue notification: ${error}`);
    }
  };

  const handleQueueGoalNotification = async () => {
    try {
      await notificationScheduler.queueNotification({
        id: `test-goal-${Date.now()}`,
        type: 'goal',
        title: '🎯 Test Goal Reminder',
        message: 'This is a test goal notification that should be queued and sent later.',
        data: { alertType: 'test', goalId: 'test-goal' },
        priority: 'high',
      });
      Alert.alert('Success', 'Goal notification queued successfully!');
      handleGetStatus(); // Refresh status
    } catch (error) {
      Alert.alert('Error', `Failed to queue notification: ${error}`);
    }
  };

  const handleSendImmediateNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        '📱 Immediate Test',
        'This notification should be sent immediately (not queued).',
        { type: 'system', test: true }
      );
      Alert.alert('Success', 'Immediate notification sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send immediate notification: ${error}`);
    }
  };

  const handleForceProcessQueue = async () => {
    try {
      await notificationScheduler.forceProcessQueue();
      Alert.alert('Success', 'Queue processed! Check for notifications.');
      handleGetStatus(); // Refresh status
    } catch (error) {
      Alert.alert('Error', `Failed to process queue: ${error}`);
    }
  };

  const handleClearQueue = async () => {
    try {
      await notificationScheduler.clearQueue();
      Alert.alert('Success', 'Notification queue cleared!');
      handleGetStatus(); // Refresh status
    } catch (error) {
      Alert.alert('Error', `Failed to clear queue: ${error}`);
    }
  };

  const handleTestMultipleNotifications = async () => {
    try {
      // Queue multiple notifications to test the 2-hour interval system
      const notifications = [
        {
          id: `multi-budget-1-${Date.now()}`,
          type: 'budget' as const,
          title: '🔔 Budget Alert #1',
          message: 'First budget notification in queue',
          data: { alertType: 'test', category: 'Food' },
          priority: 'high' as const,
        },
        {
          id: `multi-budget-2-${Date.now()}`,
          type: 'budget' as const,
          title: '🔔 Budget Alert #2',
          message: 'Second budget notification in queue',
          data: { alertType: 'test', category: 'Entertainment' },
          priority: 'normal' as const,
        },
        {
          id: `multi-goal-1-${Date.now()}`,
          type: 'goal' as const,
          title: '🎯 Goal Reminder #1',
          message: 'First goal notification in queue',
          data: { alertType: 'test', goalId: 'goal-1' },
          priority: 'normal' as const,
        },
      ];

      for (const notification of notifications) {
        await notificationScheduler.queueNotification(notification);
      }

      Alert.alert('Success', `Queued ${notifications.length} notifications! They will be sent at 2-hour intervals.`);
      handleGetStatus(); // Refresh status
    } catch (error) {
      Alert.alert('Error', `Failed to queue multiple notifications: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Scheduler Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Management</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleGetStatus}>
          <Text style={styles.buttonText}>Get Queue Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleClearQueue}>
          <Text style={styles.buttonText}>Clear Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleForceProcessQueue}>
          <Text style={styles.buttonText}>Force Process Queue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Notifications (Scheduled)</Text>
        
        <TouchableOpacity style={styles.queueButton} onPress={handleQueueBudgetNotification}>
          <Text style={styles.buttonText}>Queue Budget Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.queueButton} onPress={handleQueueGoalNotification}>
          <Text style={styles.buttonText}>Queue Goal Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.queueButton} onPress={handleTestMultipleNotifications}>
          <Text style={styles.buttonText}>Queue Multiple Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Immediate Notifications</Text>
        
        <TouchableOpacity style={styles.immediateButton} onPress={handleSendImmediateNotification}>
          <Text style={styles.buttonText}>Send Immediate Notification</Text>
        </TouchableOpacity>
      </View>

      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Current Status:</Text>
          <Text style={styles.statusText}>Initialized: {status.isInitialized ? 'Yes' : 'No'}</Text>
          <Text style={styles.statusText}>Queued Notifications: {status.queuedNotifications}</Text>
          <Text style={styles.statusText}>Next Scheduled: {status.nextScheduledDate}</Text>
          <Text style={styles.statusText}>Last Processed: {status.lastProcessedDate}</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How It Works:</Text>
        <Text style={styles.infoText}>
          • Budget/Goal notifications are queued instead of sent immediately{'\n'}
          • Notifications are sent at 2-hour intervals{'\n'}
          • Only one notification is sent per interval (highest priority first){'\n'}
          • Daily reminders and system notifications are sent immediately{'\n'}
          • Queue persists across app restarts{'\n'}
          • First notification is delayed 5 minutes after app launch
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#495057',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#495057',
  },
  button: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  queueButton: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  immediateButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  statusText: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 2,
  },
  infoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#d1ecf1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0c5460',
  },
  infoText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
});
