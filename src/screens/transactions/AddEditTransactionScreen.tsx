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
import { createTransaction, updateTransaction, fetchTransactions } from '../../store/slices/transactionsSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { getCurrencySymbol } from '../../utils/currency';

interface AddEditTransactionScreenProps {
  navigation: any;
  route: any;
}

const AddEditTransactionScreen: React.FC<AddEditTransactionScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { transactionId, transaction, accountId } = route.params || {};
  const isEditing = !!transactionId;

  const { accounts } = useTypedSelector((state) => state.accounts);
  const { categories, isLoading: categoriesLoading } = useTypedSelector((state) => state.categories);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    account_id: accountId || '',
    category_id: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    merchant: '',
    tags: '',
  });

  const [errors, setErrors] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '', // Keep this for potential future use, but won't validate it
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hasShownAccountAlert, setHasShownAccountAlert] = useState(false);
  const [hasShownCategoryAlert, setHasShownCategoryAlert] = useState(false);

  // Calculate selected account and currency based on form data
  const selectedAccount = accounts?.find(acc => acc.id === formData.account_id);
  const currency = selectedAccount?.currency || displayCurrency || 'USD';

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isEditing && transaction && transaction.account_id) {
      const transactionTags = Array.isArray(transaction.tags)
        ? transaction.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
        : [];

      setFormData({
        account_id: transaction.account_id || '',
        category_id: transaction.category_id || '',
        amount: transaction.amount?.toString() || '',
        type: transaction.type || 'expense',
        description: transaction.description || '',
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        merchant: transaction.merchant || '',
        tags: transactionTags.join(', '),
      });
    }
  }, [isEditing, transaction]);

  // Show alerts when data is loaded and no accounts/categories exist
  useEffect(() => {
    if (dataLoaded && !hasShownAccountAlert && (!accounts || accounts.length === 0)) {
      setHasShownAccountAlert(true);
      Alert.alert(
        'No Accounts Found',
        'You need to create an account first before adding transactions. Would you like to create an account now?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Create Account',
            onPress: () => navigation.navigate('Accounts', { screen: 'AddEditAccount' }),
          },
        ],
        { cancelable: false }
      );
    }
  }, [dataLoaded, accounts, hasShownAccountAlert, navigation]);

  useEffect(() => {
    if (dataLoaded && !hasShownCategoryAlert && (!categories || categories.length === 0)) {
      setHasShownCategoryAlert(true);
      Alert.alert(
        'No Categories Found',
        'You need to create categories first to organize your transactions. Would you like to manage categories now?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Manage Categories',
            onPress: () => navigation.navigate('More', { screen: 'Categories' }),
          },
        ],
        { cancelable: false }
      );
    }
  }, [dataLoaded, categories, hasShownCategoryAlert, navigation]);

  const loadData = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping transaction form data load - user not authenticated');
      return;
    }

    try {
      console.log('📝 Loading transaction form data for authenticated user');
      await Promise.all([
        dispatch(fetchAccounts()),
        dispatch(fetchCategories()),
      ]);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load form data. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors = {
      account_id: '',
      category_id: '',
      amount: '',
      description: '', // Keep this field but don't validate it
    };

    let hasError = false;

    // Account validation
    if (!formData.account_id || !formData.account_id.trim()) {
      newErrors.account_id = 'Please select an account';
      hasError = true;
    }

    // Category validation
    if (!formData.category_id.trim()) {
      newErrors.category_id = 'Please select a category';
      hasError = true;
    }

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
      hasError = true;
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      hasError = true;
    }

    // Description validation - REMOVED
    // Description is now optional, no validation needed

    setErrors(newErrors);
    return !hasError;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const transactionData = {
        account_id: formData.account_id,
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description.trim() || undefined, // Send undefined if empty
        transaction_date: formData.transaction_date,
        merchant: formData.merchant.trim() || undefined,
        tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
      };

      if (isEditing) {
        await dispatch(updateTransaction({ id: transactionId, data: transactionData })).unwrap();
      } else {
        await dispatch(createTransaction(transactionData)).unwrap();
        // Refresh transactions list to get complete data with category information
        // This ensures the newly created transaction has all category details
        await dispatch(fetchTransactions({ page: 1, limit: 20 }));
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

  // Helper function to get category icon with fallback
  const getCategoryIcon = (category: any) => {
    // If category has an icon property, use it
    if (category.icon) {
      // Map backend icon names to emojis
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
      };
      
      return iconMap[category.icon] || '💰';
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
    
    return '💰'; // Default fallback
  };

  const renderAccountSelector = () => {
    if (!accounts || accounts.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateIcon}>🏦</Text>
          <Text style={styles.emptyStateTitle}>No Accounts Available</Text>
          <Text style={styles.emptyStateMessage}>
            You need to create an account first before adding transactions.
          </Text>
          <CustomButton
            title="Add Account"
            onPress={() => navigation.navigate('Accounts', { screen: 'AddEditAccount' })}
            variant="primary"
            size="small"
            style={styles.emptyStateButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Account *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {accounts?.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.selectorOption,
                formData.account_id === account.id && styles.selectorOptionSelected,
              ]}
              onPress={() => account.id && updateFormData('account_id', account.id)}
            >
              <Text style={styles.selectorIcon}>
                {account.type === 'checking' ? '🏦' : account.type === 'savings' ? '💰' : '💳'}
              </Text>
              <Text
                style={[
                  styles.selectorLabel,
                  formData.account_id === account.id && styles.selectorLabelSelected,
                ]}
                numberOfLines={1}
              >
                {account.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.account_id && <Text style={styles.errorText}>{errors.account_id}</Text>}
      </View>
    );
  };

  const renderCategorySelector = () => {
    if (categoriesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="small" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      );
    }

    if (!categories || categories.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateIcon}>🏷️</Text>
          <Text style={styles.emptyStateTitle}>No Categories Available</Text>
          <Text style={styles.emptyStateMessage}>
            You need to create categories first. Categories help organize your transactions.
          </Text>
          <CustomButton
            title="Manage Categories"
            onPress={() => navigation.navigate('More', { screen: 'Categories' })}
            variant="primary"
            size="small"
            style={styles.emptyStateButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {categories?.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryGridItem,
                formData.category_id === category.id && styles.selectorOptionSelected,
              ]}
              onPress={() => category.id && updateFormData('category_id', category.id)}
            >
              {/* Category Icon */}
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(category)}
              </Text>
              
              {/* Category Color Indicator */}
              <View
                style={[
                  styles.categoryColor,
                  { backgroundColor: category.color || colors.primary },
                ]}
              />
              
              {/* Category Name */}
              <Text
                style={[
                  styles.categoryLabel,
                  formData.category_id === category.id && styles.selectorLabelSelected,
                ]}
                numberOfLines={2}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category_id && <Text style={styles.errorText}>{errors.category_id}</Text>}
      </View>
    );
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      <Text style={styles.label}>Transaction Type</Text>
      <View style={styles.typeOptions}>
        <TouchableOpacity
          style={[
            styles.typeOption,
            formData.type === 'expense' && styles.typeOptionSelected,
            formData.type === 'expense' && { backgroundColor: colors.expense + '20', borderColor: colors.expense },
          ]}
          onPress={() => updateFormData('type', 'expense')}
        >
          <Text style={styles.typeIcon}>💸</Text>
          <Text
            style={[
              styles.typeLabel,
              formData.type === 'expense' && { color: colors.expense },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeOption,
            formData.type === 'income' && styles.typeOptionSelected,
            formData.type === 'income' && { backgroundColor: colors.income + '20', borderColor: colors.income },
          ]}
          onPress={() => updateFormData('type', 'income')}
        >
          <Text style={styles.typeIcon}>💰</Text>
          <Text
            style={[
              styles.typeLabel,
              formData.type === 'income' && { color: colors.income },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show loading spinner if not authenticated or data not loaded
  if (!isAuthenticated || !dataLoaded) {
    return <LoadingSpinner />;
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
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {renderTypeSelector()}

          {renderAccountSelector()}

          {renderCategorySelector()}

          <CustomTextInput
            label="Amount *"
            value={formData.amount}
            onChangeText={(value) => updateFormData('amount', value)}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.amount}
            leftIcon={<Text style={styles.inputIcon}>
              {getCurrencySymbol(currency)}
            </Text>}
          />

          <CustomTextInput
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="e.g., Grocery shopping, Salary, etc."
            error={errors.description}
            leftIcon={<Text style={styles.inputIcon}>📝</Text>}
          />

          <View style={styles.dateInputContainer}>
            <Text style={styles.dateFormatHint}>Date (YYYY-MM-DD)</Text>
            <CustomTextInput
              label=""
              value={formData.transaction_date}
              onChangeText={(value) => updateFormData('transaction_date', value)}
              placeholder="YYYY-MM-DD"
              leftIcon={<Text style={styles.inputIcon}>📅</Text>}
            />
          </View>

          <CustomTextInput
            label="Merchant (Optional)"
            value={formData.merchant}
            onChangeText={(value) => updateFormData('merchant', value)}
            placeholder="e.g., Supermarket, Company Name"
            leftIcon={<Text style={styles.inputIcon}>🏪</Text>}
          />

          <CustomTextInput
            label="Tags (Optional)"
            value={formData.tags}
            onChangeText={(value) => updateFormData('tags', value)}
            placeholder="e.g., groceries, food, monthly"
            leftIcon={<Text style={styles.inputIcon}>🏷️</Text>}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              {formData.type === 'expense' 
                ? 'This will decrease your account balance'
                : 'This will increase your account balance'
              }
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={isEditing ? 'Update Transaction' : 'Add Transaction'}
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
  typeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    borderWidth: 2,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  typeLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  selectorContainer: {
    marginBottom: spacing.lg,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  selectorOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  selectorOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  selectorIcon: {
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  selectorLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectorLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  // New styles for category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryGridItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    width: '31%', // 3 items per row with small gaps
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 100,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
    minHeight: 32,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  emptyStateContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    minWidth: 150,
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
  dateInputContainer: {
    marginBottom: spacing.md,
  },
  dateFormatHint: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
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

export default AddEditTransactionScreen;
