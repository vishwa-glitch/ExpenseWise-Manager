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
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 115,
  },
  loadingText: {
    ...typography.body,
    color: colors.primaryDark,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 115,
    backgroundColor: `${colors.error}20`,
  },
  errorIcon: {
    fontSize: 23,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 21,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  amountText: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    fontSize: 21,
  },
  targetAmountText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 14,
  },
  progressContainer: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  incrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incrementIcon: {
    fontSize: 14,
    color: colors.income,
    marginRight: spacing.xs,
  },
  incrementText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
