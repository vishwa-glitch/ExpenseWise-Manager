import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchDashboardInsights } from '../../store/slices/analyticsSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
import { fetchGoals } from '../../store/slices/goalsSlice';
import { fetchRecommendations } from '../../store/slices/recommendationsSlice';
import { fetchBudgets } from '../../store/slices/budgetsSlice';
import { TransactionItem } from '../../components/common/TransactionItem';
import { GoalCard } from '../../components/common/GoalCard';
import { RecommendationCard } from '../../components/common/RecommendationCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PieChart } from '../../components/charts/PieChart';
import { LineChart } from '../../components/charts/LineChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { SmartInsightsSection } from '../../components/dashboard/SmartInsightsSection';
import { CategoryBreakdownSection } from '../../components/dashboard/CategoryBreakdownSection';
import { BudgetStatusSection } from '../../components/dashboard/BudgetStatusSection';
import { WeeklyFinancialHealthSection } from '../../components/dashboard/WeeklyFinancialHealthSection';
import CurrencySummary from '../../components/dashboard/CurrencySummary';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { TimePeriod } from '../../components/common/TimePeriodSelector';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';
import { SmartAlertCard } from '../../components/dashboard/widgets/SmartAlertCard';
import { GoalProgressCard } from '../../components/dashboard/widgets/GoalProgressCard';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const { user, isAuthenticated } = useTypedSelector((state) => state.auth);
  const { accounts } = useTypedSelector((state) => state.accounts);
  const { transactions } = useTypedSelector((state) => state.transactions);
  const { goals } = useTypedSelector((state) => state.goals);
  const { recommendations } = useTypedSelector((state) => state.recommendations);
  const { dashboardInsights, isLoading } = useTypedSelector((state) => state.analytics);
  const { displayCurrency } = useTypedSelector((state) => state.user);

  useEffect(() => {
    // Only load dashboard data when user is authenticated
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    // Double-check authentication before making API calls
    if (!isAuthenticated) {
      console.log('🚫 Skipping dashboard data load - user not authenticated');
      return;
    }

    try {
      console.log('📊 Loading dashboard data for authenticated user');
      await Promise.all([
        dispatch(fetchDashboardInsights()),
        dispatch(fetchAccounts()),
        dispatch(fetchTransactions({ limit: 10 })),
        dispatch(fetchGoals()),
        dispatch(fetchRecommendations()),
        dispatch(fetchBudgets()),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping refresh - user not authenticated');
      return;
    }

    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const calculateTotalBalance = () => {
    // TODO: Implement proper currency conversion for multi-currency accounts.
    // This is a temporary solution that only sums accounts matching the display currency.
    try {
      if (!accounts || !Array.isArray(accounts)) {
        return 0;
      }
      return accounts
        .filter(account => account.currency === displayCurrency)
        .reduce((total, account) => {
          if (!account || typeof account.balance !== 'number' || isNaN(account.balance)) {
            return total;
          }
          return total + account.balance;
        }, 0);
    } catch (error) {
      return 0;
    }
  };


  const getRecentTransactions = () => {
    try {
      // Limit to maximum 3 recent transactions
      if (!transactions || !Array.isArray(transactions)) {
        return [];
      }
      return transactions.slice(0, 3).filter(transaction => transaction);
    } catch (error) {
      return [];
    }
  };

  const getActiveGoals = () => {
    try {
      if (!goals || !Array.isArray(goals)) {
        return [];
      }
      return goals.filter(goal => goal && goal.status === 'active').slice(0, 2);
    } catch (error) {
      return [];
    }
  };

  const getTopRecommendations = () => {
    try {
      if (!recommendations || !Array.isArray(recommendations)) {
        return [];
      }
      return recommendations.slice(0, 2).filter(recommendation => recommendation);
    } catch (error) {
      return [];
    }
  };

  const getCategoryBreakdownData = () => {
    try {
      if (!dashboardInsights?.top_categories || !Array.isArray(dashboardInsights.top_categories) || dashboardInsights.top_categories.length === 0) {
        return [];
      }
      
      return dashboardInsights.top_categories.map((category: any, index: number) => ({
        name: category?.name || 'Unknown',
        amount: category?.amount || 0,
        color: colors.categories && Array.isArray(colors.categories) ? colors.categories[index % colors.categories.length] : '#000000',
      })).filter((item: any) => item);
    } catch (error) {
      return [];
    }
  };

  const getSpendingTrendData = () => {
    try {
      // Always return a valid data structure for the chart
      if (!dashboardInsights?.spending_trend) {
        // Return default data with a single transparent dataset to prevent chart errors
        return {
          labels: ['No Data'],
          datasets: [{
            data: [0],
            color: (opacity = 1) => `rgba(0, 0, 0, 0)`, // Transparent
            strokeWidth: 0,
          }],
        };
      }
      
      return {
        labels: dashboardInsights.spending_trend.labels,
        datasets: [{
          data: dashboardInsights.spending_trend.data,
          color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
          strokeWidth: 2,
        }],
      };
    } catch (error) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(0, 0, 0, 0)`,
          strokeWidth: 0,
        }],
      };
    }
  };

  const handleAddAccount = () => {
    navigation.navigate('Accounts', {
      screen: 'AddEditAccount',
    });
  };

  const handleAccountPress = (accountId: string) => {
    navigation.navigate('Accounts', {
      screen: 'AccountDetail',
      params: { accountId },
    });
  };

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleDismissRecommendation = (id: string) => {
    // Handle recommendation dismissal
    // TODO: Implement recommendation dismissal logic
  };

  const handleActOnRecommendation = (id: string) => {
    // Handle recommendation action
    // TODO: Implement recommendation action logic
  };

  const handleInsightsRefresh = async (period: TimePeriod) => {
    console.log('Refreshing insights for period:', period);
    // This will be handled by the SmartInsightsSection component
    // which will dispatch the appropriate actions
  };

  const getCurrentDate = () => {
    try {
      const date = new Date();
      if (isNaN(date.getTime())) {
        return new Date().toDateString();
      }
      const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return formattedDate || new Date().toDateString();
    } catch (error) {
      return new Date().toDateString();
    }
  };

  const formatBalance = (amount: number) => {
    try {
      if (typeof amount !== 'number' || isNaN(amount)) {
        return formatCurrency(0, displayCurrency);
      }
      return formatCurrency(amount, displayCurrency);
    } catch (error) {
      return formatCurrency(0, displayCurrency);
    }
  };

  const getBalanceColor = () => {
    try {
      const balance = calculateTotalBalance();
      if (typeof balance !== 'number' || isNaN(balance)) {
        return colors.income;
      }
      return balance >= 0 ? colors.income : colors.expense;
    } catch (error) {
      return colors.income;
    }
  };

  const getAccountTypeIcon = (type: string) => {
    try {
      if (!type || typeof type !== 'string') return '💼';
      
      switch (type.toLowerCase()) {
        case 'checking':
          return '🏦';
        case 'savings':
          return '💰';
        case 'credit':
          return '💳';
        case 'investment':
          return '📈';
        default:
          return '💼';
      }
    } catch (error) {
      return '💼';
    }
  };

  // Show loading spinner if not authenticated or if loading and no data
  if (!isAuthenticated || (isLoading && !dashboardInsights)) {
    return <LoadingSpinner />;
  }

  const totalBalance = calculateTotalBalance();

  // Calculate expanded height based on number of accounts - Fixed: ensure accounts is array
  const expandedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (accounts && Array.isArray(accounts) ? accounts.length : 0) * 60 + 16],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.first_name || 'User'}!
            </Text>
            <Text style={styles.dateText}>
              {getCurrentDate()}
            </Text>
          </View>
        </View>

        {/* Compact Total Balance Card */}
        <View style={styles.balanceCard}>
          <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                <View style={styles.balanceTitleRow}>
                  <Text style={styles.balanceTitle}>Total Balance</Text>
                  <Text style={styles.expandIcon}>
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </View>
                <Text style={[styles.balanceAmount, { color: getBalanceColor() }]}>
                  {`${totalBalance < 0 ? '-' : ''}${formatBalance(Math.abs(totalBalance))}`}
                </Text>
                <Text style={styles.balanceSubtitle}>
                  In {displayCurrency} (from {accounts.filter(a => a.currency === displayCurrency).length} of {accounts.length} accounts)
                </Text>
              </View>
            
              {/* Trend indicator if available - Fixed: Wrapped in proper condition */}
              {dashboardInsights?.spending_trend?.change_percentage ? (
                <View style={styles.trendContainer}>
                  <Text style={[
                    styles.trendText,
                    { color: dashboardInsights.spending_trend.trend_direction === 'increasing' ? colors.income : colors.expense }
                  ]}>
                    {`${dashboardInsights.spending_trend.trend_direction === 'increasing' ? '↗' : '↘'} ${Math.round(Math.abs(dashboardInsights.spending_trend.change_percentage))}% this month`}
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>

          <CurrencySummary accounts={accounts} />

          {/* Expandable Accounts List - Fixed: Added proper null check */}
          {accounts && accounts.length > 0 ? (
            <Animated.View style={[styles.expandedContent, { height: expandedHeight }]}>
              <View style={styles.accountsList}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[styles.accountItem, !account.is_active && styles.inactiveAccount]}
                    onPress={() => handleAccountPress(account.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accountLeft}>
                      <Text style={styles.accountIcon}>
                        {getAccountTypeIcon(account.type || '')}
                      </Text>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName} numberOfLines={1}>
                          {account.name || 'Unnamed Account'}
                        </Text>
                        <Text style={styles.accountType}>
                          {account.type ? account.type.charAt(0).toUpperCase() + account.type.slice(1) : 'Account'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.accountBalance,
                      { color: (account.balance || 0) >= 0 ? colors.income : colors.expense }
                    ]}>
                      {formatCurrency(account.balance || 0, account.currency || displayCurrency)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {/* Add Account Button */}
          <View style={styles.addAccountSection}>
            <CustomButton
              title="Add Account"
              onPress={handleAddAccount}
              variant="outline"
              style={styles.addAccountButton}
              textStyle={styles.addAccountButtonText}
            />
          </View>
        </View>

        {/* Widgets Section */}
        <View style={styles.widgetsSection}>
          <SmartAlertCard onPress={() => navigation.navigate('Budgets')} onDetailsPress={() => navigation.navigate('Budgets')} />
          <View style={{ height: spacing.md }} />
          <GoalProgressCard onPress={() => navigation.navigate('Goals')} />
        </View>

        {/* Budget Status */}
        <BudgetStatusSection 
          onPress={() => navigation.navigate('More', { screen: 'Budgets' })}
        />

        {/* Weekly Financial Health */}
        <WeeklyFinancialHealthSection 
          onPress={() => navigation.navigate('More', { screen: 'Analytics' })}
        />

        {/* Recent Activity */}
        <View style={styles.section}>
          <SectionHeader 
            title="Recent Activity"
            showDivider={true}
            rightComponent={
              <TouchableOpacity
                onPress={() => navigation.navigate('Transactions')}
                accessibilityRole="button"
                accessibilityLabel="See all transactions"
                accessibilityHint="Navigate to the full transactions list"
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            }
          />
          {getRecentTransactions().length > 0 ? (
            getRecentTransactions().map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() =>
                  navigation.navigate('Transactions', {
                    screen: 'TransactionDetail',
                    params: { transactionId: transaction.id },
                  })
                }
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptyMessage}>
                Add your first transaction to get started
              </Text>
              <TouchableOpacity
                style={styles.addTransactionButton}
                onPress={() => navigation.navigate('Transactions', { screen: 'AddEditTransaction' })}
              >
                <Text style={styles.addTransactionText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Smart Insights - Enhanced with time period controls */}
        <ErrorBoundary>
          <SmartInsightsSection
            dashboardInsights={dashboardInsights}
            isLoading={isLoading}
            onRefresh={handleInsightsRefresh}
          />
        </ErrorBoundary>

        {/* Category Breakdown */}
        <ErrorBoundary>
          <CategoryBreakdownSection
            dashboardInsights={dashboardInsights}
            isLoading={isLoading}
            onRefresh={() => handleInsightsRefresh('monthly')}
          />
        </ErrorBoundary>

        {/* Recommendations - Fixed: Added proper condition */}
        {getTopRecommendations().length > 0 ? (
          <View style={styles.section}>
            <SectionHeader 
              title="Smart Recommendations"
              showDivider={true}
              rightComponent={
                <TouchableOpacity
                  onPress={() => navigation.navigate('RecommendationsHistory')}
                  accessibilityRole="button"
                  accessibilityLabel="See all recommendations"
                  accessibilityHint="Navigate to the full recommendations list"
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              }
            />
            {getTopRecommendations().map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onDismiss={() => handleDismissRecommendation(recommendation.id)}
                onAct={() => handleActOnRecommendation(recommendation.id)}
              />
            ))}
          </View>
        ) : null}

        {/* Goals Progress - Fixed: Added proper condition */}
        {getActiveGoals().length > 0 ? (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.goalsSummaryCard}
              onPress={() => navigation.navigate('Goals')}
            >
              <View style={styles.goalsSummaryHeader}>
                <Text style={styles.goalsSummaryTitle}>Financial Goals</Text>
                <Text style={styles.seeAllText}>See All</Text>
              </View>
              
              <View style={styles.goalsGrid}>
                {getActiveGoals().map((goal) => (
                  <View key={goal.id} style={styles.goalItem}>
                    <View style={styles.goalIconContainer}>
                      <Text style={styles.goalIcon}>
                        {goal.category === 'emergency' ? '🚨' : 
                         goal.category === 'vacation' ? '🏖️' : 
                         goal.category === 'car' ? '🚗' : 
                         goal.category === 'house' ? '🏠' : 
                         goal.category === 'education' ? '🎓' : 
                         goal.category === 'retirement' ? '👴' : 
                         goal.category === 'investment' ? '📈' : '🎯'}
                      </Text>
                    </View>
                    <Text style={styles.goalName} numberOfLines={1}>{goal.title || 'Untitled Goal'}</Text>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill, 
                          { width: `${Math.min(goal.progress_percentage || 0, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.goalProgressText}>
                      {(goal.progress_percentage || 0).toFixed(0)}%
                    </Text>
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={styles.addGoalItem}
                  onPress={() => navigation.navigate('Goals', { screen: 'AddManualGoal' })}
                >
                  <View style={styles.addGoalIconContainer}>
                    <Text style={styles.addGoalIcon}>+</Text>
                  </View>
                  <Text style={styles.addGoalText}>Add Goal</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" showDivider={true} />
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Goals', { screen: 'AddManualGoal' })}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Create Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Accounts')}
            >
              <Text style={styles.actionIcon}>🏦</Text>
              <Text style={styles.actionText}>View Accounts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Transactions', { screen: 'AddEditTransaction' })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  widgetsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceHeader: {
    marginBottom: spacing.sm,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expandIcon: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceAmount: {
    ...typography.h1,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    fontSize: 28,
  },
  balanceSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  trendContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trendText: {
    ...typography.small,
    fontWeight: '600',
  },
  expandedContent: {
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  accountsList: {
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveAccount: {
    opacity: 0.6,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 14,
  },
  accountType: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    fontSize: 11,
  },
  accountBalance: {
    ...typography.body,
    fontWeight: 'bold',
    fontSize: 14,
  },
  addAccountSection: {
    marginTop: spacing.md,
  },
  addAccountButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
  },
  addAccountButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  goalsSummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  goalsSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalsSummaryTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalItem: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  goalProgressText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addGoalItem: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGoalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addGoalIcon: {
    fontSize: 24,
    color: colors.background,
    fontWeight: 'bold',
  },
  addGoalText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  actionButton: {
   flex: 1,
   backgroundColor: colors.card,
   borderRadius: 12,
   padding: spacing.sm,
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
 actionIcon: {
   fontSize: 20,
   marginBottom: spacing.xs,
 },
 actionText: {
   ...typography.small,
   color: colors.text,
   textAlign: 'center',
   fontWeight: '600',
   fontSize: 11,
 },
 emptyState: {
   backgroundColor: colors.surface,
   borderRadius: 12,
   padding: spacing.lg,
   alignItems: 'center',
   marginHorizontal: spacing.md,
 },
 emptyIcon: {
   fontSize: 40,
   marginBottom: spacing.sm,
 },
 emptyTitle: {
   ...typography.h3,
   color: colors.text,
   marginBottom: spacing.xs,
   textAlign: 'center',
   fontSize: 16,
 },
 emptyMessage: {
   ...typography.body,
   color: colors.textSecondary,
   textAlign: 'center',
   lineHeight: 20,
   marginBottom: spacing.md,
   fontSize: 14,
 },
 addTransactionButton: {
   backgroundColor: colors.primary,
   paddingHorizontal: spacing.md,
   paddingVertical: spacing.sm,
   borderRadius: 8,
 },
 addTransactionText: {
   ...typography.body,
   color: colors.background,
   fontWeight: '600',
   fontSize: 14,
 },
 fab: {
   position: 'absolute',
   bottom: spacing.xl,
   right: spacing.lg,
   width: 56,
   height: 56,
   borderRadius: 28,
   backgroundColor: colors.primary,
   justifyContent: 'center',
   alignItems: 'center',
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 4,
   },
   shadowOpacity: 0.3,
   shadowRadius: 4.65,
   elevation: 8,
 },
 fabIcon: {
   fontSize: 24,
   color: colors.background,
   fontWeight: 'bold',
 },
 bottomSpacing: {
   height: spacing.lg,
 },
});

export default DashboardScreen;