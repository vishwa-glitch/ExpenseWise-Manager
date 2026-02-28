import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, goalCategories } from '../../types/goals';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface GoalInsightsProps {
  goals: Goal[];
  displayCurrency: string;
  onGoalPress?: (goalId: string) => void;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const GoalInsights: React.FC<GoalInsightsProps> = ({
  goals,
  displayCurrency,
  onGoalPress
}) => {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    const onTrackGoals = activeGoals.filter(goal => goal.status_info?.is_on_track);
    const urgentGoals = activeGoals.filter(goal => goal.status_info?.urgency === 'high');
    const overdueGoals = activeGoals.filter(goal => goal.days_remaining < 0);
    
    // Success insights
    if (completedGoals.length > 0) {
      insights.push({
        type: 'success',
        title: 'Goals Completed! 🎉',
        description: `You've successfully completed ${completedGoals.length} ${completedGoals.length === 1 ? 'goal' : 'goals'}. Great job staying committed!`,
        icon: '✅',
      });
    }
    
    if (onTrackGoals.length === activeGoals.length && activeGoals.length > 0) {
      insights.push({
        type: 'success',
        title: 'All Goals On Track',
        description: `All ${activeGoals.length} active goals are progressing well. Keep up the excellent work!`,
        icon: '🎯',
      });
    }
    
    // Warning insights
    if (urgentGoals.length > 0) {
      const urgentGoal = urgentGoals[0];
      insights.push({
        type: 'warning',
        title: 'Goals Need Attention',
        description: `${urgentGoals.length} ${urgentGoals.length === 1 ? 'goal needs' : 'goals need'} immediate attention. Consider increasing your monthly contributions.`,
        icon: '⚠️',
        action: {
          label: 'View Details',
          onPress: () => onGoalPress?.(urgentGoal.id),
        },
      });
    }
    
    if (overdueGoals.length > 0) {
      const overdueGoal = overdueGoals[0];
      insights.push({
        type: 'error',
        title: 'Overdue Goals',
        description: `${overdueGoals.length} ${overdueGoals.length === 1 ? 'goal is' : 'goals are'} past their target date. Consider revising your timeline or increasing contributions.`,
        icon: '🚨',
        action: {
          label: 'Review Goal',
          onPress: () => onGoalPress?.(overdueGoal.id),
        },
      });
    }
    
    // Info insights
    const highProgressGoals = activeGoals.filter(goal => goal.progress_percentage >= 80);
    if (highProgressGoals.length > 0) {
      const nearCompletionGoal = highProgressGoals[0];
      insights.push({
        type: 'info',
        title: 'Almost There!',
        description: `${nearCompletionGoal.title} is ${nearCompletionGoal.progress_percentage.toFixed(1)}% complete. Just ${formatCurrency(nearCompletionGoal.remaining_amount, displayCurrency)} more to go!`,
        icon: '🏁',
        action: {
          label: 'Contribute Now',
          onPress: () => onGoalPress?.(nearCompletionGoal.id),
        },
      });
    }
    
    // Monthly savings optimization
    const totalMonthlyNeeded = activeGoals.reduce((sum, goal) => sum + (goal.monthly_savings_needed || 0), 0);
    if (totalMonthlyNeeded > 0) {
      insights.push({
        type: 'info',
        title: 'Monthly Savings Target',
        description: `To stay on track with all goals, you need to save ${formatCurrency(totalMonthlyNeeded, displayCurrency)} per month.`,
        icon: '💰',
      });
    }
    
    // Category-specific insights
    const emergencyGoals = goals.filter(goal => goal.category === 'emergency');
    if (emergencyGoals.length === 0) {
      insights.push({
        type: 'warning',
        title: 'Consider an Emergency Fund',
        description: 'Financial experts recommend having 3-6 months of expenses saved for emergencies.',
        icon: '🛡️',
      });
    }
    
    return insights;
  };

  const getRecommendations = () => {
    const recommendations = [];
    const activeGoals = goals.filter(goal => goal.status === 'active');
    
    // Goal diversification
    const categories = new Set(goals.map(goal => goal.category));
    if (categories.size < 3 && goals.length >= 2) {
      recommendations.push({
        title: 'Diversify Your Goals',
        description: 'Consider adding goals in different categories for better financial balance.',
        icon: '🎯',
        priority: 'medium',
      });
    }
    
    // Milestone celebrations
    const milestonesCompleted = goals.reduce((sum, goal) => sum + (goal.completed_milestones || 0), 0);
    if (milestonesCompleted > 0) {
      recommendations.push({
        title: 'Celebrate Your Progress',
        description: `You've completed ${milestonesCompleted} milestones! Reward yourself for staying committed.`,
        icon: '🎉',
        priority: 'low',
      });
    }
    
    // Contribution consistency
    const inconsistentGoals = activeGoals.filter(goal => {
      const expectedProgress = goal.days_remaining > 0 
        ? ((new Date().getTime() - new Date(goal.created_at).getTime()) / (new Date(goal.target_date).getTime() - new Date(goal.created_at).getTime())) * 100
        : 100;
      return Math.abs((goal.progress_percentage || 0) - expectedProgress) > 20;
    });
    
    if (inconsistentGoals.length > 0) {
      recommendations.push({
        title: 'Improve Consistency',
        description: 'Set up automatic transfers to maintain steady progress toward your goals.',
        icon: '📅',
        priority: 'high',
      });
    }
    
    return recommendations;
  };

  const insights = generateInsights();
  const recommendations = getRecommendations();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return ['#4CAF50', '#2E7D57'];
      case 'warning': return ['#F5A623', '#E8930A'];
      case 'error': return ['#E74C3C', '#C0392B'];
      case 'info': return ['#4A90E2', '#2E5BBA'];
      default: return ['#95A5A6', '#7F8C8D'];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F5A623';
      case 'low': return '#4CAF50';
      default: return '#95A5A6';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Insights Section */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Smart Insights</Text>
          {insights.map((insight, index) => (
            <LinearGradient
              key={index}
              colors={getInsightColor(insight.type)}
              style={styles.insightCard}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
              </View>
              
              {insight.action && (
                <TouchableOpacity
                  style={styles.insightAction}
                  onPress={insight.action.onPress}
                >
                  <Text style={styles.insightActionText}>{insight.action.label}</Text>
                  <Text style={styles.insightActionIcon}>→</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          ))}
        </View>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💭 Recommendations</Text>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationIcon}>{recommendation.icon}</Text>
                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationTitleRow}>
                    <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(recommendation.priority) + '20' }
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        { color: getPriorityColor(recommendation.priority) }
                      ]}>
                        {recommendation.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationDescription}>
                    {recommendation.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Goal Performance Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Performance Trends</Text>
        <View style={styles.trendsContainer}>
          {goals.length > 0 ? (
            <>
              <View style={styles.trendCard}>
                <Text style={styles.trendIcon}>📊</Text>
                <Text style={styles.trendTitle}>Average Progress</Text>
                <Text style={styles.trendValue}>
                  {(goals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0) / goals.length).toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.trendCard}>
                <Text style={styles.trendIcon}>⏱️</Text>
                <Text style={styles.trendTitle}>Avg. Time Left</Text>
                <Text style={styles.trendValue}>
                  {Math.round(
                    goals
                      .filter(goal => goal.days_remaining > 0)
                      .reduce((sum, goal) => sum + goal.days_remaining, 0) / 
                    Math.max(goals.filter(goal => goal.days_remaining > 0).length, 1) / 30
                  )} months
                </Text>
              </View>
              
              <View style={styles.trendCard}>
                <Text style={styles.trendIcon}>💪</Text>
                <Text style={styles.trendTitle}>Success Rate</Text>
                <Text style={styles.trendValue}>
                  {goals.length > 0 
                    ? ((goals.filter(goal => goal.status === 'completed').length / goals.length) * 100).toFixed(1)
                    : 0}%
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>Create goals to see performance trends</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  insightCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...typography.h4,
    color: colors.background,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  insightDescription: {
    ...typography.body,
    color: colors.background + 'DD',
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background + '20',
    borderRadius: 8,
  },
  insightActionText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  insightActionIcon: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
  recommendationCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  recommendationTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  recommendationDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
  },
  trendCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    flex: 1,
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendIcon: {
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  trendTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  trendValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default GoalInsights;
