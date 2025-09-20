/**
 * Goal Monitoring Test Component
 * For testing and debugging goal notification triggers
 * Can be temporarily added to any screen for testing purposes
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { goalMonitoringService } from '../../services/goalMonitoringService';
import { notificationService } from '../../services/notificationService';

export const GoalMonitoringTest: React.FC = () => {
  const [status, setStatus] = useState<any>(null);

  const handleGetStatus = () => {
    const currentStatus = goalMonitoringService.getStatus();
    setStatus(currentStatus);
    Alert.alert('Goal Monitoring Status', JSON.stringify(currentStatus, null, 2));
  };

  const handleForceCheck = async () => {
    try {
      await goalMonitoringService.forceCheck();
      Alert.alert('Success', 'Goal check completed. Check notifications for any alerts.');
    } catch (error) {
      Alert.alert('Error', `Failed to check goals: ${error}`);
    }
  };

  const handleTestNoGoalsNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        '🎯 Set Your First Financial Goal!',
        'Start your journey to financial success by setting a savings goal. Whether it\'s for a vacation, emergency fund, or dream purchase - every goal begins with a single step!',
        { 
          type: 'goal', 
          alertType: 'no_goals',
          test: true,
          suggestedGoals: ['Emergency Fund', 'Vacation', 'New Car', 'House Down Payment'],
        }
      );
      Alert.alert('Success', 'Test no-goals notification sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send test notification: ${error}`);
    }
  };

  const handleTestContributionReminder = async () => {
    try {
      await notificationService.sendImmediateNotification(
        '💰 Time to fund your Dream Vacation!',
        'Your "Dream Vacation" goal is waiting for its first contribution. Even a small amount can get you started on the path to success!',
        { 
          type: 'goal', 
          alertType: 'contribution_reminder',
          goalId: 'test-goal-1',
          goalTitle: 'Dream Vacation',
          test: true,
        }
      );
      Alert.alert('Success', 'Test contribution reminder sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send test notification: ${error}`);
    }
  };

  const handleTestMilestoneApproaching = async () => {
    try {
      await notificationService.sendImmediateNotification(
        '⏰ Emergency Fund deadline approaching!',
        'Only 25 days left for your Emergency Fund goal. You\'ll need about $200 monthly to stay on track.',
        { 
          type: 'goal', 
          alertType: 'milestone_approaching',
          goalId: 'test-goal-2',
          goalTitle: 'Emergency Fund',
          test: true,
        }
      );
      Alert.alert('Success', 'Test milestone approaching notification sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send test notification: ${error}`);
    }
  };

  const handleTestNearCompletion = async () => {
    try {
      await notificationService.sendImmediateNotification(
        '🎉 Almost there with New Car!',
        'You\'re 95% complete! Just $500 more to achieve your New Car goal!',
        { 
          type: 'goal', 
          alertType: 'goal_completion_near',
          goalId: 'test-goal-3',
          goalTitle: 'New Car',
          test: true,
        }
      );
      Alert.alert('Success', 'Test near completion notification sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send test notification: ${error}`);
    }
  };

  const handleClearCooldowns = () => {
    goalMonitoringService.clearAlertCooldowns();
    Alert.alert('Success', 'Goal alert cooldowns cleared. New alerts can be triggered immediately.');
  };

  const handleStartMonitoring = async () => {
    try {
      await goalMonitoringService.startMonitoring();
      Alert.alert('Success', 'Goal monitoring started');
    } catch (error) {
      Alert.alert('Error', `Failed to start monitoring: ${error}`);
    }
  };

  const handleStopMonitoring = () => {
    goalMonitoringService.stopMonitoring();
    Alert.alert('Success', 'Goal monitoring stopped');
  };

  const handleSimulateGoalCreation = async () => {
    try {
      await goalMonitoringService.checkAfterGoalActivity('goal_created', {
        goalId: 'test-new-goal',
        goalTitle: 'Test Goal',
        goalData: { category: 'vacation', target_amount: 5000 },
      });
      Alert.alert('Success', 'Simulated goal creation activity');
    } catch (error) {
      Alert.alert('Error', `Failed to simulate goal creation: ${error}`);
    }
  };

  const handleSimulateContribution = async () => {
    try {
      await goalMonitoringService.checkAfterGoalActivity('contribution_made', {
        goalId: 'test-goal-1',
        amount: 100,
        description: 'Test contribution',
      });
      Alert.alert('Success', 'Simulated contribution activity');
    } catch (error) {
      Alert.alert('Error', `Failed to simulate contribution: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Monitoring Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status & Control</Text>
        <TouchableOpacity style={styles.button} onPress={handleGetStatus}>
          <Text style={styles.buttonText}>Get Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleForceCheck}>
          <Text style={styles.buttonText}>Force Goal Check</Text>
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>
        <TouchableOpacity style={styles.testButton} onPress={handleTestNoGoalsNotification}>
          <Text style={styles.buttonText}>Test "No Goals" Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={handleTestContributionReminder}>
          <Text style={styles.buttonText}>Test Contribution Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={handleTestMilestoneApproaching}>
          <Text style={styles.buttonText}>Test Milestone Approaching</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={handleTestNearCompletion}>
          <Text style={styles.buttonText}>Test Near Completion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulate Activities</Text>
        <TouchableOpacity style={styles.simulateButton} onPress={handleSimulateGoalCreation}>
          <Text style={styles.buttonText}>Simulate Goal Creation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.simulateButton} onPress={handleSimulateContribution}>
          <Text style={styles.buttonText}>Simulate Contribution</Text>
        </TouchableOpacity>
      </View>

      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Current Status:</Text>
          <Text style={styles.statusText}>Monitoring: {status.isMonitoring ? 'Active' : 'Inactive'}</Text>
          <Text style={styles.statusText}>Alert Count: {status.alertCount}</Text>
          <Text style={styles.statusText}>No Goals Reminder: {status.thresholds?.noGoalsReminderDays} days</Text>
          <Text style={styles.statusText}>Contribution Reminder: {status.thresholds?.contributionReminderDays} days</Text>
          <Text style={styles.statusText}>Completion Near: {status.thresholds?.completionNearPercentage}%</Text>
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
  section: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  simulateButton: {
    backgroundColor: '#ffc107',
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
