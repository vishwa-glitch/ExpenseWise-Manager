import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { apiService } from '../../services/api';

const ApiTestComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsResult, setAnalyticsResult] = useState<any>(null);
  const [varianceResult, setVarianceResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAnalyticsEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing analytics endpoint...');
      const result = await apiService.getBudgetAnalytics('current_month', 6);
      console.log('Analytics API result:', result);
      setAnalyticsResult(result);
    } catch (err: any) {
      console.error('Analytics API error:', err);
      setError(`Analytics API Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const testVarianceEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing variance endpoint...');
      const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const result = await apiService.getBudgetVarianceReport(startDate, endDate, false);
      console.log('Variance API result:', result);
      setVarianceResult(result);
    } catch (err: any) {
      console.error('Variance API error:', err);
      setError(`Variance API Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 API Test Component</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testAnalyticsEndpoint}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Analytics API</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testVarianceEndpoint}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Variance API</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Testing API...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        {analyticsResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>📊 Analytics API Result:</Text>
            <Text style={styles.resultData}>
              {JSON.stringify(analyticsResult, null, 2)}
            </Text>
          </View>
        )}

        {varianceResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>📈 Variance API Result:</Text>
            <Text style={styles.resultData}>
              {JSON.stringify(varianceResult, null, 2)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  resultsContainer: {
    maxHeight: 300,
  },
  resultSection: {
    marginBottom: spacing.lg,
  },
  resultTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  resultData: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: spacing.xs,
  },
});

export default ApiTestComponent;
