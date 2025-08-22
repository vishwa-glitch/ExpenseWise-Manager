import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { formatCurrency } from '../../utils/currency';

const { width: screenWidth } = Dimensions.get('window');

interface AccountsHorizontalScrollProps {
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    currency?: string;
    transaction_count?: number;
    is_active?: boolean;
  }>;
  onAccountPress: (accountId: string) => void;
  onAddAccount: () => void;
}

export const AccountsHorizontalScroll: React.FC<AccountsHorizontalScrollProps> = ({
  accounts,
  onAccountPress,
  onAddAccount,
}) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '';
      case 'savings':
        return '';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      default:
        return '💼';
    }
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? colors.income : colors.expense;
  };

  const formatBalance = (amount: number, currency?: string) => {
    return formatCurrency(amount, currency || displayCurrency || 'USD');
  };

  const renderAccountCard = (account: any) => (
    <TouchableOpacity
      key={account.id}
      style={[styles.accountCard, !account.is_active && styles.inactiveCard]}
      onPress={() => onAccountPress(account.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.accountIcon}>
          {getAccountTypeIcon(account.type)}
        </Text>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName} numberOfLines={1}>
            {account.name}
          </Text>
          <Text style={styles.accountType}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.balanceSection}>
        <Text style={[styles.balance, { color: getBalanceColor(account.balance) }]}>
          {account.balance < 0 ? '-' : ''}
          {formatBalance(Math.abs(account.balance), account.currency)}
        </Text>
        {account.transaction_count !== undefined && (
          <Text style={styles.transactionCount}>
            {account.transaction_count} transactions
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAddAccountCard = () => (
    <TouchableOpacity
      style={styles.addAccountCard}
      onPress={onAddAccount}
      activeOpacity={0.8}
    >
      <View style={styles.addIconContainer}>
        <Text style={styles.addIcon}>+</Text>
      </View>
      <Text style={styles.addAccountText}>Add Account</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={screenWidth * 0.75}
        snapToAlignment="start"
      >
        {accounts.map(renderAccountCard)}
        {renderAddAccountCard()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.xl,
  },
  accountCard: {
    width: screenWidth * 0.7,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  accountIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  accountType: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  balanceSection: {
    alignItems: 'flex-start',
  },
  balance: {
    ...typography.h2,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  transactionCount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  addAccountCard: {
    width: screenWidth * 0.4,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginRight: spacing.md,
  },
  addIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  addIcon: {
    fontSize: 24,
    color: colors.background,
    fontWeight: 'bold',
  },
  addAccountText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});