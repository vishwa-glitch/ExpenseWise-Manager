import React, { useEffect, useState, useRef } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchBudgets, deleteBudget } from '../../store/slices/budgetsSlice';
import { renewExpiredBudgets } from '../../services/budgetRenewalService';

import { BudgetCard } from '../../components/common/BudgetCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { RootState } from '../../store';
import { formatCurrency } from '../../utils/currency';
import OnboardingOverlay from '../../components/common/OnboardingOverlay';
import { useOnboardingOverlay } from '../../hooks/useOnboardingOverlay';

interface BudgetsListScreenProps {
  navigation: any;
}

const BudgetsListScreen: React.FC<BudgetsListScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Onboarding overlay hook
  const onboardingOverlay = useOnboardingOverlay();

  const budgetsSelector = (state: RootState) => state.budgets;
  const authSelector = (state: RootState) => state.auth;

  const { budgets, isLoading } = useTypedSelector(budgetsSelector);
  const { isAuthenticated } = useTypedSelector(authSelector);
  const { displayCurrency } = useTypedSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle screen focus to refresh data and restore scroll functionality
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        console.log(' Budget screen focused - refreshing data');
        loadData();
      }
      
      // Reset scroll position and ensure FlatList is properly initialized
      if (flatListRef.current) {
        // Small delay to ensure the component is fully rendered
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }, 100);
      }
    }, [isAuthenticated])
  );

  const restoreScrollPosition = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const loadData = async () => {
    if (!isAuthenticated) {
      console.log(' Skipping budgets data load - user not authenticated');
      return;
    }

    try {
      console.log(' Loading budgets data for authenticated user');
      
      // Check for budget renewals before loading data
      try {
        console.log('🔄 Checking for budget renewals...');
        const renewalResult = await renewExpiredBudgets();
        if (renewalResult.renewed.length > 0) {
          console.log(`✅ Renewed ${renewalResult.renewed.length} budget(s)`);
        }
      } catch (error) {
        console.error('❌ Error during budget renewal check:', error);
      }

      // Only fetch budgets here to avoid redundant fetching that can cause extra re-renders
      await dispatch(fetchBudgets());
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log(' Skipping refresh - user not authenticated');
      return;
    }

    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getActiveBudgets = () => {
    return budgets.filter((budget: any) => budget.is_active);
  };

  const getInactiveBudgets = () => {
    return budgets.filter((budget: any) => !budget.is_active);
  };

  const canCreateBudget = () => true;

  const handleCreateBudget = () => {
    if (canCreateBudget()) {
      navigation.navigate('CreateBudget');
    } else {
      Alert.alert(
        'Budget Limit Reached',
        'Upgrade to Premium for unlimited budgets.',
        [
          { text: 'Cancel', style: 'cancel' },
                  {
          text: 'Upgrade',
          onPress: () => {
            // TODO: Implement premium upgrade
            Alert.alert('Premium Feature', 'Premium upgrade functionality coming soon!');
          },
        },
        ]
      );
    }
  };

  const handleBudgetPress = (budget: any) => {
    navigation.navigate('BudgetDetail', { budgetId: budget.id });
  };

  const handleEditBudget = (budget: any) => {
    navigation.navigate('EditBudget', { budgetId: budget.id, budget });
  };

  const handleDeleteBudget = (budget: any) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budget.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteBudget(budget.id)).unwrap();
              await loadData(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget. Please try again.');
            }
          },
        },
      ]
    );
  };

  const calculateTotalBudgetAmount = () => {
    return getActiveBudgets().reduce((total: number, budget: any) => total + budget.amount, 0);
  };

  const calculateTotalSpent = () => {
    return getActiveBudgets().reduce((total: number, budget: any) => total + (budget.spent_amount || 0), 0);
  };

  const formatCurrencyAmount = (amount: number) => {
    return formatCurrency(amount, displayCurrency);
  };

  const renderBudgetItem = ({ item }: { item: any }) => (
    <BudgetCard
      budget={item}
      onPress={() => handleBudgetPress(item)}
      onEdit={() => handleEditBudget(item)}
      onDelete={() => handleDeleteBudget(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryValue}>
            {formatCurrencyAmount(calculateTotalBudgetAmount())}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💸</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>
            {formatCurrencyAmount(calculateTotalSpent())}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💵</Text>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text style={[
            styles.summaryValue,
            { color: (calculateTotalBudgetAmount() - calculateTotalSpent()) >= 0 ? colors.income : colors.expense }
          ]}>
            {formatCurrencyAmount(calculateTotalBudgetAmount() - calculateTotalSpent())}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.summaryCard}
          onPress={() => navigation.navigate('BudgetAnalytics')}
          activeOpacity={0.8}
        >
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryLabel}>Analytics</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            View
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Budgets</Text>
        <TouchableOpacity onPress={handleCreateBudget}>
          <Text style={styles.addButtonText}>+ Add Budget</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📈</Text>
      <Text style={styles.emptyTitle}>No Budgets Yet</Text>
      <Text style={styles.emptyMessage}>
        Create your first budget to start tracking your spending and stay on top of your finances.
      </Text>
      <TouchableOpacity
        style={styles.createFirstBudgetButton}
        onPress={handleCreateBudget}
      >
        <Text style={styles.createFirstBudgetText}>Create Your First Budget</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated || (isLoading && budgets.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateBudget}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Onboarding Overlay - show for step 4 (budgets) only */}
      {onboardingOverlay.isVisible && onboardingOverlay.currentStep === 4 && (
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
  fabIcon: {
    fontSize: 24,
    color: colors.background,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm, // Add some padding to center the smaller cards
  },
  summaryCard: {
    width: '48.07%', // Increased from 43.7% by 10%
    backgroundColor: colors.card,
    borderRadius: 10, // Reduced from 12
    padding: spacing.xs, // Reduced from spacing.sm
    alignItems: 'center',
    marginBottom: spacing.sm, // Reduced from spacing.md
    minHeight: 110, // Added minimum height (10% taller than default)
    justifyContent: 'center', // Center content vertically
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryIcon: {
    fontSize: 19, // Increased by 5% from 18
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 11, // Increased by 5% from 10
  },
  summaryValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14, // Increased by 5% from 13
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
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
  createFirstBudgetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  createFirstBudgetText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default BudgetsListScreen;
