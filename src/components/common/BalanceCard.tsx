import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { formatCurrency } from '../../utils/currency';

interface BalanceCardProps {
  title: string;
  balance: number;
  currency?: string;
  subtitle?: string;
  onPress?: () => void;
  variant?: 'default' | 'income' | 'expense';
  showTrend?: boolean;
  trendValue?: number;
  trendDirection?: 'up' | 'down';
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  balance,
  currency: currencyProp,
  subtitle,
  onPress,
  variant = 'default',
  showTrend = false,
  trendValue,
  trendDirection,
}) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const currency = currencyProp || displayCurrency || 'USD';

  const formatBalance = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const getBalanceColor = () => {
    if (variant === 'income') return colors.income;
    if (variant === 'expense') return colors.expense;
    return balance >= 0 ? colors.income : colors.expense;
  };

  const getTrendColor = () => {
    if (!trendDirection) return colors.textSecondary;
    return trendDirection === 'up' ? colors.income : colors.expense;
  };

  const CardComponent: React.ComponentType<any> = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.container, variant !== 'default' && styles[variant]]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showTrend && trendValue !== undefined && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trendDirection === 'up' ? '↗' : '↘'} {Math.abs(trendValue)}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.balance, { color: getBalanceColor() }]}>
        {balance < 0 && variant === 'default' ? '-' : ''}
        {formatBalance(balance)}
      </Text>
      
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </CardComponent>
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
  income: {
    backgroundColor: colors.income,
  },
  expense: {
    backgroundColor: colors.expense,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});