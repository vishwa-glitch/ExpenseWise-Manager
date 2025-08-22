import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface EmptyTransactionsStateProps {
  hasFilters: boolean;
  hasSearch: boolean;
  filterDescription?: string;
  onClearFilters?: () => void;
  onAddTransaction?: () => void;
  isLoading?: boolean;
}

const EmptyTransactionsState: React.FC<EmptyTransactionsStateProps> = ({
  hasFilters,
  hasSearch,
  filterDescription,
  onClearFilters,
  onAddTransaction,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>⏳</Text>
        <Text style={styles.title}>Loading transactions...</Text>
        <Text style={styles.message}>Please wait while we fetch your data</Text>
      </View>
    );
  }

  if (hasFilters || hasSearch) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔍</Text>
        <Text style={styles.title}>No matching transactions</Text>
        <Text style={styles.message}>
          No transactions found matching your current filters
          {filterDescription && `: ${filterDescription}`}
        </Text>
        <View style={styles.actionContainer}>
          {onClearFilters && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onClearFilters}
            >
              <Text style={styles.primaryButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
          {onAddTransaction && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onAddTransaction}
            >
              <Text style={styles.secondaryButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📋</Text>
      <Text style={styles.title}>No transactions yet</Text>
      <Text style={styles.message}>
        Start tracking your finances by adding your first transaction
      </Text>
      {onAddTransaction && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onAddTransaction}
        >
          <Text style={styles.primaryButtonText}>Add Your First Transaction</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  actionContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 200,
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 200,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EmptyTransactionsState;