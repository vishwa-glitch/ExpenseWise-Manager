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
    initial_amount?: number;
    contributed_amount?: number;
    progress_percentage?: number;
    target_date?: string;
    days_remaining?: number;
    monthly_savings_needed?: number;
    status: string;
    category?: string;
    priority?: string;
    currency?: string;
    is_goal_exceeded?: boolean;
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
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return null;
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
    if (progress > 100) return colors.success; // Exceeded goal
    if (progress >= 100) return colors.success; // Completed goal
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
    if (!goal.priority || typeof goal.priority !== 'string') return null;
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
    
    // Return actual remaining amount (can be negative if goal exceeded)
    const remaining = target - current;
    return typeof remaining === 'number' && !isNaN(remaining) ? remaining : 0;
  };

  const getCompletionStatus = () => {
    const progress = goal.progress_percentage || 0;
    const current = typeof goal.current_amount === 'number' && !isNaN(goal.current_amount) ? goal.current_amount : 0;
    const target = typeof goal.target_amount === 'number' && !isNaN(goal.target_amount) ? goal.target_amount : 0;
    
    // Use backend flag if available, otherwise calculate
    const isExceeded = goal.is_goal_exceeded !== undefined 
      ? goal.is_goal_exceeded 
      : current >= target;
    
    if (goal.status === 'completed' || progress >= 100 || isExceeded) {
      const message = isExceeded && current > target 
        ? '🎉 Goal Exceeded!' 
        : '🎉 Goal Achieved!';
      return { isCompleted: true, message, isExceeded };
    }
    
    return { isCompleted: false, message: null, isExceeded: false };
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
            <Text style={styles.title} numberOfLines={2}>
              {goal.title || 'Untitled Goal'}
            </Text>
            {!compact && goal.category ? (
              <Text style={styles.category}>
                {getCategoryIcon(goal.category)} {(() => {
                  const category = goal.category;
                  if (typeof category === 'string' && category.length > 0) {
                    return category.charAt(0).toUpperCase() + category.slice(1);
                  }
                  return String(category || '');
                })()}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerRight}>
          {goal.target_date && formatDate(goal.target_date) ? (
            <Text style={styles.targetDate}>
              🗓️ {formatDate(goal.target_date)}
            </Text>
          ) : null}
          {goal.days_remaining !== undefined && typeof goal.days_remaining === 'number' && goal.days_remaining > 0 ? (
            <Text style={[styles.daysRemaining, { color: getDaysRemainingColor() }]}>
              ⏰ {goal.days_remaining} days left
            </Text>
          ) : null}
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
        {getCompletionStatus().isCompleted ? (
          <View style={[styles.completionBanner, getCompletionStatus().isExceeded ? styles.exceededBanner : null]}>
            <Text style={[styles.completionText, getCompletionStatus().isExceeded ? styles.exceededText : null]}>
              {getCompletionStatus().message}
            </Text>
            <Text style={styles.completionSubtext}>
              {getCompletionStatus().isExceeded 
                ? `Exceeded target by ${formatAmount(Math.abs(getRemainingAmount()))}!`
                : `Saved ${formatAmount(goal.current_amount)} of ${formatAmount(goal.target_amount)}`
              }
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>💰 Current Savings</Text>
              <Text style={styles.currentAmount}>
                {formatAmount(goal.current_amount)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>🎯 Target Amount</Text>
              <Text style={styles.targetAmount}>
                {formatAmount(goal.target_amount)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>
                {getRemainingAmount() < 0 ? '🎉 Exceeded By' : '📈 Still Needed'}
              </Text>
              <Text style={[styles.remainingAmount, getRemainingAmount() < 0 ? styles.exceededAmount : null]}>
                {getRemainingAmount() < 0 
                  ? formatAmount(Math.abs(getRemainingAmount()))
                  : formatAmount(getRemainingAmount())
                }
              </Text>
            </View>
          </>
        )}
      </View>

      {!compact && (
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {goal.priority && getPriorityDisplay() ? (
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
                <Text style={styles.priorityText}>{String(getPriorityDisplay() || '')}</Text>
              </View>
            ) : null}
            <View style={[styles.statusBadge, { backgroundColor: getTransparentColor(getStatusColor(), 0.2) }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {(() => {
                  const status = goal.status || 'active';
                  return typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : String(status);
                })()}
              </Text>
            </View>
          </View>
          
          {/* Quick Contribute Button */}
          {onContribute && (goal.status || 'active') === 'active' ? (
            <TouchableOpacity
              style={styles.contributeButton}
              onPress={onContribute}
              activeOpacity={0.8}
            >
              <Text style={styles.contributeButtonText}>💰 Add Contribution</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {!compact && goal.monthly_savings_needed && typeof goal.monthly_savings_needed === 'number' && goal.monthly_savings_needed > 0 ? (
        <View style={styles.savingsNeeded}>
          <Text style={styles.savingsIcon}>💡</Text>
          <Text style={styles.savingsText}>
            Save {formatAmount(goal.monthly_savings_needed || 0)}/month to reach your goal on time
          </Text>
        </View>
      ) : null}
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
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
  },
  category: {
    ...typography.body,
    color: colors.primary,
    textTransform: 'capitalize',
    fontWeight: '600',
    fontSize: 14,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
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
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  progressText: {
    ...typography.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  amountSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  amountLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  currentAmount: {
    ...typography.h3,
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 16,
  },
  targetAmount: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  remainingAmount: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  exceededAmount: {
    color: colors.success,
  },
  completionBanner: {
    backgroundColor: colors.success + '15',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success + '30',
  },
  completionText: {
    ...typography.h2,
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  completionSubtext: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  exceededBanner: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success + '40',
  },
  exceededText: {
    color: colors.success,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetDate: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 13.2, // 10% bigger than small font size (12 * 1.1)
  },
  daysRemaining: {
    ...typography.small,
    fontWeight: '600',
    fontSize: 13.2, // 10% bigger than small font size (12 * 1.1)
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  contributeButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 13,
  },
});