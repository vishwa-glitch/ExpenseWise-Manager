import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

const Stack = createStackNavigator();

const DashboardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;