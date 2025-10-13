import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { completeOnboarding } from '../store/slices/onboardingSlice';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3';
import PagerView from 'react-native-pager-view';

const { width } = Dimensions.get('window');

// Component to handle onboarding screens with swipeable navigation
const OnboardingNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const dispatch = useAppDispatch();

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

  const handleGetStarted = async () => {
    console.log('✅ User completed onboarding, marking as complete');
    await dispatch(completeOnboarding());
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