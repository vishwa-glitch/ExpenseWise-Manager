import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExportScreen from '../screens/export/ExportScreen';

const Stack = createStackNavigator();

const ExportNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ExportMain" component={ExportScreen} />
    </Stack.Navigator>
  );
};

export default ExportNavigator;
