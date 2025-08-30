import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { BudgetAnalyticsResponse, BudgetVarianceReportResponse } from '../../types/api';

interface DataDebugComponentProps {
  analytics?: BudgetAnalyticsResponse | null;
  varianceReport?: BudgetVarianceReportResponse | null;
}

const DataDebugComponent: React.FC<DataDebugComponentProps> = ({
  analytics,
  varianceReport,
}) => {
  const formatData = (data: any, depth = 0): string => {
    if (data === null || data === undefined) {
      return 'null/undefined';
    }
    
    if (typeof data === 'string') {
      return `"${data}"`;
    }
    
    if (typeof data === 'number') {
      return data.toString();
    }
    
    if (typeof data === 'boolean') {
      return data.toString();
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return '[] (empty array)';
      }
      return `[${data.length} items] ${data.slice(0, 3).map(item => formatData(item, depth + 1)).join(', ')}${data.length > 3 ? '...' : ''}`;
    }
    
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        return '{} (empty object)';
      }
      if (depth > 2) {
        return `{${keys.length} properties}`;
      }
      return `{${keys.slice(0, 3).map(key => `${key}: ${formatData(data[key], depth + 1)}`).join(', ')}${keys.length > 3 ? '...' : ''}}`;
    }
    
    return String(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Data Debug Information</Text>
      
      <ScrollView style={styles.scrollView}>
        {/* Analytics Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Analytics Data</Text>
          <Text style={styles.dataText}>
            Analytics exists: {analytics ? 'YES' : 'NO'}
          </Text>
          {analytics && (
            <>
              <Text style={styles.dataText}>
                Summary: {formatData(analytics.summary)}
              </Text>
              <Text style={styles.dataText}>
                Category Performance: {formatData(analytics.category_performance)}
              </Text>
              <Text style={styles.dataText}>
                Monthly Trends: {formatData(analytics.monthly_trends)}
              </Text>
              <Text style={styles.dataText}>
                Efficiency Metrics: {formatData(analytics.efficiency_metrics)}
              </Text>
              <Text style={styles.dataText}>
                Period: {analytics.period}
              </Text>
              <Text style={styles.dataText}>
                Analysis Date: {analytics.analysis_date}
              </Text>
            </>
          )}
        </View>

        {/* Variance Report Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Variance Report Data</Text>
          <Text style={styles.dataText}>
            Variance Report exists: {varianceReport ? 'YES' : 'NO'}
          </Text>
          {varianceReport && (
            <>
              <Text style={styles.dataText}>
                Summary: {formatData(varianceReport.summary)}
              </Text>
              <Text style={styles.dataText}>
                Detailed Analysis: {formatData(varianceReport.detailed_analysis)}
              </Text>
              <Text style={styles.dataText}>
                Top Over Budgets: {formatData(varianceReport.top_over_budgets)}
              </Text>
              <Text style={styles.dataText}>
                Top Under Budgets: {formatData(varianceReport.top_under_budgets)}
              </Text>
              <Text style={styles.dataText}>
                Category Summary: {formatData(varianceReport.category_summary)}
              </Text>
            </>
          )}
        </View>

        {/* Raw Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Raw Analytics Data</Text>
          <Text style={styles.rawData}>
            {analytics ? JSON.stringify(analytics, null, 2) : 'No analytics data'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Raw Variance Report Data</Text>
          <Text style={styles.rawData}>
            {varianceReport ? JSON.stringify(varianceReport, null, 2) : 'No variance report data'}
          </Text>
        </View>
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
  scrollView: {
    maxHeight: 400,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  dataText: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  rawData: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: spacing.xs,
  },
});

export default DataDebugComponent;
