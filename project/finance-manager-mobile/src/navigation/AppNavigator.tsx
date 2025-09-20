import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { checkAuthStatus, completeCurrencySelection } from '../store/slices/authSlice';
import { fetchUserProfile, loadUserCurrency, setDisplayCurrency } from '../store/slices/userSlice';
import { apiService } from '../services/api';
import { initializeBudgetRenewal } from '../services/budgetRenewalService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
// import NetworkStatusIndicator from '../components/common/NetworkStatusIndicator';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import CurrencySelectionScreen from '../screens/auth/CurrencySelectionScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, needsCurrencySelection } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...');
      try {
        await dispatch(checkAuthStatus());
      } catch (error) {
        console.error('❌ Error during app initialization:', error);
      }
    };
    
    initializeApp();
  }, [dispatch]);

  // Separate effect for loading user data when authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && !isLoading) {
        console.log('✅ User is authenticated, loading user data...');
        try {
          // Only load user data if we have a valid token and user doesn't need currency selection
          const token = await SecureStore.getItemAsync('access_token');
          if (token && !needsCurrencySelection) {
            console.log('✅ Loading user data for existing user...');
            // Add a small delay to ensure authentication state is stable
            setTimeout(async () => {
              try {
                // Load user currency preference first
                const userCurrency = await apiService.getUserCurrencyPreference();
                console.log('💰 Loaded user currency preference:', userCurrency);
                
                // Update Redux store with user's currency preference
                dispatch(setDisplayCurrency(userCurrency));
                
                await dispatch(fetchUserProfile());
                
                // Initialize budget renewal service after user data is loaded
                console.log('🔄 Initializing budget renewal service...');
                await initializeBudgetRenewal();
              } catch (error) {
                console.error('❌ Error loading user data after delay:', error);
              }
            }, 100);
          } else if (needsCurrencySelection) {
            console.log('✅ New user needs currency selection, skipping user data load');
          } else {
            console.log('❌ No access token found, skipping user data load');
          }
        } catch (error) {
          console.error('❌ Error loading user data:', error);
        }
      }
    };
    
    loadUserData();
  }, [dispatch, isAuthenticated, isLoading, needsCurrencySelection]);


  // Debug logging for navigation state
  useEffect(() => {
    console.log('🧭 Navigation state changed:', {
      isAuthenticated,
      needsCurrencySelection,
      isLoading
    });
  }, [isAuthenticated, needsCurrencySelection, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  console.log('🧭 Rendering AppNavigator with state:', {
    isAuthenticated,
    needsCurrencySelection,
    isLoading
  });

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          ) : needsCurrencySelection ? (
            <Stack.Screen 
              name="CurrencySelection" 
              component={CurrencySelectionScreen}
            />
          ) : (
            <Stack.Screen name="Main" component={MainNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;