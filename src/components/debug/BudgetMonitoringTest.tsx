/**
 * Budget Monitoring Test Component
 * For testing and debugging budget notification triggers
 * Can be temporarily added to any screen for testing purposes
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { budgetMonitoringService } from '../../services/budgetMonitoringService';
import { notificationService } from '../../services/notificationService';

export const BudgetMonitoringTest: React.FC = () => {
  const [status, setStatus] = useState<any>(null);

  const handleGetStatus = () => {
    const currentStatus = budgetMonitoringService.getStatus();
    setStatus(currentStatus);
    Alert.alert('Monitoring Status', JSON.stringify(currentStatus, null, 2));
  };

  const handleForceCheck = async () => {
    try {
      await budgetMonitoringService.forceCheck();
      Alert.alert('Success', 'Budget check completed. Check notifications for any alerts.');
    } catch (error) {
      Alert.alert('Error', `Failed to check budgets: ${error}`);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        'Test Budget Alert',
        'This is a test budget notification to verify the system is working.',
        { type: 'budget', test: true }
      );
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send test notification: ${error}`);
    }
  };

  const handleClearCooldowns = () => {
    budgetMonitoringService.clearAlertCooldowns();
    Alert.alert('Success', 'Alert cooldowns cleared. New alerts can be triggered immediately.');
  };

  const handleStartMonitoring = async () => {
    try {
      await budgetMonitoringService.startMonitoring();
      Alert.alert('Success', 'Budget monitoring started');
    } catch (error) {
      Alert.alert('Error', `Failed to start monitoring: ${error}`);
    }
  };

  const handleStopMonitoring = () => {
    budgetMonitoringService.stopMonitoring();
    Alert.alert('Success', 'Budget monitoring stopped');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Monitoring Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleGetStatus}>
        <Text style={styles.buttonText}>Get Status</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleForceCheck}>
        <Text style={styles.buttonText}>Force Budget Check</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleTestNotification}>
        <Text style={styles.buttonText}>Send Test Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleClearCooldowns}>
        <Text style={styles.buttonText}>Clear Alert Cooldowns</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleStartMonitoring}>
        <Text style={styles.buttonText}>Start Monitoring</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleStopMonitoring}>
        <Text style={styles.buttonText}>Stop Monitoring</Text>
      </TouchableOpacity>

      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Current Status:</Text>
          <Text style={styles.statusText}>Monitoring: {status.isMonitoring ? 'Active' : 'Inactive'}</Text>
          <Text style={styles.statusText}>Alert Count: {status.alertCount}</Text>
          <Text style={styles.statusText}>Approaching Limit: {status.thresholds?.approachingLimitThreshold}%</Text>
          <Text style={styles.statusText}>Daily Overspend: {status.thresholds?.dailyOverspendThreshold}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#495057',
  },
  button: {
    backgroundColor: '#007bff',
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
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
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
});
