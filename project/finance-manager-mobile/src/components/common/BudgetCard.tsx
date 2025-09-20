import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { formatCurrency } from '../../utils/currency';
import { 
  getStatusDisplay, 
  calculateBudgetStatus, 
  calculateDaysRemaining,
  getSpendingAdvice,
  formatUtilizationRate,
  type BudgetStatus 
} from '../../utils/budgetStatus';

interface BudgetCardProps {
  budget: {
    id: string;
    name: string;
    amount: number;
    spent_amount?: number;
    period: string;
    category_name?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    currency?: string;
    status?: BudgetStatus;
    utilization_rate?: number;
    alert_threshold?: number;
  };
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onPress, onEdit, onDelete }) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const { categories } = useTypedSelector((state) => state.categories);

  const formatAmount = (amount: number) => {
    const currency = budget.currency || displayCurrency || 'USD';
    return formatCurrency(amount, currency, { maximumFractionDigits: 0 });
  };

  const getProgressPercentage = () => {
    if (!budget.spent_amount || budget.amount === 0) return 0;
    return Math.min((budget.spent_amount / budget.amount) * 100, 100);
  };

  const getRemainingAmount = () => {
    return budget.amount - (budget.spent_amount || 0);
  };

  const getBudgetStatus = (): BudgetStatus => {
    if (budget.status) {
      return budget.status;
    }
    const utilizationRate = budget.utilization_rate || getProgressPercentage();
    const alertThreshold = budget.alert_threshold || 80;
    return calculateBudgetStatus(utilizationRate, alertThreshold);
  };

  const getProgressColor = () => {
    const status = getBudgetStatus();
    const statusColors = {
      green: colors.success || colors.primary,
      blue: colors.info || colors.accent,
      orange: colors.warning,
      red: colors.error
    };
    return getStatusDisplay(status, statusColors).color;
  };

  const getStatusInfo = () => {
    const status = getBudgetStatus();
    const statusColors = {
      green: colors.success || colors.primary,
      blue: colors.info || colors.accent,
      orange: colors.warning,
      red: colors.error
    };
    return getStatusDisplay(status, statusColors);
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
    
    // First, try to find the category in the categories store
    const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    
    // If category has an icon property, map it to emoji
    if (category?.icon) {
      const iconMap: { [key: string]: string } = {
        'utensils': '🍽️',
        'car': '🚗',
        'shopping-bag': '🛍️',
        'film': '🎬',
        'zap': '⚡',
        'heart': '🏥',
        'book': '📚',
        'plane': '✈️',
        'briefcase': '💼',
        'trending-up': '📈',
        'home': '🏠',
        'phone': '📱',
        'gift': '🎁',
        'coffee': '☕',
        'music': '🎵',
        'camera': '📷',
        'gamepad': '🎮',
        'dumbbell': '🏋️',
        'palette': '🎨',
        'tool': '🔧',
        'tag': '🏷️',
      };
      
      return iconMap[category.icon] || '🏷️';
    }
    
    // Fallback to name-based icons for default categories
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('dining')) return '🍽️';
    if (name.includes('transport') || name.includes('car')) return '🚗';
    if (name.includes('shop') || name.includes('retail')) return '🛍️';
    if (name.includes('entertainment') || name.includes('movie')) return '🎬';
    if (name.includes('utilities') || name.includes('electric')) return '⚡';
    if (name.includes('health') || name.includes('medical')) return '🏥';
    if (name.includes('education') || name.includes('school')) return '📚';
    if (name.includes('travel') || name.includes('vacation')) return '✈️';
    if (name.includes('salary') || name.includes('income')) return '💼';
    if (name.includes('investment') || name.includes('stock')) return '📈';
    
    return '💰'; // Default fallback
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getDaysRemaining = () => {
    return calculateDaysRemaining(budget.end_date);
  };

  const getUtilizationRate = () => {
    return budget.utilization_rate || getProgressPercentage();
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
        
        {budget.is_active && onEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.spentAmount}>
            Budget Used: {formatUtilizationRate(getUtilizationRate())}
          </Text>
          <View style={styles.statusChip}>
            <Text style={styles.statusIcon}>{getStatusInfo().icon}</Text>
            <Text style={[styles.statusText, { color: getStatusInfo().color }]}>
              {getStatusInfo().text}
            </Text>
          </View>
        </View>
        
        <View style={styles.amountRow}>
          <Text style={styles.spentAmountDetail}>
            {formatAmount(budget.spent_amount || 0)}
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
                width: `${getUtilizationRate()}%`,
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
          <Text style={styles.contextInfo}>
            {getStatusInfo().description}
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
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  editButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spentAmountDetail: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
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
  contextInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
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