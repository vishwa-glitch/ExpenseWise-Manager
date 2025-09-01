import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { networkService } from '../../services/networkService';
import { colors } from '../../constants/colors';

interface NetworkStatusIndicatorProps {
  showAlways?: boolean;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ showAlways = false }) => {
  const { authMode } = useTypedSelector((state) => state.auth);
  const [isOnline, setIsOnline] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Get initial network state
    networkService.checkConnectivity().then(setIsOnline);

    // Listen for network changes
    const unsubscribe = networkService.addNetworkListener(setIsOnline);

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Animate the indicator when network status changes
    Animated.timing(fadeAnim, {
      toValue: (!isOnline || authMode === 'offline') ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, authMode, fadeAnim]);

  // Don't show if online and not in offline mode, unless showAlways is true
  if (isOnline && authMode !== 'offline' && !showAlways) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.indicator}>
        <View style={[styles.dot, { backgroundColor: authMode === 'offline' ? colors.warning : colors.error }]} />
        <Text style={styles.text}>
          {authMode === 'offline' ? 'Offline Mode' : 'No Internet Connection'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default NetworkStatusIndicator;
