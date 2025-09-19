import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { completeOnboarding } from '../store/slices/onboardingSlice';
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3';

const OnboardingNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const dispatch = useAppDispatch();

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

  const handleGetStarted = async () => {
    console.log('✅ User completed onboarding');
    await dispatch(completeOnboarding());
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
            onGetStarted={handleGetStarted}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingNavigator;