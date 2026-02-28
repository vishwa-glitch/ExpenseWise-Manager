import "react-native-gesture-handler";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator } from "react-native";
import { store, persistor } from "./src/store";
import AppWrapper from "./src/components/common/AppWrapper";
import CrashErrorBoundary from "./src/components/common/CrashErrorBoundary";

// Loading component for PersistGate
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10, fontSize: 16 }}>Loading your data...</Text>
  </View>
);

export default function App() {
  return (
    <CrashErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <StatusBar style="auto" />
            <AppWrapper />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </CrashErrorBoundary>
  );
}
