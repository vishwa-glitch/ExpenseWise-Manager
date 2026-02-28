import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { colors, typography, spacing } from '../../constants/colors';
import { pieChartConfig, chartDimensions } from '../../constants/chartConfig';
import { formatCurrency } from '../../utils/currency';
import { getCategoryColor, isGoalContribution, getCategoryDisplayName } from '../../utils/categoryColors';
import { TimePeriod } from '../common/TimePeriodSelector';

const screenWidth = Dimensions.get('window').width;

interface PieChartProps {
  data: Array<{
    name: string;
    amount: number;
    color: string;
    legendFontColor?: string;
    legendFontSize?: number;
  }>;
  title?: string;
  showLegend?: boolean;
  centerText?: string;
  centerSubtext?: string;
  timePeriod?: TimePeriod;
  isLoading?: boolean;
  showPercentages?: boolean;
  displayCurrency: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  showLegend = true,
  centerText,
  centerSubtext,
  timePeriod,
  isLoading = false,
  showPercentages = true,
  displayCurrency,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const chartConfig = pieChartConfig;

  const chartData = data.map((item, index) => ({
    name: item.name,
    population: item.amount,
    color: item.color || getCategoryColor(item.name),
    legendFontColor: item.legendFontColor || colors.text,
    legendFontSize: item.legendFontSize || 12,
    isGoalContribution: isGoalContribution(item.name),
  }));

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, displayCurrency);
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading chart data...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Data Available</Text>
      <Text style={styles.emptyMessage}>
        No category data found for the selected period.
      </Text>
    </View>
  );

  const handleLegendPress = (index: number) => {
    setHighlightedIndex(highlightedIndex === index ? null : index);
  };

  // Check if data is empty or invalid
  const hasValidData = data && data.length > 0 && totalAmount > 0;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.chartContainer}>
        {isLoading ? (
          renderLoadingSkeleton()
        ) : !hasValidData ? (
          renderEmptyState()
        ) : (
          <>
            <RNPieChart
              data={chartData}
              width={chartDimensions.width}
              height={chartDimensions.height}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute={false}
            />

            {(centerText || totalAmount > 0) && (
              <View style={styles.centerTextContainer}>
                <Text style={styles.centerText}>
                  {centerText || formatCurrency(totalAmount, displayCurrency)}
                </Text>
                {centerSubtext && (
                  <Text style={styles.centerSubtext}>{centerSubtext}</Text>
                )}
                {timePeriod && (
                  <Text style={styles.centerSubtext}>
                    {timePeriod === 'weekly' ? 'This Week' :
                      timePeriod === 'monthly' ? 'This Month' :
                        timePeriod === '6months' ? '6 Months' :
                          'This Year'}
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </View>

      {showLegend && hasValidData && !isLoading && (
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.legendItem,
                highlightedIndex === index && styles.highlightedLegendItem,
              ]}
              onPress={() => handleLegendPress(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color || getCategoryColor(item.name) },
                  highlightedIndex === index && styles.highlightedLegendColor,
                  isGoalContribution(item.name) && styles.goalContributionColor,
                ]}
              />
              <View style={styles.legendText}>
                <Text style={[
                  styles.legendName,
                  isGoalContribution(item.name) && styles.goalContributionText,
                ]} numberOfLines={1}>
                  {getCategoryDisplayName(item.name)}
                </Text>
                <Text style={styles.legendAmount}>
                  {formatCurrency(item.amount, displayCurrency)}
                  {showPercentages && ` (${((item.amount / totalAmount) * 100).toFixed(1)}%)`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

import { chartStyles, textStyles, responsive, accessibilityHelpers } from '../../utils/styleUtils';

const styles = StyleSheet.create({
  container: {
    ...chartStyles.container,
  },
  title: {
    ...textStyles.cardTitle,
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  centerText: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  centerSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loadingContainer: {
    ...chartStyles.loadingContainer,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    ...chartStyles.emptyContainer,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  legendContainer: {
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  highlightedLegendItem: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  highlightedLegendColor: {
    width: 18,
    height: 18,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  legendText: {
    flex: 1,
  },
  legendName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  legendAmount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  goalContributionColor: {
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  goalContributionText: {
    fontWeight: '700',
    color: '#4CAF50',
  },
});