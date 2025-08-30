import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchCategories, deleteCategory } from '../../store/slices/categoriesSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';

import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { FREE_TIER_LIMITS } from '../../utils/subscriptionUtils';
import OnboardingOverlay from '../../components/common/OnboardingOverlay';
import { useOnboardingOverlay } from '../../hooks/useOnboardingOverlay';



interface CategoriesScreenProps {
  navigation: any;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  
  // Onboarding overlay hook
  const onboardingOverlay = useOnboardingOverlay();

  const { categories, isLoading } = useTypedSelector((state) => state.categories);
  const { profile } = useTypedSelector((state) => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchUserProfile()),
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getCustomCategories = () => {
    return categories.filter(cat => !cat.is_default);
  };

  const getDefaultCategories = () => {
    return categories.filter(cat => cat.is_default);
  };

  const handleAddCategory = () => {
    navigation.navigate('AddEditCategory');
  };

  const handleEditCategory = (category: any) => {
    if (!category.is_default) {
      navigation.navigate('AddEditCategory', {
        categoryId: category.id,
        category: category,
      });
    } else {
      Alert.alert(
        'Cannot Edit',
        'Default categories cannot be edited. You can create custom categories instead.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteCategory = (category: any) => {
    if (category.is_default) {
      Alert.alert(
        'Cannot Delete',
        'Default categories cannot be deleted.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone and may affect existing transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCategory(category.id)).unwrap();
              // Refresh the list
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: any) => {
    // If category has an icon property, use it
    if (category.icon) {
      // Map backend icon names to emojis
      const iconMap: { [key: string]: string } = {
        'utensils': '🍽️',
        'car': '🚗',
        'shopping-bag': '🛍️',
        'film': '🎬',
        'zap': '⚡',
        'heart': '🏥',
        'book': '📚',
        'plane': '✈️',
        'briefcase': '💼',
        'trending-up': '📈',
        'home': '🏠',
        'phone': '📱',
        'gift': '🎁',
        'coffee': '☕',
        'music': '🎵',
        'camera': '📷',
        'gamepad': '🎮',
        'dumbbell': '🏋️',
        'palette': '🎨',
        'tool': '🔧',
        'tag': '🏷️',
      };
      
      return iconMap[category.icon] || '🏷️';
    }
    
    // Fallback to name-based icons
    const name = category.name?.toLowerCase() || '';
    if (name.includes('food') || name.includes('dining')) return '🍽️';
    if (name.includes('transport') || name.includes('car')) return '🚗';
    if (name.includes('shop') || name.includes('retail')) return '🛍️';
    if (name.includes('entertainment') || name.includes('movie')) return '🎬';
    if (name.includes('utilities') || name.includes('electric')) return '⚡';
    if (name.includes('health') || name.includes('medical')) return '🏥';
    if (name.includes('education') || name.includes('school')) return '📚';
    if (name.includes('travel') || name.includes('vacation')) return '✈️';
    if (name.includes('salary') || name.includes('income')) return '💼';
    if (name.includes('investment') || name.includes('stock')) return '📈';
    
    return '🏷️'; // Default fallback
  };

  const renderDefaultCategoryGrid = () => {
    const defaultCategories = getDefaultCategories();
    
    return (
      <View style={styles.defaultCategoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Default Categories</Text>
        </View>
        <View style={styles.gridContainer}>
          {defaultCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={styles.gridItem}
              onPress={() => handleEditCategory(category)}
            >
              <View style={styles.gridItemContent}>
                <Text style={styles.gridItemIcon}>
                  {getCategoryIcon(category)}
                </Text>
                <Text style={styles.gridItemName} numberOfLines={2}>
                  {category.name}
                </Text>
                <Text style={styles.gridItemCount}>
                  {category.transaction_count || 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderCustomCategoriesSection = () => {
    const customCategories = getCustomCategories();
    
    return (
      <View style={styles.customCategoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Custom Categories</Text>
        </View>
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={handleAddCategory}
        >
          <Text style={styles.addCustomButtonText}>Add Custom</Text>
        </TouchableOpacity>
        {customCategories.length > 0 && (
          <View style={styles.customCategoriesList}>
            {customCategories.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryColor,
                      { backgroundColor: category.color || colors.primary },
                    ]}
                  />
                  <Text style={styles.categoryIcon}>
                    {getCategoryIcon(category)}
                  </Text>
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryType}>
                      Custom • {category.transaction_count || 0} transactions
                    </Text>
                    {category.description && (
                      <Text style={styles.categoryDescription}>{category.description}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditCategory(category)}
                  >
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteCategory(category)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryLeft}>
        <View
          style={[
            styles.categoryColor,
            { backgroundColor: item.color || colors.primary },
          ]}
        />
        <Text style={styles.categoryIcon}>
          {getCategoryIcon(item)}
        </Text>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryType}>
            {!item.is_default ? 'Custom' : 'Default'} • {item.transaction_count || 0} transactions
          </Text>
          {item.description && (
            <Text style={styles.categoryDescription}>{item.description}</Text>
          )}
        </View>
      </View>
      <View style={styles.categoryActions}>
        {!item.is_default && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditCategory(item)}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCategory(item)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getDefaultCategories().length}</Text>
          <Text style={styles.statLabel}>Default</Text>
        </View>
                 <View style={styles.statItem}>
           <Text style={styles.statNumber}>
             {getCustomCategories().length}
           </Text>
           <Text style={styles.statLabel}>Custom</Text>
         </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏷️</Text>
      <Text style={styles.emptyTitle}>No Categories Available</Text>
      <Text style={styles.emptyMessage}>
        Categories help organize your transactions. Add your first custom category to get started.
      </Text>
      <TouchableOpacity
        style={styles.addFirstCategoryButton}
        onPress={handleAddCategory}
      >
        <Text style={styles.addFirstCategoryText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Categories</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={[
          { type: 'header' },
          { type: 'default-grid' },
          { type: 'custom-section' },
        ]}
        renderItem={({ item }) => {
          if (item.type === 'header') return renderHeader();
          if (item.type === 'default-grid') return renderDefaultCategoryGrid();
          if (item.type === 'custom-section') return renderCustomCategoriesSection();
          return null;
        }}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
                 contentContainerStyle={styles.listContent}
         showsVerticalScrollIndicator={false}
       />

       {/* Onboarding Overlay - show for step 6 (categories) */}
       {onboardingOverlay.isVisible && onboardingOverlay.currentStep === 6 && (
         <OnboardingOverlay
           isVisible={onboardingOverlay.isVisible}
           currentStep={onboardingOverlay.currentStep}
           totalSteps={onboardingOverlay.totalSteps}
           steps={onboardingOverlay.steps}
           onNext={onboardingOverlay.handleNext}
           onSkip={onboardingOverlay.handleSkip}
           onComplete={onboardingOverlay.handleComplete}
         />
       )}
     </SafeAreaView>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  screenTitle: {
    ...typography.h3,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  defaultCategoriesSection: {
    marginBottom: spacing.lg,
  },
  customCategoriesSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
  },
  gridItemContent: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridItemIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  gridItemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontSize: 12,
    lineHeight: 16,
  },
  gridItemCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  addCustomButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  addCustomButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  customCategoriesList: {
    marginTop: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  categoryType: {
    ...typography.small,
    color: colors.textSecondary,
  },
  categoryDescription: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  addFirstCategoryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addFirstCategoryText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default CategoriesScreen;