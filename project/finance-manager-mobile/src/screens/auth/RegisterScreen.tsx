import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { register } from '../../store/slices/authSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useTypedSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);



  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    
    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements,
    };
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    };

    let hasError = false;

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      hasError = true;
    }

    // Last Name validation (optional)
    // No validation needed as last name is optional

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      hasError = true;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password does not meet requirements';
        hasError = true;
      }
    }

    // Confirm Password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      hasError = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(register({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim() || undefined, // Make last name optional
      })).unwrap();
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific error cases with user-friendly messages
      if (err.message?.includes('already exists')) {
        // Show a more helpful dialog for existing email
        Alert.alert(
          'Account Already Exists',
          'An account with this email address already exists. Would you like to sign in instead?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Sign In',
              onPress: () => {
                // Pre-fill the email on login screen
                navigation.navigate('Login', { prefillEmail: formData.email });
              },
            },
          ]
        );
      } else if (err.message?.includes('Password must be') || err.message?.includes('password')) {
        // Show password requirements dialog
        Alert.alert(
          'Password Requirements',
          'Your password must meet the following requirements:\n\n• At least 8 characters long\n• Contains uppercase letter (A-Z)\n• Contains lowercase letter (a-z)\n• Contains number (0-9)',
          [{ text: 'OK' }]
        );
        setShowPasswordRequirements(true);
      } else if (err.message?.includes('email') || err.message?.includes('Email')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        // Show generic error for other cases
        Alert.alert('Registration Failed', err.message || 'Please check your information and try again.');
      }
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show password requirements when user starts typing password
    if (field === 'password') {
      setShowPasswordRequirements(value.length > 0);
    }
  };

  const renderPasswordRequirements = () => {
    if (!showPasswordRequirements) return null;
    
    const validation = validatePassword(formData.password);
    
    return (
      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
        <View style={styles.requirementsList}>
          <RequirementItem 
            text="At least 8 characters" 
            met={validation.requirements.length} 
          />
          <RequirementItem 
            text="Uppercase letter (A-Z)" 
            met={validation.requirements.uppercase} 
          />
          <RequirementItem 
            text="Lowercase letter (a-z)" 
            met={validation.requirements.lowercase} 
          />
          <RequirementItem 
            text="Number (0-9)" 
            met={validation.requirements.number} 
          />
        </View>
      </View>
    );
  };

  const RequirementItem: React.FC<{ text: string; met: boolean }> = ({ text, met }) => (
    <View style={styles.requirementItem}>
      <Text style={[styles.requirementIcon, { color: met ? colors.success : colors.textSecondary }]}>
        {met ? '✓' : '○'}
      </Text>
      <Text style={[styles.requirementText, { color: met ? colors.success : colors.textSecondary }]}>
        {text}
      </Text>
    </View>
  );



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>💰</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Finance Manager today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <CustomTextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="First name"
                error={errors.firstName}
                style={styles.nameInput}
                leftIcon={<Text style={styles.inputIcon}>👤</Text>}
              />
              <CustomTextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Last name"
                error={errors.lastName}
                style={styles.nameInput}
                leftIcon={<Text style={styles.inputIcon}>👤</Text>}
              />
            </View>

            <CustomTextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={errors.email}
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
            />

            <CustomTextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Create a password"
              secureTextEntry
              error={errors.password}
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            {renderPasswordRequirements()}

            <CustomTextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            <CustomButton
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            {/* Terms and Privacy Notice */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <CustomButton
              title="Sign In"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.loginButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
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
  passwordRequirements: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  requirementsTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  requirementsList: {
    gap: spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    fontSize: 12,
    marginRight: spacing.sm,
    width: 16,
  },
  requirementText: {
    ...typography.small,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  termsContainer: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  termsText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  loginButton: {
    minWidth: 200,
  },
});

export default RegisterScreen;