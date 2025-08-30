import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // AdMob initialization removed for now - files kept for future use
  // See ADMOB_IMPLEMENTATION.md for re-enabling instructions

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="auto" />
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}