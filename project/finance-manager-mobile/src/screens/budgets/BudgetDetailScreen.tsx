import React, { useEffect, useState } from 'react';
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
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchBudget, deleteBudget, toggleBudget } from '../../store/slices/budgetsSlice';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
import { TransactionItem } from '../../components/common/TransactionItem';
import { ProgressDonut } from '../../components/charts/ProgressDonut';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface BudgetDetailScreenProps {
  navigation: any;
  route: any;
}

const BudgetDetailScreen: React.FC<BudgetDetailScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { budgetId } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const { selectedBudget, isLoading } = useTypedSelector((state) => state.budgets);
  const { transactions } = useTypedSelector((state) => state.transactions);

  useEffect(() => {
    loadBudgetData();
  }, [budgetId]);

  const loadBudgetData = async () => {
    try {
      await Promise.all([
        dispatch(fetchBudget(budgetId)),
        dispatch(fetchTransactions({ 
          budgetId, 
          limit: 50,
          startDate: selectedBudget?.start_date,
          endDate: selectedBudget?.end_date,
        })),
      ]);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgetData();
    setRefreshing(false);
  };

  const handleEditBudget = () => {
    navigation.navigate('EditBudget', { budgetId, budget: selectedBudget });
  };

  const handleDeleteBudget = () => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${selectedBudget?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteBudget(budgetId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleBudget = async () => {
    try {
      await dispatch(toggleBudget({ 
        id: budgetId, 
        isActive: !selectedBudget?.is_active 
      })).unwrap();
      await loadBudgetData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update budget status. Please try again.');
    }
  };

  const formatAmount = (amount: number) => {
    const currency = selectedBudget?.currency || 'USD';
    return formatCurrency(amount, currency);
  };

  const getProgressPercentage = () => {
    if (!selectedBudget?.spent || selectedBudget.amount === 0) return 0;
    return Math.min((selectedBudget.spent / selectedBudget.amount) * 100, 100);
  };

  const getRemainingAmount = () => {
    if (!selectedBudget) return 0;
    return selectedBudget.amount - (selectedBudget.spent || 0);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return colors.error;
    if (percentage >= 80) return colors.warning;
    if (percentage >= 60) return colors.accent;
    return colors.primary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    if (!selectedBudget) return 0;
    const endDate = new Date(selectedBudget.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getBudgetTransactions = () => {
    if (!selectedBudget) return [];
    
    // Filter transactions by budget period and category if specified
    return transactions.filter((transaction: any) => {
      const transactionDate = new Date(transaction.transaction_date);
      const startDate = new Date(selectedBudget.start_date);
      const endDate = new Date(selectedBudget.end_date);
      
      const isInPeriod = transactionDate >= startDate && transactionDate <= endDate;
      const isExpense = transaction.type === 'expense';
      const isInCategory = !selectedBudget.category_id || 
                          transaction.category_id === selectedBudget.category_id;
      
      return isInPeriod && isExpense && isInCategory;
    }).slice(0, 10); // Show only recent 10 transactions
  };

  const renderBudgetOverview = () => (
    <View style={styles.overviewSection}>
      <Text style={styles.sectionTitle}>Budget Overview</Text>
      
      <View style={styles.overviewContent}>
        <View style={styles.progressContainer}>
          <ProgressDonut
            progress={getProgressPercentage()}
            size={120}
            color={getProgressColor()}
            centerText={`${getProgressPercentage().toFixed(1)}%`}
            centerSubtext="Used"
          />
        </View>
        
        <View style={styles.overviewStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Budget Amount</Text>
            <Text style={styles.statValue}>
              {formatAmount(selectedBudget?.amount || 0)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Amount Spent</Text>
            <Text style={[styles.statValue, { color: colors.expense }]}>
              {formatAmount(selectedBudget?.spent || 0)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[
              styles.statValue,
              { color: getRemainingAmount() >= 0 ? colors.income : colors.error }
            ]}>
              {formatAmount(getRemainingAmount())}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBudgetDetails = () => (
    <View style={styles.detailsSection}>
      <Text style={styles.sectionTitle}>Budget Details</Text>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Period</Text>
        <Text style={styles.detailValue}>
          {selectedBudget?.period.charAt(0).toUpperCase() + selectedBudget?.period.slice(1)}
        </Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Category</Text>
        <Text style={styles.detailValue}>
          {selectedBudget?.category_name || 'All Categories'}
        </Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Start Date</Text>
        <Text style={styles.detailValue}>
          {formatDate(selectedBudget?.start_date || '')}
        </Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>End Date</Text>
        <Text style={styles.detailValue}>
          {formatDate(selectedBudget?.end_date || '')}
        </Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Days Remaining</Text>
        <Text style={[
          styles.detailValue,
          { color: getDaysRemaining() <= 7 ? colors.warning : colors.text }
        ]}>
          {getDaysRemaining()} days
        </Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Status</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: selectedBudget?.is_active ? colors.success + '20' : colors.textSecondary + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: selectedBudget?.is_active ? colors.success : colors.textSecondary }
          ]}>
            {selectedBudget?.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderRecentTransactions = () => {
    const budgetTransactions = getBudgetTransactions();
    
    return (
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions', {
              screen: 'TransactionsMain',
              params: {
                screen: 'AllTransactions',
                params: {
                  budgetId,
                  startDate: selectedBudget?.start_date,
                  endDate: selectedBudget?.end_date,
                },
              },
            })}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {budgetTransactions.length > 0 ? (
          budgetTransactions.map((transaction: any) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => navigation.navigate('Transactions', {
                screen: 'TransactionDetail',
                params: { transactionId: transaction.id },
              })}
              showAccount={true}
            />
          ))
        ) : (
          <View style={styles.emptyTransactions}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
            <Text style={styles.emptySubtext}>
              No expenses found for this budget period
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !selectedBudget) {
    return <LoadingSpinner />;
  }

  if (!selectedBudget) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Budget not found</Text>
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
        <Text style={styles.headerTitle}>{selectedBudget.name}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditBudget}
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
        {renderBudgetOverview()}
        {renderBudgetDetails()}
        {renderRecentTransactions()}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionButtons}>
            <CustomButton
              title="Edit Budget"
              onPress={handleEditBudget}
              variant="outline"
              style={styles.actionButton}
            />
            <CustomButton
              title={selectedBudget.is_active ? 'Deactivate' : 'Activate'}
              onPress={handleToggleBudget}
              variant={selectedBudget.is_active ? 'secondary' : 'primary'}
              style={styles.actionButton}
            />
          </View>
          
          <CustomButton
            title="Delete Budget"
            onPress={handleDeleteBudget}
            variant="danger"
            style={styles.deleteButton}
          />
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
  overviewSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: 'bold',
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginRight: spacing.xl,
  },
  overviewStats: {
    flex: 1,
  },
  statItem: {
    marginBottom: spacing.md,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  statValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  detailsSection: {
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
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.small,
    fontWeight: 'bold',
  },
  transactionsSection: {
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
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  deleteButton: {
    marginTop: spacing.sm,
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

export default BudgetDetailScreen;