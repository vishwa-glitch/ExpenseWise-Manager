import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import GoalsListScreen from '../screens/goals/GoalsListScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import AddManualGoalScreen from '../screens/goals/AddManualGoalScreen';
import GoalAnalyticsScreen from '../screens/goals/GoalAnalyticsScreen';
import BudgetsListScreen from '../screens/budgets/BudgetsListScreen';
import BudgetDetailScreen from '../screens/budgets/BudgetDetailScreen';
import CreateEditBudgetScreen from '../screens/budgets/CreateEditBudgetScreen';
import BudgetAnalyticsScreen from '../screens/budgets/BudgetAnalyticsScreen';
import { colors, typography, spacing } from '../constants/colors';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const GoalsTopTabs: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goals</Text>
          <View style={styles.menuButton} />
        </View>
      </SafeAreaView>

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
        initialRouteName="GoalsList"
      >
        <Tab.Screen
          name="GoalsList"
          component={GoalsListScreen}
          options={{
            tabBarLabel: 'Goals',
          }}
        />
        <Tab.Screen
          name="Budget"
          component={BudgetsListScreen}
          options={{
            tabBarLabel: 'Budget',
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const GoalsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GoalsMain" component={GoalsTopTabs} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <Stack.Screen name="AddManualGoal" component={AddManualGoalScreen} />
      <Stack.Screen name="GoalAnalytics" component={GoalAnalyticsScreen} />
      <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
      <Stack.Screen name="CreateBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="EditBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="BudgetAnalytics" component={BudgetAnalyticsScreen} />
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

export default GoalsNavigator;