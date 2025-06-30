import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { deleteTransaction } from '../../store/slices/transactionsSlice';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';

interface TransactionDetailScreenProps {
  navigation: any;
  route: any;
}

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { transactionId, transaction: routeTransaction } = route.params;
  const [transaction, setTransaction] = useState(routeTransaction);

  const { transactions } = useTypedSelector((state) => state.transactions);

  useEffect(() => {
    // If transaction not passed via route, find it in the store
    if (!transaction && transactionId) {
      const foundTransaction = transactions.find(t => t.id === transactionId);
      if (foundTransaction) {
        setTransaction(foundTransaction);
      }
    }
  }, [transactionId, transactions, transaction]);

  const formatAmount = (amount: number, type: string) => {
    const currency = transaction?.currency || getDefaultCurrency();
    const formattedAmount = formatCurrency(amount, currency);
    return type === 'expense' ? `-${formattedAmount}` : `+${formattedAmount}`;
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

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return '💰';
    
    const iconMap: { [key: string]: string } = {
      'food & dining': '🍽️',
      'transportation': '🚗',
      'shopping': '🛍️',
      'entertainment': '🎬',
      'utilities': '⚡',
      'healthcare': '🏥',
      'education': '📚',
      'travel': '✈️',
      'salary': '💼',
      'investment': '📈',
      'other': '💰',
    };
    
    return iconMap[categoryName.toLowerCase()] || '💰';
  };

  const getAmountColor = () => {
    return transaction?.type === 'income' ? colors.income : colors.expense;
  };

  const handleEdit = () => {
    navigation.navigate('AddEditTransaction', {
      transactionId: transaction.id,
      transaction,
    });
  };

  const handleDelete = () => {
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
              await dispatch(deleteTransaction(transaction.id)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!transaction) {
    return <LoadingSpinner />;
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
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Transaction Header */}
        <View style={styles.transactionHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(transaction.category_name)}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.description}>{transaction.description}</Text>
            <Text style={[styles.amount, { color: getAmountColor() }]}>
              {formatAmount(transaction.amount, transaction.type)}
            </Text>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Type</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.typeIcon}>
                {transaction.type === 'income' ? '💰' : '💸'}
              </Text>
              <Text style={[
                styles.detailValue,
                { color: getAmountColor() }
              ]}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(transaction.transaction_date)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(transaction.category_name)}
              </Text>
              <Text style={styles.detailValue}>
                {transaction.category_name || 'Uncategorized'}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>
              {transaction.account_name || 'Unknown Account'}
            </Text>
          </View>

          {transaction.merchant && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Merchant</Text>
              <Text style={styles.detailValue}>{transaction.merchant}</Text>
            </View>
          )}

          {transaction.tags && transaction.tags.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {transaction.tags.map((tag: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {formatDate(transaction.created_at)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionButtons}>
            <CustomButton
              title="Edit Transaction"
              onPress={handleEdit}
              variant="outline"
              style={styles.actionButton}
            />
            <CustomButton
              title="Delete Transaction"
              onPress={handleDelete}
              variant="danger"
              style={styles.actionButton}
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
  scrollContent: {
    padding: spacing.lg,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  categoryIcon: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  description: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  amount: {
    ...typography.h1,
    fontWeight: 'bold',
  },
  detailsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: 'bold',
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
    flex: 1,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 2,
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '500',
  },
  actionsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default TransactionDetailScreen;