import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/colors';
import { BudgetAnalyticsResponse } from '../../types/api';
import { PieChart } from '../charts/PieChart';

interface BudgetAnalyticsSummaryProps {
  analytics: BudgetAnalyticsResponse;
  onPress?: () => void;
}

const BudgetAnalyticsSummary: React.FC<BudgetAnalyticsSummaryProps> = ({
  analytics,
  onPress,
}) => {
  const { summary, efficiency_metrics, category_performance } = analytics;

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return colors.success;
    if (efficiency >= 60) return colors.warning;
    return colors.error;
  };

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 80) return 'trending-up';
    if (efficiency >= 60) return 'trending-up-outline';
    return 'trending-down';
  };

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

  const Container = onPress ? TouchableOpacity : View;

  // Prepare data for category spending pie chart
  const pieChartData = category_performance
    .filter(category => category.total_spent_amount > 0)
    .map(category => ({
      name: category.category_name,
      amount: category.total_spent_amount,
      color: category.category_color,
    }));

  return (
    <Container style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </View>

      <View style={styles.metricsGrid}>
        {/* Total Budget */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Budget</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(summary.total_budget_amount)}
          </Text>
          <Text style={styles.metricSubtext}>
            {summary.active_budgets} active budgets
          </Text>
        </View>

        {/* Total Spent */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Spent</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(summary.total_spent_amount)}
          </Text>
          <Text style={styles.metricSubtext}>
            {formatPercentage((summary.total_spent_amount / summary.total_budget_amount) * 100)} used
          </Text>
        </View>

        {/* Remaining */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Remaining</Text>
          <Text style={[styles.metricValue, { color: colors.success }]}>
            {formatCurrency(summary.total_remaining_amount)}
          </Text>
          <Text style={styles.metricSubtext}>
            {formatPercentage((summary.total_remaining_amount / summary.total_budget_amount) * 100)} left
          </Text>
        </View>

        {/* Efficiency */}
        <View style={styles.metricCard}>
          <View style={styles.efficiencyHeader}>
            <Text style={styles.metricLabel}>Efficiency</Text>
            <Ionicons 
              name={getEfficiencyIcon(efficiency_metrics.overall_efficiency)} 
              size={16} 
              color={getEfficiencyColor(efficiency_metrics.overall_efficiency)} 
            />
          </View>
          <Text style={[styles.metricValue, { color: getEfficiencyColor(efficiency_metrics.overall_efficiency) }]}>
            {formatPercentage(efficiency_metrics.overall_efficiency)}
          </Text>
          <Text style={styles.metricSubtext}>
            {efficiency_metrics.budgets_on_track} on track
          </Text>
        </View>
      </View>

      {/* Status Summary */}
      <View style={styles.statusSummary}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <Text style={styles.statusText}>
            {efficiency_metrics.budgets_on_track} On Track
          </Text>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.statusText}>
            {efficiency_metrics.budgets_at_risk} At Risk
          </Text>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
          <Text style={styles.statusText}>
            {efficiency_metrics.budgets_over_limit} Over Limit
          </Text>
        </View>
      </View>

      {/* Category Spending Pie Chart */}
      {pieChartData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          <PieChart
            data={pieChartData}
            title="Category Spending"
            showLegend={true}
            showPercentages={true}
            displayCurrency="USD"
          />
        </View>
      )}

      {/* Category Performance Preview */}
      {category_performance && category_performance.length > 0 && (
        <View style={styles.categoryPreview}>
          <Text style={styles.categoryTitle}>Top Categories</Text>
          {category_performance.slice(0, 3).map((category, index) => (
            <View key={category.category_id} style={styles.categoryItem}>
              <View style={[styles.categoryColor, { backgroundColor: category.category_color }]} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.category_name}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.total_spent_amount)} / {formatCurrency(category.total_budget_amount)}
                </Text>
              </View>
              <Text style={[styles.categoryPercentage, { color: category.variance < 0 ? colors.success : colors.error }]}>
                {formatPercentage(category.percentage_used)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Container>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  efficiencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  chartSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  categoryPreview: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  categoryTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  categoryAmount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  categoryPercentage: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default BudgetAnalyticsSummary;
