import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector, useUserData } from '../../hooks/useTypedSelector';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';
import { debugLogger } from '../../utils/debugLogger';

interface SafeDashboardScreenProps {
  navigation: any;
}

const SafeDashboardScreen: React.FC<SafeDashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated, isLoading: userLoading } = useUserData();
  
  // Debug logging for user data
  useEffect(() => {
    debugLogger.log('SafeDashboard', 'User data loaded', {
      user,
      isAuthenticated,
      hasUser: !!user,
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
    });
  }, [user, isAuthenticated]);

  const { accounts: rawAccounts } = useTypedSelector((state) => state.accounts);
  const { transactions: rawTransactions } = useTypedSelector((state) => state.transactions);
  const { displayCurrency: rawDisplayCurrency } = useTypedSelector((state) => state.user);
  
  // Safe data handling
  const accounts = rawAccounts && Array.isArray(rawAccounts) 
    ? rawAccounts.filter(account => account && account.id) 
    : [];
  const transactions = rawTransactions && Array.isArray(rawTransactions) 
    ? rawTransactions.filter(transaction => transaction && transaction.id) 
    : [];
  const displayCurrency = rawDisplayCurrency && rawDisplayCurrency.trim() !== '' ? rawDisplayCurrency : 'USD';

  // Safe data loading - one step at a time
  useEffect(() => {
    if (isAuthenticated && !userLoading) {
      loadDataSafely();
    }
  }, [isAuthenticated, userLoading]);

  const loadDataSafely = async () => {
    try {
      debugLogger.log('SafeDashboard', 'Starting data load');
      setError(null);
      setLoadingStep(1);
      debugLogger.log('SafeDashboard', 'Step 1: Loading accounts...');
      await dispatch(fetchAccounts());
      
      setLoadingStep(2);
      debugLogger.log('SafeDashboard', 'Step 2: Loading transactions...');
      await dispatch(fetchTransactions({ limit: 10 }));
      
      setLoadingStep(3);
      debugLogger.log('SafeDashboard', 'Step 3: Data loaded successfully');
    } catch (error) {
      debugLogger.error('SafeDashboard', error as Error, 'Failed to load dashboard data');
      setError((error as Error).message || 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log('🚫 SafeDashboard - Skipping refresh - user not authenticated');
      return;
    }

    setRefreshing(true);
    await loadDataSafely();
    setRefreshing(false);
  };

  const calculateTotalBalance = () => {
    if (!accounts || accounts.length === 0) return 0;
    
    return accounts.reduce((total, account) => {
      const balance = account.balance || 0;
      return total + balance;
    }, 0);
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to view the dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Dashboard</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDataSafely}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalBalance = calculateTotalBalance();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.first_name || 'User'}!
          </Text>
          <Text style={styles.balanceText}>
            {formatCurrency(totalBalance, displayCurrency)}
          </Text>
        </View>

        {loadingStep < 3 && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>
              {loadingStep === 1 && 'Loading accounts...'}
              {loadingStep === 2 && 'Loading transactions...'}
              {loadingStep === 3 && 'Loading complete!'}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accounts ({accounts.length})</Text>
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <View key={account.id} style={styles.accountItem}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance || 0, displayCurrency)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No accounts found</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions ({transactions.length})</Text>
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || 'No description'}
                  </Text>
                  <Text style={[
                    styles.transactionAmount,
                    { color: (transaction.amount || 0) >= 0 ? colors.success : colors.error }
                  ]}>
                    {formatCurrency(transaction.amount || 0, displayCurrency)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No transactions found</Text>
            )}
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.large,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.small,
  },
  balanceText: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: spacing.large,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
  content: {
    padding: spacing.large,
  },
  section: {
    marginBottom: spacing.large,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.medium,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.small,
  },
  accountName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  accountBalance: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.small,
  },
  transactionDescription: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  transactionAmount: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.large,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.medium,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },
});

export default SafeDashboardScreen;
