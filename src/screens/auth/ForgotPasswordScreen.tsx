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
} from 'react-native';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsEmailSent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>📧</Text>
          <Text style={styles.successTitle}>Email Sent!</Text>
          <Text style={styles.successMessage}>
            We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
          </Text>
          <CustomButton
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>🔒</Text>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
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

            <CustomButton
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.resetButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <CustomButton
              title="Back to Login"
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
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputIcon: {
    fontSize: 20,
  },
  resetButton: {
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  loginButton: {
    minWidth: 200,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  backButton: {
    minWidth: 200,
  },
});

export default ForgotPasswordScreen;