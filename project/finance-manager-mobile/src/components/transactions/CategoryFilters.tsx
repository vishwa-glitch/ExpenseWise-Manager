import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { getCategoryColor, isGoalContribution, getCategoryDisplayName } from '../../utils/categoryColors';

interface CategoryFilterData {
  id: string;
  name: string;
  icon?: string;
  transactionCount?: number;
}

interface CategoryFiltersProps {
  categories: CategoryFilterData[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  maxVisible?: number;
  showTransactionCount?: boolean;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  maxVisible = 5,
  showTransactionCount = false,
}) => {
  const visibleCategories = categories.slice(0, maxVisible);

  const renderCategoryChip = (category: CategoryFilterData) => {
    const isSelected = selectedCategories.includes(category.id);
    const isGoalCategory = isGoalContribution(category.name);
    const categoryColor = getCategoryColor(category.name);
    const transactionCountText = showTransactionCount && category.transactionCount !== undefined 
      ? ` with ${category.transactionCount} transactions` 
      : '';
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryChip,
          isSelected && styles.categoryChipSelected,
          isGoalCategory && styles.goalCategoryChip,
          isSelected && isGoalCategory && styles.goalCategoryChipSelected,
        ]}
        onPress={() => onCategoryToggle(category.id)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${category.name} category${transactionCountText}`}
        accessibilityHint={`${isSelected ? 'Remove' : 'Add'} ${category.name} category filter`}
        accessibilityState={{ selected: isSelected }}
      >
        {category.icon && (
          <Text style={styles.categoryIcon} accessibilityHidden={true}>
            {category.icon}
          </Text>
        )}
        <View style={styles.categoryTextContainer}>
          <Text style={[
            styles.categoryName,
            isSelected && styles.categoryNameSelected,
            isGoalCategory && styles.goalCategoryName,
            isSelected && isGoalCategory && styles.goalCategoryNameSelected,
          ]}>
            {getCategoryDisplayName(category.name)}
          </Text>
          {showTransactionCount && category.transactionCount !== undefined && (
            <Text style={[
              styles.transactionCount,
              isSelected && styles.transactionCountSelected
            ]}>
              {category.transactionCount} transactions
            </Text>
          )}
        </View>
        {isSelected && (
          <Text style={styles.selectedIndicator} accessibilityHidden={true}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Category filters"
    >
      <Text 
        style={styles.sectionTitle}
        accessibilityRole="header"
        accessibilityLevel={3}
      >
        Categories
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
        accessible={true}
        accessibilityLabel="Category filter options"
        accessibilityHint="Swipe left or right to see more category options"
      >
        {visibleCategories.map(renderCategoryChip)}
      </ScrollView>
      
      {selectedCategories.length > 0 && (
        <View 
          style={styles.selectedSummary}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={`${selectedCategories.length} category${selectedCategories.length !== 1 ? 'ies' : ''} selected`}
        >
          <Text style={styles.selectedSummaryText}>
            {selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : ''} selected
          </Text>
          <TouchableOpacity
            style={styles.clearCategoriesButton}
            onPress={() => {
              selectedCategories.forEach(categoryId => onCategoryToggle(categoryId));
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear selected categories"
            accessibilityHint="Removes all selected category filters"
          >
            <Text style={styles.clearCategoriesText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: spacing.xs,
  },
  categoriesContainer: {
    marginBottom: spacing.xs,
  },
  categoriesContent: {
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 32,
    maxWidth: 120,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  transactionCount: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1,
  },
  transactionCountSelected: {
    color: colors.primary + '80',
  },
  selectedIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  selectedSummaryText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  clearCategoriesButton: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clearCategoriesText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: 'bold',
  },
  goalCategoryChip: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50' + '10',
  },
  goalCategoryChipSelected: {
    backgroundColor: '#4CAF50' + '30',
    borderColor: '#4CAF50',
  },
  goalCategoryName: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  goalCategoryNameSelected: {
    color: '#4CAF50',
    fontWeight: '700',
  },
});

export default CategoryFilters;