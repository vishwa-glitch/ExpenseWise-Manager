import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { CustomButton } from '../common/CustomButton';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchCategories } from '../../store/slices/categoriesSlice';

interface CategoryFilterOption {
  id: string;
  name: string;
  icon?: string | null;
}

// Filter Data Definitions
const timePeriodFilters = [
  { id: 'all', label: 'All Time', active: true },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' }
];

const typeFilters = [
  { id: 'all-types', label: 'All Types' },
  { id: 'income', label: 'Income', color: '#4CAF50' },
  { id: 'expense', label: 'Expenses', color: '#F44336' },
  { id: 'transfer', label: 'Transfers', color: '#2196F3' }
];

const getCategoryIcon = (category: CategoryFilterOption) => {
  const iconMap: Record<string, string> = {
    utensils: '🍽️',
    car: '🚗',
    'shopping-bag': '🛍️',
    film: '🎬',
    zap: '⚡',
    heart: '🏥',
    book: '📚',
    plane: '✈️',
    briefcase: '💼',
    'trending-up': '📈',
    home: '🏠',
    phone: '📱',
    gift: '🎁',
    coffee: '☕',
    music: '🎵',
    camera: '📷',
    gamepad: '🎮',
    dumbbell: '🏋️',
    palette: '🎨',
    tool: '🔧',
    tag: '🏷️',
  };

  if (category?.icon && iconMap[category.icon]) {
    return iconMap[category.icon];
  }

  return '🏷️';
};

interface TransactionFiltersProps {
  activeTimePeriod: string;
  activeCategories: string[];
  activeType: string;
  onTimePeriodChange: (period: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onTypeChange: (type: string) => void;
  onCustomDateRange: (startDate: string, endDate: string) => void;
  onClearFilters: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  activeTimePeriod,
  activeCategories,
  activeType,
  onTimePeriodChange,
  onCategoryToggle,
  onTypeChange,
  onCustomDateRange,
  onClearFilters,
}) => {
  const dispatch = useAppDispatch();
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { categories, isLoading, error } = useTypedSelector((state) => state.categories);

  useEffect(() => {
    if (categories.length === 0 && !isLoading && !error) {
      dispatch(fetchCategories());
    }
  }, [categories.length, dispatch, error, isLoading]);

  const categoryFilters = useMemo(() => {
    const dynamicCategories = categories
      .filter((category: CategoryFilterOption | null | undefined): category is CategoryFilterOption => Boolean(category?.id && category?.name))
      .map((category) => ({
        id: category.id,
        label: category.name,
        icon: getCategoryIcon(category),
      }));

    return [
      { id: 'all-categories', label: 'All Categories', icon: '📊' },
      ...dynamicCategories,
    ];
  }, [categories]);

  const handleTimePeriodPress = (periodId: string) => {
    if (periodId === 'custom') {
      setShowCustomDateModal(true);
    } else {
      onTimePeriodChange(periodId);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      onCustomDateRange(customStartDate, customEndDate);
      setShowCustomDateModal(false);
      onTimePeriodChange('custom');
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeTimePeriod !== 'all') count++;
    if (activeCategories.length > 0 && !activeCategories.includes('all-categories')) count++;
    if (activeType !== 'all-types') count++;
    return count;
  };

  const renderTimePeriodFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Time Period</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
      >
        {timePeriodFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeTimePeriod === filter.id && styles.filterChipActive
            ]}
            onPress={() => handleTimePeriodPress(filter.id)}
          >
            <Text style={[
              styles.filterChipText,
              activeTimePeriod === filter.id && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTypeFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Transaction Type</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
      >
        {typeFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeType === filter.id && styles.filterChipActive,
              filter.color && activeType === filter.id && { borderColor: filter.color }
            ]}
            onPress={() => onTypeChange(filter.id)}
          >
            <Text style={[
              styles.filterChipText,
              activeType === filter.id && styles.filterChipTextActive,
              filter.color && activeType === filter.id && { color: filter.color }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategoryFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
      >
        {categoryFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.categoryChip,
              activeCategories.includes(filter.id) && styles.filterChipActive
            ]}
            onPress={() => onCategoryToggle(filter.id)}
          >
            <Text style={styles.categoryIcon}>{filter.icon}</Text>
            <Text style={[
              styles.categoryChipText,
              activeCategories.includes(filter.id) && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading && categories.length === 0 ? (
        <Text style={styles.loadingHelper}>Loading categories...</Text>
      ) : null}
    </View>
  );

  const renderCustomDateModal = () => (
    <Modal
      visible={showCustomDateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCustomDateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Custom Date Range</Text>
          
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <TextInput
              style={styles.dateInput}
              value={customStartDate}
              onChangeText={setCustomStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>End Date</Text>
            <TextInput
              style={styles.dateInput}
              value={customEndDate}
              onChangeText={setCustomEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.modalActions}>
            <CustomButton
              title="Cancel"
              onPress={() => setShowCustomDateModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <CustomButton
              title="Apply"
              onPress={handleCustomDateSubmit}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      {renderTimePeriodFilters()}
      {renderTypeFilters()}
      {renderCategoryFilters()}
      
      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <View style={styles.clearFiltersContainer}>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={onClearFilters}
          >
            <Text style={styles.clearFiltersText}>
              Clear All Filters ({activeFiltersCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {renderCustomDateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: spacing.md,
  },
  loadingHelper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    marginTop: spacing.xs,
  },
  filterRow: {
    marginBottom: 4,
  },
  filterRowContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: Math.round(spacing.sm * 1.15),
    paddingVertical: Math.round(6 * 1.15),
    borderRadius: 18,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: Math.round(28 * 1.15),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: Math.round(44 * 1.15), // Better touch target
  },
  filterChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: Math.round(11 * 1.15),
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: Math.round(spacing.sm * 1.15),
    paddingVertical: Math.round(6 * 1.15),
    borderRadius: 16,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: Math.round(32 * 1.15),
    maxWidth: Math.round(120 * 1.15),
    minWidth: Math.round(44 * 1.15), // Better touch target
  },
  categoryIcon: {
    fontSize: Math.round(12 * 1.15),
    marginRight: Math.round(4 * 1.15),
  },
  categoryChipText: {
    fontSize: Math.round(10 * 1.15),
    color: colors.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  clearFiltersContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  clearFiltersButton: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: Math.round(spacing.md * 1.15),
    paddingVertical: Math.round(6 * 1.15),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error,
    alignSelf: 'flex-start',
    minHeight: Math.round(32 * 1.15), // Better touch target
  },
  clearFiltersText: {
    fontSize: Math.round(10 * 1.15),
    color: colors.error,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dateInputContainer: {
    marginBottom: spacing.md,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default TransactionFilters;
