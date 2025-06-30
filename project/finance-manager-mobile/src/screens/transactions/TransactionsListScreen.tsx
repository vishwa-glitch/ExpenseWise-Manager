import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchTransactions, deleteTransaction } from '../../store/slices/transactionsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { TransactionItem } from '../../components/common/TransactionItem';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';

interface TransactionsListScreenProps {
  navigation: any;
  route?: any;
}

const TransactionsListScreen: React.FC<TransactionsListScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { transactions, pagination, isLoading } = useTypedSelector((state) => state.transactions);
  const { categories } = useTypedSelector((state) => state.categories);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  // Get accountId and filterDate from route params
  const { accountId, filterDate } = route?.params || {};

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadCategories();
    }
  }, [isAuthenticated, accountId, filterDate]);

  const loadData = async (page = 1, reset = true) => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping transactions data load - user not authenticated');
      return;
    }

    try {
      console.log('📋 Loading transactions data for authenticated user');
      const params: any = { page, limit: 20 };
      if (accountId) {
        params.accountId = accountId;
      }
      if (filterDate) {
        params.date = filterDate;
      }
      
      await dispatch(fetchTransactions(params));
      
      if (reset) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping refresh - user not authenticated');
      return;
    }

    setRefreshing(true);
    await loadData(1, true);
    setRefreshing(false);
  };

  const loadMoreTransactions = async () => {
    if (loadingMore || !pagination || currentPage >= pagination.pages) {
      return;
    }

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await loadData(nextPage, false);
    setCurrentPage(nextPage);
    setLoadingMore(false);
  };

  const handleTransactionPress = (transaction: any) => {
    navigation.navigate('TransactionDetail', { 
      transactionId: transaction.id,
      transaction 
    });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTransaction(transactionId)).unwrap();
              // Refresh the list
              await loadData(1, true);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getFilteredTransactions = () => {
    if (!searchQuery.trim()) {
      return transactions;
    }

    return transactions.filter((transaction: any) =>
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatFilterDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderTransactionItem = ({ item }: { item: any }) => (
    <TransactionItem
      transaction={item}
      onPress={() => handleTransactionPress(item)}
      onLongPress={() => handleDeleteTransaction(item.id)}
      showAccount={!accountId} // Hide account name if viewing from specific account
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Date Filter Display */}
      {filterDate && (
        <View style={styles.dateFilterContainer}>
          <Text style={styles.dateFilterLabel}>Showing transactions for:</Text>
          <Text style={styles.dateFilterValue}>{formatFilterDate(filterDate)}</Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              // Navigate back to all transactions without date filter
              navigation.setParams({ filterDate: undefined });
            }}
          >
            <Text style={styles.clearFilterText}>Show All Transactions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {getFilteredTransactions().length} transactions
          {pagination && ` (${pagination.total} total)`}
          {filterDate && ' on selected date'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery 
          ? 'No Matching Transactions' 
          : filterDate 
          ? 'No Transactions on This Date'
          : 'No Transactions Yet'
        }
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : filterDate
          ? 'No transactions were recorded on this date'
          : 'Add your first transaction to get started tracking your finances'
        }
      </Text>
      {!searchQuery && !filterDate && (
        <TouchableOpacity
          style={styles.addFirstTransactionButton}
          onPress={() => navigation.navigate('AddEditTransaction', { accountId })}
        >
          <Text style={styles.addFirstTransactionText}>Add Transaction</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <LoadingSpinner size="small" />
        <Text style={styles.loadingMoreText}>Loading more transactions...</Text>
      </View>
    );
  };

  if (!isAuthenticated || (isLoading && transactions.length === 0)) {
    return <LoadingSpinner />;
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreTransactions}
        onEndReachedThreshold={0.1}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTransaction', { accountId })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  dateFilterContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  dateFilterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  dateFilterValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  clearFilterButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  clearFilterText: {
    ...typography.small,
    color: colors.background,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.sm,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryContainer: {
    alignItems: 'center',
  },
  summaryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  addFirstTransactionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addFirstTransactionText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingMoreText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
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
});

export default TransactionsListScreen;