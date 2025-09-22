/**
 * Quick Notification Test Component
 * Simple buttons to test notifications immediately
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { budgetMonitoringService } from '../../services/budgetMonitoringService';
import { goalMonitoringService } from '../../services/goalMonitoringService';
import { notificationScheduler } from '../../services/notificationScheduler';
import { notificationMemoryService } from '../../services/notificationMemoryService';
import * as Notifications from 'expo-notifications';

export const QuickNotificationTest: React.FC = () => {

  const testDirectNotification = async () => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Direct Test',
          body: 'This is a direct notification test!',
          sound: true,
        },
        trigger: null,
      });
      Alert.alert('Success', `Direct notification sent! ID: ${notificationId}`);
    } catch (error) {
      Alert.alert('Error', `Failed: ${error}`);
    }
  };

  const testBudgetCheck = async () => {
    try {
      console.log('🧪 Manual budget check triggered from UI');
      await budgetMonitoringService.triggerImmediateCheck();
      Alert.alert('Success', 'Budget check completed! Check console logs for details.');
    } catch (error) {
      Alert.alert('Error', `Budget check failed: ${error}`);
    }
  };

  const testGoalCheck = async () => {
    try {
      console.log('🧪 Manual goal check triggered from UI');
      await goalMonitoringService.triggerImmediateCheck();
      Alert.alert('Success', 'Goal check completed! Check console logs for details.');
    } catch (error) {
      Alert.alert('Error', `Goal check failed: ${error}`);
    }
  };

  const testSchedulerNotification = async () => {
    try {
      await notificationScheduler.sendImmediateTestNotification();
      Alert.alert('Success', 'Scheduler test notification sent!');
    } catch (error) {
      Alert.alert('Error', `Scheduler test failed: ${error}`);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      Alert.alert('Permissions', `Current status: ${status}`);
      
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        Alert.alert('New Permissions', `Updated status: ${newStatus}`);
      }
    } catch (error) {
      Alert.alert('Error', `Permission check failed: ${error}`);
    }
  };

  const checkMemoryStats = async () => {
    try {
      const stats = notificationMemoryService.getMemoryStats();
      const recentNotifications = notificationMemoryService.getRecentNotifications(24);
      
      Alert.alert(
        'Memory Stats', 
        `Total Sent: ${stats.totalSentNotifications}\n` +
        `Recent (24h): ${stats.recentNotifications}\n` +
        `Budget: ${stats.budgetNotifications}\n` +
        `Goal: ${stats.goalNotifications}\n` +
        `Daily Reminders: ${stats.dailyReminders}\n` +
        `Last Daily Check: ${stats.lastDailyReminderDate}\n\n` +
        `Recent Notifications:\n${recentNotifications.slice(0, 3).map(n => 
          `• ${n.type}: ${n.title} (${n.hoursAgo}h ago)`
        ).join('\n')}`
      );
    } catch (error) {
      Alert.alert('Error', `Memory check failed: ${error}`);
    }
  };

  const clearMemory = async () => {
    try {
      await notificationMemoryService.clearMemory();
      Alert.alert('Success', 'Notification memory cleared! All notifications can be sent again.');
    } catch (error) {
      Alert.alert('Error', `Memory clear failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Quick Notification Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={checkPermissions}>
        <Text style={styles.buttonText}>Check Permissions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={testDirectNotification}>
        <Text style={styles.buttonText}>Direct Notification Test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.budgetButton} onPress={testBudgetCheck}>
        <Text style={styles.buttonText}>Trigger Budget Check</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.goalButton} onPress={testGoalCheck}>
        <Text style={styles.buttonText}>Trigger Goal Check</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.schedulerButton} onPress={testSchedulerNotification}>
        <Text style={styles.buttonText}>Scheduler Test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.memoryButton} onPress={checkMemoryStats}>
        <Text style={styles.buttonText}>Check Memory Stats</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={clearMemory}>
        <Text style={styles.buttonText}>Clear Memory</Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        Notifications now show immediately and remember what was sent to avoid duplicates!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#495057',
  },
  button: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  budgetButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  goalButton: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  schedulerButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  memoryButton: {
    backgroundColor: '#6f42c1',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  clearButton: {
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
  info: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    textAlign: 'center',
    color: '#856404',
    fontSize: 14,
  },
});
