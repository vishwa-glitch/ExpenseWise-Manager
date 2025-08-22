import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { colors, typography, spacing } from '../../constants/colors';
import { barChartConfig, chartDimensions, chartUtils } from '../../constants/chartConfig';
import { TimePeriod } from '../common/TimePeriodSelector';
import { chartStyles, textStyles, responsive, accessibilityHelpers } from '../../utils/styleUtils';

const screenWidth = Dimensions.get('window').width;

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
    }>;
  };
  title?: string;
  yAxisSuffix?: string;
  showValuesOnTopOfBars?: boolean;
  showGrid?: boolean;
  timePeriod?: TimePeriod;
  isLoading?: boolean;
  onRefresh?: () => void;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  yAxisSuffix = '',
  showValuesOnTopOfBars = false,
  showGrid = true,
  timePeriod,
  isLoading = false,
  onRefresh,
  horizontal = false,
}) => {
  const chartConfig = barChartConfig;

  const formatYLabel = (value: string) => {
    return chartUtils.formatCurrency(parseFloat(value), yAxisSuffix);
  };

  // Check if data is empty or invalid
  const hasValidData = chartUtils.validateChartData(data);

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
        No data found for the selected period.
      </Text>
      {onRefresh && (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {timePeriod && (
            <Text style={styles.subtitle}>
              {timePeriod === 'weekly' ? 'Last 7 days' :
               timePeriod === 'monthly' ? 'Last 30 days' :
               timePeriod === '6months' ? 'Last 6 months' :
               'Last 12 months'}
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.chartContainer}>
        {isLoading ? (
          renderLoadingSkeleton()
        ) : !hasValidData ? (
          renderEmptyState()
        ) : (
          <RNBarChart
            data={data}
            width={chartDimensions.width}
            height={chartDimensions.height}
            chartConfig={chartConfig}
            style={styles.chart}
            formatYLabel={formatYLabel}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withInnerLines={showGrid}
            showValuesOnTopOfBars={showValuesOnTopOfBars}
            showBarTops={true}
            fromZero={true}
            segments={4}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...chartStyles.container,
  },
  titleContainer: {
    ...chartStyles.titleContainer,
  },
  title: {
    ...textStyles.cardTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.subtitle,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  refreshButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
});