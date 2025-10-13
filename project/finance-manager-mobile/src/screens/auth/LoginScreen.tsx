import React, { useState, useEffect, useRef } from "react";
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
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { login } from "../../store/slices/authSlice";
import { CustomTextInput } from "../../components/common/CustomTextInput";
import { CustomButton } from "../../components/common/CustomButton";
import { colors, typography, spacing } from "../../constants/colors";

interface LoginScreenProps {
  navigation: any;
  route?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useTypedSelector((state) => state.auth);
  const scrollViewRef = useRef<ScrollView>(null);

  // Refs for measuring input positions
  const emailRef = useRef<View>(null);
  const passwordRef = useRef<View>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
    Linking.openURL(
      "mailto:wealthwise523@gmail.com?subject=Login Support Request"
    );
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validation
    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      hasError = true;
    }

    if (hasError) return;

    try {
      await dispatch(login({ email: email.trim(), password })).unwrap();
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle specific error cases
      if (err.message?.includes("Invalid email or password")) {
        Alert.alert(
          "Login Failed",
          "Invalid email or password. Please check your credentials and try again.",
          [
            { text: "OK" },
            {
              text: "Contact Support",
              onPress: openSupportEmail,
            },
          ]
        );
      } else {
        Alert.alert(
          "Login Failed",
          err.message || "Please check your credentials and try again."
        );
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleInputFocus = (inputType: "email" | "password") => {
    setTimeout(() => {
      const targetRef = inputType === "email" ? emailRef : passwordRef;

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
            console.log("Failed to measure layout");
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
                  <Text style={styles.title}>Welcome Back</Text>
                  <Text style={styles.subtitle}>
                    Sign in to continue managing your finances
                  </Text>
                </View>

                <View style={styles.formCard}>
                  <View style={styles.form}>
                    <View ref={emailRef}>
                      <CustomTextInput
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        error={emailError}
                        leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
                        onFocus={() => handleInputFocus("email")}
                      />
                    </View>

                    <View ref={passwordRef}>
                      <CustomTextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        error={passwordError}
                        leftIcon={<Text style={styles.inputIcon}>🔐</Text>}
                        onFocus={() => handleInputFocus("password")}
                      />
                    </View>

                    <CustomButton
                      title="Sign In"
                      onPress={handleLogin}
                      loading={isLoading}
                      style={styles.loginButton}
                    />
                  </View>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account?</Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate("Register")}
                    style={styles.registerButton}
                  >
                    <Text style={styles.registerButtonText}>Create Account</Text>
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
    justifyContent: "center",
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.xl,
  },
  content: {
    padding: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
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
    textAlign: "center",
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: "center",
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
  inputIcon: {
    fontSize: 18,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: "center",
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
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minWidth: 180,
    alignItems: 'center',
  },
  registerButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
