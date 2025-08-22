import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GoalsListScreen from '../screens/goals/GoalsListScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import AddManualGoalScreen from '../screens/goals/AddManualGoalScreen';
import GoalAnalyticsScreen from '../screens/goals/GoalAnalyticsScreen';

const Stack = createStackNavigator();

const GoalsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GoalsList" component={GoalsListScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <Stack.Screen name="AddManualGoal" component={AddManualGoalScreen} />
      <Stack.Screen name="GoalAnalytics" component={GoalAnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default GoalsNavigator;