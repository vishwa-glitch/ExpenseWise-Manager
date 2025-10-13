import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardEvent,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { register } from '../../store/slices/authSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { ENV } from '../../config/environment';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useTypedSelector((state) => state.auth);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Refs for measuring input positions
  const nameRowRef = useRef<View>(null);
  const emailRef = useRef<View>(null);
  const passwordRef = useRef<View>(null);

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

    console.log('🎯 Starting registration process...');
    console.log('📋 Form data:', {
      email: formData.email.trim(),
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim() || undefined,
      password_length: formData.password.length
    });

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
          'Your password must be at least 8 characters long.',
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleInputFocus = (inputType: 'name' | 'email' | 'password') => {
    setTimeout(() => {
      let targetRef;
      
      switch (inputType) {
        case 'name':
          targetRef = nameRowRef;
          break;
        case 'email':
          targetRef = emailRef;
          break;
        case 'password':
          targetRef = passwordRef;
          break;
      }

      if (targetRef?.current && scrollViewRef.current) {
        targetRef.current.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            // Scroll to position with some offset for better visibility
            scrollViewRef.current?.scrollTo({
              y: y - 100, // Offset to show some content above
              animated: true,
            });
          },
          () => {
            // Fallback if measure fails
            console.log('Failed to measure layout');
          }
        );
      }
    }, 300);
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#45a049', '#388E3C']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Text style={styles.logo}>💰</Text>
                  </View>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Start managing your finances today</Text>
                </View>

              <View style={styles.formCard}>
                <View style={styles.form}>
                  <View style={styles.nameRow} ref={nameRowRef}>
                    <CustomTextInput
                      label="First Name"
                      value={formData.firstName}
                      onChangeText={(value) => updateFormData('firstName', value)}
                      placeholder="First name"
                      error={errors.firstName}
                      style={styles.nameInput}
                      leftIcon={<Text style={styles.inputIcon}>👤</Text>}
                      onFocus={() => handleInputFocus('name')}
                    />
                    <CustomTextInput
                      label="Last Name"
                      value={formData.lastName}
                      onChangeText={(value) => updateFormData('lastName', value)}
                      placeholder="Last name"
                      error={errors.lastName}
                      style={styles.nameInput}
                      leftIcon={<Text style={styles.inputIcon}>👤</Text>}
                      onFocus={() => handleInputFocus('name')}
                    />
                  </View>

                <View ref={emailRef}>
                  <CustomTextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    error={errors.email}
                    leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
                    onFocus={() => handleInputFocus('email')}
                  />
                </View>

                <View ref={passwordRef}>
                  <CustomTextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    placeholder="Create a password"
                    secureTextEntry
                    error={errors.password}
                    leftIcon={<Text style={styles.inputIcon}>🔐</Text>}
                    onFocus={() => handleInputFocus('password')}
                  />

                  {renderPasswordRequirements()}

                  <CustomTextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    placeholder="Confirm your password"
                    secureTextEntry
                    error={errors.confirmPassword}
                    leftIcon={<Text style={styles.inputIcon}>🔐</Text>}
                    onFocus={() => handleInputFocus('password')}
                  />
                </View>

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
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.xl,
  },
  content: {
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  form: {
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  inputIcon: {
    fontSize: 18,
  },
  passwordRequirements: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  requirementsTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  requirementsList: {
    gap: spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    fontSize: 10,
    marginRight: spacing.sm,
    width: 14,
  },
  requirementText: {
    ...typography.small,
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
  },
  registerButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  termsContainer: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  termsText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 10,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
    fontSize: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minWidth: 180,
    alignItems: 'center',
  },
  loginButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;