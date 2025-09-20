import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Linking,
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
  const scrollViewRef = useRef<ScrollView>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const openSupportEmail = () => {
    Linking.openURL('mailto:wealthwise523@gmail.com?subject=Login Support Request');
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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
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
              text: 'Contact Support',
              onPress: openSupportEmail,
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', err.message || 'Please check your credentials and try again.');
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleInputFocus = () => {
    // Scroll to ensure the focused input is visible
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
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
                <Text style={styles.title}>Expense Manager</Text>
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
                  leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
                  onFocus={handleInputFocus}
                />

                <CustomTextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  error={passwordError}
                  leftIcon={<Text style={styles.inputIcon}>🔐</Text>}
                  onFocus={handleInputFocus}
                />

                <CustomButton
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isLoading}
                  style={styles.loginButton}
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
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl * 2,
  },
  content: {
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    fontSize: 18,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  registerButton: {
    minWidth: 180,
  },
});

export default LoginScreen;