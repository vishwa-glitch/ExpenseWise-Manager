import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency?: string;
    transaction_count?: number;
    is_active?: boolean;
  };
  onPress?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onPress }) => {
  const formatBalance = (amount: number) => {
    const currency = account.currency || getDefaultCurrency();
    return formatCurrency(amount, currency);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      default:
        return '💼';
    }
  };

  const getBalanceColor = () => {
    return account.balance >= 0 ? colors.income : colors.expense;
  };

  return (
    <TouchableOpacity
      style={[styles.container, !account.is_active && styles.inactive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.accountInfo}>
          <Text style={styles.icon}>{getAccountTypeIcon(account.type)}</Text>
          <View style={styles.details}>
            <Text style={styles.name}>{account.name}</Text>
            <Text style={styles.type}>{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balance, { color: getBalanceColor() }]}>
            {account.balance < 0 ? '-' : ''}
            {formatBalance(account.balance)}
          </Text>
          {account.transaction_count !== undefined && (
            <Text style={styles.transactionCount}>
              {account.transaction_count} transactions
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inactive: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  type: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    ...typography.h3,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  transactionCount: {
    ...typography.small,
    color: colors.textSecondary,
  },
});