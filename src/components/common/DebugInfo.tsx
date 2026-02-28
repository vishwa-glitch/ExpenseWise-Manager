import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ENV } from '../../config/environment';
import { API_CONFIG } from '../../config/api';

interface DebugInfoProps {
  visible?: boolean;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ visible = false }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Debug Information</Text>
      <Text style={styles.info}>Environment: {ENV.ENVIRONMENT}</Text>
      <Text style={styles.info}>API Base URL: {ENV.API_BASE_URL}</Text>
      <Text style={styles.info}>API Prefix: {ENV.API_PREFIX}</Text>
      <Text style={styles.info}>Full API URL: {API_CONFIG.BASE_URL}{API_CONFIG.API_PREFIX}</Text>
      <Text style={styles.info}>Timeout: {ENV.API_TIMEOUT}ms</Text>
      <Text style={styles.info}>Logging: {ENV.ENABLE_LOGGING ? 'Enabled' : 'Disabled'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  info: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
});

export default DebugInfo;
