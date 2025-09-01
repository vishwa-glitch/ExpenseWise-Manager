import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { formatCurrency } from '../../utils/currency';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    target_amount?: number;
    current_amount?: number;
    progress_percentage?: number;
    target_date?: string;
    days_remaining?: number;
    monthly_savings_needed?: number;
    status: string;
    category?: string;
    priority?: string;
    currency?: string;
  };
  onPress?: () => void;
  onContribute?: () => void;
  compact?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onContribute, compact = false }) => {
  // Safety check for malformed goal object
  if (!goal || typeof goal !== 'object') {
    console.warn('GoalCard: Invalid goal object provided:', goal);
    return null;
  }

  const { displayCurrency } = useTypedSelector((state) => state.user);
  const formatAmount = (amount: number | undefined | null) => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0;
    }
    const currency = goal.currency || displayCurrency || 'USD';
    try {
      const formatted = formatCurrency(amount, currency, { maximumFractionDigits: 0 });
      // Ensure we return a valid string
      return typeof formatted === 'string' ? formatted : String(amount);
    } catch (error) {
      console.warn('Error formatting amount:', error);
      return String(amount);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return '';
    }
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
    const progress = goal.progress_percentage || 0;
    if (progress >= 100) return colors.success;
    if (progress >= 75) return colors.primary;
    if (progress >= 50) return colors.warning;
    return colors.accent;
  };

  const getStatusColor = () => {
    const status = goal.status || 'active';
    switch (status) {
      case 'completed': return colors.success;
      case 'active': return colors.primary;
      case 'paused': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getDaysRemainingColor = () => {
    if (!goal.days_remaining) return colors.textSecondary;
    if (goal.days_remaining < 30) return colors.error;
    if (goal.days_remaining < 90) return colors.warning;
    return colors.textSecondary;
  };

  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getPriorityDisplay = () => {
    if (!goal.priority || typeof goal.priority !== 'string') return '';
    try {
      return goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1);
    } catch (error) {
      console.warn('Error formatting priority:', error);
      return goal.priority;
    }
  };

  const getTransparentColor = (color: string, opacity: number = 0.2) => {
    // Convert hex to rgba for transparency
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  const getRemainingAmount = () => {
    const target = typeof goal.target_amount === 'number' && !isNaN(goal.target_amount) ? goal.target_amount : 0;
    const current = typeof goal.current_amount === 'number' && !isNaN(goal.current_amount) ? goal.current_amount : 0;
    return target - current;
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact ? styles.compact : null]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Status Indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getCategoryIcon(goal.category)}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {goal.title || 'Untitled Goal'}
            </Text>
            {!compact && goal.category && (
              <Text style={styles.category}>
                {typeof goal.category === 'string' ? goal.category.charAt(0).toUpperCase() + goal.category.slice(1) : goal.category}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          {goal.priority && (
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.priorityText}>{getPriorityDisplay()}</Text>
            </View>
          )}
                      <View style={[styles.statusBadge, { backgroundColor: getTransparentColor(getStatusColor(), 0.2) }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {(() => {
                  const status = goal.status || 'active';
                  return typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : status;
                })()}
              </Text>
            </View>
        </View>
      </View>

      {/* Enhanced Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={[styles.progressText, { color: getProgressColor() }]}>
            {(() => {
              const progress = goal.progress_percentage || 0;
              return typeof progress === 'number' && !isNaN(progress) ? progress.toFixed(1) + '%' : '0.0%';
            })()}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(typeof goal.progress_percentage === 'number' && !isNaN(goal.progress_percentage) ? goal.progress_percentage : 0, 100)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Enhanced Amount Section */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Current</Text>
          <Text style={styles.currentAmount}>
            {formatAmount(goal.current_amount)}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Target</Text>
          <Text style={styles.targetAmount}>
            {formatAmount(goal.target_amount)}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Remaining</Text>
          <Text style={styles.remainingAmount}>
            {formatAmount(getRemainingAmount())}
          </Text>
        </View>
      </View>

      {!compact && (
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {goal.target_date && (
              <Text style={styles.targetDate}>
                🗓️ {formatDate(goal.target_date)}
              </Text>
            )}
            {goal.days_remaining !== undefined && typeof goal.days_remaining === 'number' && goal.days_remaining > 0 && (
              <Text style={[styles.daysRemaining, { color: getDaysRemainingColor() }]}>
                ⏰ {goal.days_remaining} days left
              </Text>
            )}
          </View>
          
          {/* Quick Contribute Button */}
          {onContribute && (goal.status || 'active') === 'active' && (
            <TouchableOpacity
              style={styles.contributeButton}
              onPress={onContribute}
              activeOpacity={0.8}
            >
              <Text style={styles.contributeButtonText}>💰 Add Contribution</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!compact && goal.monthly_savings_needed && typeof goal.monthly_savings_needed === 'number' && goal.monthly_savings_needed > 0 && (
        <View style={styles.savingsNeeded}>
          <Text style={styles.savingsIcon}>💡</Text>
          <Text style={styles.savingsText}>
            Save {formatAmount(goal.monthly_savings_needed || 0)}/month to reach your goal on time
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  compact: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  category: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  priorityText: {
    ...typography.small,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
    fontSize: 10,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  amountSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  currentAmount: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  targetAmount: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  remainingAmount: {
    ...typography.body,
    color: colors.warning,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  footerLeft: {
    flex: 1,
  },
  targetDate: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  daysRemaining: {
    ...typography.small,
    fontWeight: '600',
  },
  savingsNeeded: {
    backgroundColor: colors.info + '10',
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  savingsIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  savingsText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
    fontSize: 13.2, // 10% bigger than the original small font size (12 * 1.1)
  },
  contributeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    minWidth: 140,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  contributeButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 13,
  },
});