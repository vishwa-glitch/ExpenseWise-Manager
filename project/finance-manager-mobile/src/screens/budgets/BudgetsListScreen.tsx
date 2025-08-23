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
import { fetchBudgets, deleteBudget } from '../../store/slices/budgetsSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { showPremiumModal } from '../../store/slices/uiSlice';
import { BudgetCard } from '../../components/common/BudgetCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { SUBSCRIPTION_TIERS } from '../../config/api';
import { RootState } from '../../store';

interface BudgetsListScreenProps {
  navigation: any;
}

const BudgetsListScreen: React.FC<BudgetsListScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const budgetsSelector = (state: RootState) => state.budgets;
  const userSelector = (state: RootState) => state.user;
  const authSelector = (state: RootState) => state.auth;

  const { budgets, isLoading } = useTypedSelector(budgetsSelector);
  const { profile } = useTypedSelector(userSelector);
  const { isAuthenticated } = useTypedSelector(authSelector);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) {
      console.log(' Skipping budgets data load - user not authenticated');
      return;
    }

    try {
      console.log(' Loading budgets data for authenticated user');
      await Promise.all([
        dispatch(fetchBudgets()),
        dispatch(fetchUserProfile()),
      ]);
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

  const canCreateBudget = () => {
    if (!profile) return false;
    
    const isFreeTier = profile.subscription_tier === 'free';
    // For now, let's allow unlimited budgets for both tiers
    // You can adjust this based on your business logic
    return true;
  };

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
            onPress: () => dispatch(showPremiumModal()),
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
    return getActiveBudgets().reduce((total: number, budget: any) => total + (budget.spent || 0), 0);
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
          <Text style={styles.summaryIcon}>📊</Text>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryValue}>
            ₹{calculateTotalBudgetAmount().toLocaleString('en-IN')}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💸</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>
            ₹{calculateTotalSpent().toLocaleString('en-IN')}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💰</Text>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text style={[
            styles.summaryValue,
            { color: (calculateTotalBudgetAmount() - calculateTotalSpent()) >= 0 ? colors.income : colors.expense }
          ]}>
            ₹{(calculateTotalBudgetAmount() - calculateTotalSpent()).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getActiveBudgets().length}</Text>
          <Text style={styles.statLabel}>Active Budgets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getInactiveBudgets().length}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{budgets.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
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
      <Text style={styles.emptyIcon}>📊</Text>
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
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateBudget}
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
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
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
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
});

export default BudgetsListScreen;