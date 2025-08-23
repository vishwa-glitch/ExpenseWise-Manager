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
import { fetchGoals, deleteGoal } from '../../store/slices/goalsSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { showPremiumModal } from '../../store/slices/uiSlice';
import { GoalCard } from '../../components/common/GoalCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { SUBSCRIPTION_TIERS } from '../../config/api';
import { RootState } from '../../store';

interface GoalsListScreenProps {
  navigation: any;
}

interface Goal {
  id: number;
  title: string;
  status: string;
  current_amount: number;
  target_amount: number;
}

const GoalsListScreen: React.FC<GoalsListScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { goals, isLoading } = useTypedSelector((state: RootState) => state.goals);
  const { profile } = useTypedSelector((state: RootState) => state.user);
  const { isAuthenticated } = useTypedSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping goals data load - user not authenticated');
      return;
    }

    try {
      console.log('🎯 Loading goals data for authenticated user');
      await Promise.all([
        dispatch(fetchGoals()),
        dispatch(fetchUserProfile()),
      ]);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping refresh - user not authenticated');
      return;
    }

    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getActiveGoals = () => {
    return goals.filter((goal: Goal) => goal.status === 'active');
  };

  const getCompletedGoals = () => {
    return goals.filter((goal: Goal) => goal.status === 'completed');
  };

  const canAddGoal = () => {
    if (!profile) return false;
    
    const isFreeTier = profile.subscription_tier === 'free';
    const activeGoalLimit = SUBSCRIPTION_TIERS.FREE.active_goals;
    const activeGoalsCount = getActiveGoals().length;
    
    return !isFreeTier || activeGoalsCount < activeGoalLimit;
  };

  const handleAddGoal = () => {
    if (canAddGoal()) {
      navigation.navigate('AddManualGoal');
    } else {
      Alert.alert(
        'Goal Limit Reached',
        `Free tier allows up to ${SUBSCRIPTION_TIERS.FREE.active_goals} active goal. Upgrade to Premium for unlimited goals.`,
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

  const handleAIGoalSetting = () => {
    // AI Goal Setting temporarily disabled
    Alert.alert(
      'Feature Coming Soon',
      'AI-powered goal setting will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleGoalPress = (goal: any) => {
    navigation.navigate('GoalDetail', { goalId: goal.id });
  };

  const handleDeleteGoal = (goal: any) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteGoal(goal.id)).unwrap();
              // Refresh the list
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const calculateTotalSavings = () => {
    return goals.reduce((total: number, goal: any) => total + goal.current_amount, 0);
  };

  const calculateTotalTarget = () => {
    return goals.reduce((total: number, goal: any) => total + goal.target_amount, 0);
  };

  const renderGoalItem = ({ item }: { item: any }) => (
    <GoalCard
      goal={item}
      onPress={() => handleGoalPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Enhanced Summary Cards with Progress */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Text style={styles.summaryIcon}>🎯</Text>
          </View>
          <Text style={styles.summaryLabel}>Active Goals</Text>
          <Text style={styles.summaryValue}>
            {getActiveGoals().length}
            {profile?.subscription_tier === 'free' ? ` / ${SUBSCRIPTION_TIERS.FREE.active_goals}` : ''}
          </Text>
          {profile?.subscription_tier === 'free' && (
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(getActiveGoals().length / SUBSCRIPTION_TIERS.FREE.active_goals) * 100}%` }
                ]} 
              />
            </View>
          )}
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Text style={styles.summaryIcon}>💰</Text>
          </View>
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>
            ₹{calculateTotalSavings().toLocaleString('en-IN')}
          </Text>
          <Text style={styles.summarySubtext}>
            of ₹{calculateTotalTarget().toLocaleString('en-IN')} target
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Text style={styles.summaryIcon}>🏆</Text>
          </View>
          <Text style={styles.summaryLabel}>Completed</Text>
          <Text style={styles.summaryValue}>
            {getCompletedGoals().length}
          </Text>
          <Text style={styles.summarySubtext}>
            {goals.length > 0 ? `${((getCompletedGoals().length / goals.length) * 100).toFixed(0)}% success rate` : 'No goals yet'}
          </Text>
        </View>
      </View>

      {/* Enhanced Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleAddGoal}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>➕</Text>
          </View>
          <Text style={styles.actionText}>Add Goal</Text>
          <Text style={styles.actionSubtext}>Create manually</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => navigation.navigate('GoalAnalytics')}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>📊</Text>
          </View>
          <Text style={styles.actionText}>Analytics</Text>
          <Text style={styles.actionSubtext}>View insights</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.aiAction]}
          onPress={handleAIGoalSetting}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🤖</Text>
          </View>
          <Text style={styles.actionText}>AI Assistant</Text>
          <Text style={styles.actionSubtext}>Coming soon</Text>
        </TouchableOpacity>
      </View>

      {/* Section Headers with Filter */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Goals</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🎯</Text>
      </View>
      <Text style={styles.emptyTitle}>Start Your Financial Journey</Text>
      <Text style={styles.emptyMessage}>
        Set meaningful financial goals to track your progress and turn your dreams into achievable milestones.
      </Text>
      
      {/* Goal Examples */}
      <View style={styles.goalExamples}>
        <Text style={styles.examplesTitle}>Popular goals:</Text>
        <View style={styles.examplesList}>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleIcon}>🚨</Text>
            <Text style={styles.exampleText}>Emergency Fund</Text>
          </View>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleIcon}>🏖️</Text>
            <Text style={styles.exampleText}>Dream Vacation</Text>
          </View>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleIcon}>🏠</Text>
            <Text style={styles.exampleText}>Home Down Payment</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.createFirstGoalButton}
        onPress={handleAddGoal}
      >
        <Text style={styles.createFirstGoalText}>Create Your First Goal</Text>
      </TouchableOpacity>
      
      {/* AI Option */}
      <TouchableOpacity
        style={styles.aiSuggestionButton}
        onPress={handleAIGoalSetting}
      >
        <Text style={styles.aiSuggestionText}>🤖 Get AI Suggestions (Coming Soon)</Text>
      </TouchableOpacity>
    </View>
  );


  if (!isAuthenticated || (isLoading && goals.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={goals}
        renderItem={renderGoalItem}
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
        style={[
          styles.fab,
          !canAddGoal() && styles.fabDisabled,
        ]}
        onPress={handleAddGoal}
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
  menuIcon: {
    fontSize: 24,
    color: colors.text,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
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
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryIcon: {
    fontSize: 20,
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
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryAction: {
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  secondaryAction: {
    backgroundColor: colors.card,
  },
  aiAction: {
    backgroundColor: colors.accent + '10',
    borderWidth: 2,
    borderColor: colors.accent + '30',
    opacity: 0.7,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  actionSubtext: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  filterIcon: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  goalExamples: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  examplesTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  examplesList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  exampleItem: {
    alignItems: 'center',
    flex: 1,
  },
  exampleIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  exampleText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  createFirstGoalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  createFirstGoalText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  aiSuggestionButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiSuggestionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
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

export default GoalsListScreen;