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
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

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
  const { displayCurrency } = useTypedSelector((state) => state.user);

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
    const currency = selectedGoal?.currency || displayCurrency || 'USD';
    try {
      const formatted = formatCurrency(amount, currency);
      // Ensure we always return a string
      return typeof formatted === 'string' ? formatted : String(amount);
    } catch (error) {
      console.warn('Error formatting amount in GoalDetailScreen:', error);
      return String(amount);
    }
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
                  <Text style={styles.accountOptionText}>
                    {typeof account.name === 'string' ? account.name : 'Account'}
                  </Text>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(
                      typeof account.balance === 'number' ? account.balance : 0, 
                      typeof account.currency === 'string' ? account.currency : 'USD'
                    )}
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
              <Text style={styles.goalTitle}>
                {typeof selectedGoal.title === 'string' ? selectedGoal.title : 'Untitled Goal'}
              </Text>
              <Text style={styles.goalCategory}>
                {selectedGoal.category && typeof selectedGoal.category === 'string' 
                  ? selectedGoal.category.charAt(0).toUpperCase() + selectedGoal.category.slice(1) 
                  : 'Other'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <ProgressDonut
            progress={typeof selectedGoal.progress_percentage === 'number' ? selectedGoal.progress_percentage : 0}
            size={80}
            strokeWidth={6}
            color={colors.primary}
            centerText={`${(typeof selectedGoal.progress_percentage === 'number' ? selectedGoal.progress_percentage : 0).toFixed(1)}%`}
            centerSubtext="Complete"
            title="Progress"
          />
          
          <View style={styles.amountInfo}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Current:</Text>
              <Text style={styles.currentAmount}>
                {formatAmount(typeof selectedGoal.current_amount === 'number' ? selectedGoal.current_amount : 0)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Target:</Text>
              <Text style={styles.targetAmount}>
                {formatAmount(typeof selectedGoal.target_amount === 'number' ? selectedGoal.target_amount : 0)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Remaining:</Text>
              <Text style={styles.remainingAmount}>
                {formatAmount(
                  (typeof selectedGoal.target_amount === 'number' ? selectedGoal.target_amount : 0) - 
                  (typeof selectedGoal.current_amount === 'number' ? selectedGoal.current_amount : 0)
                )}
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

          {typeof selectedGoal.days_remaining === 'number' && (
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

          {typeof selectedGoal.monthly_savings_needed === 'number' && selectedGoal.monthly_savings_needed > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Monthly Savings:</Text>
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
              {selectedGoal.status && typeof selectedGoal.status === 'string' 
                ? selectedGoal.status.charAt(0).toUpperCase() + selectedGoal.status.slice(1)
                : 'Active'}
            </Text>
          </View>

          {selectedGoal.description && typeof selectedGoal.description === 'string' && (
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 20,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: spacing.xs,
  },
  editIcon: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  goalHeader: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  goalCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  progressSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  amountInfo: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  currentAmount: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  targetAmount: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: 16,
    color: colors.warning,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  descriptionContainer: {
    marginTop: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  actionsSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
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
    padding: spacing.lg,
    width: '92%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputIcon: {
    fontSize: 18,
  },
  accountSelector: {
    marginBottom: spacing.lg,
  },
  accountSelectorLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  accountOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 120,
    alignItems: 'center',
  },
  accountOptionSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  accountOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  accountBalance: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
  },
  amountInput: {
    height: 60,
    fontSize: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    marginVertical: spacing.md,
    textAlign: 'center',
    width: '100%',
    fontWeight: '600',
  },
  amountInputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});

export default GoalDetailScreen;