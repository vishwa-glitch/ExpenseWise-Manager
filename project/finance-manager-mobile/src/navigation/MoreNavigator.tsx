import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoreScreen from '../screens/more/MoreScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import AddEditCategoryScreen from '../screens/categories/AddEditCategoryScreen';
import BudgetsScreen from '../screens/budgets/BudgetsScreen';
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
      <Stack.Screen name="Bills" component={BillsScreen} />
    </Stack.Navigator>
  );
};

export default MoreNavigator;