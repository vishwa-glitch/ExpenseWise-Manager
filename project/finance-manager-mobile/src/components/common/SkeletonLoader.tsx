import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing } from '../../constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  shimmer?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  shimmer = true,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (shimmer) {
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      shimmerLoop.start();

      return () => {
        shimmerLoop.stop();
      };
    }
  }, [shimmer, shimmerAnimation]);

  const shimmerTranslateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      {shimmer && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslateX }],
              opacity: shimmerOpacity,
            },
          ]}
        />
      )}
    </View>
  );
};

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  style?: any;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  lineHeight = 20,
  lastLineWidth = '60%',
  style,
}) => {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonLoader
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={index > 0 ? { marginTop: spacing.xs } : undefined}
        />
      ))}
    </View>
  );
};

interface SkeletonCardProps {
  children: React.ReactNode;
  style?: any;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

// Specific skeleton components for dashboard sections
export const BudgetStatusSkeleton: React.FC = () => {
  return (
    <SkeletonCard>
      <View style={styles.header}>
        <SkeletonLoader width="40%" height={12} />
        <SkeletonLoader width="80%" height={24} style={{ marginTop: spacing.xs }} />
      </View>
      <View style={styles.progressContainer}>
        <SkeletonLoader width="100%" height={8} borderRadius={4} />
        <SkeletonLoader width="60%" height={14} style={{ marginTop: spacing.sm }} />
      </View>
    </SkeletonCard>
  );
};

export const WeeklyHealthSkeleton: React.FC = () => {
  return (
    <SkeletonCard>
      <View style={styles.header}>
        <SkeletonLoader width="60%" height={12} />
      </View>
      
      {/* Score section */}
      <View style={styles.scoreSection}>
        <SkeletonLoader width="30%" height={20} />
        <SkeletonLoader width="15%" height={24} />
        <SkeletonLoader width="25%" height={16} />
      </View>
      
      {/* Items section */}
      <View style={styles.itemsSection}>
        {Array.from({ length: 3 }, (_, index) => (
          <View key={index} style={styles.item}>
            <SkeletonLoader width={16} height={16} borderRadius={8} />
            <SkeletonLoader width="85%" height={16} />
          </View>
        ))}
      </View>
      
      {/* Stats section */}
      <View style={styles.statsSection}>
        {Array.from({ length: 4 }, (_, index) => (
          <View key={index} style={styles.statItem}>
            <SkeletonLoader width="30%" height={14} />
            <SkeletonLoader width="40%" height={14} />
          </View>
        ))}
      </View>
      
      {/* Goal section */}
      <View style={styles.goalSection}>
        <SkeletonLoader width={20} height={20} borderRadius={10} />
        <SkeletonLoader width="70%" height={16} />
      </View>
    </SkeletonCard>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    opacity: 0.3,
  },
  textContainer: {
    // No specific styles needed
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: spacing.md,
  },
  progressContainer: {
    gap: spacing.sm,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  itemsSection: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statsSection: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },
});