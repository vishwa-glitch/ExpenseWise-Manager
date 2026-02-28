import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { formatCurrency } from '../../../utils/currency';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { colors, typography, spacing } from '../../../constants/colors';

interface SmartAlertCardProps {
  isLoading: boolean;
  error: string | null;
  title: string;
  percentageUsed: number;
  currentAmount: number;
  totalAmount: number;
  daysLeft: number;
  onPress: () => void;
  onDetailsPress: () => void;
}

export const SmartAlertCard: React.FC<Partial<SmartAlertCardProps>> = ({
  isLoading = false,
  error = null,
  title = 'Food Budget',
  percentageUsed = 80,
  currentAmount = 4000,
  totalAmount = 5000,
  daysLeft = 12,
  onPress = () => {},
  onDetailsPress = () => {},
}) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);
  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.warning} />
        <Text style={styles.loadingText}>Loading Alert...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.errorContainer]}>
        <Text style={styles.errorText}>Could not load budget alert.</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Alert for ${title}`}
      accessibilityHint={`You have used ${percentageUsed}% of your budget.`}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.amountText}>
        {formatCurrency(currentAmount, displayCurrency)} of {formatCurrency(totalAmount, displayCurrency)}
      </Text>

      <Text style={styles.subtitle}>{`${percentageUsed}% used • ${daysLeft} days left this month`}</Text>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={onDetailsPress}
        accessibilityLabel="View details for this budget alert"
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>
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
    color: colors.text,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 115,
    backgroundColor: `${colors.error}20`,
    borderColor: colors.error,
  },
  errorText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    fontSize: 14,
  },
  topRow: {
    marginBottom: spacing.sm,
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
    marginBottom: spacing.xs,
    fontSize: 21,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 11,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 7,
  },
  detailsButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
    fontSize: 11,
  },
  arrowIcon: {
    fontSize: 14,
    marginLeft: spacing.xs,
    color: colors.background,
  },
});
