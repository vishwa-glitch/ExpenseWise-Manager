import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { colors, typography, spacing } from '../../constants/colors';
import { lineChartConfig, chartDimensions, chartUtils } from '../../constants/chartConfig';
import { TimePeriod } from '../common/TimePeriodSelector';

const screenWidth = Dimensions.get('window').width;

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  title?: string;
  yAxisSuffix?: string;
  showGrid?: boolean;
  bezier?: boolean;
  timePeriod?: TimePeriod;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  yAxisSuffix = '',
  showGrid = true,
  bezier = true,
  timePeriod,
  isLoading = false,
  onRefresh,
}) => {
  const chartConfig = lineChartConfig;

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
        No spending data found for the selected period.
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
          <RNLineChart
            data={data}
            width={chartDimensions.width}
            height={chartDimensions.height}
            chartConfig={chartConfig}
            bezier={bezier}
            style={styles.chart}
            formatYLabel={formatYLabel}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withDots={true}
            withShadow={false}
            withScrollableDot={false}
            withInnerLines={showGrid}
            withOuterLines={showGrid}
          />
        )}
      </View>
    </View>
  );
};

import { chartStyles, textStyles, responsive, accessibilityHelpers } from '../../utils/styleUtils';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: spacing.sm,
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