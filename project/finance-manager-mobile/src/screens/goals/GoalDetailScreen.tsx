import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { 
  fetchGoal, 
  contributeToGoal, 
  deleteGoal 
} from '../../store/slices/goalsSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProgressDonut } from '../../components/charts/ProgressDonut';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface GoalDetailScreenProps {
  navigation: any;
  route: any;
}

const GoalDetailScreen: React.FC<GoalDetailScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { goalId, openContribution } = route.params;
  
  const { selectedGoal, isLoading } = useTypedSelector((state) => state.goals);
  const { accounts } = useTypedSelector((state) => state.accounts);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);
  const { categories } = useTypedSelector((state) => state.categories);

  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && goalId) {
      loadData();
    }
  }, [isAuthenticated, goalId]);

  useEffect(() => {
    // Auto-open contribution modal if requested
    if (openContribution && selectedGoal && accounts.length > 0) {
      setShowContributeModal(true);
    }
  }, [openContribution, selectedGoal, accounts]);
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchGoal(goalId)),
        dispatch(fetchAccounts()),
      ]);
    } catch (error) {
      console.error('Error loading goal data:', error);
    }
  };

  const handleContribute = async () => {
    if (!contributionAmount || !selectedAccountId) {
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
      await dispatch(contributeToGoal({
        id: goalId,
        amount,
        accountId: selectedAccountId,
      })).unwrap();

      Alert.alert('Success', 'Contribution added successfully!');
      setShowContributeModal(false);
      setContributionAmount('');
      setSelectedAccountId('');
      
      // Reload goal data
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add contribution.');
    } finally {
      setIsContributing(false);
    }
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteGoal(goalId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal.');
            }
          },
        },
      ]
    );
  };

  const formatAmount = (amount: number) => {
    const currency = selectedGoal?.currency || 'USD';
    return formatCurrency(amount, currency);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category?: string) => {
    const iconMap: { [key: string]: string } = {
      'emergency': '🚨',
      'vacation': '🏖️',
      'car': '🚗',
      'house': '🏠',
      'education': '🎓',
      'retirement': '👴',
      'investment': '📈',
      'other': '🎯',
    };
    
    return iconMap[category?.toLowerCase() || 'other'] || '🎯';
  };

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
            leftIcon={<Text style={styles.inputIcon}>💰</Text>}
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
              onPress={() => setShowContributeModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <CustomButton
              title="Add Contribution"
              onPress={handleContribute}
              loading={isContributing}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!isAuthenticated || isLoading) {
    return <LoadingSpinner />;
  }

  if (!selectedGoal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Goal not found</Text>
          <CustomButton
            title="Go Back"
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditGoal', { goalId, goal: selectedGoal })}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Goal Header */}
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalIcon}>
              {getCategoryIcon(selectedGoal.category)}
            </Text>
            <View style={styles.goalDetails}>
              <Text style={styles.goalTitle}>{selectedGoal.title}</Text>
              <Text style={styles.goalCategory}>
                {selectedGoal.category?.charAt(0).toUpperCase() + selectedGoal.category?.slice(1) || 'Other'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <ProgressDonut
            progress={selectedGoal.progress_percentage || 0}
            size={150}
            strokeWidth={12}
            color={colors.primary}
            centerText={`${(selectedGoal.progress_percentage || 0).toFixed(1)}%`}
            centerSubtext="Complete"
            title="Progress"
          />
          
          <View style={styles.amountInfo}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Current Amount:</Text>
              <Text style={styles.currentAmount}>
                {formatAmount(selectedGoal.current_amount || 0)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Target Amount:</Text>
              <Text style={styles.targetAmount}>
                {formatAmount(selectedGoal.target_amount || 0)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Remaining:</Text>
              <Text style={styles.remainingAmount}>
                {formatAmount((selectedGoal.target_amount || 0) - (selectedGoal.current_amount || 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* Goal Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Goal Information</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Target Date:</Text>
            <Text style={styles.detailValue}>
              {formatDate(selectedGoal.target_date)}
            </Text>
          </View>

          {selectedGoal.days_remaining !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Days Remaining:</Text>
              <Text style={[
                styles.detailValue,
                { color: selectedGoal.days_remaining < 30 ? colors.warning : colors.text }
              ]}>
                {selectedGoal.days_remaining > 0 ? `${selectedGoal.days_remaining} days` : 'Overdue'}
              </Text>
            </View>
          )}

          {selectedGoal.monthly_savings_needed && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Monthly Savings Needed:</Text>
              <Text style={styles.detailValue}>
                {formatAmount(selectedGoal.monthly_savings_needed)}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[
              styles.detailValue,
              { 
                color: selectedGoal.status === 'completed' ? colors.success : 
                       selectedGoal.status === 'active' ? colors.primary : colors.textSecondary 
              }
            ]}>
              {selectedGoal.status?.charAt(0).toUpperCase() + selectedGoal.status?.slice(1)}
            </Text>
          </View>

          {selectedGoal.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.description}>{selectedGoal.description}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionButtons}>
            <CustomButton
              title="Add Contribution"
              onPress={() => setShowContributeModal(true)}
              variant="primary"
              style={styles.actionButton}
            />
            <CustomButton
              title="Edit Goal"
              onPress={() => navigation.navigate('EditGoal', { goalId, goal: selectedGoal })}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
          
          <CustomButton
            title="Delete Goal"
            onPress={handleDeleteGoal}
            variant="danger"
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>

      {renderContributeModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: spacing.sm,
  },
  editIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  goalHeader: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  goalCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  progressSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  amountInfo: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amountLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  currentAmount: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  targetAmount: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  remainingAmount: {
    ...typography.h3,
    color: colors.warning,
    fontWeight: 'bold',
  },
  detailsSection: {
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  descriptionContainer: {
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  actionsSection: {
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  deleteButton: {
    marginTop: spacing.sm,
  },
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
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputIcon: {
    fontSize: 20,
  },
  accountSelector: {
    marginBottom: spacing.lg,
  },
  accountSelectorLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  accountOption: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 120,
  },
  accountOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
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
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});

export default GoalDetailScreen;