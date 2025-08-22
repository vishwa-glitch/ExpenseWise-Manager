import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';

interface TransactionItemProps {
  transaction: {
    id: string;
    amount: number;
    type: string;
    description: string;
    category_name?: string;
    account_name?: string;
    transaction_date: string;
    merchant?: string;
    currency?: string;
    tags?: string[];
  };
  onPress?: () => void;
  onLongPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showAccount?: boolean;
  runningBalance?: number;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onLongPress,
  onEdit,
  onDelete,
  showAccount = true,
  runningBalance,
}) => {
  const formatAmount = (amount: number, type: string) => {
    const currency = transaction.currency || getDefaultCurrency();
    const formattedAmount = formatCurrency(amount, currency);
    return type.toLowerCase() === 'expense' ? `-${formattedAmount}` : `+${formattedAmount}`;
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
    return transaction.type.toLowerCase() === 'income' ? colors.income : colors.expense;
  };

  // Use category name as fallback if description is empty
  const getDisplayDescription = () => {
    if (transaction.description && transaction.description.trim()) {
      return transaction.description;
    }
    return transaction.category_name || 'Uncategorized';
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <TouchableOpacity style={styles.leftAction} onPress={onEdit}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          Edit
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0, 1],
      outputRange: [0, 0, 10, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <TouchableOpacity style={styles.rightAction} onPress={onDelete}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          Delete
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  const transactionContent = (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: transaction.type.toLowerCase() === 'income' ? colors.income + '20' : colors.expense + '20' }]}>
          <Text style={styles.icon}>
            {getCategoryIcon(transaction.category_name)}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {getDisplayDescription()}
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
          {transaction.tags && transaction.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {transaction.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
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
        {runningBalance !== undefined && (
          <Text style={[
            styles.runningBalance,
            { color: runningBalance >= 0 ? colors.income : colors.expense }
          ]}>
            {formatCurrency(Math.abs(runningBalance), transaction.currency || getDefaultCurrency())}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (onEdit || onDelete) {
    return (
      <Swipeable
        renderLeftActions={onEdit ? renderLeftActions : undefined}
        renderRightActions={onDelete ? renderRightActions : undefined}
        friction={2}
        leftThreshold={30}
        rightThreshold={40}
      >
        {transactionContent}
      </Swipeable>
    );
  }

  return (
    transactionContent
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
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
    backgroundColor: colors.primary + '20',
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
    fontWeight: '500',
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '400',
    fontSize: 14,
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
    fontSize: 14,
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
    fontWeight: '600',
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.small,
    color: colors.textSecondary,
    fontSize: 12,
    opacity: 0.7,
  },
  runningBalance: {
    ...typography.small,
    fontWeight: '500',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    ...typography.small,
    color: colors.textSecondary,
    fontSize: 10,
  },
  leftAction: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightAction: {
    flex: 1,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionText: {
    color: colors.background,
    fontWeight: '600',
    padding: 20,
  },
});