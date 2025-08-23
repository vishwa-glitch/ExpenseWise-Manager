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
        <Text style={styles.errorIcon}>⚠️</Text>
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
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>{`${title}: ${percentageUsed}% used`}</Text>
      </View>

      <Text style={styles.amountText}>
        {formatCurrency(currentAmount, displayCurrency)} of {formatCurrency(totalAmount, displayCurrency)}
      </Text>

      <Text style={styles.subtitle}>{`${daysLeft} days left this month`}</Text>

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
    backgroundColor: `${colors.warning}20`, // warning with 20% opacity
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150, // Fixed height for loading state
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.md,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    backgroundColor: `${colors.error}20`, // error with 20% opacity
    borderColor: colors.error,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 20,
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  detailsButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  arrowIcon: {
    color: colors.text,
    marginLeft: spacing.sm,
    fontWeight: 'bold',
  },
});
