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
import { useTypedSelector, useUserData } from '../../hooks/useTypedSelector';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
// import { fetchGoals } from '../../store/slices/goalsSlice'; // removed for now
import { fetchRecommendations } from '../../store/slices/recommendationsSlice';
import { fetchBudgets } from '../../store/slices/budgetsSlice';
import { fetchDashboardInsights } from '../../store/slices/analyticsSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { TransactionItem } from '../../components/common/TransactionItem';
// import { GoalCard } from '../../components/common/GoalCard'; // removed for now
import { RecommendationCard } from '../../components/common/RecommendationCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import CurrencySummary from '../../components/dashboard/CurrencySummary';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';
import { SmartAlertCard } from '../../components/dashboard/widgets/SmartAlertCard';
// import { GoalProgressCard } from '../../components/dashboard/widgets/GoalProgressCard'; // removed for now
import { CategoryBreakdownSection } from '../../components/dashboard/CategoryBreakdownSection';
import OnboardingOverlay from '../../components/common/OnboardingOverlay';
import { useOnboardingOverlay } from '../../hooks/useOnboardingOverlay';



interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  // Onboarding overlay hook
  const onboardingOverlay = useOnboardingOverlay();

  const { user, isAuthenticated, isLoading: userLoading } = useUserData();
  
  // Debug logging for user data
  useEffect(() => {
    console.log('👤 Dashboard - User data:', {
      user,
      isAuthenticated,
      hasUser: !!user,
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
    });
  }, [user, isAuthenticated]);
  const { accounts: rawAccounts } = useTypedSelector((state) => state.accounts);
  
  // Ensure accounts is always an array and filter out any null/undefined accounts
  const accounts = rawAccounts && Array.isArray(rawAccounts) 
    ? rawAccounts.filter(account => account && account.id) 
    : [];
  const { transactions: rawTransactions } = useTypedSelector((state) => state.transactions);
  // const { goals, isLoading: goalsLoading } = useTypedSelector((state) => state.goals); // removed for now
  const { budgets, budgetStatus, isLoading: budgetsLoading } = useTypedSelector((state) => state.budgets);
  const { recommendations: rawRecommendations } = useTypedSelector((state) => state.recommendations);
  
  // Ensure transactions is always an array and filter out any null/undefined transactions
  const transactions = rawTransactions && Array.isArray(rawTransactions) 
    ? rawTransactions.filter(transaction => transaction && transaction.id) 
    : [];
    
  // Ensure recommendations is always an array and filter out any null/undefined recommendations
  const recommendations = rawRecommendations && Array.isArray(rawRecommendations) 
    ? rawRecommendations.filter(recommendation => recommendation && recommendation.id) 
    : [];
  const { displayCurrency: rawDisplayCurrency } = useTypedSelector((state) => state.user);
  
  // Ensure displayCurrency is always a valid currency string
  const displayCurrency = rawDisplayCurrency && rawDisplayCurrency.trim() !== '' ? rawDisplayCurrency : 'USD';
  const { dashboardInsights, isLoading: analyticsLoading } = useTypedSelector((state) => state.analytics);

  // Debug logging for currency
  useEffect(() => {
    console.log('💰 Dashboard - Current display currency:', displayCurrency);
  }, [displayCurrency]);

  useEffect(() => {
    // Only load dashboard data when user is authenticated
    if (isAuthenticated) {
      loadDashboardData();
      
      // If user data is missing, try to load profile data
      if (!user?.first_name && !user?.email) {
        console.log('👤 User data missing, attempting to load profile...');
        dispatch(fetchUserProfile()).catch(error => {
          console.error('❌ Failed to load user profile:', error);
        });
      }
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    // Double-check authentication before making API calls
    if (!isAuthenticated) {
      console.log('🚫 Skipping dashboard data load - user not authenticated');
      return;
    }

    try {
      console.log('📊 Loading dashboard data for authenticated user');
      await Promise.all([
        dispatch(fetchAccounts()),
        dispatch(fetchTransactions({ limit: 10 })),
        // dispatch(fetchGoals()), // removed for now
        dispatch(fetchRecommendations()),
        dispatch(fetchBudgets()),
        dispatch(fetchDashboardInsights()),
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
        .filter(account => account && account.currency && account.currency === displayCurrency)
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
      return transactions.slice(0, 3);
    } catch (error) {
      return [];
    }
  };

  // const getActiveGoals = () => {
  //   try {
  //     if (!goals || !Array.isArray(goals)) {
  //       return [];
  //     }
  //     return goals.filter(goal => goal && goal.status === 'active').slice(0, 2);
  //   } catch (error) {
  //     return [];
  //   }
  // };

  const getMostRelevantBudgetAlert = () => {
    try {
      if (!budgets || !Array.isArray(budgets) || budgets.length === 0) {
        return null;
      }

      // Find the budget with the highest percentage used (most urgent)
      const budgetWithHighestUsage = budgets
        .filter(budget => budget && budget.id && budget.is_active === true)
        .map(budget => {
          const percentageUsed = budget.spent_amount && budget.amount 
            ? (budget.spent_amount / budget.amount) * 100 
            : 0;
          return { ...budget, percentageUsed };
        })
        .sort((a, b) => b.percentageUsed - a.percentageUsed)[0];

      if (!budgetWithHighestUsage) return null;

      // Calculate days left in current month
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysLeft = daysInMonth - now.getDate();

      return {
        title: budgetWithHighestUsage.name || 'Budget',
        percentageUsed: Math.round(budgetWithHighestUsage.percentageUsed),
        currentAmount: budgetWithHighestUsage.spent_amount || 0,
        totalAmount: budgetWithHighestUsage.amount || 0,
        daysLeft: daysLeft,
      };
    } catch (error) {
      console.error('Error getting budget alert:', error);
      return null;
    }
  };

  // const getMostRelevantGoal = () => {
  //   try {
  //     if (!goals || !Array.isArray(goals) || goals.length === 0) {
  //       return null;
  //   }

  //   // Find the goal with the highest priority or most progress
  //   const activeGoals = goals.filter(goal => goal && goal.status === 'active');
  //   if (activeGoals.length === 0) return null;

  //   // Sort by priority (high first) then by progress percentage
  //   const sortedGoals = activeGoals
  //     .map(goal => ({
  //       ...goal,
  //       progressPercentage: goal.progress_percentage || 0,
  //       priority: goal.priority || 'medium'
  //     }))
  //     .sort((a, b) => {
  //       // Priority order: high > medium > low
  //       const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
  //       const aPriority = priorityOrder[a.priority] || 2;
  //       const bPriority = priorityOrder[b.priority] || 2;
        
  //       if (aPriority !== bPriority) {
  //         return bPriority - aPriority;
  //       }
  //       // If same priority, sort by progress percentage
  //       return b.progressPercentage - a.progressPercentage;
  //     });

  //   const selectedGoal = sortedGoals[0];
    
  //   return {
  //     title: selectedGoal.title || 'Financial Goal',
  //     currentAmount: selectedGoal.current_amount || 0,
  //     targetAmount: selectedGoal.target_amount || 0,
  //     progressPercentage: selectedGoal.progressPercentage,
  //     monthlyIncrement: selectedGoal.monthly_savings_needed || 0,
  //   };
  // } catch (error) {
  //   console.error('Error getting goal:', error);
  //   return null;
  // }
  // };

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
        console.log('💰 Formatting balance with currency:', displayCurrency, 'amount: 0');
        return formatCurrency(0, displayCurrency);
      }
      console.log('💰 Formatting balance with currency:', displayCurrency, 'amount:', amount);
      return formatCurrency(amount, displayCurrency);
    } catch (error) {
      console.error('❌ Error formatting balance:', error);
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
          return '🏛️';
        case 'savings':
          return '💵';
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

  // Show loading spinner if not authenticated
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  // Additional safety check for critical data
  if (!accounts || !Array.isArray(accounts)) {
    console.warn('⚠️ Dashboard: Accounts data is not properly initialized');
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
              Welcome back, {userLoading ? '...' : (user?.first_name || user?.email?.split('@')[0] || 'User')}!
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
                  In {displayCurrency || 'USD'} (from {accounts.filter(a => a && a.currency && a.currency === displayCurrency).length} of {accounts.length} accounts)
                </Text>
              </View>
            
              {/* Trend indicator if available - Fixed: Wrapped in proper condition */}
              {/* Removed dashboardInsights.spending_trend as it's no longer imported */}
              {/* {dashboardInsights?.spending_trend?.change_percentage ? (
                <View style={styles.trendContainer}>
                  <Text style={[
                    styles.trendText,
                    { color: dashboardInsights.spending_trend.trend_direction === 'increasing' ? colors.income : colors.expense }
                  ]}>
                    {`${dashboardInsights.spending_trend.trend_direction === 'increasing' ? '↗' : '↘'} ${Math.round(Math.abs(dashboardInsights.spending_trend.change_percentage))}% this month`}
                  </Text>
                </View>
              ) : null} */}
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
                    style={[styles.accountItem, account.is_active === false && styles.inactiveAccount]}
                    onPress={() => account.id ? handleAccountPress(account.id) : null}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accountLeft}>
                      <Text style={styles.accountIcon}>
                        {getAccountTypeIcon(account.type || '')}
                      </Text>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName} numberOfLines={1}>
                          {account.name && typeof account.name === 'string' ? account.name : 'Unnamed Account'}
                        </Text>
                        <Text style={styles.accountType}>
                          {account.type && typeof account.type === 'string' ? account.type.charAt(0).toUpperCase() + account.type.slice(1) : 'Account'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.accountBalance,
                      { color: (account.balance || 0) >= 0 ? colors.income : colors.expense }
                    ]}>
                      {formatCurrency(account.balance || 0, account.currency || displayCurrency || 'USD')}
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
              <Text style={styles.emptyIcon}>📄</Text>
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

        {/* Widgets Section */}
        <View style={styles.widgetsSection}>
          {budgetsLoading ? (
            <LoadingSpinner />
          ) : getMostRelevantBudgetAlert() ? (
            <SmartAlertCard 
              error={null}
              {...getMostRelevantBudgetAlert()}
                            onPress={() => navigation.navigate('Budget')}
              onDetailsPress={() => navigation.navigate('Budget')} 
            />
          ) : null}
          {budgetsLoading || getMostRelevantBudgetAlert() ? (
            <View style={{ height: spacing.sm }} />
          ) : null}
          {/* Goals widget removed for now - functionality kept for future use */}
        </View>

        {/* Category Breakdown Section */}
        <CategoryBreakdownSection 
          dashboardInsights={dashboardInsights}
          isLoading={analyticsLoading}
          onRefresh={onRefresh}
        />



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

      {/* Onboarding Overlay - show for step 0 (welcome) and step 6 (complete) */}
      {onboardingOverlay.isVisible && (onboardingOverlay.currentStep === 0 || onboardingOverlay.currentStep === 6) && (
        <OnboardingOverlay
          isVisible={onboardingOverlay.isVisible}
          currentStep={onboardingOverlay.currentStep}
          totalSteps={onboardingOverlay.totalSteps}
          steps={onboardingOverlay.steps}
          onNext={onboardingOverlay.handleNext}
          onSkip={onboardingOverlay.handleSkip}
          onComplete={onboardingOverlay.handleComplete}
        />
      )}
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