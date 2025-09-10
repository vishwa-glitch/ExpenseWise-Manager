import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import TransactionsListScreen from '../screens/transactions/TransactionsListScreen';
import TransactionDetailScreen from '../screens/transactions/TransactionDetailScreen';
import AddEditTransactionScreen from '../screens/transactions/AddEditTransactionScreen';
import TransactionCalendarScreen from '../screens/transactions/TransactionCalendarScreen';
import { colors, typography, spacing } from '../constants/colors';

const Stack = createStackNavigator();

// Transactions screen with horizontal swipe tabs (All Transactions / Calendar)
const TransactionMainScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const initialLayout = { width: Dimensions.get('window').width };
  
  // Get initial tab from route params (for onboarding navigation)
  // Only act when param is explicitly provided; avoid defaulting to 'all' to prevent snap-back
  const initialTabParam = route?.params?.initialTab as 'all' | 'calendar' | undefined;
  const initialIndex = initialTabParam === 'calendar' ? 1 : 0;

  const renderAll = React.useCallback(() => (
    <TransactionsListScreen navigation={navigation} />
  ), [navigation]);

  const renderCalendar = React.useCallback(() => (
    <TransactionCalendarScreen navigation={navigation} />
  ), [navigation]);

  const renderScene = SceneMap({
    all: renderAll,
    calendar: renderCalendar,
  });

  const [index, setIndex] = React.useState(initialIndex);
  
  // Apply initialTab only when provided, then clear it to avoid future resets
  React.useEffect(() => {
    if (!initialTabParam) return;
    setIndex(initialTabParam === 'calendar' ? 1 : 0);
    // Clear the param so user-driven swipes don't get overridden
    navigation.setParams({ initialTab: undefined });
  }, [initialTabParam]);
  const [routes] = React.useState([
    { key: 'all', title: 'All Transactions' },
    { key: 'calendar', title: 'Calendar' },
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
          <Text style={styles.headerTitle}>Transactions</Text>
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

// Main Stack Navigator for transactions - Working Version
const TransactionsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TransactionsMain" component={TransactionMainScreen} />
      <Stack.Screen 
        name="AllTransactions" 
        component={TransactionsListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Transactions',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          headerTitleStyle: {
            ...typography.h2,
            color: colors.text,
            fontWeight: 'bold',
          },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen name="Calendar" component={TransactionCalendarScreen} />
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

export default TransactionsNavigator;