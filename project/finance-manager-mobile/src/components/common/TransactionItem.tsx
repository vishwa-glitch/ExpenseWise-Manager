import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';
import { Transaction } from '../../types/transaction';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { isGoalContribution, getGoalContributionDisplayName, getGoalContributionIcon, getGoalContributionColor } from '../../utils/goalUtils';

// Extend the Transaction interface to include the runningBalance prop
interface TransactionWithRunningBalance extends Transaction {
  runningBalance?: number;
}

interface TransactionItemProps {
  transaction: TransactionWithRunningBalance;
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
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const { categories } = useTypedSelector((state) => state.categories);

  const formatAmount = (amount: number, type: string) => {
    // Use account_currency as primary, fallback to currency, then to 'USD'
    const currency = transaction.account_currency || transaction.currency || 'USD';
    const signedAmount = type.toLowerCase() === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const formatted = formatCurrency(signedAmount, currency);
    if (type.toLowerCase() === 'income') {
      return `+${formatted}`;
    }
    return formatted;
  };

  // Format running balance with the transaction's currency
  const formatRunningBalance = (balance: number | undefined) => {
    if (balance === undefined) return null;
    const currency = transaction.account_currency || transaction.currency || 'USD';
    return formatCurrency(balance, currency);
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
    
    // Handle Goal Contribution category with special icon
    // Use the full isGoalContribution function to check all criteria (tags, description, category)
    if (isGoalContribution(transaction)) {
      return getGoalContributionIcon();
    }
    
    // First, try to find the category in the categories store
    const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    
    // If category has an icon property, map it to emoji
    if (category?.icon) {
      const iconMap: { [key: string]: string } = {
        'utensils': '🍽️',
        'car': '🚗',
        'shopping-bag': '🛍️',
        'film': '🎬',
        'zap': '⚡',
        'heart': '🏥',
        'book': '📚',
        'plane': '✈️',
        'briefcase': '💼',
        'trending-up': '📈',
        'home': '🏠',
        'phone': '📱',
        'gift': '🎁',
        'coffee': '☕',
        'music': '🎵',
        'camera': '📷',
        'gamepad': '🎮',
        'dumbbell': '🏋️',
        'palette': '🎨',
        'tool': '🔧',
        'tag': '🏷️',
      };
      
      return iconMap[category.icon] || '🏷️';
    }
    
    // Fallback to name-based icons for default categories
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('dining')) return '🍽️';
    if (name.includes('transport') || name.includes('car')) return '🚗';
    if (name.includes('shop') || name.includes('retail')) return '🛍️';
    if (name.includes('entertainment') || name.includes('movie')) return '🎬';
    if (name.includes('utilities') || name.includes('electric')) return '⚡';
    if (name.includes('health') || name.includes('medical')) return '🏥';
    if (name.includes('education') || name.includes('school')) return '📚';
    if (name.includes('travel') || name.includes('vacation')) return '✈️';
    if (name.includes('salary') || name.includes('income')) return '💼';
    if (name.includes('investment') || name.includes('stock')) return '📈';
    
    return '💰'; // Default fallback
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
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: isGoalContribution(transaction) 
              ? getGoalContributionColor() + '20' 
              : transaction.type.toLowerCase() === 'income' 
                ? colors.income + '20' 
                : colors.expense + '20' 
          }
        ]}>
          <Text style={styles.icon}>
            {getCategoryIcon(transaction.category_name)}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {getDisplayDescription()}
          </Text>
                      <View style={styles.metadata}>
              <Text style={[
                styles.category,
                isGoalContribution(transaction) && { color: getGoalContributionColor() }
              ]}>
                {getGoalContributionDisplayName(transaction)}
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
            {formatRunningBalance(runningBalance)}
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