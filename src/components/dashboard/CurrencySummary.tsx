import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Account } from '../../types/index';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface CurrencySummaryProps {
  accounts: Account[];
}

interface CurrencyBalances {
  [currencyCode: string]: number;
}

const CurrencySummary: React.FC<CurrencySummaryProps> = ({ accounts }) => {
  // Safety check for accounts array
  if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
    return null;
  }

  const currencyBalances = accounts.reduce((acc, account) => {
    if (!account || !account.currency) return acc;
    
    if (!acc[account.currency]) {
      acc[account.currency] = 0;
    }
    acc[account.currency] += account.balance || 0;
    return acc;
  }, {} as CurrencyBalances);

  const sortedCurrencies = Object.keys(currencyBalances).sort();

  if (sortedCurrencies.length <= 1) {
    return null; // Don't show summary if only one or zero currencies
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance by Currency</Text>
      {sortedCurrencies.map((currencyCode) => (
        <View key={currencyCode} style={styles.currencyRow}>
          <Text style={styles.currencyCode}>{currencyCode}</Text>
          <Text style={styles.currencyBalance}>
            {formatCurrency(currencyBalances[currencyCode], currencyCode)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  currencyCode: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  currencyBalance: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
});

export default CurrencySummary;
