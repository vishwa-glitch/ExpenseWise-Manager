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
import { LineChart, PieChart, BarChart } from '../../components/charts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { TimePeriodSelector, TimePeriod } from '../../components/common/TimePeriodSelector';

import { colors, typography, spacing } from '../../constants/colors';
import { chartUtils } from '../../constants/chartConfig';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

interface GoalAnalyticsScreenProps {
  navigation: any;
}

const GoalAnalyticsScreen: React.FC<GoalAnalyticsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');

  const { goals, isLoading } = useTypedSelector((state) => state.goals);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const { profile } = useTypedSelector((state) => state.user);

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

  const getGoalsByCategory = () => {
    const categoryMap = new Map();

    // TODO: Implement proper currency conversion. For now, only aggregating goals in the display currency.
    goals
      .filter(goal => goal.currency === displayCurrency)
      .forEach(goal => {
        const category = goal.category || 'other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: category.charAt(0).toUpperCase() + category.slice(1),
            count: 0,
            totalTarget: 0,
            totalCurrent: 0,
          });
        }

        const categoryData = categoryMap.get(category);
        categoryData.count += 1;
        categoryData.totalTarget += goal.target_amount || 0;
        categoryData.totalCurrent += goal.current_amount || 0;
      });

    return Array.from(categoryMap.values());
  };

  const getCategoryChartData = () => {
    const categoryData = getGoalsByCategory();
    
    // Filter out categories with no savings
    const validCategories = categoryData.filter(category => category.totalCurrent > 0);
    
    if (validCategories.length === 0) {
      return [];
    }
    
    return validCategories.map((category, index) => ({
      name: category.name,
      amount: category.totalCurrent,
      color: colors.categories[index % colors.categories.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));
  };

  const getGoalProgressData = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    
    if (activeGoals.length === 0) {
      return {
        labels: ['No Goals'],
        datasets: [{ data: [0] }]
      };
    }
    
    return {
      labels: activeGoals.map(goal => chartUtils.truncateLabel(goal.title, 10)),
      datasets: [
        {
          data: activeGoals.map(goal => goal.progress_percentage || 0),
          color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
        }
      ]
    };
  };

  const getGoalTimelineData = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active' && goal.days_remaining);
    
    if (activeGoals.length === 0) {
      return {
        labels: ['No Goals'],
        datasets: [{ data: [0] }]
      };
    }
    
    return {
      labels: activeGoals.map(goal => chartUtils.truncateLabel(goal.title, 10)),
      datasets: [
        {
          data: activeGoals.map(goal => Math.max(0, goal.days_remaining || 0)),
          color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        }
      ]
    };
  };

  const getGoalComparisonData = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    
    if (activeGoals.length === 0) {
      return {
        labels: ['No Goals'],
        datasets: [
          { data: [0], color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})` },
          { data: [0], color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})` }
        ]
      };
    }
    
    return {
      labels: activeGoals.map(goal => chartUtils.truncateLabel(goal.title, 8)),
      datasets: [
        {
          data: activeGoals.map(goal => goal.current_amount || 0),
          color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
        },
        {
          data: activeGoals.map(goal => goal.target_amount || 0),
          color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        }
      ]
    };
  };

  const getMonthlySavingsData = () => {
    // Mock monthly savings data - in real app this would come from API
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const totalSavings = calculateTotalSavings();
    const monthlySavings = totalSavings / 6; // Distribute evenly for demo
    
    return {
      labels: months,
      datasets: [
        {
          data: months.map(() => monthlySavings + (Math.random() - 0.5) * monthlySavings * 0.3),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        }
      ]
    };
  };

  const calculateTotalSavings = () => {
    // TODO: Implement proper currency conversion. For now, only summing goals in the display currency.
    return goals
      .filter(goal => goal.currency === displayCurrency)
      .reduce((total, goal) => total + (goal.current_amount || 0), 0);
  };

  const calculateTotalTarget = () => {
    // TODO: Implement proper currency conversion. For now, only summing goals in the display currency.
    return goals
      .filter(goal => goal.currency === displayCurrency)
      .reduce((total, goal) => total + (goal.target_amount || 0), 0);
  };

  const calculateAverageProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0);
    return totalProgress / goals.length;
  };

  const getGoalInsights = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    const totalSavings = calculateTotalSavings();
    const totalTarget = calculateTotalTarget();
    const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
    
    const onTrackGoals = activeGoals.filter(goal => {
      if (!goal.target_date || !goal.monthly_savings_needed) return false;
      const targetDate = new Date(goal.target_date);
      const now = new Date();
      const monthsRemaining = Math.max(1, (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const requiredMonthlySavings = (goal.target_amount - goal.current_amount) / monthsRemaining;
      return goal.monthly_savings_needed <= requiredMonthlySavings * 1.1; // 10% buffer
    });

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalSavings,
      totalTarget,
      completionRate,
      onTrackGoals: onTrackGoals.length,
      averageProgress: calculateAverageProgress(),
    };
  };

  const formatAmount = (amount: number) => {
    // TODO: This should use a display currency and proper conversion for aggregated values
    return formatCurrency(amount, displayCurrency);
  };

  const currencySymbol = getCurrencySymbol(displayCurrency);

  if (!isAuthenticated || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goal Analytics</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Saved</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(calculateTotalSavings())}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Target</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(calculateTotalTarget())}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Avg. Progress</Text>
            <Text style={styles.summaryValue}>
              {calculateAverageProgress().toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Time Period Selector */}
        <TimePeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          isLoading={isLoading}
        />

        {/* Category Distribution */}
        {getCategoryChartData().length > 0 && (
          <PieChart
            data={getCategoryChartData()}
            title="Savings by Category"
            timePeriod={selectedPeriod}
            isLoading={isLoading}
            showPercentages={true}
          />
        )}

        {/* Goal Progress */}
        {goals.filter(goal => goal.status === 'active').length > 0 && (
          <BarChart
            data={getGoalProgressData()}
            title="Goal Progress (%)"
            yAxisSuffix="%"
            showValuesOnTopOfBars={true}
            timePeriod={selectedPeriod}
            isLoading={isLoading}
          />
        )}

        {/* Goal Timeline */}
        {goals.filter(goal => goal.status === 'active' && goal.days_remaining).length > 0 && (
          <BarChart
            data={getGoalTimelineData()}
            title="Days Remaining"
            yAxisSuffix=" days"
            showValuesOnTopOfBars={true}
            timePeriod={selectedPeriod}
            isLoading={isLoading}
          />
        )}

        {/* Goal Comparison Chart */}
        {goals.filter(goal => goal.status === 'active').length > 0 && (
          <BarChart
            data={getGoalComparisonData()}
            title="Current vs Target Amount"
            yAxisSuffix={currencySymbol}
            showValuesOnTopOfBars={false}
            timePeriod={selectedPeriod}
            isLoading={isLoading}
          />
        )}

        {/* Monthly Savings Trend */}
        {goals.length > 0 && (
          <LineChart
            data={getMonthlySavingsData()}
            title="Monthly Savings Trend"
            yAxisSuffix={currencySymbol}
            bezier={true}
            timePeriod={selectedPeriod}
            isLoading={isLoading}
          />
        )}

        {/* Goal Insights */}
        {goals.length > 0 && (
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Goal Insights</Text>
            <View style={styles.insightsGrid}>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>{getGoalInsights().completionRate.toFixed(1)}%</Text>
                <Text style={styles.insightLabel}>Completion Rate</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>{getGoalInsights().onTrackGoals}</Text>
                <Text style={styles.insightLabel}>On Track</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>
                  {chartUtils.formatCurrency(getGoalInsights().totalTarget - getGoalInsights().totalSavings)}
                </Text>
                <Text style={styles.insightLabel}>Remaining</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>{getGoalInsights().activeGoals}</Text>
                <Text style={styles.insightLabel}>Active Goals</Text>
              </View>
            </View>
          </View>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Goals Yet</Text>
            <Text style={styles.emptyMessage}>
              Create your first financial goal to start tracking your progress and see detailed analytics.
            </Text>
            <TouchableOpacity 
              style={styles.createGoalButton}
              onPress={() => navigation.navigate('CreateGoal')}
            >
              <Text style={styles.createGoalButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Premium Feature Notice */}
        <View style={styles.premiumNotice}>
          <Text style={styles.premiumIcon}>⭐</Text>
          <Text style={styles.premiumTitle}>Premium Feature</Text>
          <Text style={styles.premiumText}>
            You're enjoying detailed goal analytics as part of your premium subscription. This helps you track your progress and make better financial decisions.
          </Text>
                  </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  summaryValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
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
    marginBottom: spacing.lg,
  },
  createGoalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createGoalButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  premiumNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  premiumIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  premiumTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  premiumText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  insightsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightsTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  insightLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default GoalAnalyticsScreen;