import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoreScreen from '../screens/more/MoreScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import AddEditCategoryScreen from '../screens/categories/AddEditCategoryScreen';
import BudgetsScreen from '../screens/budgets/BudgetsScreen';
import AnalyticsNavigator from './AnalyticsNavigator';
import BudgetsListScreen from '../screens/budgets/BudgetsListScreen';
import BudgetDetailScreen from '../screens/budgets/BudgetDetailScreen';
import CreateEditBudgetScreen from '../screens/budgets/CreateEditBudgetScreen';
import BillsScreen from '../screens/bills/BillsScreen';

const Stack = createStackNavigator();

const MoreNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="AddEditCategory" component={AddEditCategoryScreen} />
      <Stack.Screen name="Budgets" component={BudgetsScreen} />
      <Stack.Screen name="BudgetsList" component={BudgetsListScreen} />
      <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
      <Stack.Screen name="CreateBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="EditBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsNavigator} />
      <Stack.Screen name="Bills" component={BillsScreen} />
    </Stack.Navigator>
  );
};

export default MoreNavigator;