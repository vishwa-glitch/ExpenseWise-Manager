import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { formatCurrency } from '../../utils/currency';

interface BudgetCardProps {
  budget: {
    id: string;
    name: string;
    amount: number;
    spent?: number;
    period: string;
    category_name?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    currency?: string;
  };
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onPress, onEdit, onDelete }) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const formatAmount = (amount: number) => {
    const currency = budget.currency || displayCurrency || 'USD';
    return formatCurrency(amount, currency, { maximumFractionDigits: 0 });
  };

  const getProgressPercentage = () => {
    if (!budget.spent || budget.amount === 0) return 0;
    return Math.min((budget.spent / budget.amount) * 100, 100);
  };

  const getRemainingAmount = () => {
    return budget.amount - (budget.spent || 0);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return colors.error;
    if (percentage >= 80) return colors.warning;
    if (percentage >= 60) return colors.accent;
    return colors.primary;
  };

  const getPeriodIcon = (period: string) => {
    switch (period.toLowerCase()) {
      case 'weekly':
        return '📅';
      case 'monthly':
        return '🗓️';
      case 'quarterly':
        return '📊';
      case 'yearly':
        return '🗓️';
      default:
        return '📅';
    }
  };

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return '💰';
    
    const iconMap: { [key: string]: string } = {
      'food & dining': '🍽️',
      'transportation': '🚗',
      'shopping': '🛍️',
      'entertainment': '🎬',
      'utilities': '⚡',
      'healthcare': '🏥',
      'education': '📚',
      'travel': '✈️',
      'other': '💰',
    };
    
    return iconMap[categoryName.toLowerCase()] || '💰';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(budget.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <TouchableOpacity
      style={[styles.container, !budget.is_active && styles.inactive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(budget.category_name)}
            </Text>
            <Text style={styles.periodIcon}>
              {getPeriodIcon(budget.period)}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{budget.name}</Text>
            <Text style={styles.category}>
              {budget.category_name || 'All Categories'} • {budget.period}
            </Text>
          </View>
        </View>
        
        {budget.is_active && (
          <View style={styles.actionsContainer}>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEdit}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onDelete}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.spentAmount}>
            Spent: {formatAmount(budget.spent || 0)}
          </Text>
          <Text style={styles.totalAmount}>
            of {formatAmount(budget.amount)}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${getProgressPercentage()}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        
        <View style={styles.progressFooter}>
          <Text style={[
            styles.remainingAmount,
            { color: getRemainingAmount() >= 0 ? colors.income : colors.error }
          ]}>
            {getRemainingAmount() >= 0 ? 'Remaining: ' : 'Over budget: '}
            {formatAmount(Math.abs(getRemainingAmount()))}
          </Text>
          <Text style={styles.progressPercentage}>
            {getProgressPercentage().toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dateRange}>
          <Text style={styles.dateText}>
            {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
          </Text>
        </View>
        
        {budget.is_active && (
          <View style={styles.daysRemaining}>
            <Text style={styles.daysRemainingText}>
              {getDaysRemaining()} days left
            </Text>
          </View>
        )}
        
        {!budget.is_active && (
          <View style={styles.inactiveLabel}>
            <Text style={styles.inactiveLabelText}>Inactive</Text>
          </View>
        )}
      </View>
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
  inactive: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  periodIcon: {
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spentAmount: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  totalAmount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingAmount: {
    ...typography.caption,
    fontWeight: '600',
  },
  progressPercentage: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRange: {
    flex: 1,
  },
  dateText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  daysRemaining: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  daysRemainingText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  inactiveLabel: {
    backgroundColor: colors.textSecondary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  inactiveLabelText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});