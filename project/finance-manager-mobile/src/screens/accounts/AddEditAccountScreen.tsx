import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { createAccount, updateAccount, patchAccountBalance } from '../../store/slices/accountsSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { getCurrencySymbol } from '../../utils/currency';
import { checkAccountCreationLimit, getUserStats, getUserProfile } from '../../utils/subscriptionUtils';
import OnboardingOverlay from '../../components/common/OnboardingOverlay';
import { useOnboardingOverlay } from '../../hooks/useOnboardingOverlay';

interface AddEditAccountScreenProps {
  navigation: any;
  route: any;
}

const AddEditAccountScreen: React.FC<AddEditAccountScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { accountId, account } = route.params || {};
  const isEditing = !!accountId;
  
  // Onboarding overlay hook
  const onboardingOverlay = useOnboardingOverlay();

  // Get display currency from Redux store
  const { displayCurrency } = useTypedSelector((state) => state.user);

  // Get user profile and stats for limit checking
  const { profile } = useTypedSelector((state) => state.user);
  const userStats = profile?.stats || {
    total_transactions: 0,
    total_accounts: 0,
    total_categories: 0,
    total_goals: 0,
  };

  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: displayCurrency, // Use display currency as default
  });

  const [originalBalance, setOriginalBalance] = useState<number>(0);

  const [errors, setErrors] = useState({
    name: '',
    balance: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const accountTypes = [
    { value: 'checking', label: 'Checking Account', icon: '🏦' },
    { value: 'savings', label: 'Savings Account', icon: '💰' },
    { value: 'credit', label: 'Credit Card', icon: '💳' },
    { value: 'investment', label: 'Investment Account', icon: '📈' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'other', label: 'Other', icon: '💼' },
  ];

  useEffect(() => {
    if (isEditing && account) {
      const accountBalance = account.balance || 0;
      setFormData({
        name: account.name || '',
        type: account.type || 'checking',
        balance: accountBalance.toString(),
        currency: account.currency || displayCurrency,
      });
      setOriginalBalance(accountBalance);
      console.log('📝 Form initialized for editing with balance:', accountBalance);
    } else {
      // For new accounts, use the dynamic display currency
      setFormData(prev => ({
        ...prev,
        currency: displayCurrency
      }));
    }
  }, [isEditing, account, displayCurrency]);

  const validateForm = () => {
    const newErrors = {
      name: '',
      balance: '',
    };

    let hasError = false;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
      hasError = true;
    }

    // Balance validation
    if (!formData.balance.trim()) {
      newErrors.balance = 'Initial balance is required';
      hasError = true;
    } else if (isNaN(parseFloat(formData.balance))) {
      newErrors.balance = 'Please enter a valid amount';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Check account creation limit for new accounts only
    if (!isEditing) {
      const limitExceeded = checkAccountCreationLimit(
        userStats.total_accounts,
        profile,
        navigation
      );
      
      if (limitExceeded) {
        return; // Stop execution if limit exceeded
      }
    }

    setIsLoading(true);

    try {
      const newBalance = parseFloat(formData.balance);
      console.log('💾 Saving account with balance:', newBalance);
      console.log('📊 Form data before save:', formData);

      if (isEditing) {
        // Check if only balance changed
        const balanceChanged = newBalance !== originalBalance;
        const nameChanged = formData.name.trim() !== account.name;
        const typeChanged = formData.type !== account.type;
        const currencyChanged = formData.currency !== account.currency;
        
        console.log('🔍 Change detection:', {
          balanceChanged,
          nameChanged,
          typeChanged,
          currencyChanged,
          originalBalance,
          newBalance,
        });

        if (balanceChanged && !nameChanged && !typeChanged && !currencyChanged) {
          // Only balance changed, use PATCH endpoint
          console.log('💰 Using PATCH endpoint for balance-only update');
          await dispatch(patchAccountBalance({ 
            id: accountId, 
            balance: newBalance 
          })).unwrap();
        } else {
          // Multiple fields changed, use PUT endpoint
          console.log('🏦 Using PUT endpoint for full account update');
          const accountData = {
            name: formData.name.trim(),
            type: formData.type,
            balance: newBalance,
            currency: formData.currency,
          };
          await dispatch(updateAccount({ id: accountId, ...accountData })).unwrap();
        }
      } else {
        // Creating new account
        console.log('➕ Creating new account');
        const accountData = {
          name: formData.name.trim(),
          type: formData.type,
          balance: newBalance,
          currency: formData.currency,
        };
        await dispatch(createAccount(accountData)).unwrap();
      }

      console.log('✅ Account save operation completed successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('❌ Account save error:', error);
      Alert.alert(
        isEditing ? 'Update Failed' : 'Creation Failed',
        error.message || 'Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderAccountTypeSelector = () => (
    <View style={styles.typeSelector}>
      <Text style={styles.label}>Account Type</Text>
      <View style={styles.typeGrid}>
        {accountTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeOption,
              formData.type === type.value && styles.typeOptionSelected,
            ]}
            onPress={() => updateFormData('type', type.value)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.typeLabel,
                formData.type === type.value && styles.typeLabelSelected,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Account' : 'Add Account'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <CustomTextInput
            label="Account Name"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="e.g., Main Checking, Savings Account"
            error={errors.name}
            leftIcon={<Text style={styles.inputIcon}>🏷️</Text>}
          />

          {renderAccountTypeSelector()}

          <CustomTextInput
            label={isEditing ? 'Current Balance' : 'Initial Balance'}
            value={formData.balance}
            onChangeText={(value) => updateFormData('balance', value)}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.balance}
            leftIcon={<Text style={styles.inputIcon}>
              {getCurrencySymbol(formData.currency)}
            </Text>}
          />

          <View style={styles.currencyInfo}>
            <Text style={styles.currencyInfoLabel}>Currency:</Text>
            <Text style={styles.currencyInfoValue}>
              {getCurrencySymbol(formData.currency)} {formData.currency}
            </Text>
            <Text style={styles.currencyInfoNote}>
              Currency is set to your display currency and cannot be changed.
            </Text>
          </View>

          {!isEditing && (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Your initial balance will be recorded as the first transaction for this account.
              </Text>
            </View>
          )}

          {isEditing && (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                {parseFloat(formData.balance) !== originalBalance 
                  ? 'Balance will be updated using the dedicated balance endpoint.'
                  : 'Current balance matches the original value.'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={isEditing ? 'Update Account' : 'Create Account'}
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
        />
      </View>
      
             {/* Onboarding Overlay - only show for new accounts during onboarding */}
       {!isEditing && onboardingOverlay.isVisible && onboardingOverlay.currentStep === 1 && (
         <>
           <OnboardingOverlay
             isVisible={onboardingOverlay.isVisible}
             currentStep={onboardingOverlay.currentStep}
             totalSteps={onboardingOverlay.totalSteps}
             steps={onboardingOverlay.steps}
             onNext={onboardingOverlay.handleNext}
             onSkip={onboardingOverlay.handleSkip}
             onComplete={onboardingOverlay.handleComplete}
           />
           {/* Prevent interaction with form during onboarding */}
           <View style={styles.interactionBlocker} />
         </>
       )}
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  form: {
    flex: 1,
  },
  inputIcon: {
    fontSize: 20,
    color: colors.text,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeSelector: {
    marginBottom: spacing.lg,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeOption: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  typeLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  currencyInfo: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  currencyInfoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  currencyInfoValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  currencyInfoNote: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    width: '100%',
  },
  interactionBlocker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});

export default AddEditAccountScreen;