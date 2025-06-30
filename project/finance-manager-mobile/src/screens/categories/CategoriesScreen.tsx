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
import { showPremiumModal } from '../../store/slices/uiSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { SUBSCRIPTION_TIERS } from '../../config/api';

interface CategoriesScreenProps {
  navigation: any;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

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
    return categories.filter(cat => cat.is_custom);
  };

  const getDefaultCategories = () => {
    return categories.filter(cat => !cat.is_custom);
  };

  const canAddCategory = () => {
    if (!profile) return false;
    
    const isFreeTier = profile.subscription_tier === 'free';
    const customCategoryLimit = SUBSCRIPTION_TIERS.FREE.custom_categories;
    const customCategoriesCount = getCustomCategories().length;
    
    return !isFreeTier || customCategoriesCount < customCategoryLimit;
  };

  const handleAddCategory = () => {
    if (canAddCategory()) {
      navigation.navigate('AddEditCategory');
    } else {
      Alert.alert(
        'Category Limit Reached',
        `Free tier allows up to ${SUBSCRIPTION_TIERS.FREE.custom_categories} custom categories. Upgrade to Premium for unlimited categories.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => dispatch(showPremiumModal()),
          },
        ]
      );
    }
  };

  const handleEditCategory = (category: any) => {
    if (category.is_custom) {
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
    if (!category.is_custom) {
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
            {item.is_custom ? 'Custom' : 'Default'} • {item.transaction_count || 0} transactions
          </Text>
          {item.description && (
            <Text style={styles.categoryDescription}>{item.description}</Text>
          )}
        </View>
      </View>
      <View style={styles.categoryActions}>
        {item.is_custom && (
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
            {profile?.subscription_tier === 'free' ? ` / ${SUBSCRIPTION_TIERS.FREE.custom_categories}` : ''}
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

  const defaultCategories = getDefaultCategories();
  const customCategories = getCustomCategories();

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
          { type: 'section', title: 'Default Categories' },
          ...defaultCategories.map(cat => ({ ...cat, type: 'category' })),
          { type: 'section', title: 'Custom Categories' },
          ...customCategories.map(cat => ({ ...cat, type: 'category' })),
        ]}
        renderItem={({ item }) => {
          if (item.type === 'header') return renderHeader();
          if (item.type === 'section') return renderSectionHeader(item.title);
          return renderCategoryItem({ item });
        }}
        keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          !canAddCategory() && styles.fabDisabled,
        ]}
        onPress={handleAddCategory}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
    paddingVertical: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  sectionHeader: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  fabIcon: {
    fontSize: 24,
    color: colors.background,
    fontWeight: 'bold',
  },
});

export default CategoriesScreen;