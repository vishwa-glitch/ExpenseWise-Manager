import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GoalAnalyticsScreen from '../screens/goals/GoalAnalyticsScreen';

const Stack = createStackNavigator();

const AnalyticsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AnalyticsMain" component={GoalAnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default AnalyticsNavigator;