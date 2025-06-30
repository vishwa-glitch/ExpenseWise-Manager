import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';

interface TransactionItemProps {
  transaction: {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    category_name?: string;
    account_name?: string;
    transaction_date: string;
    merchant?: string;
    currency?: string;
  };
  onPress?: () => void;
  onLongPress?: () => void;
  showAccount?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onLongPress,
  showAccount = true,
}) => {
  const formatAmount = (amount: number, type: string) => {
    const currency = transaction.currency || getDefaultCurrency();
    const formattedAmount = formatCurrency(amount, currency);
    return type === 'expense' ? `-${formattedAmount}` : `+${formattedAmount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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
    return transaction.type === 'income' ? colors.income : colors.expense;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {getCategoryIcon(transaction.category_name)}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.category}>
              {transaction.category_name || 'Uncategorized'}
            </Text>
            {showAccount && transaction.account_name && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.account}>{transaction.account_name}</Text>
              </>
            )}
          </View>
          {transaction.merchant && (
            <Text style={styles.merchant}>{transaction.merchant}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {formatAmount(transaction.amount, transaction.type)}
        </Text>
        <Text style={styles.date}>
          {formatDate(transaction.transaction_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  icon: {
    fontSize: 20,
  },
  details: {
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  separator: {
    ...typography.small,
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  account: {
    ...typography.small,
    color: colors.textSecondary,
  },
  merchant: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.small,
    color: colors.textSecondary,
  },
});