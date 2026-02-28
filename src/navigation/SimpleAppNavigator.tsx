import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { checkAuthStatus } from '../store/slices/authSlice';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

const SimpleAppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 SimpleAppNavigator - Initializing app...');
      try {
        await dispatch(checkAuthStatus());
        console.log('✅ SimpleAppNavigator - Auth status checked');
      } catch (error) {
        console.error('❌ SimpleAppNavigator - Error during app initialization:', error);
      }
    };
    
    initializeApp();
  }, [dispatch]);

  console.log('🔍 SimpleAppNavigator - State:', { isAuthenticated, isLoading });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default SimpleAppNavigator;
