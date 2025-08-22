import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { checkAuthStatus, completeCurrencySelection } from '../store/slices/authSlice';
import { fetchUserProfile, loadUserCurrency } from '../store/slices/userSlice';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import CurrencySelectionScreen from '../screens/auth/CurrencySelectionScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, needsCurrencySelection } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      await dispatch(checkAuthStatus());
      await dispatch(loadUserCurrency());
      
      // If authenticated, also fetch user profile
      if (isAuthenticated) {
        await dispatch(fetchUserProfile());
      }
    };
    
    initializeApp();
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
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
  );
};

export default AppNavigator;