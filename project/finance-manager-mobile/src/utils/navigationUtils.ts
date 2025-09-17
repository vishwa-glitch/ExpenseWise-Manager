/**
 * Navigation utility functions to handle common navigation patterns
 * and fix navigation state issues
 */

export const resetMainNavigationState = (navigation: any) => {
  try {
    // Simple approach - just navigate to dashboard without aggressive resets
    navigation.navigate('Home', { screen: 'Dashboard' });
    console.log('✅ Navigated to Dashboard after onboarding');
  } catch (error) {
    console.warn('⚠️ Failed to navigate to Dashboard:', error);
  }
};

export const resetMoreTabNavigation = (navigation: any) => {
  try {
    // Navigate to More tab and reset its stack to MoreMain
    navigation.navigate('Home', {
      screen: 'More',
      params: {
        screen: 'MoreMain',
      },
      initial: false,
    });
    console.log('✅ More tab navigation reset successfully');
  } catch (error) {
    console.warn('⚠️ Failed to reset More tab navigation:', error);
  }
};

export const navigateToMoreScreen = (navigation: any) => {
  try {
    // First reset the More tab to ensure clean state
    resetMoreTabNavigation(navigation);
    console.log('✅ Navigated to More screen with clean state');
  } catch (error) {
    console.warn('⚠️ Failed to navigate to More screen:', error);
  }
};