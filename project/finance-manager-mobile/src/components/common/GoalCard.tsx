import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    target_amount: number;
    current_amount: number;
    progress_percentage: number;
    target_date?: string;
    days_remaining?: number;
    monthly_savings_needed?: number;
    status: string;
    category?: string;
    priority?: number;
    currency?: string;
  };
  onPress?: () => void;
  compact?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, compact = false }) => {
  const formatAmount = (amount: number) => {
    const currency = goal.currency || getDefaultCurrency();
    return formatCurrency(amount, currency, { maximumFractionDigits: 0 });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category?: string) => {
    const iconMap: { [key: string]: string } = {
      'emergency': '🚨',
      'vacation': '🏖️',
      'car': '🚗',
      'house': '🏠',
      'education': '🎓',
      'retirement': '👴',
      'investment': '📈',
      'other': '🎯',
    };
    
    return iconMap[category?.toLowerCase() || 'other'] || '🎯';
  };

  const getProgressColor = () => {
    if (goal.progress_percentage >= 100) return colors.success;
    if (goal.progress_percentage >= 75) return colors.primary;
    if (goal.progress_percentage >= 50) return colors.warning;
    return colors.accent;
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compact]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.icon}>{getCategoryIcon(goal.category)}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {goal.title}
            </Text>
            {!compact && goal.category && (
              <Text style={styles.category}>
                {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
              </Text>
            )}
          </View>
        </View>
        {goal.priority && (
          <View style={[styles.priorityBadge, { backgroundColor: getProgressColor() }]}>
            <Text style={styles.priorityText}>P{goal.priority}</Text>
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(goal.progress_percentage, 100)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {goal.progress_percentage.toFixed(1)}%
        </Text>
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.currentAmount}>
          {formatAmount(goal.current_amount)}
        </Text>
        <Text style={styles.targetAmount}>
          of {formatAmount(goal.target_amount)}
        </Text>
      </View>

      {!compact && (
        <View style={styles.footer}>
          {goal.target_date && (
            <Text style={styles.targetDate}>
              Target: {formatDate(goal.target_date)}
            </Text>
          )}
          {goal.days_remaining !== undefined && goal.days_remaining > 0 && (
            <Text style={styles.daysRemaining}>
              {goal.days_remaining} days left
            </Text>
          )}
        </View>
      )}

      {!compact && goal.monthly_savings_needed && goal.monthly_savings_needed > 0 && (
        <View style={styles.savingsNeeded}>
          <Text style={styles.savingsText}>
            Save {formatAmount(goal.monthly_savings_needed)}/month to reach goal
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compact: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    ...typography.small,
    color: colors.background,
    fontWeight: 'bold',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  currentAmount: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  targetAmount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  targetDate: {
    ...typography.small,
    color: colors.textSecondary,
  },
  daysRemaining: {
    ...typography.small,
    color: colors.warning,
    fontWeight: '600',
  },
  savingsNeeded: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
  },
  savingsText: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});