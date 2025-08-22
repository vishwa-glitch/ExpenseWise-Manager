import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { formatCurrency } from '../../utils/currency';

interface ExpandableBalanceCardProps {
  title: string;
  balance: number;
  currency?: string;
  subtitle?: string;
  accounts?: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    currency?: string;
  }>;
  showTrend?: boolean;
  trendValue?: number;
  trendDirection?: 'up' | 'down';
  onAccountPress?: (accountId: string) => void;
}

export const ExpandableBalanceCard: React.FC<ExpandableBalanceCardProps> = ({
  title,
  balance,
  currency: propCurrency,
  subtitle,
  accounts = [],
  showTrend = false,
  trendValue,
  trendDirection,
  onAccountPress,
}) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const currency = propCurrency || displayCurrency || 'USD';
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const formatBalance = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const getBalanceColor = () => {
    return balance >= 0 ? colors.income : colors.expense;
  };

  const getTrendColor = () => {
    if (!trendDirection) return colors.textSecondary;
    return trendDirection === 'up' ? colors.income : colors.expense;
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

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const expandedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, accounts.length * 70 + 20],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{title}</Text>
            {showTrend && trendValue !== undefined && (
              <View style={styles.trendContainer}>
                <Text style={[styles.trendText, { color: getTrendColor() }]}>
                  {trendDirection === 'up' ? '↗' : '↘'} {Math.abs(trendValue)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>
        
        <Text style={[styles.balance, { color: getBalanceColor() }]}>
          {balance < 0 ? '-' : ''}
          {formatBalance(Math.abs(balance))}
        </Text>
        
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </TouchableOpacity>

      {accounts.length > 0 && (
        <Animated.View style={[styles.expandedContent, { height: expandedHeight }]}>
          <View style={styles.accountsList}>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={styles.accountItem}
                onPress={() => onAccountPress?.(account.id)}
                activeOpacity={0.7}
              >
                <View style={styles.accountLeft}>
                  <Text style={styles.accountIcon}>
                    {getAccountTypeIcon(account.type)}
                  </Text>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountType}>
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.accountBalance,
                  { color: account.balance >= 0 ? colors.income : colors.expense }
                ]}>
                  {formatCurrency(account.balance, account.currency || propCurrency || displayCurrency || 'USD')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: spacing.md,
  },
  balance: {
    ...typography.h1,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  trendContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  trendText: {
    ...typography.small,
    fontWeight: '600',
  },
  expandIcon: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  expandedContent: {
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  accountsList: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  accountType: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  accountBalance: {
    ...typography.body,
    fontWeight: 'bold',
  },
});