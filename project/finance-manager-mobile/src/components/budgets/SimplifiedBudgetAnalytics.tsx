import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';

interface SimplifiedBudgetAnalyticsProps {
  analytics: any;
  onBudgetPress?: (budgetId: string) => void;
}

const SimplifiedBudgetAnalytics: React.FC<SimplifiedBudgetAnalyticsProps> = ({
  analytics,
  onBudgetPress,
}) => {
  const { summary, efficiency_metrics, category_performance } = analytics;
  const { displayCurrency } = useTypedSelector((state) => state.user);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: displayCurrency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(0)}%`;
  };

  const getOverallStatus = () => {
    const efficiency = getDisplayEfficiency();
    
    // Higher efficiency means better budget management
    if (efficiency >= 95) return { status: 'Perfect', color: colors.success, icon: 'checkmark-circle' };
    if (efficiency >= 80) return { status: 'Great', color: colors.success, icon: 'checkmark-circle' };
    if (efficiency >= 60) return { status: 'Good', color: colors.warning, icon: 'warning' };
    return { status: 'Needs Attention', color: colors.error, icon: 'alert-circle' };
  };

  const getDisplayEfficiency = () => {
    // Backend now provides the correct efficiency calculation
    return efficiency_metrics.overall_efficiency;
  };

  const getTopCategories = () => {
    return category_performance
      .sort((a: any, b: any) => b.total_spent_amount - a.total_spent_amount)
      .slice(0, 3);
  };

  const getOverBudgetCategories = () => {
    return category_performance
      .filter((cat: any) => cat.status === 'over_budget')
      .slice(0, 2);
  };

  const overallStatus = getOverallStatus();
  const topCategories = getTopCategories();
  const overBudgetCategories = getOverBudgetCategories();

  return (
    <View style={styles.container}>
      {/* Overall Status */}
      <View style={styles.overallStatus}>
        <View style={styles.statusHeader}>
          <Ionicons name={overallStatus.icon as any} size={24} color={overallStatus.color} />
          <Text style={styles.statusTitle}>Overall Budget Status</Text>
        </View>
        <Text style={[styles.statusValue, { color: overallStatus.color }]}>
          {overallStatus.status}
        </Text>
        <Text style={styles.statusSubtext}>
          {formatPercentage(getDisplayEfficiency())} efficiency
        </Text>
      </View>

      {/* Key Numbers */}
      <View style={styles.keyNumbers}>
        <View style={styles.numberCard}>
          <Text style={styles.numberLabel}>Total Budget</Text>
          <Text style={styles.numberValue}>
            {formatCurrency(summary.total_budget_amount)}
          </Text>
        </View>
        
        <View style={styles.numberCard}>
          <Text style={styles.numberLabel}>Spent</Text>
          <Text style={[styles.numberValue, { color: colors.expense }]}>
            {formatCurrency(summary.total_spent_amount)}
          </Text>
        </View>
        
        <View style={styles.numberCard}>
          <Text style={styles.numberLabel}>Remaining</Text>
          <Text style={[styles.numberValue, { color: colors.income }]}>
            {formatCurrency(summary.total_remaining_amount)}
          </Text>
        </View>
      </View>

      {/* Top Spending Categories */}
      {topCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Spending Categories</Text>
          {topCategories.map((category: any) => (
            <View key={category.category_id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryColor, { backgroundColor: category.category_color }]} />
                <Text style={styles.categoryName}>{category.category_name}</Text>
              </View>
              <View style={styles.categoryAmounts}>
                <Text style={styles.categorySpent}>
                  {formatCurrency(category.total_spent_amount)}
                </Text>
                <Text style={styles.categoryBudget}>
                  of {formatCurrency(category.total_budget_amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Over Budget Alerts */}
      {overBudgetCategories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.alertTitle}>Over Budget Categories</Text>
          </View>
          {overBudgetCategories.map((category: any) => (
            <TouchableOpacity
              key={category.category_id}
              style={styles.alertItem}
              onPress={() => onBudgetPress?.(category.category_id)}
              activeOpacity={0.7}
            >
              <Text style={styles.alertCategory}>{category.category_name}</Text>
              <Text style={styles.alertAmount}>
                {formatCurrency(category.total_spent_amount)} / {formatCurrency(category.total_budget_amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Summary */}
      <View style={styles.quickSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Budgets on Track</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {efficiency_metrics.budgets_on_track}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Need Attention</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            {efficiency_metrics.budgets_at_risk + efficiency_metrics.budgets_over_limit}
          </Text>
        </View>
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
  overallStatus: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  statusValue: {
    ...typography.h2,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statusSubtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
  keyNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  numberCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  numberLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  numberValue: {
    ...typography.h3,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryInfo: {
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
    flex: 1,
  },
  categoryAmounts: {
    alignItems: 'flex-end',
  },
  categorySpent: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  categoryBudget: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  alertItem: {
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  alertCategory: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  alertAmount: {
    ...typography.caption,
    color: colors.error,
  },
  quickSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h3,
    fontWeight: 'bold',
  },
});

export default SimplifiedBudgetAnalytics;
