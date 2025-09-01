import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchBudgetStatus } from '../../store/slices/budgetsSlice';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useErrorHandler } from '../../utils/errorUtils';
import { useNetworkState } from '../../utils/networkUtils';
import { useAutoRefresh, useUpdateAnimation } from '../../utils/refreshUtils';
import { BudgetStatusSkeleton } from '../common/SkeletonLoader';
import { FadeInView } from '../common/FadeInView';
import { useMemoizedCalculation, useCleanup } from '../../utils/performanceUtils';
import { useAccessibilityEnhancements } from '../../utils/accessibilityEnhancements';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';
import { isBudgetCurrentlyActive, calculateRemainingDays } from '../../utils/budgetUtils';
import { renewExpiredBudgets } from '../../services/budgetRenewalService';

interface BudgetStatusSectionProps {
  onPress?: () => void;
}

const BudgetStatusSectionContent: React.FC<BudgetStatusSectionProps> = ({
  onPress,
}) => {
  const dispatch = useAppDispatch();
  const { 
    budgets, 
    budgetStatus, 
    budgetStatusLoading, 
    budgetStatusError 
  } = useTypedSelector((state) => state.budgets);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  
  const { getScenarioErrorMessage } = useErrorHandler();
  const networkState = useNetworkState();
  const { isUpdating, startUpdateAnimation } = useUpdateAnimation();
  const addCleanup = useCleanup();
  const { generateBudgetStatusLabel, announceChange } = useAccessibilityEnhancements();

  // Fetch budget data on component mount
  useEffect(() => {
    dispatch(fetchBudgetStatus());
  }, [dispatch]);

  // Set up automatic refresh
  const refreshBudgetData = React.useCallback(async () => {
    startUpdateAnimation();
    
    // Check for budget renewals before fetching status
    try {
      console.log('🔄 Checking for budget renewals...');
      const renewalResult = await renewExpiredBudgets();
      if (renewalResult.renewed.length > 0) {
        console.log(`✅ Renewed ${renewalResult.renewed.length} budget(s)`);
      }
    } catch (error) {
      console.error('❌ Error during budget renewal check:', error);
    }
    
    dispatch(fetchBudgetStatus());
  }, [dispatch, startUpdateAnimation]);

  useAutoRefresh('budgetStatus', refreshBudgetData, {
    enabled: true,
    interval: 2 * 60 * 1000, // 2 minutes for budget data
    onAppForeground: true,
  });

  // Automatically refresh when budgets change
  useEffect(() => {
    if (budgets && budgets.length > 0) {
      dispatch(fetchBudgetStatus());
    }
  }, [budgets, dispatch]);

  // Automatically refresh when network reconnects
  useEffect(() => {
    const handleNetworkReconnect = () => {
      if (budgetStatusError) {
        dispatch(fetchBudgetStatus());
      }
    };

    // Use React Native's DeviceEventEmitter for custom events
    const subscription = DeviceEventEmitter.addListener('networkReconnected', handleNetworkReconnect);
    
    // Add to cleanup manager
    addCleanup(() => subscription.remove());
  }, [budgetStatusError, dispatch, addCleanup]);

  // Memoized budget status calculation for performance
  const currentBudgetStatus = useMemoizedCalculation(
    () => {
      // If we have budget status from Redux, use it
      if (budgetStatus) {
        return budgetStatus;
      }

      // Fallback to calculating from budgets array
      // TODO: Implement proper currency conversion. For now, only aggregating budgets in the display currency.
      if (!budgets || !Array.isArray(budgets) || budgets.length === 0) {
        return {
          totalBudget: 0,
          totalSpent: 0,
          percentage: 0,
          daysLeft: 0,
          isOverBudget: false,
          budgetCount: 0,
        };
      }

      
      // Filter for active budgets in display currency that are currently within their date range
      const currentlyActiveBudgets = budgets.filter(budget => {
        if (budget.is_active === false || budget.currency !== displayCurrency) return false;
        
        // If budget has start_date and end_date, check if it's currently active
        if (budget.start_date && budget.end_date) {
          return isBudgetCurrentlyActive(budget.start_date, budget.end_date);
        }
        
        // Fallback for budgets without proper date ranges
        return true;
      });
      
      const totalBudget = currentlyActiveBudgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
      const totalSpent = currentlyActiveBudgets.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0);
      const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      
      // Calculate days left - use the earliest end date from active budgets
      let daysLeft = 0;
      if (currentlyActiveBudgets.length > 0) {
        const endDates = currentlyActiveBudgets
          .filter(budget => budget.end_date)
          .map(budget => budget.end_date);
        
        if (endDates.length > 0) {
          // Find the earliest end date
          const earliestEndDate = endDates.reduce((earliest, current) => {
            return new Date(current) < new Date(earliest) ? current : earliest;
          });
          daysLeft = calculateRemainingDays(earliestEndDate);
        } else {
          // Fallback to current month calculation
          const now = new Date();
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          daysLeft = Math.max(0, lastDay.getDate() - now.getDate());
        }
      }

      return {
        totalBudget,
        totalSpent,
        percentage,
        daysLeft,
        isOverBudget: percentage > 100,
        budgetCount: currentlyActiveBudgets.length,
        overBudgetAmount: percentage > 100 ? totalSpent - totalBudget : undefined,
      };
    },
    [budgetStatus, budgets, displayCurrency],
    {
      calculationName: `budget-status-${budgets?.length || 0}-${budgetStatus?.totalSpent || 0}-${displayCurrency}`
    }
  );

  // Announce changes for screen readers
  useEffect(() => {
    if (currentBudgetStatus && !budgetStatusLoading && !budgetStatusError) {
      // TODO: Implement proper currency conversion for announcements
      const message = currentBudgetStatus.isOverBudget 
        ? `Budget alert: You are over budget by ${formatCurrency(currentBudgetStatus.overBudgetAmount || 0, displayCurrency)}`
        : `Budget update: ${currentBudgetStatus.percentage}% of budget used`;
      
      // Delay announcement to avoid conflicts with loading states
      const timer = setTimeout(() => {
        announceChange(message);
      }, 500);

      addCleanup(() => clearTimeout(timer));
    }
  }, [currentBudgetStatus, budgetStatusLoading, budgetStatusError, announceChange, addCleanup]);

  const getProgressBarColor = () => {
    if (currentBudgetStatus.percentage >= 100) return colors.error;
    if (currentBudgetStatus.percentage >= 80) return colors.warning;
    return colors.primary;
  };

  const getStatusText = () => {
    if (currentBudgetStatus.percentage >= 100) {
      const overAmount = currentBudgetStatus.overBudgetAmount || 
        (currentBudgetStatus.totalSpent - currentBudgetStatus.totalBudget);
      // TODO: Implement proper currency conversion
      return `Over budget by ${formatCurrency(overAmount, displayCurrency)}`;
    }
    return `${currentBudgetStatus.percentage}% used • ${currentBudgetStatus.daysLeft} days left`;
  };

  const handleRetry = () => {
    if (!networkState.isConnected) {
      // Show network error message
      return;
    }
    dispatch(fetchBudgetStatus());
  };

  // Loading skeleton component
  const LoadingSkeleton = () => <BudgetStatusSkeleton />;

  // Error state component
  const ErrorState = () => {
    const errorMessage = budgetStatusError 
      ? getScenarioErrorMessage('budget_fetch', { message: budgetStatusError })
      : 'Unable to load budget data';

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget Status</Text>
          <View style={styles.errorContainer}>
            {!networkState.isConnected ? (
              <>
                <Text style={styles.errorIcon}>📡</Text>
                <Text style={styles.errorText}>No internet connection</Text>
                <Text style={styles.errorSubtext}>
                  Budget data will refresh when connection is restored
                </Text>
              </>
            ) : (
              <>
                <Text 
                  style={styles.errorText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {errorMessage}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={handleRetry}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading budget data"
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Status</Text>
        <View style={styles.emptyContainer}>
          <Text 
            style={styles.emptyText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            No budgets set up yet
          </Text>
          <Text 
            style={styles.emptySubtext}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            Create your first budget to track spending
          </Text>
        </View>
      </View>
    </View>
  );

  // Show loading skeleton while loading
  if (budgetStatusLoading && !budgetStatus) {
    return <LoadingSkeleton />;
  }

  // Show error state if there's an error and no cached data
  if (budgetStatusError && !budgetStatus) {
    return <ErrorState />;
  }

  // Show empty state if no budgets exist
  if (currentBudgetStatus.budgetCount === 0 && currentBudgetStatus.totalBudget === 0) {
    return <EmptyState />;
  }

  return (
    <FadeInView duration={300}>
      <TouchableOpacity 
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={generateBudgetStatusLabel(currentBudgetStatus)}
        accessibilityHint="Tap to view detailed budget breakdown"
      >
      <View style={styles.header}>
        <Text style={styles.title}>Budget Status</Text>
        <View style={styles.amountContainer}>
          <Text 
            style={styles.amount}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {/* TODO: Implement proper currency conversion */}
            {formatCurrency(currentBudgetStatus.totalSpent, displayCurrency)} of {formatCurrency(currentBudgetStatus.totalBudget, displayCurrency)}
          </Text>
          {(budgetStatusLoading || isUpdating) && (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.loadingIndicator}
            />
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(currentBudgetStatus.percentage, 100)}%`,
                backgroundColor: getProgressBarColor(),
              }
            ]} 
          />
          {currentBudgetStatus.percentage > 100 && (
            <View 
              style={[
                styles.overBudgetIndicator,
                { left: `${Math.min(currentBudgetStatus.percentage, 150)}%` }
              ]}
            />
          )}
        </View>
        <Text 
          style={[
            styles.statusText,
            { color: currentBudgetStatus.isOverBudget ? colors.error : colors.textSecondary }
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {getStatusText()}
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
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 24,
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: 28,
  },
  progressContainer: {
    gap: spacing.sm,
    minWidth: 0, // Prevent overflow
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2, // Ensure some progress is always visible
  },
  overBudgetIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 12,
    backgroundColor: colors.error,
    borderRadius: 2,
  },
  statusText: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    minHeight: 28,
  },
  loadingIndicator: {
    marginLeft: spacing.xs,
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  skeletonTitle: {
    height: 12,
    width: '40%',
    marginBottom: spacing.xs,
  },
  skeletonAmount: {
    height: 24,
    width: '80%',
  },
  skeletonProgressBar: {
    height: 8,
    width: '100%',
    borderRadius: 4,
  },
  skeletonStatusText: {
    height: 14,
    width: '60%',
  },
  // Error state styles
  errorContainer: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  errorIcon: {
    fontSize: 24,
    textAlign: 'center',
    alignSelf: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    fontSize: 16,
  },
  errorSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  // Empty state styles
  emptyContainer: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
});

// Main component wrapped with ErrorBoundary
export const BudgetStatusSection: React.FC<BudgetStatusSectionProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Budget Status</Text>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>Something went wrong</Text>
              <Text style={styles.errorSubtext}>Please try refreshing the app</Text>
            </View>
          </View>
        </View>
      }
    >
      <BudgetStatusSectionContent {...props} />
    </ErrorBoundary>
  );
};