import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoreScreen from '../screens/more/MoreScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import AddEditCategoryScreen from '../screens/categories/AddEditCategoryScreen';
import AnalyticsNavigator from './AnalyticsNavigator';
import BillsScreen from '../screens/bills/BillsScreen';
import ExportNavigator from './ExportNavigator';
import HelpSupportScreen from '../screens/help/HelpSupportScreen';
import NotificationSettingsScreen from '../screens/notifications/NotificationSettingsScreen';
import DailyReminderSettingsScreen from '../screens/notifications/DailyReminderSettingsScreen';

const Stack = createStackNavigator();

const MoreNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MoreMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="AddEditCategory" component={AddEditCategoryScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsNavigator} />
      <Stack.Screen name="Bills" component={BillsScreen} />
      <Stack.Screen name="Export" component={ExportNavigator} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="DailyReminderSettings" component={DailyReminderSettingsScreen} />
    </Stack.Navigator>
  );
};

export default MoreNavigator;