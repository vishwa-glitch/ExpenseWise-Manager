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
import { updateUserProfile, fetchUserProfile } from '../../store/slices/userSlice';
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
  });

  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize form with current user data from backend
    if (profile || user) {
      const userData = profile || user;
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
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

    // Email validation - removed since email is not editable

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
        phone: formData.phone.trim() || undefined,
      };

      // Update profile via backend API
      await dispatch(updateUserProfile(updateData)).unwrap();
      
      // Refresh profile data to get updated information
      await dispatch(fetchUserProfile());
      
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

          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Email Address</Text>
            <View style={styles.emailDisplay}>
              <Text style={styles.emailIcon}>📧</Text>
              <Text style={styles.emailText}>{formData.email}</Text>
            </View>
            <Text style={styles.emailNote}>Email address cannot be changed</Text>
          </View>

          <CustomTextInput
            label="Phone Number (Optional)"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={<Text style={styles.inputIcon}>📱</Text>}
          />

          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTitle}>Current Subscription</Text>
            <View style={styles.subscriptionDetails}>
              <Text style={styles.subscriptionTier}>
                ⭐ Premium Member {/* TEMPORARY: All users show as premium for app launch */}
              </Text>
              <Text style={styles.premiumStatus}>
                ✨ Enjoy Premium Features
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your profile information is securely stored and used to personalize your experience.
            </Text>
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
    padding: spacing.md,
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  inputIcon: {
    fontSize: 20,
  },
  subscriptionInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  subscriptionTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
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
  premiumStatus: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subscriptionExpiry: {
    ...typography.small,
    color: colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
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
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    width: '100%',
  },
  emailContainer: {
    marginBottom: spacing.md,
  },
  emailLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  emailText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  emailNote: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});

export default EditProfileScreen;