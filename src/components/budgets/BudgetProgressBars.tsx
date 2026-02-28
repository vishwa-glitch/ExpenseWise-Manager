import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/colors';

interface BudgetProgressBarsProps {
  categoryPerformance: Array<{
    category_id: string;
    category_name: string;
    category_color: string;
    total_budget_amount: number;
    total_spent_amount: number;
    total_remaining_amount: number;
    percentage_used: number;
    variance: number;
    variance_percentage: number;
    status: 'under_budget' | 'on_track' | 'approaching_limit' | 'over_budget';
  }>;
  onCategoryPress?: (categoryId: string) => void;
}

const BudgetProgressBars: React.FC<BudgetProgressBarsProps> = ({
  categoryPerformance,
  onCategoryPress,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_budget':
        return colors.success;
      case 'on_track':
        return colors.primary;
      case 'approaching_limit':
        return colors.warning;
      case 'over_budget':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_budget':
        return 'trending-down';
      case 'on_track':
        return 'checkmark-circle';
      case 'approaching_limit':
        return 'warning';
      case 'over_budget':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const Container = onCategoryPress ? TouchableOpacity : View;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Progress</Text>
        <Text style={styles.subtitle}>
          {categoryPerformance.length} categories
        </Text>
      </View>

      {categoryPerformance.map((category) => (
        <Container
          key={category.category_id}
          style={styles.categoryContainer}
          onPress={() => onCategoryPress?.(category.category_id)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryColor, { backgroundColor: category.category_color }]} />
              <Text style={styles.categoryName}>{category.category_name}</Text>
            </View>
            <View style={styles.categoryStats}>
              <Text style={styles.percentage}>
                {formatPercentage(category.percentage_used)}
              </Text>
              <Ionicons 
                name={getStatusIcon(category.status)} 
                size={16} 
                color={getStatusColor(category.status)} 
              />
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar,
                { 
                  width: `${Math.min(category.percentage_used, 100)}%`,
                  backgroundColor: getStatusColor(category.status)
                }
              ]} 
            />
          </View>
          
          <View style={styles.amountsContainer}>
            <Text style={styles.amount}>
              {formatCurrency(category.total_spent_amount)} / {formatCurrency(category.total_budget_amount)}
            </Text>
            <Text style={styles.remaining}>
              {formatCurrency(category.total_remaining_amount)} remaining
            </Text>
          </View>

          {category.variance !== 0 && (
            <View style={styles.varianceContainer}>
              <Text style={[
                styles.varianceText,
                { color: category.variance < 0 ? colors.success : colors.error }
              ]}>
                {category.variance < 0 ? 'Under' : 'Over'} budget by {formatCurrency(Math.abs(category.variance))}
                {' '}({formatPercentage(Math.abs(category.variance_percentage))})
              </Text>
            </View>
          )}
        </Container>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  categoryContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentage: {
    ...typography.body,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  remaining: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  varianceContainer: {
    marginTop: spacing.xs,
  },
  varianceText: {
    ...typography.caption,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default BudgetProgressBars;
