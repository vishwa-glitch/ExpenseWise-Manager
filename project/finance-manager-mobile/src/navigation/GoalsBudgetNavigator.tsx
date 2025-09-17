import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import GoalsListScreen from '../screens/goals/GoalsListScreen';
import BudgetsListScreen from '../screens/budgets/BudgetsListScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import AddManualGoalScreen from '../screens/goals/AddManualGoalScreen';
import AIGoalSettingScreen from '../screens/goals/AIGoalSettingScreen';
import GoalAnalyticsScreen from '../screens/goals/GoalAnalyticsScreen';
import BudgetDetailScreen from '../screens/budgets/BudgetDetailScreen';
import CreateEditBudgetScreen from '../screens/budgets/CreateEditBudgetScreen';
import BudgetAnalyticsScreen from '../screens/budgets/BudgetAnalyticsScreen';
import { colors, typography, spacing } from '../constants/colors';

const Stack = createStackNavigator();

// Goals/Budget screen with horizontal swipe tabs (Goals / Budget)
const GoalsBudgetMainScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const initialLayout = { width: Dimensions.get('window').width };
  
  // Get initial tab from route params
  const initialTabParam = route?.params?.initialTab as 'goals' | 'budget' | undefined;
  const initialIndex = initialTabParam === 'budget' ? 1 : 0;

  const renderGoals = React.useCallback(() => (
    <GoalsListScreen navigation={navigation} />
  ), [navigation]);

  const renderBudget = React.useCallback(() => (
    <BudgetsListScreen navigation={navigation} />
  ), [navigation]);

  const renderScene = SceneMap({
    goals: renderGoals,
    budget: renderBudget,
  });

  const [index, setIndex] = React.useState(initialIndex);
  
  // Apply initialTab only when provided, then clear it to avoid future resets
  React.useEffect(() => {
    if (!initialTabParam) return;
    setIndex(initialTabParam === 'budget' ? 1 : 0);
    // Clear the param so user-driven swipes don't get overridden
    navigation.setParams({ initialTab: undefined });
  }, [initialTabParam]);

  const [routes] = React.useState([
    { key: 'goals', title: 'Goals' },
    { key: 'budget', title: 'Budget' },
  ]);

  // Custom Tab Bar compatible with current tab-view version
  const TabBarTop: React.FC<any> = ({ navigationState, position }) => {
    const tabWidth = Dimensions.get('window').width / navigationState.routes.length;
    const hasInterpolate = position && typeof position.interpolate === 'function';
    const translateX = hasInterpolate
      ? position.interpolate({
          inputRange: navigationState.routes.map((_: any, i: number) => i),
          outputRange: navigationState.routes.map((_: any, i: number) => i * tabWidth),
        })
      : new Animated.Value(navigationState.index * tabWidth);

    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabsRow}>
          {navigationState.routes.map((r: any, i: number) => {
            const focused = navigationState.index === i;
            return (
              <TouchableOpacity key={r.key} style={[styles.tabItem, { width: tabWidth }]} onPress={() => setIndex(i)}>
                <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary }]}>
                  {r.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Animated.View style={[styles.tabIndicator, { width: tabWidth, transform: [{ translateX }] }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goals & Budget</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        swipeEnabled
        lazy
        renderTabBar={(props) => <TabBarTop {...props} />}
      />
    </View>
  );
};

// Main Stack Navigator for Goals & Budget - Working Version
const GoalsBudgetNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GoalsBudgetMain" component={GoalsBudgetMainScreen} />

      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <Stack.Screen name="AddManualGoal" component={AddManualGoalScreen} />
      <Stack.Screen name="AIGoalSetting" component={AIGoalSettingScreen} />
      <Stack.Screen name="GoalAnalytics" component={GoalAnalyticsScreen} />
      <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
      <Stack.Screen name="CreateBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="EditBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="CreateEditBudget" component={CreateEditBudgetScreen} />
      <Stack.Screen name="BudgetAnalytics" component={BudgetAnalyticsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBarContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  tabIndicator: {
    height: 3,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
});

export default GoalsBudgetNavigator;