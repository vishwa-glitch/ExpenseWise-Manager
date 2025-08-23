import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { formatCurrency } from '../../../utils/currency';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { colors, typography, spacing } from '../../../constants/colors';

interface GoalProgressCardProps {
  isLoading: boolean;
  error: string | null;
  title: string;
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  monthlyIncrement: number;
  onPress: () => void;
}

export const GoalProgressCard: React.FC<Partial<GoalProgressCardProps>> = ({
  isLoading = false,
  error = null,
  title = 'Save for a New Car',
  currentAmount = 75000,
  targetAmount = 200000,
  progressPercentage = 37.5,
  monthlyIncrement = 5000,
  onPress = () => {},
}) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Goal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.errorContainer]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Could not load goal progress.</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Goal: ${title}`}
      accessibilityHint={`Current progress is ${progressPercentage}%`}
    >
      <View style={styles.topRow}>
        <Text style={styles.icon}>🎯</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.amountText}>
        {formatCurrency(currentAmount, displayCurrency)}{' '}
        <Text style={styles.targetAmountText}>
          of {formatCurrency(targetAmount, displayCurrency)}
        </Text>
      </Text>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      <View style={styles.incrementContainer}>
        <Text style={styles.incrementIcon}>↑</Text>
        <Text style={styles.incrementText}>
          {formatCurrency(monthlyIncrement, displayCurrency)} this month
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
  },
  loadingText: {
    ...typography.body,
    color: colors.primaryDark,
    marginTop: spacing.md,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    backgroundColor: `${colors.error}20`, // error with 20% opacity
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  amountText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  targetAmountText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
  },
  incrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incrementIcon: {
    color: colors.success,
    marginRight: spacing.xs,
    fontSize: 16,
  },
  incrementText: {
    ...typography.body,
    color: colors.success,
  },
});
