import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Goal } from '../../types/goals';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface GoalContributionTimelineProps {
  goals: Goal[];
  displayCurrency: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const GoalContributionTimeline: React.FC<GoalContributionTimelineProps> = ({
  goals,
  displayCurrency
}) => {
  // Generate mock monthly contribution data based on current progress
  const generateContributionData = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date,
      });
    }
    
    // Calculate contributions per month based on goal progress
    const activeGoals = goals.filter(goal => goal.status === 'active' && goal.currency === displayCurrency);
    const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
    
    // Distribute contributions across months with some variation
    const baseMonthlyContribution = totalCurrentAmount / 6;
    const contributionData = months.map((month, index) => {
      // Add some realistic variation (±30%)
      const variation = (Math.random() - 0.5) * 0.6;
      const contribution = Math.max(0, baseMonthlyContribution * (1 + variation));
      return {
        ...month,
        amount: contribution,
        goalCount: Math.floor(Math.random() * activeGoals.length) + 1,
      };
    });
    
    return contributionData;
  };

  const getProjectedData = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active' && goal.currency === displayCurrency);
    const totalMonthlyNeeded = activeGoals.reduce((sum, goal) => sum + (goal.monthly_savings_needed || 0), 0);
    
    const months = [];
    const currentDate = new Date();
    
    // Generate next 6 months
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount: totalMonthlyNeeded,
        isProjected: true,
      });
    }
    
    return months;
  };

  const contributionData = generateContributionData();
  const projectedData = getProjectedData();
  
  // Prepare chart data
  const chartData = {
    labels: contributionData.map(item => item.month),
    datasets: [
      {
        data: contributionData.map(item => item.amount),
        color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${colors.textSecondary.replace('#', '')}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const getTotalContributions = () => {
    return contributionData.reduce((sum, item) => sum + item.amount, 0);
  };

  const getAverageMonthly = () => {
    return getTotalContributions() / contributionData.length;
  };

  const getGrowthRate = () => {
    if (contributionData.length < 2) return 0;
    const firstMonth = contributionData[0].amount;
    const lastMonth = contributionData[contributionData.length - 1].amount;
    return firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💰</Text>
          <Text style={styles.summaryLabel}>Total (6 months)</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(getTotalContributions(), displayCurrency)}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>📊</Text>
          <Text style={styles.summaryLabel}>Monthly Average</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(getAverageMonthly(), displayCurrency)}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryLabel}>Growth Rate</Text>
          <Text style={[
            styles.summaryValue,
            { color: getGrowthRate() >= 0 ? colors.success : colors.error }
          ]}>
            {getGrowthRate() >= 0 ? '+' : ''}{getGrowthRate().toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Contribution Trend Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📈 Contribution Trend (Last 6 Months)</Text>
        {contributionData.length > 0 && (
          <LineChart
            data={chartData}
            width={screenWidth - (spacing.lg * 2)}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            formatYLabel={(value) => `${Math.round(parseFloat(value) / 1000)}k`}
          />
        )}
      </View>

      {/* Monthly Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.sectionTitle}>📅 Monthly Breakdown</Text>
        {contributionData.map((item, index) => (
          <View key={index} style={styles.monthItem}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthName}>{item.month}</Text>
              <Text style={styles.monthAmount}>
                {formatCurrency(item.amount, displayCurrency)}
              </Text>
            </View>
            <View style={styles.monthDetails}>
              <Text style={styles.monthDetailText}>
                {item.goalCount} {item.goalCount === 1 ? 'goal' : 'goals'} contributed to
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((item.amount / getAverageMonthly()) * 50, 100)}%` }
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Future Projections */}
      <View style={styles.projectionContainer}>
        <Text style={styles.sectionTitle}>🔮 Projected Contributions</Text>
        <Text style={styles.projectionSubtitle}>
          Based on your current goal targets and timelines
        </Text>
        
        {projectedData.map((item, index) => (
          <View key={index} style={styles.projectionItem}>
            <View style={styles.projectionHeader}>
              <Text style={styles.projectionMonth}>{item.month}</Text>
              <Text style={styles.projectionAmount}>
                {formatCurrency(item.amount, displayCurrency)}
              </Text>
            </View>
            <View style={styles.projectionIndicator}>
              <View style={[
                styles.projectionBar,
                { 
                  backgroundColor: item.amount > getAverageMonthly() 
                    ? colors.warning + '30' 
                    : colors.success + '30'
                }
              ]}>
                <Text style={[
                  styles.projectionStatus,
                  { 
                    color: item.amount > getAverageMonthly() 
                      ? colors.warning 
                      : colors.success
                  }
                ]}>
                  {item.amount > getAverageMonthly() ? 'Above Average' : 'Manageable'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>💡 Timeline Insights</Text>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightIcon}>🎯</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Consistency Score</Text>
            <Text style={styles.insightDescription}>
              Your contribution pattern shows {getGrowthRate() > 10 ? 'excellent' : getGrowthRate() > 0 ? 'good' : 'room for improvement'} consistency. 
              {getGrowthRate() > 0 
                ? ' Keep up the great work!' 
                : ' Consider setting up automatic transfers for better consistency.'}
            </Text>
          </View>
        </View>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightIcon}>⏰</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Timeline Optimization</Text>
            <Text style={styles.insightDescription}>
              Based on your current pace, you're {getGrowthRate() >= 0 ? 'on track' : 'slightly behind'} your goal timelines. 
              Consider {getGrowthRate() >= 0 ? 'maintaining' : 'increasing'} your monthly contributions.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  summaryValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  breakdownContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  monthItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  monthName: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
  },
  monthAmount: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  monthDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  projectionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  projectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  projectionItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  projectionMonth: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
  },
  projectionAmount: {
    ...typography.h4,
    color: colors.warning,
    fontWeight: 'bold',
  },
  projectionIndicator: {
    alignItems: 'flex-end',
  },
  projectionBar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  projectionStatus: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  insightsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  insightCard: {
    flexDirection: 'row',
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
    shadowRadius: 4,
    elevation: 3,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  insightDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default GoalContributionTimeline;
