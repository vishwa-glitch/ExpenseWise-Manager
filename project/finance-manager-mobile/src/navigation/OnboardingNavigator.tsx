import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { completeOnboarding } from '../store/slices/onboardingSlice';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const { width } = Dimensions.get('window');
const Stack = createStackNavigator();

// Component to handle onboarding screens with swipeable navigation
const OnboardingScreensFlow: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);

  const handleNext = () => {
    if (currentScreen < 2) {
      const nextScreen = currentScreen + 1;
      setCurrentScreen(nextScreen);
      pagerRef.current?.setPage(nextScreen);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      const prevScreen = currentScreen - 1;
      setCurrentScreen(prevScreen);
      pagerRef.current?.setPage(prevScreen);
    }
  };

  const handlePageSelected = (event: any) => {
    const selectedPage = event.nativeEvent.position;
    setCurrentScreen(selectedPage);
  };

  const handleGetStarted = () => {
    console.log('✅ User completed onboarding, navigating to login');
    navigation.navigate('Login' as never);
  };

  return (
    <OnboardingProvider currentScreen={currentScreen} totalScreens={3}>
      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={handlePageSelected}
          scrollEnabled={true}
        >
          <View key="1" style={styles.pageContainer}>
            <OnboardingScreen1
              onNext={handleNext}
            />
          </View>
          <View key="2" style={styles.pageContainer}>
            <OnboardingScreen2
              onNext={handleNext}
              onBack={handleBack}
            />
          </View>
          <View key="3" style={styles.pageContainer}>
            <OnboardingScreen3
              onGetStarted={handleGetStarted}
              onBack={handleBack}
            />
          </View>
        </PagerView>
      </View>
    </OnboardingProvider>
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
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    width: width,
  },
});

export default OnboardingNavigator;