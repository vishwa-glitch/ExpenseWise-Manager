import React from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

// Import tab screens
import DashboardNavigator from './DashboardNavigator';
import TransactionsNavigator from './TransactionsNavigator';
import GoalsNavigator from './GoalsNavigator';
import MoreNavigator from './MoreNavigator';

// Import drawer screens
import StatementImportScreen from '../screens/statements/StatementImportScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import RecommendationsHistoryScreen from '../screens/recommendations/RecommendationsHistoryScreen';

import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileNavigator from './ProfileNavigator';
import AccountSharesScreen from '../screens/accounts/AccountSharingScreen';
import HelpSupportScreen from '../screens/help/HelpSupportScreen';

// Import account screens for direct navigation
import AccountsListScreen from '../screens/accounts/AccountsListScreen';
import AccountDetailScreen from '../screens/accounts/AccountDetailScreen';
import AddEditAccountScreen from '../screens/accounts/AddEditAccountScreen';
import AccountSharingScreen from '../screens/accounts/AccountSharingScreen';

// Import global components



const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const { width: screenWidth } = Dimensions.get('window');

// Tab Bar Icon Component
const TabBarIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const iconMap: { [key: string]: string } = {
    Dashboard: '🏠',
    Transactions: '📋',
    'Goals & Budget': '🎯',
    More: '☰',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>
        {iconMap[name] || '📱'}
      </Text>
      <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary }]}>
        {name}
      </Text>
    </View>
  );
};

// Custom Bottom Tab Bar Component
const CustomBottomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.customTabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined 
          ? options.tabBarLabel 
          : options.title !== undefined 
          ? options.title 
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.jumpTo(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <TabBarIcon name={label} focused={isFocused} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

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

// Swipeable Tab Navigator (removed Accounts tab)
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: false,
        lazy: true,
        lazyPreloadDistance: 1,
        animationEnabled: true,
      }}
      initialLayout={{ width: screenWidth }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardNavigator}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsNavigator}
        options={{ tabBarLabel: 'Transactions' }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsNavigator}
        options={{ tabBarLabel: 'Goals & Budget' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreNavigator}
        options={{ tabBarLabel: 'More' }}
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
      </Stack.Navigator>
      
      {/* Global Premium Modal */}
      
    </>
  );
};

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 10,
    paddingTop: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MainNavigator;