import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BudgetsListScreen from '../screens/budgets/BudgetsListScreen';
import BudgetDetailScreen from '../screens/budgets/BudgetDetailScreen';
import CreateEditBudgetScreen from '../screens/budgets/CreateEditBudgetScreen';
import BudgetAnalyticsScreen from '../screens/budgets/BudgetAnalyticsScreen';

const Stack = createStackNavigator();

const BudgetNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BudgetsList" component={BudgetsListScreen} />
      <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
      <Stack.Screen name="CreateBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="EditBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="BudgetAnalytics" component={BudgetAnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default BudgetNavigator;

