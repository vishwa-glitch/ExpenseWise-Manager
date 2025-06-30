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
import { updateUserProfile } from '../../store/slices/userSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';

interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  const { profile, isLoading } = useTypedSelector((state) => state.user);
  const { user, isAuthenticated } = useTypedSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    preferred_currency: '',
  });

  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize form with current user data
    if (profile || user) {
      const userData = profile || user;
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        preferred_currency: userData.preferred_currency || 'USD',
      });
    }
  }, [profile, user]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    };

    let hasError = false;

    // First Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
      hasError = true;
    }

    // Last Name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
      hasError = true;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      hasError = true;
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone.trim() && formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        preferred_currency: formData.preferred_currency,
      };

      await dispatch(updateUserProfile(updateData)).unwrap();
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const currencyOptions = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  const renderCurrencySelector = () => (
    <View style={styles.currencySelector}>
      <Text style={styles.label}>Preferred Currency</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
        {currencyOptions.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyOption,
              formData.preferred_currency === currency.code && styles.currencyOptionSelected,
            ]}
            onPress={() => updateFormData('preferred_currency', currency.code)}
          >
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <Text
              style={[
                styles.currencyCode,
                formData.preferred_currency === currency.code && styles.currencyCodeSelected,
              ]}
            >
              {currency.code}
            </Text>
            <Text style={styles.currencyName}>{currency.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (!isAuthenticated) {
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.nameRow}>
            <CustomTextInput
              label="First Name *"
              value={formData.first_name}
              onChangeText={(value) => updateFormData('first_name', value)}
              placeholder="Enter first name"
              error={errors.first_name}
              style={styles.nameInput}
              leftIcon={<Text style={styles.inputIcon}>👤</Text>}
            />
            <CustomTextInput
              label="Last Name *"
              value={formData.last_name}
              onChangeText={(value) => updateFormData('last_name', value)}
              placeholder="Enter last name"
              error={errors.last_name}
              style={styles.nameInput}
              leftIcon={<Text style={styles.inputIcon}>👤</Text>}
            />
          </View>

          <CustomTextInput
            label="Email Address *"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            error={errors.email}
            leftIcon={<Text style={styles.inputIcon}>📧</Text>}
          />

          <CustomTextInput
            label="Phone Number (Optional)"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={<Text style={styles.inputIcon}>📱</Text>}
          />

          {renderCurrencySelector()}

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Your preferred currency will be used as the default for new accounts and transactions. 
              Existing accounts will keep their current currency settings.
            </Text>
          </View>

          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTitle}>Current Subscription</Text>
            <View style={styles.subscriptionDetails}>
              <Text style={styles.subscriptionTier}>
                {profile?.subscription_tier === 'premium' ? '⭐ Premium Member' : '🆓 Free Member'}
              </Text>
              {profile?.subscription_expires_at && (
                <Text style={styles.subscriptionExpiry}>
                  Expires: {new Date(profile.subscription_expires_at).toLocaleDateString('en-IN')}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Save Changes"
          onPress={handleSave}
          loading={isSaving}
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
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
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
  currencySelector: {
    marginBottom: spacing.lg,
  },
  currencyScroll: {
    flexGrow: 0,
  },
  currencyOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  currencyOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  currencySymbol: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  currencyCode: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  currencyCodeSelected: {
    color: colors.primary,
  },
  currencyName: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
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
  subscriptionInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  subscriptionTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subscriptionDetails: {
    alignItems: 'center',
  },
  subscriptionTier: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subscriptionExpiry: {
    ...typography.small,
    color: colors.textSecondary,
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

export default EditProfileScreen;