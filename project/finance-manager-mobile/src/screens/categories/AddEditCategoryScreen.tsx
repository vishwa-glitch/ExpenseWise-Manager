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
import { createCategory, updateCategory } from '../../store/slices/categoriesSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';

interface AddEditCategoryScreenProps {
  navigation: any;
  route: any;
}

const AddEditCategoryScreen: React.FC<AddEditCategoryScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { categoryId, category } = route.params || {};
  const isEditing = !!categoryId;

  const [formData, setFormData] = useState({
    name: '',
    color: colors.primary,
    icon: 'tag',
    description: '',
  });

  const [errors, setErrors] = useState({
    name: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Predefined color options
  const colorOptions = [
    colors.primary,
    colors.accent,
    colors.income,
    colors.expense,
    colors.warning,
    colors.info,
    ...colors.categories,
  ];

  // Predefined icon options with their display names
  const iconOptions = [
    { value: 'tag', display: '🏷️', name: 'Tag' },
    { value: 'utensils', display: '🍽️', name: 'Food' },
    { value: 'car', display: '🚗', name: 'Transport' },
    { value: 'shopping-bag', display: '🛍️', name: 'Shopping' },
    { value: 'film', display: '🎬', name: 'Entertainment' },
    { value: 'zap', display: '⚡', name: 'Utilities' },
    { value: 'heart', display: '🏥', name: 'Health' },
    { value: 'book', display: '📚', name: 'Education' },
    { value: 'plane', display: '✈️', name: 'Travel' },
    { value: 'briefcase', display: '💼', name: 'Work' },
    { value: 'trending-up', display: '📈', name: 'Investment' },
    { value: 'home', display: '🏠', name: 'Home' },
    { value: 'phone', display: '📱', name: 'Technology' },
    { value: 'gift', display: '🎁', name: 'Gifts' },
    { value: 'coffee', display: '☕', name: 'Coffee' },
    { value: 'music', display: '🎵', name: 'Music' },
    { value: 'camera', display: '📷', name: 'Photography' },
    { value: 'gamepad', display: '🎮', name: 'Gaming' },
    { value: 'dumbbell', display: '🏋️', name: 'Fitness' },
    { value: 'palette', display: '🎨', name: 'Art' },
  ];

  useEffect(() => {
    if (isEditing && category) {
      setFormData({
        name: category.name || '',
        color: category.color || colors.primary,
        icon: category.icon || 'tag',
        description: category.description || '',
      });
    }
  }, [isEditing, category]);

  const validateForm = () => {
    const newErrors = {
      name: '',
    };

    let hasError = false;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
      hasError = true;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const categoryData = {
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
        description: formData.description.trim() || undefined,
        is_custom: true, // Mark as custom category
      };

      if (isEditing) {
        await dispatch(updateCategory({ id: categoryId, data: categoryData })).unwrap();
      } else {
        await dispatch(createCategory(categoryData)).unwrap();
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

  const renderColorSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Color</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {colorOptions.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              formData.color === color && styles.colorOptionSelected,
            ]}
            onPress={() => updateFormData('color', color)}
          >
            {formData.color === color && (
              <Text style={styles.colorSelectedIcon}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderIconSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Icon</Text>
      <View style={styles.iconGrid}>
        {iconOptions.map((iconOption) => (
          <TouchableOpacity
            key={iconOption.value}
            style={[
              styles.iconOption,
              formData.icon === iconOption.value && styles.iconOptionSelected,
            ]}
            onPress={() => updateFormData('icon', iconOption.value)}
          >
            <Text style={styles.iconDisplay}>{iconOption.display}</Text>
            <Text style={styles.iconName}>{iconOption.name}</Text>
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
          {isEditing ? 'Edit Category' : 'Add Category'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Category Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.categoryPreview}>
              <View
                style={[
                  styles.previewColorIndicator,
                  { backgroundColor: formData.color },
                ]}
              />
              <Text style={styles.previewIcon}>
                {iconOptions.find(opt => opt.value === formData.icon)?.display || '🏷️'}
              </Text>
              <Text style={styles.previewName}>
                {formData.name || 'Category Name'}
              </Text>
            </View>
          </View>

          <CustomTextInput
            label="Category Name *"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="e.g., Groceries, Entertainment, etc."
            error={errors.name}
            leftIcon={<Text style={styles.inputIcon}>🏷️</Text>}
          />

          <CustomTextInput
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Brief description of this category"
            multiline
            numberOfLines={3}
            leftIcon={<Text style={styles.inputIcon}>📝</Text>}
          />

          {renderColorSelector()}

          {renderIconSelector()}

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Custom categories help you organize transactions according to your specific needs. 
              You can edit or delete custom categories anytime.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={isEditing ? 'Update Category' : 'Create Category'}
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
  previewContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  previewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  categoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    minWidth: 200,
  },
  previewColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  previewIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  previewName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  selectorContainer: {
    marginBottom: spacing.lg,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
  },
  colorSelectedIcon: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconOption: {
    width: '23%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  iconDisplay: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  iconName: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
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

export default AddEditCategoryScreen;