/**
 * Comprehensive Notification Debug Panel
 * Tests all aspects of the notification system to identify issues
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationScheduler } from '../../services/notificationScheduler';
import { budgetMonitoringService } from '../../services/budgetMonitoringService';
import { goalMonitoringService } from '../../services/goalMonitoringService';

export const NotificationDebugPanel: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('Unknown');
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [goalStatus, setGoalStatus] = useState<any>(null);

  useEffect(() => {
    checkPermissions();
    refreshAllStatus();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      console.log('🔔 Notification permission status:', status);
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      setPermissionStatus('Error');
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      Alert.alert('Permission Status', `Notification permissions: ${status}`);
    } catch (error) {
      Alert.alert('Error', `Failed to request permissions: ${error}`);
    }
  };

  const refreshAllStatus = () => {
    try {
      setSchedulerStatus(notificationScheduler.getDetailedStatus());
      setBudgetStatus(budgetMonitoringService.getStatus());
      setGoalStatus(goalMonitoringService.getStatus());
    } catch (error) {
      console.error('❌ Error refreshing status:', error);
    }
  };

  const testImmediateNotification = async () => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Direct Expo Test',
          body: 'This notification was sent directly via Expo Notifications API',
          data: { test: true, direct: true },
          sound: true,
        },
        trigger: null,
      });
      Alert.alert('Success', `Direct notification sent! ID: ${notificationId}`);
    } catch (error) {
      Alert.alert('Error', `Failed to send direct notification: ${error}`);
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

  const testBudgetNotification = async () => {
    try {
      await budgetMonitoringService.generateTestNotification();
      Alert.alert('Success', 'Budget test notification sent!');
    } catch (error) {
      Alert.alert('Error', `Budget test failed: ${error}`);
    }
  };

  const testQueuedNotification = async () => {
    try {
      await notificationScheduler.addTestNotification(
        'budget',
        '🧪 30-Second Queue Test',
        'This notification should appear in 30 seconds via the queue system'
      );
      Alert.alert('Success', 'Notification queued for 30 seconds!');
      refreshAllStatus();
    } catch (error) {
      Alert.alert('Error', `Queue test failed: ${error}`);
    }
  };

  const forceProcessQueue = async () => {
    try {
      await notificationScheduler.forceProcessQueue();
      Alert.alert('Success', 'Queue processed! Check for notifications.');
      refreshAllStatus();
    } catch (error) {
      Alert.alert('Error', `Queue processing failed: ${error}`);
    }
  };

  const clearAllQueues = async () => {
    try {
      await notificationScheduler.clearQueue();
      budgetMonitoringService.clearAlertCooldowns();
      goalMonitoringService.clearAlertCooldowns();
      Alert.alert('Success', 'All queues and cooldowns cleared!');
      refreshAllStatus();
    } catch (error) {
      Alert.alert('Error', `Clear failed: ${error}`);
    }
  };

  const StatusSection: React.FC<{ title: string; status: any; color: string }> = ({ title, status, color }) => (
    <View style={[styles.statusSection, { borderLeftColor: color }]}>
      <Text style={styles.statusTitle}>{title}</Text>
      {status ? (
        <Text style={styles.statusText}>{JSON.stringify(status, null, 2)}</Text>
      ) : (
        <Text style={styles.statusText}>Loading...</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔔 Notification Debug Panel</Text>
      
      {/* Permission Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Permissions</Text>
        <Text style={styles.permissionText}>Status: {permissionStatus}</Text>
        <TouchableOpacity style={styles.button} onPress={checkPermissions}>
          <Text style={styles.buttonText}>Check Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>
      </View>

      {/* Immediate Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Immediate Tests</Text>
        <TouchableOpacity style={styles.testButton} onPress={testImmediateNotification}>
          <Text style={styles.buttonText}>Direct Expo API Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testSchedulerNotification}>
          <Text style={styles.buttonText}>Scheduler Immediate Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testBudgetNotification}>
          <Text style={styles.buttonText}>Budget Service Test</Text>
        </TouchableOpacity>
      </View>

      {/* Queue Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Queue Tests</Text>
        <TouchableOpacity style={styles.queueButton} onPress={testQueuedNotification}>
          <Text style={styles.buttonText}>Add 30-Second Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.queueButton} onPress={forceProcessQueue}>
          <Text style={styles.buttonText}>Force Process Queue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllQueues}>
          <Text style={styles.buttonText}>Clear All Queues</Text>
        </TouchableOpacity>
      </View>

      {/* Status Refresh */}
      <TouchableOpacity style={styles.refreshButton} onPress={refreshAllStatus}>
        <Text style={styles.buttonText}>🔄 Refresh All Status</Text>
      </TouchableOpacity>

      {/* Status Display */}
      <StatusSection title="📅 Scheduler Status" status={schedulerStatus} color="#007bff" />
      <StatusSection title="💰 Budget Monitor Status" status={budgetStatus} color="#28a745" />
      <StatusSection title="🎯 Goal Monitor Status" status={goalStatus} color="#ffc107" />

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>🔍 Debugging Steps:</Text>
        <Text style={styles.infoText}>
          1. Check permissions first{'\n'}
          2. Test direct Expo API notification{'\n'}
          3. Test scheduler immediate notification{'\n'}
          4. Test budget service notification{'\n'}
          5. Test queued notification (30 seconds){'\n'}
          6. Check status for queue details{'\n'}
          7. Force process queue if needed
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#495057',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#495057',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#6c757d',
    fontWeight: '500',
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
  queueButton: {
    backgroundColor: '#ffc107',
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
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statusSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  statusText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  infoSection: {
    backgroundColor: '#d1ecf1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
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
