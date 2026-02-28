import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface FilterChip {
  id: string;
  label: string;
  type: 'date' | 'amount' | 'pattern' | 'category';
  icon?: string;
}

interface QuickFiltersProps {
  activeFilters: string[];
  onFilterToggle: (filterId: string) => void;
  categories?: Array<{ id: string; name: string; icon?: string }>;
}

const QUICK_FILTERS: FilterChip[] = [
  { id: 'this_week', label: 'This Week', type: 'date', icon: '📅' },
  { id: 'this_month', label: 'This Month', type: 'date', icon: '📅' },
  { id: 'last_month', label: 'Last Month', type: 'date', icon: '📅' },
  { id: 'last_3_months', label: 'Last 3 Months', type: 'date', icon: '📅' },
  { id: 'high_amount', label: 'High Amount (>₹5000)', type: 'amount', icon: '💰' },
  { id: 'recurring', label: 'Recurring', type: 'pattern', icon: '🔄' },
  { id: 'uncategorized', label: 'Uncategorized', type: 'pattern', icon: '❓' },
];

const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilters,
  onFilterToggle,
  categories = [],
}) => {
  // Create category filter chips from top 5 categories
  const categoryChips: FilterChip[] = categories.slice(0, 5).map(cat => ({
    id: `category_${cat.id}`,
    label: cat.name,
    type: 'category',
    icon: cat.icon || '🏷️',
  }));

  const allFilterChips = [...QUICK_FILTERS, ...categoryChips];

  const renderFilterChip = (chip: FilterChip) => {
    const isActive = activeFilters.includes(chip.id);
    
    return (
      <TouchableOpacity
        key={chip.id}
        style={[
          styles.filterChip,
          isActive && styles.filterChipActive
        ]}
        onPress={() => onFilterToggle(chip.id)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${chip.label} filter`}
        accessibilityHint={`${isActive ? 'Remove' : 'Apply'} ${chip.label} filter to transactions`}
        accessibilityState={{ selected: isActive }}
      >
        {chip.icon && (
          <Text style={styles.filterChipIcon} accessibilityHidden={true}>
            {chip.icon}
          </Text>
        )}
        <Text style={[
          styles.filterChipText,
          isActive && styles.filterChipTextActive
        ]}>
          {chip.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Transaction filters"
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterChipsContainer}
        contentContainerStyle={styles.filterChipsContent}
        accessible={true}
        accessibilityLabel="Filter options"
        accessibilityHint="Swipe left or right to see more filter options"
      >
        {allFilterChips.map(renderFilterChip)}
      </ScrollView>
      
      {activeFilters.length > 0 && (
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={() => {
            // Clear all active filters
            activeFilters.forEach(filterId => onFilterToggle(filterId));
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Clear all ${activeFilters.length} active filters`}
          accessibilityHint="Removes all currently applied filters"
        >
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  filterChipsContainer: {
    marginBottom: spacing.xs,
  },
  filterChipsContent: {
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 28,
  },
  filterChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterChipIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  clearAllButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    marginLeft: spacing.xs,
  },
  clearAllText: {
    fontSize: 10,
    color: colors.error,
    fontWeight: '600',
  },
});

export default QuickFilters;