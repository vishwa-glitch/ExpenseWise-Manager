/**
 * Budget Monitoring Settings Component
 * Allows users to customize budget alert thresholds and preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { budgetMonitoringService } from '../../services/budgetMonitoringService';
import { getBudgetMonitoringStatus, updateMonitoringThresholds } from '../../utils/budgetMonitoringUtils';

interface BudgetMonitoringSettingsProps {
  onClose?: () => void;
}

export const BudgetMonitoringSettings: React.FC<BudgetMonitoringSettingsProps> = ({ onClose }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [thresholds, setThresholds] = useState({
    approachingLimitThreshold: 80,
    dailyOverspendThreshold: 120,
    burnRateThreshold: 150,
    multipleOverBudgetCount: 3,
  });

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = () => {
    try {
      const status = getBudgetMonitoringStatus();
      setIsEnabled(status.isMonitoring);
      setThresholds(status.thresholds);
    } catch (error) {
      console.error('Error loading monitoring settings:', error);
    }
  };

  const handleToggleMonitoring = async (enabled: boolean) => {
    try {
      if (enabled) {
        await budgetMonitoringService.startMonitoring();
      } else {
        budgetMonitoringService.stopMonitoring();
      }
      setIsEnabled(enabled);
      
      Alert.alert(
        'Settings Updated',
        `Budget monitoring ${enabled ? 'enabled' : 'disabled'} successfully.`
      );
    } catch (error) {
      Alert.alert('Error', `Failed to ${enabled ? 'enable' : 'disable'} monitoring: ${error}`);
    }
  };

  const handleThresholdChange = (key: string, increment: boolean) => {
    setThresholds(prev => {
      const currentValue = prev[key as keyof typeof prev];
      let newValue: number;
      
      switch (key) {
        case 'approachingLimitThreshold':
          newValue = increment ? Math.min(95, currentValue + 5) : Math.max(50, currentValue - 5);
          break;
        case 'dailyOverspendThreshold':
          newValue = increment ? Math.min(200, currentValue + 10) : Math.max(100, currentValue - 10);
          break;
        case 'burnRateThreshold':
          newValue = increment ? Math.min(300, currentValue + 25) : Math.max(100, currentValue - 25);
          break;
        case 'multipleOverBudgetCount':
          newValue = increment ? Math.min(10, currentValue + 1) : Math.max(2, currentValue - 1);
          break;
        default:
          return prev;
      }
      
      return { ...prev, [key]: newValue };
    });
  };

  const handleSaveSettings = () => {
    try {
      updateMonitoringThresholds(thresholds);
      Alert.alert('Success', 'Budget monitoring settings saved successfully!');
      if (onClose) onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to save settings: ${error}`);
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultThresholds = {
              approachingLimitThreshold: 80,
              dailyOverspendThreshold: 120,
              burnRateThreshold: 150,
              multipleOverBudgetCount: 3,
            };
            setThresholds(defaultThresholds);
            updateMonitoringThresholds(defaultThresholds);
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  const ThresholdControl: React.FC<{
    title: string;
    description: string;
    value: number;
    unit: string;
    onDecrease: () => void;
    onIncrease: () => void;
  }> = ({ title, description, value, unit, onDecrease, onIncrease }) => (
    <View style={styles.thresholdContainer}>
      <View style={styles.thresholdInfo}>
        <Text style={styles.thresholdTitle}>{title}</Text>
        <Text style={styles.thresholdDescription}>{description}</Text>
      </View>
      <View style={styles.thresholdControls}>
        <TouchableOpacity style={styles.controlButton} onPress={onDecrease}>
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.thresholdValue}>{value}{unit}</Text>
        <TouchableOpacity style={styles.controlButton} onPress={onIncrease}>
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Monitoring Settings</Text>
        <Text style={styles.subtitle}>
          Customize when you receive budget alerts and warnings
        </Text>
      </View>

      {/* Enable/Disable Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Enable Budget Monitoring</Text>
            <Text style={styles.toggleDescription}>
              Automatically monitor your budgets and send notifications when thresholds are exceeded
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={handleToggleMonitoring}
            trackColor={{ false: '#e9ecef', true: '#28a745' }}
            thumbColor={isEnabled ? '#ffffff' : '#6c757d'}
          />
        </View>
      </View>

      {/* Threshold Settings */}
      {isEnabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Thresholds</Text>
          
          <ThresholdControl
            title="Approaching Limit Alert"
            description="Get notified when you've used this percentage of your budget"
            value={thresholds.approachingLimitThreshold}
            unit="%"
            onDecrease={() => handleThresholdChange('approachingLimitThreshold', false)}
            onIncrease={() => handleThresholdChange('approachingLimitThreshold', true)}
          />

          <ThresholdControl
            title="Daily Overspend Alert"
            description="Alert when daily spending exceeds this percentage of daily allowance"
            value={thresholds.dailyOverspendThreshold}
            unit="%"
            onDecrease={() => handleThresholdChange('dailyOverspendThreshold', false)}
            onIncrease={() => handleThresholdChange('dailyOverspendThreshold', true)}
          />

          <ThresholdControl
            title="High Burn Rate Alert"
            description="Warn when spending rate is this much faster than expected"
            value={thresholds.burnRateThreshold}
            unit="%"
            onDecrease={() => handleThresholdChange('burnRateThreshold', false)}
            onIncrease={() => handleThresholdChange('burnRateThreshold', true)}
          />

          <ThresholdControl
            title="Multiple Budgets Over"
            description="Alert when this many budgets are over limit simultaneously"
            value={thresholds.multipleOverBudgetCount}
            unit=" budgets"
            onDecrease={() => handleThresholdChange('multipleOverBudgetCount', false)}
            onIncrease={() => handleThresholdChange('multipleOverBudgetCount', true)}
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetDefaults}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How Budget Monitoring Works</Text>
        <Text style={styles.infoText}>
          • Checks your budgets every 30 minutes during active hours{'\n'}
          • Sends graceful notifications when thresholds are exceeded{'\n'}
          • Includes a 2-hour cooldown period to avoid spam{'\n'}
          • Automatically triggers when you add new transactions{'\n'}
          • Uses positive, encouraging language in all alerts
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  thresholdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  thresholdInfo: {
    flex: 1,
    marginRight: 16,
  },
  thresholdTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  thresholdDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  thresholdControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
  },
  thresholdValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginHorizontal: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});
