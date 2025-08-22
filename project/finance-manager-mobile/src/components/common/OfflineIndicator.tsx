import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showWhenOnline = false,
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // For now, assume we're always online since NetInfo is not available
    // In a real implementation, you would install @react-native-community/netinfo
    setIsConnected(true);
    
    // Show indicator briefly
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide if enabled
    if (autoHide) {
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, autoHideDelay);
    }
  }, [slideAnim, autoHide, autoHideDelay]);

  // Don't show anything if we haven't determined connection status yet
  if (isConnected === null) {
    return null;
  }

  // Don't show when online unless explicitly requested
  if (isConnected && !showWhenOnline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isConnected ? styles.onlineContainer : styles.offlineContainer,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.icon}>
        {isConnected ? '✅' : '📶'}
      </Text>
      <Text style={[styles.text, isConnected ? styles.onlineText : styles.offlineText]}>
        {isConnected ? 'Back online' : 'No internet connection'}
      </Text>
    </Animated.View>
  );
};

// Hook to get current network status
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  // For now, assume we're always online since NetInfo is not available
  // In a real implementation, you would install @react-native-community/netinfo
  useEffect(() => {
    setIsConnected(true);
    setIsInternetReachable(true);
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOnline: isConnected && isInternetReachable,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 1000,
  },
  offlineContainer: {
    backgroundColor: colors.error,
  },
  onlineContainer: {
    backgroundColor: colors.success,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
  offlineText: {
    color: colors.background,
  },
  onlineText: {
    color: colors.background,
  },
});