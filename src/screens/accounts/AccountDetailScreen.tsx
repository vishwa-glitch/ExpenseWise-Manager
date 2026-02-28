import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { 
  fetchAccount, 
  fetchAccountSummary, 
  deleteAccount,
  clearAccountSummary 
} from '../../store/slices/accountsSlice';
import { fetchTransactions, fetchTransactionsByAccount } from '../../store/slices/transactionsSlice';
import { BalanceCard } from '../../components/common/BalanceCard';
import { TransactionItem } from '../../components/common/TransactionItem';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface AccountDetailScreenProps {
  navigation: any;
  route: any;
}

const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { accountId } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const { selectedAccount, accountSummary, isLoading } = useTypedSelector((state) => state.accounts);
  const { transactions, pagination, isLoading: transactionsLoading } = useTypedSelector((state) => state.transactions);
  const { displayCurrency } = useTypedSelector((state) => state.user);

  // Local pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);

  const loadAccountData = useCallback(async () => {
    try {
      console.log('🏦 Loading account data for account:', accountId);
      await Promise.all([
        dispatch(fetchAccount(accountId)),
        dispatch(fetchAccountSummary({ id: accountId, period: 'month' })),
        dispatch(fetchTransactionsByAccount({ accountId, page: 1, limit: 20 })),
      ]);
      console.log('✅ Account data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading account data:', error);
    }
  }, [dispatch, accountId]);

  const loadMoreTransactions = async () => {
    if (!hasMoreTransactions || transactionsLoading) return;
    
    const nextPage = currentPage + 1;
    console.log('📄 Loading more transactions, page:', nextPage);
    
    try {
      const result = await dispatch(fetchTransactionsByAccount({ 
        accountId, 
        page: nextPage,
        limit: 20 
      })).unwrap();
      
      if (result.transactions && result.transactions.length > 0) {
        setCurrentPage(nextPage);
        // Check if there are more pages
        if (result.pagination && nextPage >= result.pagination.pages) {
          setHasMoreTransactions(false);
        }
      } else {
        // No more transactions to load
        setHasMoreTransactions(false);
        console.log('📄 No more transactions to load');
      }
    } catch (error) {
      console.error('❌ Error loading more transactions:', error);
    }
  };

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 AccountDetailScreen focused, reloading data...');
      // Reset pagination state when screen is focused
      setCurrentPage(1);
      setHasMoreTransactions(true);
      loadAccountData();
      
      // Cleanup function to clear account summary when leaving screen
      return () => {
        dispatch(clearAccountSummary());
      };
    }, [loadAccountData, dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccountData();
    setRefreshing(false);
  };

  const handleEditAccount = () => {
    navigation.navigate('AddEditAccount', { accountId, account: selectedAccount });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${selectedAccount?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAccount(accountId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShareAccount = () => {
    navigation.navigate('AccountSharing', { accountId });
  };

  const navigateToAddTransaction = () => {
    // Navigate to the drawer navigator's Home screen, then to transactions tab, then to add transaction screen
    navigation.getParent()?.navigate('Home', {
      screen: 'Transactions',
      params: {
        screen: 'AddEditTransaction',
        params: { accountId },
      },
    });
  };

  const navigateToTransactionsList = () => {
    // Navigate to the drawer navigator's Home screen, then to transactions tab, then to transactions list
    navigation.getParent()?.navigate('Home', {
      screen: 'Transactions',
      params: {
        screen: 'TransactionsMain',
        params: {
          screen: 'AllTransactions',
          params: { accountId },
        },
      },
    });
  };

  const navigateToTransactionDetail = (transactionId: string) => {
    // Navigate to the drawer navigator's Home screen, then to transactions tab, then to transaction detail
    navigation.getParent()?.navigate('Home', {
      screen: 'Transactions',
      params: {
        screen: 'TransactionDetail',
        params: { transactionId },
      },
    });
  };



  const getAccountTransactions = () => {
    // Return all transactions for this account (they're already filtered by accountId in the API call)
    return transactions;
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      case 'cash':
        return '💵';
      case 'other':
        return '💼';
      default:
        return '💼';
    }
  };

  const formatAmount = (amount: number) => {
    const currency = selectedAccount?.currency || displayCurrency;
    return formatCurrency(amount, currency, { maximumFractionDigits: 0 });
  };

  const renderAccountSummary = () => {
    if (!accountSummary) return null;

    return (
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Monthly Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              {formatAmount(accountSummary.total_income || 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>💸</Text>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              {formatAmount(accountSummary.total_expenses || 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryLabel}>Net Change</Text>
            <Text style={[
              styles.summaryValue, 
              { color: (accountSummary.net_change || 0) >= 0 ? colors.income : colors.expense }
            ]}>
              {(accountSummary.net_change || 0) >= 0 ? '+' : ''}
              {formatAmount(accountSummary.net_change || 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>🔢</Text>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryValue}>
              {accountSummary.transaction_count || 0}
            </Text>
          </View>
        </View>

        {/* Additional Summary Details */}
        <View style={styles.summaryDetails}>
          <View style={styles.summaryDetailItem}>
            <Text style={styles.summaryDetailLabel}>Average Transaction:</Text>
            <Text style={styles.summaryDetailValue}>
              {formatAmount(accountSummary.average_transaction || 0)}
            </Text>
          </View>
          <View style={styles.summaryDetailItem}>
            <Text style={styles.summaryDetailLabel}>Largest Expense:</Text>
            <Text style={[styles.summaryDetailValue, { color: colors.expense }]}>
              {formatAmount(accountSummary.largest_expense || 0)}
            </Text>
          </View>
          <View style={styles.summaryDetailItem}>
            <Text style={styles.summaryDetailLabel}>Largest Income:</Text>
            <Text style={[styles.summaryDetailValue, { color: colors.income }]}>
              {formatAmount(accountSummary.largest_income || 0)}
            </Text>
          </View>
          {accountSummary.most_frequent_category && (
            <View style={styles.summaryDetailItem}>
              <Text style={styles.summaryDetailLabel}>Top Category:</Text>
              <Text style={styles.summaryDetailValue}>
                {accountSummary.most_frequent_category}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && !selectedAccount) {
    return <LoadingSpinner />;
  }

  if (!selectedAccount) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Account not found</Text>
          <CustomButton
            title="Go Back"
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
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
        <Text style={styles.headerTitle}>{selectedAccount.name}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditAccount}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Account Info */}
        <View style={styles.accountInfo}>
          <View style={styles.accountHeader}>
            <Text style={styles.accountIcon}>
              {getAccountTypeIcon(selectedAccount.type)}
            </Text>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{selectedAccount.name}</Text>
              <Text style={styles.accountType}>
                {selectedAccount.type.charAt(0).toUpperCase() + selectedAccount.type.slice(1)} Account
              </Text>
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <BalanceCard
          title="Current Balance"
          balance={selectedAccount.balance}
          currency={selectedAccount.currency || displayCurrency}
          subtitle={`${selectedAccount.transaction_count || 0} transactions`}
        />

        {/* Account Summary */}
        {renderAccountSummary()}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToAddTransaction}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToTransactionsList}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>View All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareAccount}
            >
              <Text style={styles.actionIcon}>🤝</Text>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Transactions</Text>
            <TouchableOpacity onPress={navigateToTransactionsList}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {getAccountTransactions().length > 0 ? (
            <>
              {getAccountTransactions().map((transaction: any) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  showAccount={false}
                  onPress={() => navigateToTransactionDetail(transaction.id)}
                />
              ))}
              {hasMoreTransactions && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreTransactions}
                  disabled={transactionsLoading}
                >
                  <Text style={styles.loadMoreText}>
                    {transactionsLoading ? 'Loading...' : 'Load More Transactions'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first transaction to get started
              </Text>
              <TouchableOpacity
                style={styles.addTransactionButton}
                onPress={navigateToAddTransaction}
              >
                <Text style={styles.addTransactionText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <View style={styles.managementButtons}>
            <CustomButton
              title="Edit Account"
              onPress={handleEditAccount}
              variant="outline"
              style={styles.managementButton}
            />
            <CustomButton
              title="Delete Account"
              onPress={handleDeleteAccount}
              variant="danger"
              style={styles.managementButton}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
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
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: spacing.sm,
  },
  editIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  accountInfo: {
    padding: spacing.lg,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  accountType: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  summarySection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryItem: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryDetails: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
  },
  summaryDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryDetailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryDetailValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: 'bold',
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
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
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyTransactions: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addTransactionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addTransactionText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  loadMoreButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadMoreText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  managementButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  managementButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default AccountDetailScreen;