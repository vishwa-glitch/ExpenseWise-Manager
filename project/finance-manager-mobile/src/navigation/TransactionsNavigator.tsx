import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import TransactionsListScreen from '../screens/transactions/TransactionsListScreen';
import TransactionDetailScreen from '../screens/transactions/TransactionDetailScreen';
import AddEditTransactionScreen from '../screens/transactions/AddEditTransactionScreen';
import TransactionCalendarScreen from '../screens/transactions/TransactionCalendarScreen';
import StatementImportScreen from '../screens/statements/StatementImportScreen';
import { colors, typography, spacing } from '../constants/colors';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

// Top Tab Navigator for main transaction views
const TransactionTopTabs: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Top Tab Navigator */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: colors.background,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarPressColor: colors.primary + '20',
          swipeEnabled: true,
          lazy: true,
          lazyPreloadDistance: 1,
        }}
        initialRouteName="AllTransactions"
      >
        <Tab.Screen
          name="AllTransactions"
          component={TransactionsListScreen}
          options={{
            tabBarLabel: 'All Transactions',
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={TransactionCalendarScreen}
          options={{
            tabBarLabel: 'Calendar',
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

// Main Stack Navigator for transactions
const TransactionsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TransactionsMain" component={TransactionTopTabs} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="AddEditTransaction" component={AddEditTransactionScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.text,
  },
});

export default TransactionsNavigator;