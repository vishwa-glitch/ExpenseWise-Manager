import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchWeeklyHealth } from '../../store/slices/analyticsSlice';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useErrorHandler } from '../../utils/errorUtils';
import { useNetworkState } from '../../utils/networkUtils';
import { useAutoRefresh, useUpdateAnimation } from '../../utils/refreshUtils';
import { WeeklyHealthSkeleton } from '../common/SkeletonLoader';
import { FadeInView } from '../common/FadeInView';
import { useMemoizedCalculation, useCleanup } from '../../utils/performanceUtils';
import { useAccessibilityEnhancements } from '../../utils/accessibilityEnhancements';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

interface WeeklyFinancialHealthSectionProps {
  onPress?: () => void;
}

const WeeklyFinancialHealthSectionContent: React.FC<WeeklyFinancialHealthSectionProps> = ({
  onPress,
}) => {
  const dispatch = useAppDispatch();
  const { 
    weeklyHealth, 
    weeklyHealthLoading, 
    weeklyHealthError,
    dashboardInsights 
  } = useTypedSelector((state) => state.analytics);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  
  const { getScenarioErrorMessage } = useErrorHandler();
  const networkState = useNetworkState();
  const { isUpdating, startUpdateAnimation } = useUpdateAnimation();
  const addCleanup = useCleanup();
  const { generateWeeklyHealthLabel, announceChange } = useAccessibilityEnhancements();

  // Memoized weekly health data calculation for performance
  const healthData = useMemoizedCalculation(
    () => {
    // If we have weekly health data from Redux, use it
    if (weeklyHealth) {
      return {
        overallScore: weeklyHealth.overallScore / 10, // Convert to 0-10 scale for display
        maxScore: 10,
        achievements: weeklyHealth.achievements || [],
        warnings: weeklyHealth.warnings || [],
        issues: weeklyHealth.issues || [],
        weeklyStats: {
          thisWeek: weeklyHealth.weeklyStats.thisWeek,
          budget: weeklyHealth.weeklyStats.budget,
          lastWeek: weeklyHealth.weeklyStats.lastWeek,
          monthlyAvg: weeklyHealth.weeklyStats.monthlyAvg,
          overBudget: weeklyHealth.weeklyStats.overBudget,
          changeFromLastWeek: weeklyHealth.weeklyStats.changeFromLastWeek,
          changeFromMonthlyAvg: weeklyHealth.weeklyStats.changeFromMonthlyAvg,
        },
        nextWeekGoal: weeklyHealth.nextWeekGoal,
        dataAvailability: weeklyHealth.dataAvailability,
      };
    }

    // Fallback to generating from dashboard insights if available
    if (dashboardInsights) {
      const overview = dashboardInsights.overview || {};
      const monthlyExpenses = overview.monthly_expenses || 0;
      const weeklySpending = Math.round(monthlyExpenses / 4);
      const monthlyBudget = monthlyExpenses * 1.2; // Assume 20% buffer
      const weeklyBudget = Math.round(monthlyBudget / 4);
      
      // Generate basic health score based on spending vs budget
      const spendingRatio = weeklyBudget > 0 ? weeklySpending / weeklyBudget : 0;
      const overallScore = Math.max(0, Math.min(10, Math.round((1 - Math.max(0, spendingRatio - 1)) * 10)));
      
      const achievements = [];
      const warnings = [];
      const issues = [];
      
      if (spendingRatio <= 0.8) {
        achievements.push({
          type: 'success',
          text: 'Staying within budget this week',
          amount: weeklyBudget - weeklySpending,
        });
      } else if (spendingRatio <= 1.0) {
        warnings.push({
          type: 'warning',
          text: 'Close to budget limit',
          amount: weeklyBudget - weeklySpending,
        });
      } else {
        issues.push({
          type: 'error',
          text: 'Over budget this week',
          amount: weeklySpending - weeklyBudget,
        });
      }
      
      return {
        overallScore,
        maxScore: 10,
        achievements,
        warnings,
        issues,
        weeklyStats: {
          thisWeek: weeklySpending,
          budget: weeklyBudget,
          lastWeek: Math.round(weeklySpending * (0.9 + Math.random() * 0.2)),
          monthlyAvg: weeklySpending,
          overBudget: Math.max(0, weeklySpending - weeklyBudget),
          changeFromLastWeek: Math.round((Math.random() - 0.5) * 20),
          changeFromMonthlyAvg: 0,
        },
        nextWeekGoal: Math.round(weeklyBudget * 0.9),
        dataAvailability: {
          hasTransactions: monthlyExpenses > 0,
          hasBudgets: overview.active_budgets > 0,
          hasGoals: overview.active_goals > 0,
        },
      };
    }

    // Final fallback with minimal data
    return {
      overallScore: 0,
      maxScore: 10,
      achievements: [],
      warnings: [],
      issues: [],
      weeklyStats: {
        thisWeek: 0,
        budget: 0,
        lastWeek: 0,
        monthlyAvg: 0,
        overBudget: 0,
        changeFromLastWeek: 0,
        changeFromMonthlyAvg: 0,
      },
      nextWeekGoal: 0,
      dataAvailability: {
        hasTransactions: false,
        hasBudgets: false,
        hasGoals: false,
      },
    };
    },
    [weeklyHealth, dashboardInsights],
    {
      calculationName: `weekly-health-${weeklyHealth?.overallScore || 0}-${dashboardInsights?.overview?.monthly_expenses || 0}`
    }
  );

  // Fetch weekly health data on component mount
  useEffect(() => {
    dispatch(fetchWeeklyHealth());
  }, [dispatch]);

  // Set up automatic refresh
  const refreshWeeklyHealthData = React.useCallback(() => {
    startUpdateAnimation();
    dispatch(fetchWeeklyHealth());
  }, [dispatch, startUpdateAnimation]);

  useAutoRefresh('weeklyHealth', refreshWeeklyHealthData, {
    enabled: true,
    interval: 5 * 60 * 1000, // 5 minutes for weekly health data
    onAppForeground: true,
  });

  // Automatically refresh when network reconnects
  useEffect(() => {
    const handleNetworkReconnect = () => {
      if (weeklyHealthError) {
        dispatch(fetchWeeklyHealth());
      }
    };

    // Use React Native's DeviceEventEmitter for custom events
    const subscription = DeviceEventEmitter.addListener('networkReconnected', handleNetworkReconnect);
    
    // Add to cleanup manager
    addCleanup(() => {
      subscription.remove();
    });
  }, [weeklyHealthError, dispatch, addCleanup]);

  // Announce health score changes for screen readers
  useEffect(() => {
    if (healthData && !weeklyHealthLoading && !weeklyHealthError && healthData.overallScore > 0) {
      const score = Math.round((healthData.overallScore / healthData.maxScore) * 10 * 10) / 10;
      const message = `Financial health updated: ${score} out of 10`;
      
      // Delay announcement to avoid conflicts with loading states
      const timer = setTimeout(() => {
        announceChange(message);
      }, 500);

      addCleanup(() => clearTimeout(timer));
    }
  }, [healthData, weeklyHealthLoading, weeklyHealthError, announceChange, addCleanup]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return colors.income;
    if (score >= 6) return colors.warning;
    return colors.error;
  };

  // Check if we have sufficient data for meaningful calculations
  const hasSufficientData = () => {
    if (!healthData.dataAvailability) return false;
    return healthData.dataAvailability.hasTransactions || 
           healthData.dataAvailability.hasBudgets || 
           healthData.dataAvailability.hasGoals;
  };

  // Empty state component for insufficient data
  const EmptyState = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Weekly Financial Health</Text>
      </View>
      
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateIcon}>📊</Text>
        <Text style={styles.emptyStateTitle}>Building Your Financial Profile</Text>
        <Text style={styles.emptyStateText}>
          We need more data to calculate your financial health score. Here's how to get started:
        </Text>
        
        <View style={styles.guidanceList}>
          {!healthData.dataAvailability?.hasTransactions && (
            <View style={styles.guidanceItem}>
              <Text style={styles.guidanceIcon}>💳</Text>
              <Text style={styles.guidanceText}>Add some transactions to track your spending</Text>
            </View>
          )}
          {!healthData.dataAvailability?.hasBudgets && (
            <View style={styles.guidanceItem}>
              <Text style={styles.guidanceIcon}>🎯</Text>
              <Text style={styles.guidanceText}>Set up budgets to monitor your spending limits</Text>
            </View>
          )}
          {!healthData.dataAvailability?.hasGoals && (
            <View style={styles.guidanceItem}>
              <Text style={styles.guidanceIcon}>💰</Text>
              <Text style={styles.guidanceText}>Create savings goals to track your progress</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.encouragementText}>
          Once you have some data, we'll show you personalized insights and recommendations!
        </Text>
      </View>
    </View>
  );

  // Progressive disclosure for users building their profile
  const PartialDataState = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Weekly Financial Health</Text>
      </View>
      
      <View style={styles.partialDataContainer}>
        <Text style={styles.partialDataIcon}>🌱</Text>
        <Text style={styles.partialDataTitle}>Getting Better Data...</Text>
        <Text style={styles.partialDataText}>
          We're starting to see your financial patterns! Add more data for better insights:
        </Text>
        
        <View style={styles.progressIndicators}>
          <View style={styles.progressItem}>
            <Text style={styles.progressIcon}>
              {healthData.dataAvailability?.hasTransactions ? '✅' : '⭕'}
            </Text>
            <Text style={styles.progressText}>Transactions</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressIcon}>
              {healthData.dataAvailability?.hasBudgets ? '✅' : '⭕'}
            </Text>
            <Text style={styles.progressText}>Budgets</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressIcon}>
              {healthData.dataAvailability?.hasGoals ? '✅' : '⭕'}
            </Text>
            <Text style={styles.progressText}>Goals</Text>
          </View>
        </View>
        
        {/* Show basic stats if we have some data */}
        {healthData.weeklyStats.thisWeek > 0 && (
          <View style={styles.basicStatsContainer}>
            <Text style={styles.basicStatsTitle}>This Week So Far:</Text>
            <Text style={styles.basicStatsAmount}>
              {formatCurrency(healthData.weeklyStats.thisWeek, displayCurrency)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const getStarRating = (score: number, maxScore: number) => {
    const filledStars = Math.floor(score);
    const emptyStars = maxScore - filledStars;
    return '⭐'.repeat(filledStars) + '☆'.repeat(emptyStars);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '•';
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Use real data if available, otherwise calculate
  const lastWeekChange = healthData.weeklyStats.changeFromLastWeek !== undefined 
    ? healthData.weeklyStats.changeFromLastWeek 
    : calculatePercentageChange(healthData.weeklyStats.thisWeek, healthData.weeklyStats.lastWeek);
    
  const monthlyAvgChange = healthData.weeklyStats.changeFromMonthlyAvg !== undefined 
    ? healthData.weeklyStats.changeFromMonthlyAvg 
    : calculatePercentageChange(healthData.weeklyStats.thisWeek, healthData.weeklyStats.monthlyAvg);

  // Show loading skeleton while loading
  if (weeklyHealthLoading && !weeklyHealth) {
    return <WeeklyHealthSkeleton />;
  }

  // Show empty state for new users with no data
  if (!hasSufficientData()) {
    return <EmptyState />;
  }

  // Show partial data state for users building their profile
  const dataCount = [
    healthData.dataAvailability?.hasTransactions,
    healthData.dataAvailability?.hasBudgets,
    healthData.dataAvailability?.hasGoals
  ].filter(Boolean).length;

  if (dataCount < 2 || healthData.overallScore === 0) {
    return <PartialDataState />;
  }

  return (
    <FadeInView duration={300} delay={100}>
      <TouchableOpacity 
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={generateWeeklyHealthLabel(healthData)}
        accessibilityHint="Tap to view detailed weekly financial report"
      >
      <View style={styles.header}>
        <Text style={styles.title}>Your Weekly Financial Health</Text>
      </View>

      <View style={styles.scoreSection}>
        <Text style={styles.scoreLabel}>Overall Score:</Text>
        <Text style={[styles.score, { color: getScoreColor(healthData.overallScore) }]}>
          {healthData.overallScore}/{healthData.maxScore}
        </Text>
        <Text style={styles.stars}>
          {getStarRating(healthData.overallScore, healthData.maxScore)}
        </Text>
      </View>

      <View style={styles.itemsSection}>
        {healthData.achievements.map((item, index) => (
          <View key={`achievement-${index}`} style={styles.item}>
            <Text style={styles.itemIcon}>{getItemIcon(item.type)}</Text>
            <Text 
              style={styles.itemText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.text}
            </Text>
          </View>
        ))}
        
        {healthData.warnings.map((item, index) => (
          <View key={`warning-${index}`} style={styles.item}>
            <Text style={styles.itemIcon}>{getItemIcon(item.type)}</Text>
            <Text 
              style={styles.itemText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.text}
            </Text>
          </View>
        ))}
        
        {healthData.issues.map((item, index) => (
          <View key={`issue-${index}`} style={styles.item}>
            <Text style={styles.itemIcon}>{getItemIcon(item.type)}</Text>
            <Text 
              style={styles.itemText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>This Week:</Text>
            <Text style={styles.statValue}>
              {formatCurrency(healthData.weeklyStats.thisWeek, displayCurrency)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Budget:</Text>
            <Text style={[
              styles.statValue,
              { color: healthData.weeklyStats.overBudget > 0 ? colors.error : colors.textSecondary }
            ]}>
              {formatCurrency(healthData.weeklyStats.budget, displayCurrency)} 
              {healthData.weeklyStats.overBudget > 0 && 
                ` (${getCurrencySymbol(displayCurrency)}${healthData.weeklyStats.overBudget} over)`
              }
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Last Week:</Text>
            <Text style={styles.statValue}>
              {formatCurrency(healthData.weeklyStats.lastWeek, displayCurrency)} 
              <Text style={[
                styles.changeText,
                { color: lastWeekChange > 0 ? colors.error : colors.income }
              ]}>
                ({lastWeekChange > 0 ? '+' : ''}{lastWeekChange}%)
              </Text>
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Monthly Avg:</Text>
            <Text style={styles.statValue}>
              {formatCurrency(healthData.weeklyStats.monthlyAvg, displayCurrency)} 
              <Text style={[
                styles.changeText,
                { color: monthlyAvgChange > 0 ? colors.error : colors.income }
              ]}>
                ({monthlyAvgChange > 0 ? '+' : ''}{monthlyAvgChange}%)
              </Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.goalSection}>
        <Text style={styles.goalIcon}>💡</Text>
        <Text style={styles.goalText}>
          Next Week Goal: Keep under {formatCurrency(healthData.nextWeekGoal, displayCurrency)}
        </Text>
      </View>
      </TouchableOpacity>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 0, // Prevent overflow
    maxWidth: '100%',
  },
  header: {
    marginBottom: spacing.md,
    minWidth: 0, // Prevent overflow
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
    flexWrap: 'wrap',
    minWidth: 0, // Prevent overflow
  },
  scoreLabel: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  score: {
    ...typography.h2,
    fontWeight: 'bold',
    fontSize: 24,
  },
  stars: {
    fontSize: 16,
    marginLeft: spacing.xs,
    flexShrink: 0, // Prevent star compression
    maxWidth: 120, // Limit star width to prevent overflow
  },
  itemsSection: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minWidth: 0, // Prevent overflow
  },
  itemIcon: {
    fontSize: 16,
    marginTop: 2,
    flexShrink: 0, // Prevent icon compression
  },
  itemText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
    flexWrap: 'wrap',
    minWidth: 0, // Allow text to wrap properly
  },
  statsSection: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    gap: spacing.sm,
    minWidth: 0, // Prevent overflow
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    minWidth: 0, // Prevent overflow
    gap: spacing.xs,
  },
  statLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flexShrink: 0, // Prevent label compression
  },
  statValue: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    minWidth: 0, // Allow text to wrap
  },
  changeText: {
    ...typography.small,
    fontWeight: '600',
    flexShrink: 0, // Prevent percentage compression
  },
  goalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  guidanceList: {
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  guidanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  guidanceIcon: {
    fontSize: 20,
  },
  guidanceText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  encouragementText: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
  // Partial data state styles
  partialDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  partialDataIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  partialDataTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  partialDataText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  progressItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressIcon: {
    fontSize: 24,
  },
  progressText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  basicStatsContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  basicStatsTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  basicStatsAmount: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
});

// Main component wrapped with ErrorBoundary
export const WeeklyFinancialHealthSection: React.FC<WeeklyFinancialHealthSectionProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Weekly Financial Health</Text>
          </View>
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>⚠️</Text>
            <Text style={styles.emptyStateTitle}>Something went wrong</Text>
            <Text style={styles.emptyStateText}>
              Unable to load financial health data. Please try refreshing the app.
            </Text>
          </View>
        </View>
      }
    >
      <WeeklyFinancialHealthSectionContent {...props} />
    </ErrorBoundary>
  );
};