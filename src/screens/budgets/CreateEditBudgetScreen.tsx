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
import DatePicker from '../../components/common/DatePicker';
import { colors, typography, spacing } from '../../constants/colors';
import { getDefaultBudgetDates, validateBudgetDates } from '../../utils/budgetUtils';
import { getCurrencySymbol } from '../../utils/currency';

interface CreateEditBudgetScreenProps {
  navigation: any;
  route: any;
}

const CreateEditBudgetScreen: React.FC<CreateEditBudgetScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { budgetId, budget } = route.params || {};
  const isEditing = !!budgetId;

  const { categories } = useTypedSelector((state) => state.categories);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const { budgets } = useTypedSelector((state) => state.budgets);

  const [formData, setFormData] = useState({
    amount: '',
    period: 'monthly',
    category_id: '', // Empty string means no category selected (all categories)
    start_date: '',
    end_date: '',
    currency: displayCurrency,
    is_active: true,
  });

  const [errors, setErrors] = useState({
    amount: '',
    category_id: '',
    start_date: '',
    end_date: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const periodOptions = [
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'yearly', label: 'Yearly', icon: '🗓️' },
    { value: 'custom', label: 'Custom Range', icon: '⚙️' },
  ];

  useEffect(() => {
    loadCategories();
    
    if (isEditing && budget) {
      setFormData({
        amount: budget.amount?.toString() || '',
        period: budget.period || 'monthly',
        category_id: budget.category_id || '',
        start_date: budget.start_date || '',
        end_date: budget.end_date || '',
        currency: budget.currency || displayCurrency,
        is_active: budget.is_active !== undefined ? budget.is_active : true,
      });
    } else {
      // Set default dates for new budget
      setDefaultDates('monthly');
    }
  }, [isEditing, budget, displayCurrency]);

  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const setDefaultDates = (period: string) => {
    const defaultDates = getDefaultBudgetDates(period as 'weekly' | 'monthly' | 'yearly' | 'custom');
    
    if (defaultDates) {
      setFormData(prev => ({
        ...prev,
        start_date: defaultDates.start_date,
        end_date: defaultDates.end_date,
      }));
    } else if (period === 'custom') {
      // For custom, clear dates so user must choose
      setFormData(prev => ({
        ...prev,
        start_date: '',
        end_date: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      amount: '',
      category_id: '',
      start_date: '',
      end_date: '',
    };

    let hasError = false;

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = 'Budget amount is required';
      hasError = true;
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      hasError = true;
    }

    // Category validation - MANDATORY
    if (!formData.category_id || formData.category_id.trim() === '') {
      newErrors.category_id = 'Category is required for budgeting';
      hasError = true;
    }

    // Date validation for all periods
    if (formData.start_date && formData.end_date) {
      const dateValidation = validateBudgetDates(
        formData.start_date, 
        formData.end_date, 
        formData.period as 'weekly' | 'monthly' | 'yearly' | 'custom'
      );
      
      if (!dateValidation.isValid) {
        newErrors.end_date = dateValidation.error || 'Invalid date range';
        hasError = true;
      }
    } else if (formData.period === 'custom') {
      if (!formData.start_date) {
        newErrors.start_date = 'Start date is required for custom period';
        hasError = true;
      }
      if (!formData.end_date) {
        newErrors.end_date = 'End date is required for custom period';
        hasError = true;
      }
    } else if (!formData.start_date || !formData.end_date) {
      // Non-custom periods should have dates set automatically
      newErrors.start_date = 'Budget dates are required';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const budgetData: any = {
        amount: parseFloat(formData.amount),
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
        currency: formData.currency,
        is_active: formData.is_active,
      };

      // Category is mandatory - always include it
      budgetData.category_id = formData.category_id;

      if (isEditing) {
        await dispatch(updateBudget({ id: budgetId, data: budgetData })).unwrap();
        navigation.goBack();
      } else {
        try {
          await dispatch(createBudget(budgetData)).unwrap();
          navigation.goBack();
        } catch (error: any) {
          // Handle specific 409 Conflict error for duplicate budgets
          if (error.status === 409) {
            const existingBudgetId = error.existing_budget_id;
            
            Alert.alert(
              'Budget Already Exists',
              error.error || 'You already have a budget for this category. Would you like to view the existing budget?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => navigation.goBack()
                },
                {
                  text: 'View Existing Budget',
                  onPress: () => {
                    if (existingBudgetId) {
                      navigation.navigate('BudgetDetail', { 
                        budgetId: existingBudgetId 
                      });
                    } else {
                      navigation.goBack();
                    }
                  }
                }
              ]
            );
          } else {
            // Re-throw other errors to be handled by the outer catch block
            throw error;
          }
        }
      }
    } catch (error: any) {
      // Handle other errors
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
    if (field === 'period' && typeof value === 'string') {
      if (value === 'custom') {
        // Clear dates for custom period - user will set them manually
        setFormData(prev => ({
          ...prev,
          start_date: '',
          end_date: '',
        }));
      } else {
        // Set default dates for predefined periods
        setDefaultDates(value);
      }
    }
  };

  const handleStartDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    updateFormData('start_date', dateString);
  };

  const handleEndDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    updateFormData('end_date', dateString);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: any) => {
    // If category has an icon property, map it to emoji
    if (category.icon) {
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

  const getExistingBudgetsForCategory = (categoryId: string) => {
    return budgets.filter(budget => budget.category_id === categoryId);
  };

  const showExistingBudgetsAlert = (categoryId: string) => {
    const existingBudgets = getExistingBudgetsForCategory(categoryId);
    if (existingBudgets.length === 0) return;

    const category = categories.find(cat => cat.id === categoryId);
    const categoryName = category ? category.name : 'this category';

    Alert.alert(
      'Existing Budgets Found',
      `You already have ${existingBudgets.length} budget(s) for ${categoryName}. Would you like to view them?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'View Budgets',
          onPress: () => {
            // Navigate to budget list with filter for this category
            navigation.navigate('BudgetsList', { 
              filterCategory: categoryId 
            });
          }
        }
      ]
    );
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
      <Text style={styles.label}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryOption,
              formData.category_id === category.id && styles.categoryOptionSelected,
            ]}
            onPress={() => {
              // Check if there are existing budgets for this category
              const existingBudgets = getExistingBudgetsForCategory(category.id);
              if (existingBudgets.length > 0 && !isEditing) {
                // Show warning and ask if user wants to proceed
                Alert.alert(
                  'Existing Budgets Found',
                  `You already have ${existingBudgets.length} budget(s) for ${category.name}. Would you like to view them instead?`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'View Existing Budgets',
                      onPress: () => {
                        navigation.navigate('BudgetsList', { 
                          filterCategory: category.id 
                        });
                      }
                    },
                    {
                      text: 'Create Anyway',
                      onPress: () => updateFormData('category_id', category.id)
                    }
                  ]
                );
              } else {
                updateFormData('category_id', category.id);
              }
            }}
          >
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(category)}
            </Text>
            <Text
              style={[
                styles.categoryLabel,
                formData.category_id === category.id && styles.categoryLabelSelected,
              ]}
            >
              {category.name}
            </Text>
            {!isEditing && getExistingBudgetsForCategory(category.id).length > 0 && (
              <View style={styles.existingBudgetIndicator}>
                <Text style={styles.existingBudgetText}>
                  {getExistingBudgetsForCategory(category.id).length} budget(s)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.category_id && (
        <Text style={styles.errorText}>{errors.category_id}</Text>
      )}
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

          {formData.period === 'custom' ? (
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.datePickerIcon}>📅</Text>
                  <Text style={styles.datePickerText}>
                    {formData.start_date ? formatDisplayDate(formData.start_date) : 'Select Start Date'}
                  </Text>
                  <Text style={styles.datePickerArrow}>›</Text>
                </TouchableOpacity>
                {errors.start_date && <Text style={styles.errorText}>{errors.start_date}</Text>}
              </View>
              
              <View style={styles.dateInput}>
                <Text style={styles.label}>End Date *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.datePickerIcon}>📅</Text>
                  <Text style={styles.datePickerText}>
                    {formData.end_date ? formatDisplayDate(formData.end_date) : 'Select End Date'}
                  </Text>
                  <Text style={styles.datePickerArrow}>›</Text>
                </TouchableOpacity>
                {errors.end_date && <Text style={styles.errorText}>{errors.end_date}</Text>}
              </View>
            </View>
          ) : (
            <View style={styles.dateInfo}>
              <Text style={styles.label}>Budget Period</Text>
              <View style={styles.dateInfoBox}>
                <Text style={styles.dateInfoIcon}>📅</Text>
                <Text style={styles.dateInfoText}>
                  {formData.start_date && formData.end_date 
                    ? `${formatDisplayDate(formData.start_date)} - ${formatDisplayDate(formData.end_date)}`
                    : 'Dates will be set automatically based on period'
                  }
                </Text>
              </View>
            </View>
          )}

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
               This budget will track expenses for the selected category. You can create multiple budgets for different categories to manage your spending effectively.
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

      {/* Date Picker Modals */}
      <DatePicker
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onDateSelect={handleStartDateSelect}
        title="Select Start Date"
        initialDate={formData.start_date ? new Date(formData.start_date) : new Date()}
        maxDate={formData.end_date ? new Date(formData.end_date) : undefined}
      />

      <DatePicker
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onDateSelect={handleEndDateSelect}
        title="Select End Date"
        initialDate={formData.end_date ? new Date(formData.end_date) : new Date()}
        minDate={formData.start_date ? new Date(formData.start_date) : undefined}
      />
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
  existingBudgetIndicator: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    marginTop: spacing.xs,
  },
  existingBudgetText: {
    ...typography.caption,
    color: colors.warning,
    fontSize: 10,
    fontWeight: '500',
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  datePickerIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  datePickerText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  datePickerArrow: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  dateInfo: {
    marginBottom: spacing.lg,
  },
  dateInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  dateInfoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  dateInfoText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
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