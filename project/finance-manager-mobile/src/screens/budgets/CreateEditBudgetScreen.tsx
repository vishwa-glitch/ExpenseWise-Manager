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
import { createBudget, updateBudget } from '../../store/slices/budgetsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { getCurrencySymbol, getDefaultCurrency } from '../../utils/currency';

interface CreateEditBudgetScreenProps {
  navigation: any;
  route: any;
}

const CreateEditBudgetScreen: React.FC<CreateEditBudgetScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { budgetId, budget } = route.params || {};
  const isEditing = !!budgetId;

  const { categories } = useTypedSelector((state) => state.categories);
  const { preferredCurrency } = useTypedSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    category_id: '',
    start_date: '',
    end_date: '',
    currency: preferredCurrency || 'USD',
    is_active: true,
  });

  const [errors, setErrors] = useState({
    name: '',
    amount: '',
    start_date: '',
    end_date: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const periodOptions = [
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'quarterly', label: 'Quarterly', icon: '📊' },
    { value: 'yearly', label: 'Yearly', icon: '🗓️' },
    { value: 'custom', label: 'Custom', icon: '⚙️' },
  ];

  useEffect(() => {
    loadCategories();
    
    if (isEditing && budget) {
      setFormData({
        name: budget.name || '',
        amount: budget.amount?.toString() || '',
        period: budget.period || 'monthly',
        category_id: budget.category_id || '',
        start_date: budget.start_date || '',
        end_date: budget.end_date || '',
        currency: budget.currency || preferredCurrency || 'USD',
        is_active: budget.is_active !== undefined ? budget.is_active : true,
      });
    } else {
      // Set default dates for new budget
      setDefaultDates('monthly');
    }
  }, [isEditing, budget, preferredCurrency]);

  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const setDefaultDates = (period: string) => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);

    switch (period) {
      case 'weekly':
        // Start from Monday of current week
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(today.getDate() - daysToMonday);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        // Custom - don't set default dates
        return;
    }

    setFormData(prev => ({
      ...prev,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    }));
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      amount: '',
      start_date: '',
      end_date: '',
    };

    let hasError = false;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
      hasError = true;
    }

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = 'Budget amount is required';
      hasError = true;
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      hasError = true;
    }

    // Date validation
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
      hasError = true;
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
      hasError = true;
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        newErrors.end_date = 'End date must be after start date';
        hasError = true;
      }
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const budgetData = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        period: formData.period,
        category_id: formData.category_id || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        currency: formData.currency,
        is_active: formData.is_active,
      };

      if (isEditing) {
        await dispatch(updateBudget({ id: budgetId, data: budgetData })).unwrap();
      } else {
        await dispatch(createBudget(budgetData)).unwrap();
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

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update dates when period changes
    if (field === 'period' && typeof value === 'string' && value !== 'custom') {
      setDefaultDates(value);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Budget Period</Text>
      <View style={styles.periodGrid}>
        {periodOptions.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodOption,
              formData.period === period.value && styles.periodOptionSelected,
            ]}
            onPress={() => updateFormData('period', period.value)}
          >
            <Text style={styles.periodIcon}>{period.icon}</Text>
            <Text
              style={[
                styles.periodLabel,
                formData.period === period.value && styles.periodLabelSelected,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Category (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <TouchableOpacity
          style={[
            styles.categoryOption,
            !formData.category_id && styles.categoryOptionSelected,
          ]}
          onPress={() => updateFormData('category_id', '')}
        >
          <Text style={styles.categoryIcon}>🏷️</Text>
          <Text
            style={[
              styles.categoryLabel,
              !formData.category_id && styles.categoryLabelSelected,
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryOption,
              formData.category_id === category.id && styles.categoryOptionSelected,
            ]}
            onPress={() => updateFormData('category_id', category.id)}
          >
            <Text style={styles.categoryIcon}>
              {category.icon ? '🏷️' : '💰'}
            </Text>
            <Text
              style={[
                styles.categoryLabel,
                formData.category_id === category.id && styles.categoryLabelSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
          {isEditing ? 'Edit Budget' : 'Create Budget'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <CustomTextInput
            label="Budget Name *"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="e.g., Monthly Groceries, Entertainment Budget"
            error={errors.name}
            leftIcon={<Text style={styles.inputIcon}>📝</Text>}
          />

          <CustomTextInput
            label="Budget Amount *"
            value={formData.amount}
            onChangeText={(value) => updateFormData('amount', value)}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.amount}
            leftIcon={<Text style={styles.inputIcon}>
              {getCurrencySymbol(formData.currency)}
            </Text>}
          />

          {renderPeriodSelector()}

          {renderCategorySelector()}

          <View style={styles.dateRow}>
            <CustomTextInput
              label="Start Date *"
              value={formData.start_date}
              onChangeText={(value) => updateFormData('start_date', value)}
              placeholder="YYYY-MM-DD"
              error={errors.start_date}
              style={styles.dateInput}
              leftIcon={<Text style={styles.inputIcon}>📅</Text>}
            />
            <CustomTextInput
              label="End Date *"
              value={formData.end_date}
              onChangeText={(value) => updateFormData('end_date', value)}
              placeholder="YYYY-MM-DD"
              error={errors.end_date}
              style={styles.dateInput}
              leftIcon={<Text style={styles.inputIcon}>📅</Text>}
            />
          </View>

          {/* Active Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Budget Status</Text>
            <View style={styles.toggleOptions}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  formData.is_active && styles.toggleOptionSelected,
                ]}
                onPress={() => updateFormData('is_active', true)}
              >
                <Text style={[
                  styles.toggleOptionText,
                  formData.is_active && styles.toggleOptionTextSelected,
                ]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  !formData.is_active && styles.toggleOptionSelected,
                ]}
                onPress={() => updateFormData('is_active', false)}
              >
                <Text style={[
                  styles.toggleOptionText,
                  !formData.is_active && styles.toggleOptionTextSelected,
                ]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              {formData.category_id 
                ? 'This budget will track expenses only for the selected category.'
                : 'This budget will track all expenses across all categories.'
              }
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={isEditing ? 'Update Budget' : 'Create Budget'}
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
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  periodOption: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  periodIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  periodLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  periodLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  categoryOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 20,
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  toggleContainer: {
    marginBottom: spacing.lg,
  },
  toggleLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  toggleOptions: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.xs,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleOptionSelected: {
    backgroundColor: colors.primary,
  },
  toggleOptionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  toggleOptionTextSelected: {
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

export default CreateEditBudgetScreen;