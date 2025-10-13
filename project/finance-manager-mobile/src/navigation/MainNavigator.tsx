import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { colors } from '../constants/colors';

// Import tab screens
import DashboardNavigator from './DashboardNavigator';
import TransactionsNavigator from './TransactionsNavigator';
import GoalsBudgetNavigator from './GoalsBudgetNavigator';
import MoreNavigator from './MoreNavigator';

// Import drawer screens
import StatementImportScreen from '../screens/statements/StatementImportScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import RecommendationsHistoryScreen from '../screens/recommendations/RecommendationsHistoryScreen';

import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileNavigator from './ProfileNavigator';
import AccountSharesScreen from '../screens/accounts/AccountSharingScreen';
import HelpSupportScreen from '../screens/help/HelpSupportScreen';
import AccountDeletionScreen from '../screens/help/AccountDeletionScreen';

// Import account screens for direct navigation
import AccountsListScreen from '../screens/accounts/AccountsListScreen';
import AccountDetailScreen from '../screens/accounts/AccountDetailScreen';
import AddEditAccountScreen from '../screens/accounts/AddEditAccountScreen';
import AccountSharingScreen from '../screens/accounts/AccountSharingScreen';

// Import global components
import OnboardingOverlay from '../components/onboarding/OnboardingOverlay';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom hamburger menu icon component
const HamburgerIcon: React.FC<{ focused: boolean }> = ({ focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: 20,
      height: 2,
      backgroundColor: focused ? colors.primary : colors.textSecondary,
      marginBottom: 3,
      opacity: focused ? 1 : 0.6,
    }} />
    <View style={{
      width: 20,
      height: 2,
      backgroundColor: focused ? colors.primary : colors.textSecondary,
      marginBottom: 3,
      opacity: focused ? 1 : 0.6,
    }} />
    <View style={{
      width: 20,
      height: 2,
      backgroundColor: focused ? colors.primary : colors.textSecondary,
      opacity: focused ? 1 : 0.6,
    }} />
  </View>
);

// Dimensions removed - not needed for simplified tab navigator

// Custom tab bar components removed - using default bottom tab navigator

// Account Stack Navigator (for direct navigation from dashboard)
const AccountStackNavigator: React.FC = () => {
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

// Bottom Tab Navigator - Simplified to prevent crashes
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardNavigator}
        options={{ 
          tabBarLabel: 'Dashboard',
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>🏡</Text>
          )
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsNavigator}
        options={{ 
          tabBarLabel: 'Transactions',
          title: 'Transactions',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>📄</Text>
          )
        }}
      />
      <Tab.Screen 
        name="GoalsBudget" 
        component={GoalsBudgetNavigator}
        options={{ 
          tabBarLabel: 'Goals & Budget',
          title: 'Goals & Budget',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>🎯</Text>
          )
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreNavigator}
        options={{ 
          tabBarLabel: 'More',
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <HamburgerIcon focused={focused} />
          )
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default behavior
            e.preventDefault();
            
            // Navigate to More tab and ensure it shows MoreMain screen
            navigation.navigate('More', { 
              screen: 'MoreMain',
              initial: false 
            });
            
            console.log('🔄 More tab pressed - navigating to MoreMain');
          },
        })}
      />
    </Tab.Navigator>
  );
};

// Main Navigator (removed drawer navigation)
const MainNavigator: React.FC = () => {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Accounts" component={AccountStackNavigator} />
        <Stack.Screen name="RecommendationsHistory" component={RecommendationsHistoryScreen} />

        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileNavigator} />
        <Stack.Screen name="AccountShares" component={AccountSharesScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="AccountDeletion" component={AccountDeletionScreen} />
      </Stack.Navigator>
      
      {/* Global Onboarding Overlay */}
      <OnboardingOverlay />
    </>
  );
};

// Styles removed - using default bottom tab navigator styles

export default MainNavigator;