import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchGoals } from '../../store/slices/goalsSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Goal } from '../../types/goals';

import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface GoalAnalyticsScreenProps {
  navigation: any;
}

const GoalAnalyticsScreen: React.FC<GoalAnalyticsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { goals, isLoading } = useTypedSelector((state) => state.goals);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);
  const { displayCurrency } = useTypedSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) return;
    
    try {
      await dispatch(fetchGoals());
    } catch (error) {
      console.error('Error loading goals analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  
  const totalTarget = activeGoals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
  const totalSaved = activeGoals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const totalRemaining = totalTarget - totalSaved;
  const avgProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0) / activeGoals.length 
    : 0;

  // Calculate valuable insights
  const totalMonthlySavingsNeeded = activeGoals.reduce((sum, goal) => 
    sum + (goal.monthly_savings_needed || 0), 0
  );

  // Find goals at risk (behind schedule)
  const goalsAtRisk = activeGoals.filter(goal => {
    const progress = goal.progress_percentage || 0;
    const daysRemaining = goal.days_remaining || 0;
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;
    if (!targetDate) return false;
    
    const totalDays = Math.ceil((targetDate.getTime() - new Date(goal.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = totalDays - daysRemaining;
    const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
    
    return progress < expectedProgress - 10; // More than 10% behind
  });

  // Find goals on track or ahead
  const goalsOnTrack = activeGoals.filter(goal => {
    const progress = goal.progress_percentage || 0;
    const daysRemaining = goal.days_remaining || 0;
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;
    if (!targetDate) return false;
    
    const totalDays = Math.ceil((targetDate.getTime() - new Date(goal.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = totalDays - daysRemaining;
    const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
    
    return progress >= expectedProgress - 10;
  });

  // Find next goal to complete
  const nextToComplete = activeGoals
    .filter(goal => (goal.progress_percentage || 0) > 0)
    .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))[0];

  // Find most urgent goal (least days remaining)
  const mostUrgent = activeGoals
    .filter(goal => goal.days_remaining && goal.days_remaining > 0)
    .sort((a, b) => (a.days_remaining || 999) - (b.days_remaining || 999))[0];

  // Calculate completion rate
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;

  if (!isAuthenticated || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Overview</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Goals Yet</Text>
            <Text style={styles.emptyMessage}>
              Create your first goal to see your progress here.
            </Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {/* Key Metrics */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
              
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricIcon}>💰</Text>
                  <Text style={styles.metricTitle}>Monthly Savings Target</Text>
                </View>
                <Text style={styles.metricValue}>
                  {formatCurrency(totalMonthlySavingsNeeded, displayCurrency, { maximumFractionDigits: 0 })}/month
                </Text>
                <Text style={styles.metricSubtext}>
                  To reach all {activeGoals.length} active goals on time
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricIcon}>🎯</Text>
                  <Text style={styles.metricTitle}>Total Remaining</Text>
                </View>
                <Text style={styles.metricValue}>
                  {formatCurrency(totalRemaining, displayCurrency, { maximumFractionDigits: 0 })}
                </Text>
                <View style={styles.progressBarSmall}>
                  <View
                    style={[
                      styles.progressFillSmall,
                      { width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }
                    ]}
                  />
                </View>
                <Text style={styles.metricSubtext}>
                  {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}% of total target achieved
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricIcon}>🏆</Text>
                  <Text style={styles.metricTitle}>Success Rate</Text>
                </View>
                <Text style={styles.metricValue}>{completionRate.toFixed(0)}%</Text>
                <Text style={styles.metricSubtext}>
                  {completedGoals.length} of {totalGoals} goals completed
                </Text>
              </View>
            </View>

            {/* Performance Insights */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>💡 Performance Insights</Text>
              
              <View style={styles.insightRow}>
                <View style={[styles.insightCard, styles.successCard]}>
                  <Text style={styles.insightNumber}>{goalsOnTrack.length}</Text>
                  <Text style={styles.insightLabel}>On Track</Text>
                </View>
                <View style={[styles.insightCard, styles.warningCard]}>
                  <Text style={styles.insightNumber}>{goalsAtRisk.length}</Text>
                  <Text style={styles.insightLabel}>At Risk</Text>
                </View>
              </View>

              {nextToComplete && (
                <TouchableOpacity
                  style={styles.highlightCard}
                  onPress={() => navigation.navigate('GoalDetail', { goalId: nextToComplete.id })}
                >
                  <Text style={styles.highlightIcon}>🎉</Text>
                  <View style={styles.highlightContent}>
                    <Text style={styles.highlightTitle}>Next to Complete</Text>
                    <Text style={styles.highlightGoal}>{nextToComplete.title}</Text>
                    <Text style={styles.highlightProgress}>
                      {(nextToComplete.progress_percentage || 0).toFixed(0)}% complete
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {mostUrgent && (
                <TouchableOpacity
                  style={[styles.highlightCard, styles.urgentCard]}
                  onPress={() => navigation.navigate('GoalDetail', { goalId: mostUrgent.id })}
                >
                  <Text style={styles.highlightIcon}>⚡</Text>
                  <View style={styles.highlightContent}>
                    <Text style={styles.highlightTitle}>Most Urgent</Text>
                    <Text style={styles.highlightGoal}>{mostUrgent.title}</Text>
                    <Text style={styles.highlightProgress}>
                      {mostUrgent.days_remaining} days remaining
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Goals at Risk */}
            {goalsAtRisk.length > 0 && (
              <View style={styles.riskSection}>
                <Text style={styles.sectionTitle}>⚠️ Goals Needing Attention</Text>
                {goalsAtRisk.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={styles.riskCard}
                    onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
                  >
                    <View style={styles.riskHeader}>
                      <Text style={styles.riskTitle}>{goal.title}</Text>
                      <Text style={styles.riskBadge}>Behind Schedule</Text>
                    </View>
                    <Text style={styles.riskText}>
                      Save {formatCurrency(goal.monthly_savings_needed, displayCurrency, { maximumFractionDigits: 0 })}/month to get back on track
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  metricsSection: {
    marginBottom: spacing.xl,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  metricTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  metricSubtext: {
    ...typography.small,
    color: colors.textSecondary,
  },
  progressBarSmall: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  insightNumber: {
    ...typography.h1,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  insightLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  highlightCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  urgentCard: {
    backgroundColor: colors.warning + '15',
    borderLeftColor: colors.warning,
  },
  highlightIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  highlightGoal: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  highlightProgress: {
    ...typography.small,
    color: colors.textSecondary,
  },
  riskSection: {
    marginBottom: spacing.xl,
  },
  riskCard: {
    backgroundColor: colors.error + '10',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  riskTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    flex: 1,
  },
  riskBadge: {
    ...typography.caption,
    color: colors.error,
    fontWeight: 'bold',
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    fontSize: 10,
  },
  riskText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});

export default GoalAnalyticsScreen;