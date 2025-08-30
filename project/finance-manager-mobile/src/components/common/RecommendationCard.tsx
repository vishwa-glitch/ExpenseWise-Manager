import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { CustomButton } from './CustomButton';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { formatCurrency } from '../../utils/currency';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    type: string;
    title: string;
    description: string;
    action_text?: string;
    potential_savings?: number;
    confidence_score?: number;
    priority: number;
    created_at: string;
    currency?: string;
  };
  onDismiss: () => void;
  onAct: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onDismiss,
  onAct,
}) => {
  const { displayCurrency } = useTypedSelector((state) => state.user);

  // Early return if recommendation is invalid
  if (!recommendation || typeof recommendation !== 'object') {
    return null;
  }
  const formatAmount = (amount?: number) => {
    if (!amount || typeof amount !== 'number' || isNaN(amount)) return '';
    try {
      const currency = recommendation.currency || displayCurrency || 'USD';
      const formatted = formatCurrency(amount, currency, { maximumFractionDigits: 0 });
      return formatted || '';
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '';
    }
  };

  const getTypeIcon = (type: string) => {
    try {
      if (!type || typeof type !== 'string') return '💡';
      
      const iconMap: { [key: string]: string } = {
        'goal_focused': '🎯',
        'spending_optimization': '💡',
        'budget_alert': '⚠️',
        'savings_opportunity': '💰',
        'investment_suggestion': '📈',
        'bill_reminder': '📅',
      };
      
      return iconMap[type] || '💡';
    } catch (error) {
      return '💡';
    }
  };

  const getPriorityColor = () => {
    if (recommendation.priority >= 8) return colors.error;
    if (recommendation.priority >= 6) return colors.warning;
    if (recommendation.priority >= 4) return colors.primary;
    return colors.textSecondary;
  };

  const getConfidenceText = () => {
    try {
      if (!recommendation.confidence_score || typeof recommendation.confidence_score !== 'number') return '';
      const score = recommendation.confidence_score * 100;
      if (score >= 90) return 'High confidence';
      if (score >= 70) return 'Medium confidence';
      return 'Low confidence';
    } catch (error) {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.icon}>{getTypeIcon(recommendation.type)}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{recommendation.title || 'Untitled Recommendation'}</Text>
            <View style={styles.metadata}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
                <Text style={styles.priorityText}>P{recommendation.priority}</Text>
              </View>
              {recommendation.confidence_score && getConfidenceText() ? (
                <Text style={styles.confidence}>
                  {getConfidenceText()}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{recommendation.description || 'No description available'}</Text>

      {recommendation.potential_savings && recommendation.potential_savings > 0 ? (
        <View style={styles.savingsContainer}>
          <Text style={styles.savingsLabel}>Potential Savings:</Text>
          <Text style={styles.savingsAmount}>
            {formatAmount(recommendation.potential_savings) || formatCurrency(0, displayCurrency)}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <CustomButton
          title={recommendation.action_text || 'Take Action'}
          onPress={onAct}
          variant="primary"
          size="small"
          style={styles.actionButton}
        />
        <CustomButton
          title="Dismiss"
          onPress={onDismiss}
          variant="outline"
          size="small"
          style={styles.dismissButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  priorityText: {
    ...typography.small,
    color: colors.background,
    fontWeight: 'bold',
  },
  confidence: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  savingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  savingsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  savingsAmount: {
    ...typography.h3,
    color: colors.income,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  dismissButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});