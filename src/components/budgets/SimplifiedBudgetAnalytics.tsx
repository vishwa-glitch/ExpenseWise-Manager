import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { BudgetAnalyticsResponse } from '../../types/api';
import { 
  getOverallStatusMessage,
  formatUtilizationRate 
} from '../../utils/budgetStatus';

type BudgetCategoryPerformance = BudgetAnalyticsResponse['category_performance'][number];

interface SimplifiedBudgetAnalyticsProps {
  analytics: BudgetAnalyticsResponse;
}

const SimplifiedBudgetAnalytics: React.FC<SimplifiedBudgetAnalyticsProps> = ({
  analytics,
}) => {
  // Add null checks for analytics data
  if (!analytics) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No budget data available</Text>
      </View>
    );
  }

  const { summary, budget_health, category_performance } = analytics;
  const { displayCurrency } = useTypedSelector((state) => state.user);

  // Add null checks for required data
  if (!summary || !budget_health) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Budget data is incomplete</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    // Handle null, undefined, or NaN values
    if (amount === null || amount === undefined || isNaN(amount)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: displayCurrency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(0);
    }
    
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
    const status = budget_health.overall_status;
    
    switch (status) {
      case 'on_track': 
        return { status: 'On Track', color: colors.success, icon: 'checkmark-circle' };
      case 'monitor_closely': 
        return { status: 'Monitor Closely', color: colors.warning, icon: 'warning' };
      case 'review_required': 
        return { status: 'Review Required', color: colors.error, icon: 'alert-circle' };
      default: 
        return { status: 'On Track', color: colors.success, icon: 'checkmark-circle' };
    }
  };

  const getTopCategories = (): BudgetCategoryPerformance[] => {
    if (!category_performance || !Array.isArray(category_performance)) {
      return [];
    }
    
    return category_performance
      .filter((category): category is BudgetCategoryPerformance =>
        Boolean(category) &&
        typeof category.total_spent_amount === 'number' &&
        !isNaN(category.total_spent_amount)
      )
      .sort((a, b) => (b.total_spent_amount || 0) - (a.total_spent_amount || 0))
      .slice(0, 3);
  };

  const getOverBudgetCategories = (): BudgetCategoryPerformance[] => {
    if (!category_performance || !Array.isArray(category_performance)) {
      return [];
    }
    
    return category_performance
      .filter((cat): cat is BudgetCategoryPerformance => Boolean(cat) && cat.status === 'over_budget')
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
          {formatUtilizationRate(budget_health.utilization_rate)} budget used
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
          {topCategories.map((category) => (
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
          {overBudgetCategories.map((category) => (
            <View
              key={category.category_id}
              style={styles.alertItem}
            >
              <Text style={styles.alertCategory}>{category.category_name}</Text>
              <Text style={styles.alertAmount}>
                {formatCurrency(category.total_spent_amount)} / {formatCurrency(category.total_budget_amount)}
              </Text>
              <Text style={styles.alertHint}>Review this category in your budgets list</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Summary */}
      <View style={styles.quickSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Budgets on Track</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {budget_health.budgets_under_budget + budget_health.budgets_on_track}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Need Attention</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            {budget_health.budgets_approaching_limit + budget_health.budgets_over_budget}
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
  alertHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
    color: colors.text,
    fontWeight: '700',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});

export default SimplifiedBudgetAnalytics;
