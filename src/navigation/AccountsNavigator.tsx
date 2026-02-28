import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AccountsListScreen from '../screens/accounts/AccountsListScreen';
import AccountDetailScreen from '../screens/accounts/AccountDetailScreen';
import AddEditAccountScreen from '../screens/accounts/AddEditAccountScreen';
import AccountSharingScreen from '../screens/accounts/AccountSharingScreen';

const Stack = createStackNavigator();

const AccountsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AccountsList" component={AccountsListScreen} />
      <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
      <Stack.Screen name="AddEditAccount" component={AddEditAccountScreen} />
      <Stack.Screen name="AccountSharing" component={AccountSharingScreen} />
    </Stack.Navigator>
  );
};

export default AccountsNavigator;