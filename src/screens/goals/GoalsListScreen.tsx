import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchGoals, fetchGoal, deleteGoal, contributeToGoal } from '../../store/slices/goalsSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';

import { GoalCard, LoadingSpinner } from '../../components/common';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import OnboardingOverlay from '../../components/common/OnboardingOverlay';
import { useOnboardingOverlay } from '../../hooks/useOnboardingOverlay';

import { RootState } from '../../store';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

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
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  // Onboarding overlay hook
  const onboardingOverlay = useOnboardingOverlay();

  const { goals, isLoading } = useTypedSelector((state: RootState) => state.goals);
  const { profile } = useTypedSelector((state: RootState) => state.user);
  const { isAuthenticated } = useTypedSelector((state: RootState) => state.auth);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const { accounts } = useTypedSelector((state) => state.accounts);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Refresh goals when screen comes into focus (e.g., after creating a new goal)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadData();
      }
    }, [isAuthenticated])
  );

  const loadData = async () => {
    if (!isAuthenticated) {
      console.log(' Skipping goals data load - user not authenticated');
      return;
    }

    try {
      console.log(' Loading goals data for authenticated user');
      await Promise.all([
        dispatch(fetchGoals()),
        dispatch(fetchUserProfile()),
        dispatch(fetchAccounts()),
      ]);
    } catch (error) {
      console.error('Error loading goals:', error);
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

  const getActiveGoals = () => {
    return goals.filter((goal: any) => goal.status === 'active');
  };

  const getCompletedGoals = () => {
    return goals.filter((goal: any) => goal.status === 'completed');
  };

  const getSortedGoals = () => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...goals].sort((a: any, b: any) => {
      // Sort by priority first (high to low)
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const canCreateGoal = () => {
    if (!profile) return false;
    
    // TEMPORARY: All users can create unlimited goals for app launch
    return true;
  };

  const handleCreateGoal = () => {
    if (canCreateGoal()) {
      navigation.navigate('AddManualGoal');
    } else {
      Alert.alert(
        'Goal Limit Reached',
        'Upgrade to Premium for unlimited goals.',
        [
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
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

  const handleContribute = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowContributeModal(true);
  };

  const handleContributeSubmit = async () => {
    if (!contributionAmount || !selectedAccountId || !selectedGoalId) {
      Alert.alert('Error', 'Please enter an amount and select an account.');
      return;
    }
    
    if (accounts.length === 0) {
      Alert.alert('Error', 'You need to create an account first.');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsContributing(true);
    try {
      const goalId = selectedGoalId;

      await dispatch(contributeToGoal({
        id: goalId,
        amount,
        accountId: selectedAccountId,
      })).unwrap();

      if (goalId) {
        await Promise.all([
          dispatch(fetchGoal(goalId)).unwrap(),
          dispatch(fetchAccounts()).unwrap(),
        ]);
      }

      Alert.alert('Success', 'Contribution added successfully!');
      setShowContributeModal(false);
      setContributionAmount('');
      setSelectedAccountId('');
      setSelectedGoalId(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add contribution.');
    } finally {
      setIsContributing(false);
    }
  };

  const calculateTotalSavings = () => {
    return getActiveGoals().reduce((total: number, goal: any) => total + (goal.current_amount || 0), 0);
  };

  const calculateTotalTarget = () => {
    return getActiveGoals().reduce((total: number, goal: any) => total + (goal.target_amount || 0), 0);
  };

  const formatCurrencyAmount = (amount: number) => {
    return formatCurrency(amount, displayCurrency);
  };

  const renderGoalItem = ({ item }: { item: any }) => (
    <GoalCard
      goal={item}
      onPress={() => handleGoalPress(item)}
      onContribute={() => handleContribute(item.id)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Summary Cards - 2x2 Grid */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🎯</Text>
          <Text style={styles.summaryLabel}>Active Goals</Text>
          <Text style={styles.summaryValue}>
            {getActiveGoals().length}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💵</Text>
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>
            {formatCurrencyAmount(calculateTotalSavings())}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🏆</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
          <Text style={styles.summaryValue}>
            {getCompletedGoals().length}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.summaryCard}
          onPress={() => navigation.navigate('GoalAnalytics')}
          activeOpacity={0.8}
        >
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryLabel}>Analytics</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Headers with Filter */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Goals</Text>
        <TouchableOpacity onPress={handleCreateGoal}>
          <Text style={styles.addButtonText}>+ Add Goal</Text>
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
            <Text style={styles.exampleIcon}>🏡</Text>
            <Text style={styles.exampleText}>Home Down Payment</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContributeModal = () => (
    <Modal
      visible={showContributeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowContributeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Contribution</Text>
          
          <CustomTextInput
            label="Amount"
            value={contributionAmount}
            onChangeText={setContributionAmount}
            placeholder="0.00"
            keyboardType="numeric"
            leftIcon={<Text style={styles.inputIcon}>{getCurrencySymbol(displayCurrency || 'USD')}</Text>}
            inputStyle={styles.amountInput}
            style={styles.amountInputContainer}
          />

          <View style={styles.accountSelector}>
            <Text style={styles.accountSelectorLabel}>Select Account:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountOption,
                    selectedAccountId === account.id && styles.accountOptionSelected,
                  ]}
                  onPress={() => setSelectedAccountId(account.id)}
                >
                  <Text style={styles.accountOptionText}>{account.name}</Text>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance, account.currency)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.modalActions}>
            <CustomButton
              title="Cancel"
              onPress={() => {
                setShowContributeModal(false);
                setContributionAmount('');
                setSelectedAccountId('');
                setSelectedGoalId(null);
              }}
              variant="outline"
              style={styles.modalButton}
            />
            <CustomButton
              title="Add Contribution"
              onPress={handleContributeSubmit}
              loading={isContributing}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!isAuthenticated || (isLoading && goals.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={getSortedGoals()}
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
        style={styles.fab}
        onPress={handleCreateGoal}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {renderContributeModal()}

      {/* Onboarding Overlay - show only for step 6 (goals) */}
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm, // Add some padding to center the smaller cards
  },
  summaryCard: {
    width: '43.7%', // Increased from 40.8% by 7%
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.sm, // Reduced padding to make cards more compact
    alignItems: 'center',
    marginBottom: spacing.md,
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
    fontSize: 20, // Same as budgets screen
    marginBottom: spacing.xs, // Reduced margin
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 11, // Slightly smaller font like budgets screen
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14, // Slightly smaller font like budgets screen
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
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  accountSelector: {
    width: '100%',
    marginBottom: spacing.md,
  },
  accountSelectorLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  accountOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  accountOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  accountOptionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  accountBalance: {
    ...typography.small,
    color: colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  amountInput: {
    height: 120,
    fontSize: 28,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.primary,
    marginVertical: spacing.lg,
    minHeight: 120,
    textAlign: 'center',
    width: '100%',
    flex: 1,
  },
  amountInputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
});

export default GoalsListScreen;
