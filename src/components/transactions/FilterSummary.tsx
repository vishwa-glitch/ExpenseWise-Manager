import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface FilterSummaryProps {
  activeFiltersCount: number;
  totalTransactions: number;
  filteredTransactions: number;
  filterDescription: string;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const FilterSummary: React.FC<FilterSummaryProps> = ({
  activeFiltersCount,
  totalTransactions,
  filteredTransactions,
  filterDescription,
  onClearFilters,
  isLoading = false,
}) => {
  if (activeFiltersCount === 0) {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {isLoading ? 'Loading...' : `${totalTransactions} transactions`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.activeSummaryContainer}>
      <View style={styles.summaryContent}>
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
        </View>
        <View style={styles.summaryTextContainer}>
          <Text style={styles.activeSummaryText}>
            {isLoading ? 'Filtering...' : `${filteredTransactions} of ${totalTransactions} transactions`}
          </Text>
          <Text style={styles.filterDescriptionText} numberOfLines={2}>
            {filterDescription}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={onClearFilters}
        disabled={isLoading}
      >
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeSummaryContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  activeSummaryText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  filterDescriptionText: {
    ...typography.small,
    color: colors.primary + 'CC',
    lineHeight: 16,
  },
  clearButton: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  clearButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default FilterSummary;