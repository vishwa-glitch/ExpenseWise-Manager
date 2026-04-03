import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
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
      name: '',
    };

    let hasError = false;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

    setErrors(newErrors);
    return !hasError;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    console.log('🎯 Starting registration process...');
    console.log('📋 Form data:', {
      email: formData.email.trim(),
      first_name: formData.name.trim(),
      password_length: formData.password.length
    });

    try {
      await dispatch(register({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.name.trim(),
        last_name: undefined,
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


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#45a049', '#388E3C']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                  <CustomTextInput
                    label="Name"
                    value={formData.name}
                    onChangeText={(value) => updateFormData('name', value)}
                    placeholder="Enter your name"
                    error={errors.name}
                    leftIcon={<Text style={styles.inputIcon}>👤</Text>}
                  />

                  <CustomTextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    error={errors.email}
                    leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
                  />

                  <CustomTextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    placeholder="Create a password"
                    error={errors.password}
                    secureTextEntry={true}
                    leftIcon={<Text style={styles.inputIcon}>🔐</Text>}
                  />

                  {renderPasswordRequirements()}

                  <CustomButton
                    title="Create Account"
                    onPress={handleRegister}
                    loading={isLoading}
                    style={styles.registerButton}
                  />
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
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md * 1.5,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  form: {
    marginBottom: 0,
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
    fontSize: 16,
    marginRight: spacing.xs,
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
    marginTop: spacing.lg,
    backgroundColor: '#2d7a2e',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: spacing.xs,
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.lg * 1.5,
    paddingVertical: spacing.sm * 1.2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    minWidth: 160,
    alignItems: 'center',
  },
  loginButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RegisterScreen;
