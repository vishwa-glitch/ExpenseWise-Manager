import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';
import { isGoalContribution } from '../../utils/categoryColors';

interface GoalContributionCardProps {
  topCategories: Array<{
    name: string;
    amount: number;
    transaction_count?: number;
  }>;
  displayCurrency: string;
  onPress?: () => void;
}

export const GoalContributionCard: React.FC<GoalContributionCardProps> = ({
  topCategories,
  displayCurrency,
  onPress,
}) => {
  // Find goal contribution data
  const goalContribution = topCategories?.find(cat => isGoalContribution(cat.name));

  if (!goalContribution) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Goal savings this month: ${formatCurrency(goalContribution.amount, displayCurrency)}`}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>💰</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>Goal Savings</Text>
          <Text style={styles.subtitle}>This Month</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.amount}>
          {formatCurrency(goalContribution.amount, displayCurrency)}
        </Text>
        
        {goalContribution.transaction_count && (
          <Text style={styles.transactions}>
            {goalContribution.transaction_count} contribution{goalContribution.transaction_count !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Great progress! 🎯</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amount: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  transactions: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
});