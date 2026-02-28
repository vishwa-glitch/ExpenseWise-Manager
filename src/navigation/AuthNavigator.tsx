import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CurrencySelectionScreen from '../screens/auth/CurrencySelectionScreen';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Register"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CurrencySelection" component={CurrencySelectionScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;