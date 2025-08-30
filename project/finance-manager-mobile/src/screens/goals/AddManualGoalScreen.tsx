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
import { createGoal, updateGoal } from '../../store/slices/goalsSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';

import { getCurrencySymbol, getDefaultCurrency } from '../../utils/currency';
import { checkGoalCreationLimit } from '../../utils/subscriptionUtils';

interface AddManualGoalScreenProps {
  navigation: any;
  route: any;
}

const AddManualGoalScreen: React.FC<AddManualGoalScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { goalId, goal } = route.params || {};
  const isEditing = !!goalId;

  // Get user profile for limit checking
  const { profile } = useTypedSelector((state) => state.user);

  const { preferredCurrency } = useTypedSelector((state) => state.user);

  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: 'other',
    description: '',
    priority: 'medium',
    currency: preferredCurrency || 'USD',
    status: 'active',
  });

  const [errors, setErrors] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = [
    { value: 'emergency', label: 'Emergency Fund', icon: '🚨' },
    { value: 'vacation', label: 'Vacation', icon: '🏖️' },
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'house', label: 'House', icon: '🏠' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'retirement', label: 'Retirement', icon: '👴' },
    { value: 'investment', label: 'Investment', icon: '📈' },
    { value: 'other', label: 'Other', icon: '🎯' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High', icon: '🔴' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'low', label: 'Low', icon: '🟢' },
  ];

  useEffect(() => {
    if (isEditing && goal) {
      setFormData({
        title: goal.title || '',
        target_amount: goal.target_amount?.toString() || '',
        current_amount: goal.current_amount?.toString() || '',
        target_date: goal.target_date || '',
        category: goal.category || 'other',
        description: goal.description || '',
        priority: goal.priority || 'medium',
        currency: goal.currency || preferredCurrency || 'USD',
        status: goal.status || 'active',
      });
    } else {
      // Set default date for new goal (1 year from now)
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      setFormData(prev => ({
        ...prev,
        target_date: defaultDate.toISOString().split('T')[0],
      }));
    }
  }, [isEditing, goal, preferredCurrency]);

  const validateForm = () => {
    const newErrors = {
      title: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
    };

    let hasError = false;

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
      hasError = true;
    }

    // Target amount validation
    if (!formData.target_amount.trim()) {
      newErrors.target_amount = 'Target amount is required';
      hasError = true;
    } else if (isNaN(parseFloat(formData.target_amount)) || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'Please enter a valid amount';
      hasError = true;
    }

    // Current amount validation
    if (formData.current_amount.trim() && (isNaN(parseFloat(formData.current_amount)) || parseFloat(formData.current_amount) < 0)) {
      newErrors.current_amount = 'Please enter a valid amount';
      hasError = true;
    }

    // Target date validation
    if (!formData.target_date.trim()) {
      newErrors.target_date = 'Target date is required';
      hasError = true;
    } else {
      const targetDate = new Date(formData.target_date);
      const today = new Date();
      
      if (isNaN(targetDate.getTime())) {
        newErrors.target_date = 'Please enter a valid date (YYYY-MM-DD)';
        hasError = true;
      } else if (targetDate <= today && formData.status === 'active') {
        newErrors.target_date = 'Target date must be in the future';
        hasError = true;
      }
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Check goal creation limit for new goals only
    if (!isEditing) {
      const limitExceeded = checkGoalCreationLimit();
      
      if (limitExceeded) {
        Alert.alert(
          'Goal Limit Reached',
          'Upgrade to Premium for unlimited goals.',
          [
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return; // Stop execution if limit exceeded
      }
    }

    setIsLoading(true);

    try {
             const goalData = {
         title: formData.title.trim(),
         target_amount: parseFloat(formData.target_amount),
         current_amount: formData.current_amount.trim() ? parseFloat(formData.current_amount) : 0,
         target_date: formData.target_date,
         category: formData.category,
         description: formData.description.trim() || undefined,
         priority: formData.priority, // Keep as string: 'high', 'medium', 'low'
         currency: formData.currency,
         status: formData.status,
       };

      if (isEditing) {
        await dispatch(updateGoal({ id: goalId, data: goalData })).unwrap();
      } else {
        await dispatch(createGoal(goalData)).unwrap();
      }

      navigation.goBack();
    } catch (error: any) {
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

  const renderCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {categoryOptions.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryOption,
              formData.category === category.value && styles.categoryOptionSelected,
            ]}
            onPress={() => updateFormData('category', category.value)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                formData.category === category.value && styles.categoryLabelSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityOptions}>
        {priorityOptions.map((priority) => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.priorityOption,
              formData.priority === priority.value && styles.priorityOptionSelected,
            ]}
            onPress={() => updateFormData('priority', priority.value)}
          >
            <Text style={styles.priorityIcon}>{priority.icon}</Text>
            <Text
              style={[
                styles.priorityLabel,
                formData.priority === priority.value && styles.priorityLabelSelected,
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatusSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusOptions}>
        <TouchableOpacity
          style={[
            styles.statusOption,
            formData.status === 'active' && styles.statusActiveSelected,
          ]}
          onPress={() => updateFormData('status', 'active')}
        >
          <Text style={[
            styles.statusLabel,
            formData.status === 'active' && styles.statusActiveLabelSelected,
          ]}>
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.statusOption,
            formData.status === 'paused' && styles.statusPausedSelected,
          ]}
          onPress={() => updateFormData('status', 'paused')}
        >
          <Text style={[
            styles.statusLabel,
            formData.status === 'paused' && styles.statusPausedLabelSelected,
          ]}>
            Paused
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.statusOption,
            formData.status === 'completed' && styles.statusCompletedSelected,
          ]}
          onPress={() => updateFormData('status', 'completed')}
        >
          <Text style={[
            styles.statusLabel,
            formData.status === 'completed' && styles.statusCompletedLabelSelected,
          ]}>
            Completed
          </Text>
        </TouchableOpacity>
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
          {isEditing ? 'Edit Goal' : 'Create Goal'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <CustomTextInput
            label="Goal Title *"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            placeholder="e.g., Emergency Fund, Dream Vacation"
            error={errors.title}
            leftIcon={<Text style={styles.inputIcon}>🎯</Text>}
          />

          <CustomTextInput
            label="Target Amount *"
            value={formData.target_amount}
            onChangeText={(value) => updateFormData('target_amount', value)}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.target_amount}
            leftIcon={<Text style={styles.inputIcon}>
              {getCurrencySymbol(formData.currency)}
            </Text>}
          />

          <CustomTextInput
            label={isEditing ? "Current Amount" : "Initial Amount (Optional)"}
            value={formData.current_amount}
            onChangeText={(value) => updateFormData('current_amount', value)}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.current_amount}
            leftIcon={<Text style={styles.inputIcon}>
              {getCurrencySymbol(formData.currency)}
            </Text>}
          />

          <CustomTextInput
            label="Target Date *"
            value={formData.target_date}
            onChangeText={(value) => updateFormData('target_date', value)}
            placeholder="YYYY-MM-DD"
            error={errors.target_date}
            leftIcon={<Text style={styles.inputIcon}>📅</Text>}
          />

          {renderCategorySelector()}

          {renderPrioritySelector()}

          {isEditing && renderStatusSelector()}

          <CustomTextInput
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Why is this goal important to you?"
            multiline
            numberOfLines={3}
            leftIcon={<Text style={styles.inputIcon}>📝</Text>}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Setting realistic goals with clear target dates helps you stay motivated and track your progress effectively.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={isEditing ? 'Update Goal' : 'Create Goal'}
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
        />
      </View>
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
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  selectorContainer: {
    marginBottom: spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryOption: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  priorityIcon: {
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  priorityLabel: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  priorityLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  statusOptions: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.xs,
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 6,
  },
  statusActiveSelected: {
    backgroundColor: colors.primary,
  },
  statusPausedSelected: {
    backgroundColor: colors.warning,
  },
  statusCompletedSelected: {
    backgroundColor: colors.success,
  },
  statusLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  statusActiveLabelSelected: {
    color: colors.background,
  },
  statusPausedLabelSelected: {
    color: colors.background,
  },
  statusCompletedLabelSelected: {
    color: colors.background,
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
});

export default AddManualGoalScreen;