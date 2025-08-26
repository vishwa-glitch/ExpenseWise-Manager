import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';

export default function App() {
  useEffect(() => {
    // Initialize AdMob only in development builds or bare workflow
    const isExpoManaged = !Platform.select({
      native: false,
      default: true,
    });

    if (!isExpoManaged) {
      try {
        const mobileAds = require('react-native-google-mobile-ads').default;
        mobileAds()
          .initialize()
          .then((adapterStatuses: any) => {
            console.log('🎬 AdMob initialized successfully');
          })
          .catch((error: any) => {
            console.error('❌ Failed to initialize AdMob:', error);
          });
      } catch (error) {
        console.log('📱 AdMob not available, using mock service');
      }
    } else {
      console.log('📱 Using mock ad service for Expo managed workflow');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="auto" />
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}