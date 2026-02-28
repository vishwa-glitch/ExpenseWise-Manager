import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import GoalAnalyticsScreen from '../screens/goals/GoalAnalyticsScreen'; // removed for now


const Stack = createStackNavigator();

const AnalyticsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Goals analytics removed for now - functionality kept for future use */}
      {/* <Stack.Screen 
        name="AnalyticsMain" 
        component={GoalAnalyticsScreen}
      /> */}
    </Stack.Navigator>
  );
};

export default AnalyticsNavigator;