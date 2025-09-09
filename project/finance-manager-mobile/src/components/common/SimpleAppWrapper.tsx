import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SimpleAppNavigator from '../../navigation/SimpleAppNavigator';

const SimpleAppWrapper: React.FC = () => {
  console.log('🔍 SimpleAppWrapper - Loading app without update checks');
  
  try {
    return <SimpleAppNavigator />;
  } catch (error) {
    console.error('❌ SimpleAppWrapper - Error loading SimpleAppNavigator:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>App Error</Text>
        <Text style={styles.errorText}>There was an error loading the app: {error.message}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SimpleAppWrapper;
