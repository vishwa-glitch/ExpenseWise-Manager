import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/colors';
import { BudgetVarianceReportResponse } from '../../types/api';
import { PieChart } from '../charts/PieChart';

interface BudgetVarianceReportProps {
  varianceReport: BudgetVarianceReportResponse;
  onBudgetPress?: (budgetId: string) => void;
}

const BudgetVarianceReport: React.FC<BudgetVarianceReportProps> = ({
  varianceReport,
  onBudgetPress,
}) => {
  const { summary, detailed_analysis, top_over_budgets, top_under_budgets } = varianceReport;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return colors.error;
    if (variance < 0) return colors.success;
    return colors.textSecondary;
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return 'trending-up';
    if (variance < 0) return 'trending-down';
    return 'remove';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  // Prepare data for pie chart (variance distribution)
  const pieChartData = [
    {
      name: 'Under Budget',
      amount: summary.variance_distribution.under_budget,
      color: colors.success,
    },
    {
      name: 'On Budget',
      amount: summary.variance_distribution.on_budget,
      color: colors.primary,
    },
    {
      name: 'Over Budget',
      amount: summary.variance_distribution.over_budget,
      color: colors.error,
    },
  ].filter(item => item.amount > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Variance Analysis</Text>
        <Text style={styles.subtitle}>
          {summary.total_budgets} budgets analyzed
        </Text>
      </View>

      {/* Summary Metrics */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Variance</Text>
          <Text style={[
            styles.summaryValue,
            { color: getVarianceColor(summary.total_variance) }
          ]}>
            {formatCurrency(summary.total_variance)}
          </Text>
          <Text style={styles.summarySubtext}>
            {formatPercentage(summary.overall_efficiency)} efficiency
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Budget Amount</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(summary.total_budget_amount)}
          </Text>
          <Text style={styles.summarySubtext}>
            Total budgeted
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Actual Spent</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(summary.total_actual_spent)}
          </Text>
          <Text style={styles.summarySubtext}>
            Total spent
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Efficiency</Text>
          <Text style={[
            styles.summaryValue,
            { color: summary.overall_efficiency >= 80 ? colors.success : colors.warning }
          ]}>
            {formatPercentage(summary.overall_efficiency)}
          </Text>
          <Text style={styles.summarySubtext}>
            Overall performance
          </Text>
        </View>
      </View>

      {/* Variance Distribution Chart */}
      {pieChartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Budget Status Distribution</Text>
          <PieChart
            data={pieChartData}
            title="Budget Status Distribution"
            showLegend={true}
            showPercentages={true}
            displayCurrency="USD"
          />
        </View>
      )}

      {/* Top Over Budgets */}
      {top_over_budgets.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.sectionTitle}>Top Over Budgets</Text>
          </View>
          <ScrollView 
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {top_over_budgets.map((budget, index) => (
              <TouchableOpacity
                key={budget.budget_id}
                style={styles.budgetItem}
                onPress={() => onBudgetPress?.(budget.budget_id)}
                disabled={!onBudgetPress}
              >
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetName}>{budget.category_name}</Text>
                  <Text style={[styles.varianceAmount, { color: colors.error }]}>
                    +{formatCurrency(budget.variance)}
                  </Text>
                </View>
                <View style={styles.budgetDetails}>
                  <Text style={styles.budgetDetail}>
                    Budget: {formatCurrency(budget.budget_amount)}
                  </Text>
                  <Text style={styles.budgetDetail}>
                    Spent: {formatCurrency(budget.actual_spent)}
                  </Text>
                  <Text style={[styles.variancePercentage, { color: colors.error }]}>
                    +{formatPercentage(budget.variance_percentage)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Top Under Budgets */}
      {top_under_budgets.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>Top Under Budgets</Text>
          </View>
          <ScrollView 
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {top_under_budgets.map((budget, index) => (
              <TouchableOpacity
                key={budget.budget_id}
                style={styles.budgetItem}
                onPress={() => onBudgetPress?.(budget.budget_id)}
                disabled={!onBudgetPress}
              >
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetName}>{budget.category_name}</Text>
                  <Text style={[styles.varianceAmount, { color: colors.success }]}>
                    {formatCurrency(budget.variance)}
                  </Text>
                </View>
                <View style={styles.budgetDetails}>
                  <Text style={styles.budgetDetail}>
                    Budget: {formatCurrency(budget.budget_amount)}
                  </Text>
                  <Text style={styles.budgetDetail}>
                    Spent: {formatCurrency(budget.actual_spent)}
                  </Text>
                  <Text style={[styles.variancePercentage, { color: colors.success }]}>
                    {formatPercentage(budget.variance_percentage)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Detailed Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Analysis</Text>
        <ScrollView 
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {detailed_analysis.map((analysis, index) => (
            <TouchableOpacity
              key={analysis.budget_id}
              style={styles.analysisItem}
              onPress={() => onBudgetPress?.(analysis.budget_id)}
              disabled={!onBudgetPress}
            >
              <View style={styles.analysisHeader}>
                <View style={styles.analysisInfo}>
                  <View 
                    style={[
                      styles.categoryColor, 
                      { backgroundColor: analysis.category_color }
                    ]} 
                  />
                  <Text style={styles.categoryName}>{analysis.category_name}</Text>
                </View>
                <View style={styles.severityBadge}>
                  <Text style={[
                    styles.severityText,
                    { color: getSeverityColor(analysis.variance_severity) }
                  ]}>
                    {analysis.variance_severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.analysisMetrics}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Budget:</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(analysis.budget_amount)}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Actual:</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(analysis.actual_spent)}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Variance:</Text>
                  <Text style={[
                    styles.metricValue,
                    { color: getVarianceColor(analysis.variance) }
                  ]}>
                    {analysis.variance > 0 ? '+' : ''}{formatCurrency(analysis.variance)}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Efficiency:</Text>
                  <Text style={[
                    styles.metricValue,
                    { color: analysis.efficiency_percentage >= 80 ? colors.success : colors.warning }
                  ]}>
                    {formatPercentage(analysis.efficiency_percentage)}
                  </Text>
                </View>
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionText}>
                  {analysis.transaction_count} transactions • 
                  Avg: {formatCurrency(analysis.avg_transaction_amount)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  chartContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  chartTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  listContainer: {
    maxHeight: 300,
  },
  budgetItem: {
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budgetName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  varianceAmount: {
    ...typography.body,
    fontWeight: '600',
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  variancePercentage: {
    ...typography.caption,
    fontWeight: '600',
  },
  analysisItem: {
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  analysisInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  severityBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  severityText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  analysisMetrics: {
    marginBottom: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  transactionInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  transactionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default BudgetVarianceReport;
