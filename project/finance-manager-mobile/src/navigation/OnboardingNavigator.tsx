import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { completeOnboarding } from '../store/slices/onboardingSlice';
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

// Component to handle onboarding screens with internal navigation
const OnboardingScreensFlow: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigation = useNavigation();

  const handleNext = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return (
          <OnboardingScreen1
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <OnboardingScreen2
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (              
          <OnboardingScreen3
            onGetStarted={() => {
              // Navigate to Login screen after onboarding
              console.log('✅ User completed onboarding, navigating to login');
              navigation.navigate('Login' as never);
            }}
            onBack={handleBack}
          />
        );
      default:
        return (
          <OnboardingScreen1
            onNext={handleNext}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingFlow"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OnboardingFlow" component={OnboardingScreensFlow} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingNavigator;