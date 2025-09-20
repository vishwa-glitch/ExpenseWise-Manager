import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, goalCategories } from '../../types/goals';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface GoalAnalyticsSummaryProps {
  goals: Goal[];
  displayCurrency: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const GoalAnalyticsSummary: React.FC<GoalAnalyticsSummaryProps> = ({
  goals,
  displayCurrency
}) => {
  const getGoalInsights = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    const onTrackGoals = activeGoals.filter(goal => goal.status_info?.is_on_track);
    const urgentGoals = activeGoals.filter(goal => goal.status_info?.urgency === 'high');
    
    const totalSaved = goals
      .filter(goal => goal.currency === displayCurrency)
      .reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
    
    const totalTarget = goals
      .filter(goal => goal.currency === displayCurrency)
      .reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
    
    const averageProgress = goals.length > 0 
      ? goals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0) / goals.length
      : 0;
    
    const totalMonthlyNeeded = activeGoals
      .filter(goal => goal.currency === displayCurrency)
      .reduce((sum, goal) => sum + (goal.monthly_savings_needed || 0), 0);

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      onTrackGoals: onTrackGoals.length,
      urgentGoals: urgentGoals.length,
      totalSaved,
      totalTarget,
      totalRemaining: totalTarget - totalSaved,
      averageProgress,
      totalMonthlyNeeded,
      completionRate: goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0,
    };
  };

  const getCategoryBreakdown = () => {
    const categoryMap = new Map();
    
    goals
      .filter(goal => goal.currency === displayCurrency)
      .forEach(goal => {
        const category = goal.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            ...goalCategories[category],
            count: 0,
            totalSaved: 0,
            totalTarget: 0,
            averageProgress: 0,
          });
        }
        
        const categoryData = categoryMap.get(category);
        categoryData.count += 1;
        categoryData.totalSaved += goal.current_amount || 0;
        categoryData.totalTarget += goal.target_amount || 0;
        categoryData.averageProgress += goal.progress_percentage || 0;
      });
    
    // Calculate average progress for each category
    Array.from(categoryMap.values()).forEach(category => {
      if (category.count > 0) {
        category.averageProgress = category.averageProgress / category.count;
      }
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => b.totalSaved - a.totalSaved);
  };

  const insights = getGoalInsights();
  const categoryBreakdown = getCategoryBreakdown();

  const summaryCards = [
    {
      title: 'Total Saved',
      value: formatCurrency(insights.totalSaved, displayCurrency),
      subtitle: `${insights.averageProgress.toFixed(1)}% avg progress`,
      icon: '💰',
      gradient: ['#4CAF50', '#2E7D57'],
    },
    {
      title: 'Monthly Target',
      value: formatCurrency(insights.totalMonthlyNeeded, displayCurrency),
      subtitle: `${insights.activeGoals} active goals`,
      icon: '📅',
      gradient: ['#4A90E2', '#2E5BBA'],
    },
    {
      title: 'Completion Rate',
      value: `${insights.completionRate.toFixed(1)}%`,
      subtitle: `${insights.completedGoals} completed`,
      icon: '🏆',
      gradient: ['#F5A623', '#E8930A'],
    },
    {
      title: 'On Track',
      value: `${insights.onTrackGoals}/${insights.activeGoals}`,
      subtitle: insights.urgentGoals > 0 ? `${insights.urgentGoals} need attention` : 'All good!',
      icon: '✅',
      gradient: insights.urgentGoals > 0 ? ['#E74C3C', '#C0392B'] : ['#2E7D57', '#1E5631'],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {summaryCards.map((card, index) => (
          <LinearGradient
            key={index}
            colors={card.gradient}
            style={styles.summaryCard}
          >
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Goals by Category</Text>
          <View style={styles.categoryGrid}>
            {categoryBreakdown.map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryCount}>
                      {category.count} {category.count === 1 ? 'goal' : 'goals'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.categoryProgress}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>
                      {category.averageProgress.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { 
                          width: `${Math.min(category.averageProgress, 100)}%`,
                          backgroundColor: category.color
                        }
                      ]}
                    />
                  </View>
                </View>
                
                <View style={styles.categoryAmounts}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Saved</Text>
                    <Text style={styles.amountValue}>
                      {formatCurrency(category.totalSaved, displayCurrency)}
                    </Text>
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Target</Text>
                    <Text style={styles.amountValue}>
                      {formatCurrency(category.totalTarget, displayCurrency)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{insights.totalGoals}</Text>
            <Text style={styles.statLabel}>Total Goals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💸</Text>
            <Text style={styles.statValue}>
              {formatCurrency(insights.totalRemaining, displayCurrency)}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statValue}>
              {Math.round(insights.totalRemaining / Math.max(insights.totalMonthlyNeeded, 1))}
            </Text>
            <Text style={styles.statLabel}>Months Left</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  summaryCard: {
    width: screenWidth * 0.4,
    marginRight: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.h3,
    color: colors.background,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.background + 'CC',
    textAlign: 'center',
    fontSize: 10,
  },
  categorySection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  categoryCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  categoryProgress: {
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  progressValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 10,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryAmounts: {
    marginTop: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  amountValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 10,
  },
  quickStats: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
  },
});

export default GoalAnalyticsSummary;
