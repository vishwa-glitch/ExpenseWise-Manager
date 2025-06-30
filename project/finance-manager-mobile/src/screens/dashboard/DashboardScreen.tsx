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
import { fetchUnreadNotifications } from '../../store/slices/notificationsSlice';
import { TransactionItem } from '../../components/common/TransactionItem';
import { GoalCard } from '../../components/common/GoalCard';
import { RecommendationCard } from '../../components/common/RecommendationCard';
import { PieChart } from '../../components/charts/PieChart';
import { LineChart } from '../../components/charts/LineChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';

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
  const { unreadCount } = useTypedSelector((state) => state.notifications);
  const { dashboardInsights, isLoading } = useTypedSelector((state) => state.analytics);

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
        dispatch(fetchUnreadNotifications()),
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
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getPrimaryCurrency = () => {
    // Use the currency from the first account, or default to USD
    if (accounts.length > 0 && accounts[0].currency) {
      return accounts[0].currency;
    }
    return getDefaultCurrency();
  };

  const getRecentTransactions = () => {
    // Limit to maximum 3 recent transactions
    return transactions.slice(0, 3);
  };

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'active').slice(0, 3);
  };

  const getTopRecommendations = () => {
    return recommendations.slice(0, 2);
  };

  const getCategoryBreakdownData = () => {
    if (!dashboardInsights?.top_categories || dashboardInsights.top_categories.length === 0) {
      return [];
    }
    
    return dashboardInsights.top_categories.map((category: any, index: number) => ({
      name: category.name,
      amount: category.amount,
      color: colors.categories[index % colors.categories.length],
    }));
  };

  const getSpendingTrendData = () => {
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
    
    // Mock data for demonstration - replace with actual trend data when available
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [20000, 25000, 22000, 28000, 24000, 26000],
        color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
        strokeWidth: 2,
      }],
    };
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
    console.log('Dismiss recommendation:', id);
  };

  const handleActOnRecommendation = (id: string) => {
    // Handle recommendation action
    console.log('Act on recommendation:', id);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatBalance = (amount: number) => {
    const currency = getPrimaryCurrency();
    return formatCurrency(amount, currency);
  };

  const getBalanceColor = () => {
    const balance = calculateTotalBalance();
    return balance >= 0 ? colors.income : colors.expense;
  };

  const getAccountTypeIcon = (type: string) => {
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
  };

  // Show loading spinner if not authenticated or if loading and no data
  if (!isAuthenticated || (isLoading && !dashboardInsights)) {
    return <LoadingSpinner />;
  }

  const totalBalance = calculateTotalBalance();

  // Calculate expanded height based on number of accounts
  const expandedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, accounts.length * 60 + 16],
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
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('NotificationCenter')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
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
                  {totalBalance < 0 ? '-' : ''}
                  {formatBalance(Math.abs(totalBalance))}
                </Text>
                <Text style={styles.balanceSubtitle}>
                  Across {accounts.length} accounts
                </Text>
              </View>
            </View>
            
            {/* Trend indicator if available */}
            {dashboardInsights?.spending_trend?.change_percentage && (
              <View style={styles.trendContainer}>
                <Text style={[
                  styles.trendText,
                  { color: dashboardInsights.spending_trend.trend_direction === 'increasing' ? colors.income : colors.expense }
                ]}>
                  {dashboardInsights.spending_trend.trend_direction === 'increasing' ? '↗' : '↘'} 
                  {Math.abs(dashboardInsights.spending_trend.change_percentage)}% this month
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Expandable Accounts List */}
          {accounts.length > 0 && (
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
                        {getAccountTypeIcon(account.type)}
                      </Text>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName} numberOfLines={1}>
                          {account.name}
                        </Text>
                        <Text style={styles.accountType}>
                          {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.accountBalance,
                      { color: account.balance >= 0 ? colors.income : colors.expense }
                    ]}>
                      {formatCurrency(account.balance, account.currency || getPrimaryCurrency())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

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

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
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

        {/* Smart Insights */}
        {(getCategoryBreakdownData().length > 0 || dashboardInsights?.spending_trend) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Smart Insights</Text>
            
            {/* Spending Trend Chart */}
            {dashboardInsights?.spending_trend && (
              <LineChart
                data={getSpendingTrendData()}
                title="Spending Trend (Last 6 Months)"
                yAxisSuffix={getPrimaryCurrency()}
              />
            )}

            {/* Category Breakdown */}
            {getCategoryBreakdownData().length > 0 && (
              <PieChart
                data={getCategoryBreakdownData()}
                title="Category Breakdown (This Month)"
              />
            )}
          </View>
        )}

        {/* Recommendations */}
        {getTopRecommendations().length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Smart Recommendations</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RecommendationsHistory')}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {getTopRecommendations().map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onDismiss={() => handleDismissRecommendation(recommendation.id)}
                onAct={() => handleActOnRecommendation(recommendation.id)}
              />
            ))}
          </View>
        )}

        {/* Goals Progress */}
        {getActiveGoals().length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Goals Progress</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Goals')}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {getActiveGoals().map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                compact={true}
                onPress={() =>
                  navigation.navigate('Goals', {
                    screen: 'GoalDetail',
                    params: { goalId: goal.id },
                  })
                }
              />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
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
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('StatementImport')}
            >
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>Import</Text>
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
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    ...typography.small,
    color: colors.background,
    fontWeight: 'bold',
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
    marginBottom: spacing.md,
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