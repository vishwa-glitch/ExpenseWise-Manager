import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { colors, typography, spacing } from '../../constants/colors';

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
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  yAxisSuffix = '',
  showGrid = true,
  bezier = true,
}) => {
  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 37, 41, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  const formatYLabel = (value: string) => {
    const num = parseFloat(value);
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L${yAxisSuffix}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${yAxisSuffix}`;
    }
    return `${num}${yAxisSuffix}`;
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.chartContainer}>
        <RNLineChart
          data={data}
          width={screenWidth - 40}
          height={220}
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
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});