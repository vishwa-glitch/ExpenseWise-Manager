import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, goalCategories, goalStatusConfig, goalUrgencyConfig } from '../../types/goals';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface GoalProgressCardProps {
  goal: Goal;
  onPress?: () => void;
  showDetails?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - (spacing.lg * 2);

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  goal,
  onPress,
  showDetails = true
}) => {
  const categoryInfo = goalCategories[goal.category];
  const statusInfo = goalStatusConfig[goal.status];
  const urgencyInfo = goalUrgencyConfig[goal.status_info?.urgency || 'low'];
  
  const progressPercentage = Math.min(goal.progress_percentage || 0, 100);
  const isCompleted = goal.status === 'completed';
  const isOnTrack = goal.status_info?.is_on_track;
  
  const getProgressColor = () => {
    if (isCompleted) return '#4CAF50';
    if (progressPercentage >= 80) return '#2E7D57';
    if (progressPercentage >= 50) return '#4A90E2';
    if (progressPercentage >= 25) return '#F5A623';
    return '#E74C3C';
  };

  const getDaysRemainingText = () => {
    if (isCompleted) return 'Completed!';
    if (!goal.days_remaining) return 'No deadline';
    
    const days = goal.days_remaining;
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    if (days <= 30) return `${days} days left`;
    if (days <= 365) return `${Math.round(days / 30)} months left`;
    return `${Math.round(days / 365)} years left`;
  };

  const getMilestoneProgress = () => {
    if (!goal.total_milestones) return null;
    return `${goal.completed_milestones || 0}/${goal.total_milestones} milestones`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[categoryInfo.color + '15', categoryInfo.color + '05']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.goalTitle} numberOfLines={2}>
                {goal.title}
              </Text>
              <Text style={styles.categoryName}>{categoryInfo.name}</Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: urgencyInfo.color + '20' }]}>
              <Text style={styles.statusIcon}>{urgencyInfo.icon}</Text>
              <Text style={[styles.statusText, { color: urgencyInfo.color }]}>
                {urgencyInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressPercentage}>
              {progressPercentage.toFixed(1)}%
            </Text>
            <Text style={styles.daysRemaining}>
              {getDaysRemainingText()}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: getProgressColor()
                  }
                ]}
              />
            </View>
          </View>
          
          {/* Milestone Progress */}
          {getMilestoneProgress() && (
            <View style={styles.milestoneContainer}>
              <Text style={styles.milestoneIcon}>🏆</Text>
              <Text style={styles.milestoneText}>{getMilestoneProgress()}</Text>
            </View>
          )}
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Current</Text>
            <Text style={styles.currentAmount}>
              {formatCurrency(goal.current_amount, goal.currency)}
            </Text>
          </View>
          
          <View style={styles.amountDivider} />
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Target</Text>
            <Text style={styles.targetAmount}>
              {formatCurrency(goal.target_amount, goal.currency)}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        {showDetails && (
          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💰</Text>
              <Text style={styles.detailText}>
                {formatCurrency(goal.remaining_amount, goal.currency)} remaining
              </Text>
            </View>
            
            {goal.monthly_savings_needed > 0 && (
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detailText}>
                  {formatCurrency(goal.monthly_savings_needed, goal.currency)}/month needed
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Performance Indicator */}
        <View style={styles.performanceIndicator}>
          <View style={[
            styles.performanceBar,
            { backgroundColor: isOnTrack ? '#4CAF50' : '#F5A623' }
          ]}>
            <Text style={styles.performanceText}>
              {isOnTrack ? '✅ On Track' : '⚠️ Needs Attention'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  goalTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
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
  progressPercentage: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  daysRemaining: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  milestoneIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  milestoneText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  currentAmount: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  targetAmount: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  amountDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  detailsSection: {
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  performanceIndicator: {
    marginTop: spacing.sm,
  },
  performanceBar: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  performanceText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
});

export default GoalProgressCard;
