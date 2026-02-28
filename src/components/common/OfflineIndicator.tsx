import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNetworkState } from '../../utils/networkUtils';
import OfflineQueueService from '../../services/offlineQueue';
import { colors, typography, spacing } from '../../constants/colors';

interface OfflineIndicatorProps {
  showQueueStatus?: boolean;
  onRetry?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  showQueueStatus = true, 
  onRetry 
}) => {
  const networkState = useNetworkState();
  const [queueStatus, setQueueStatus] = useState<{ pending: number; failed: number }>({ pending: 0, failed: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const checkQueueStatus = async () => {
      try {
        const status = await OfflineQueueService.getInstance().getQueueStatus();
        setQueueStatus(status);
      } catch (error) {
        console.error('Failed to get queue status:', error);
      }
    };

    // Check queue status periodically
    const interval = setInterval(checkQueueStatus, 5000);
    checkQueueStatus(); // Initial check

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const shouldShow = !networkState.isConnected || queueStatus.pending > 0 || queueStatus.failed > 0;
    
    if (shouldShow !== isVisible) {
      setIsVisible(shouldShow);
      
      Animated.timing(slideAnim, {
        toValue: shouldShow ? 0 : -50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [networkState.isConnected, queueStatus, isVisible, slideAnim]);

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      try {
        await OfflineQueueService.getInstance().processQueue();
      } catch (error) {
        console.error('Failed to process queue:', error);
      }
    }
  };

  const getStatusText = () => {
    if (!networkState.isConnected) {
      return 'You are offline';
    }
    
    if (queueStatus.pending > 0) {
      return `Syncing ${queueStatus.pending} items...`;
    }
    
    if (queueStatus.failed > 0) {
      return `${queueStatus.failed} items failed to sync`;
    }
    
    return 'All data synced';
  };

  const getStatusColor = () => {
    if (!networkState.isConnected) {
      return colors.error;
    }
    
    if (queueStatus.failed > 0) {
      return colors.warning;
    }
    
    if (queueStatus.pending > 0) {
      return colors.primary;
    }
    
    return colors.success;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [{ translateY: slideAnim }],
          backgroundColor: getStatusColor(),
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={[styles.indicator, { backgroundColor: colors.white }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        
        {showQueueStatus && (queueStatus.pending > 0 || queueStatus.failed > 0) && (
          <View style={styles.queueInfo}>
            {queueStatus.pending > 0 && (
              <Text style={styles.queueText}>
                Pending: {queueStatus.pending}
              </Text>
            )}
            {queueStatus.failed > 0 && (
              <Text style={styles.queueText}>
                Failed: {queueStatus.failed}
              </Text>
            )}
          </View>
        )}
        
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  queueInfo: {
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  queueText: {
    ...typography.caption,
    color: colors.white,
    marginLeft: spacing.sm,
    opacity: 0.9,
  },
  retryButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  retryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default OfflineIndicator;