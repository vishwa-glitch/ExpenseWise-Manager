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
import { formatCurrency } from '../../utils/currency';
import { getCategoryColor, isGoalContribution, getCategoryDisplayName } from '../../utils/categoryColors';

interface TransactionDetailScreenProps {
  navigation: any;
  route: any;
}

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { transactionId, transaction: routeTransaction } = route.params;
  const [transaction, setTransaction] = useState(routeTransaction);

  const { transactions } = useTypedSelector((state) => state.transactions);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const transactionTags = Array.isArray(transaction?.tags)
    ? transaction.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : [];

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
    const currency = transaction?.currency || displayCurrency || 'USD';
    const formattedAmount = formatCurrency(amount, currency);
    return type === 'expense' ? `-${formattedAmount}` : `+${formattedAmount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine the actual category based on tags and category_name
  const getActualCategory = () => {
    // Check if this is a goal contribution based on tags
    if (transactionTags.length > 0) {
      const hasGoalTag = transactionTags.some((tag: string) => {
        if (typeof tag !== 'string') return false;
        return tag.toLowerCase().includes('goal') ||
          tag.toLowerCase().includes('contribution');
      });
      if (hasGoalTag) {
        return 'Goal Contribution';
      }
    }

    // Return the original category or 'Uncategorized'
    return transaction?.category_name || 'Uncategorized';
  };

  const getCategoryIcon = (categoryName?: string) => {
    const actualCategory = getActualCategory();

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
      'goal contribution': '🎯',
      'other': '💰',
    };

    return iconMap[actualCategory.toLowerCase()] || '💰';
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
            <Text style={[
              styles.description,
              isGoalContribution(getActualCategory()) && styles.goalContributionText
            ]}>
              {getCategoryDisplayName(getActualCategory())}
            </Text>
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
                {getCategoryIcon()}
              </Text>
              <Text style={[
                styles.detailValue,
                isGoalContribution(getActualCategory()) && styles.goalContributionText
              ]}>
                {getCategoryDisplayName(getActualCategory())}
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

          {transactionTags.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {transactionTags.map((tag: string, index: number) => (
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
              title="Edit"
              onPress={handleEdit}
              variant="outline"
              style={styles.actionButton}
            />
            <CustomButton
              title="Delete"
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 20,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: spacing.xs,
  },
  editIcon: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  description: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailsSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
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
    fontSize: 14,
    marginRight: spacing.xs,
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
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  actionsSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: spacing.md,
  },
  goalContributionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default TransactionDetailScreen;
