import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchTransactions, deleteTransaction } from '../../store/slices/transactionsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { TransactionItem } from '../../components/common/TransactionItem';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';

interface BulkOperationsScreenProps {
  navigation: any;
}

const BulkOperationsScreen: React.FC<BulkOperationsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { transactions } = useTypedSelector((state) => state.transactions);
  const { categories } = useTypedSelector((state) => state.categories);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping bulk operations data load - user not authenticated');
      return;
    }

    try {
      console.log('📊 Loading bulk operations data for authenticated user');
      await Promise.all([
        dispatch(fetchTransactions({ limit: 100 })), // Load more for bulk operations
        dispatch(fetchCategories()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const toggleTransactionSelection = (transactionId: string) => {
    const newSelection = new Set(selectedTransactions);
    if (newSelection.has(transactionId)) {
      newSelection.delete(transactionId);
    } else {
      newSelection.add(transactionId);
    }
    setSelectedTransactions(newSelection);
  };

  const selectAllTransactions = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) {
      Alert.alert('No Selection', 'Please select transactions to delete.');
      return;
    }

    Alert.alert(
      'Delete Transactions',
      `Are you sure you want to delete ${selectedTransactions.size} transaction(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performBulkDelete,
        },
      ]
    );
  };

  const performBulkDelete = async () => {
    setIsLoading(true);
    try {
      const deletePromises = Array.from(selectedTransactions).map(id =>
        dispatch(deleteTransaction(id)).unwrap()
      );
      
      await Promise.all(deletePromises);
      
      setSelectedTransactions(new Set());
      setIsSelectionMode(false);
      
      Alert.alert('Success', `${deletePromises.length} transaction(s) deleted successfully.`);
      
      // Reload data
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete some transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCategorize = () => {
    if (selectedTransactions.size === 0) {
      Alert.alert('No Selection', 'Please select transactions to categorize.');
      return;
    }

    // For now, show a coming soon message
    Alert.alert(
      'Bulk Categorization',
      'Bulk categorization feature is coming soon! You can edit individual transactions for now.',
      [{ text: 'OK' }]
    );
  };

  const handleBulkExport = () => {
    if (selectedTransactions.size === 0) {
      Alert.alert('No Selection', 'Please select transactions to export.');
      return;
    }

    // For now, show a coming soon message
    Alert.alert(
      'Export Transactions',
      'Export feature is coming soon! You can view individual transaction details for now.',
      [{ text: 'OK' }]
    );
  };

  const renderTransactionItem = ({ item }: { item: any }) => {
    const isSelected = selectedTransactions.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.transactionContainer,
          isSelected && styles.selectedTransaction,
        ]}
        onPress={() => {
          if (isSelectionMode) {
            toggleTransactionSelection(item.id);
          } else {
            navigation.navigate('TransactionDetail', {
              transactionId: item.id,
              transaction: item,
            });
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleTransactionSelection(item.id);
          }
        }}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <Text style={styles.selectionIcon}>
              {isSelected ? '✓' : '○'}
            </Text>
          </View>
        )}
        <View style={styles.transactionContent}>
          <TransactionItem
            transaction={item}
            onPress={() => {}}
            showAccount={true}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Bulk Operations</Text>
      <Text style={styles.headerSubtitle}>
        Select multiple transactions to perform bulk actions
      </Text>
      
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionCount}>
            {selectedTransactions.size} of {transactions.length} selected
          </Text>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={selectAllTransactions}
          >
            <Text style={styles.selectAllText}>
              {selectedTransactions.size === transactions.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Transactions Available</Text>
      <Text style={styles.emptyMessage}>
        Add some transactions first to use bulk operations
      </Text>
      <TouchableOpacity
        style={styles.addTransactionButton}
        onPress={() => navigation.navigate('AddEditTransaction')}
      >
        <Text style={styles.addTransactionText}>Add Transaction</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isSelectionMode) {
              setIsSelectionMode(false);
              setSelectedTransactions(new Set());
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Bulk Operations</Text>
        {isSelectionMode && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsSelectionMode(false);
              setSelectedTransactions(new Set());
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bulk Action Buttons */}
      {isSelectionMode && selectedTransactions.size > 0 && (
        <View style={styles.actionBar}>
          <CustomButton
            title="Delete"
            onPress={handleBulkDelete}
            variant="danger"
            size="small"
            style={styles.actionButton}
            loading={isLoading}
          />
          <CustomButton
            title="Categorize"
            onPress={handleBulkCategorize}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
          <CustomButton
            title="Export"
            onPress={handleBulkExport}
            variant="secondary"
            size="small"
            style={styles.actionButton}
          />
        </View>
      )}

      {/* Instructions */}
      {!isSelectionMode && transactions.length > 0 && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            💡 Long press on any transaction to start bulk selection
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
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
  screenTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    padding: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  selectionCount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  selectAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  selectAllText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedTransaction: {
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectionIndicator: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  selectionIcon: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  transactionContent: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  instructions: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 8,
  },
  instructionsText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
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
  addTransactionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addTransactionText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default BulkOperationsScreen;