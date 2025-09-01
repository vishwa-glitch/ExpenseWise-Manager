import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { dailyExpenseReminderService } from './src/services/dailyExpenseReminderService';
// import { networkService } from './src/services/networkService';

// Loading component for PersistGate
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10, fontSize: 16 }}>Loading your data...</Text>
  </View>
);

export default function App() {
  // AdMob initialization removed for now - files kept for future use
  // See ADMOB_IMPLEMENTATION.md for re-enabling instructions

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        console.log('🔔 Initializing services...');
        
        // Initialize network service first
        // await networkService.initialize();
        // console.log('✅ Network service initialized successfully');
        
        // Initialize notification service
        await notificationService.getPushToken();
        console.log('✅ Notification service initialized successfully');
        
        // Initialize daily expense reminder service
        await dailyExpenseReminderService.initialize();
        console.log('✅ Daily expense reminder service initialized successfully');
        
      } catch (error) {
        console.error('❌ Error initializing services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <StatusBar style="auto" />
          <AppNavigator />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}