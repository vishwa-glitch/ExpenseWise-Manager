import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { login } from '../../store/slices/authSlice';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';

interface LoginScreenProps {
  navigation: any;
  route?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useTypedSelector((state) => state.auth);

  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Pre-fill email if coming from registration with existing email
  useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route?.params?.prefillEmail]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validation
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) return;

    try {
      await dispatch(login({ email: email.trim(), password })).unwrap();
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('Invalid email or password')) {
        Alert.alert(
          'Login Failed',
          'Invalid email or password. Please check your credentials and try again.',
          [
            { text: 'OK' },
            {
              text: 'Forgot Password?',
              onPress: () => navigation.navigate('ForgotPassword'),
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', err.message || 'Please check your credentials and try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>💰</Text>
            <Text style={styles.title}>Finance Manager</Text>
            <Text style={styles.subtitle}>Welcome back! Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <CustomTextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={emailError}
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
            />

            <CustomTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={passwordError}
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <CustomButton
              title="Forgot Password?"
              onPress={() => navigation.navigate('ForgotPassword')}
              variant="outline"
              style={styles.forgotButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <CustomButton
              title="Create Account"
              onPress={() => navigation.navigate('Register')}
              variant="secondary"
              style={styles.registerButton}
            />
          </View>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoText}>Email: test@example.com</Text>
            <Text style={styles.demoText}>Password: testpassword123</Text>
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
    marginBottom: spacing.xxl,
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
  inputIcon: {
    fontSize: 20,
  },
  loginButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  forgotButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  registerButton: {
    minWidth: 200,
  },
  demoCredentials: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  demoText: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default LoginScreen;