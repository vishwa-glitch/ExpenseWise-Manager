import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing } from '../../constants/colors';
import { chartDimensions, skeletonConfig } from '../../constants/chartConfig';

const screenWidth = Dimensions.get('window').width;

interface LoadingSkeletonProps {
  height?: number;
  width?: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  height = 20,
  width = screenWidth - 40,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.surface],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Chart-specific loading skeletons
export const ChartLoadingSkeleton: React.FC<{
  type?: 'line' | 'pie';
  showTitle?: boolean;
}> = ({ type = 'line', showTitle = true }) => {
  return (
    <View style={styles.chartSkeletonContainer}>
      {showTitle && (
        <LoadingSkeleton
          height={24}
          width={200}
          borderRadius={4}
          style={styles.titleSkeleton}
        />
      )}
      
      {type === 'line' ? (
        <View style={[styles.lineChartSkeleton, { height: chartDimensions.height }]}>
          {/* Y-axis labels */}
          <View style={styles.yAxisSkeleton}>
            {[...Array(5)].map((_, index) => (
              <LoadingSkeleton
                key={index}
                height={12}
                width={30}
                borderRadius={2}
                style={styles.yAxisLabel}
              />
            ))}
          </View>
          
          {/* Chart area */}
          <View style={styles.chartAreaSkeleton}>
            {/* Chart lines */}
            {[...Array(3)].map((_, index) => (
              <LoadingSkeleton
                key={index}
                height={2}
                width={screenWidth - 100}
                borderRadius={1}
                style={[styles.chartLine, { top: 20 + index * 40 }]}
              />
            ))}
            
            {/* Data points */}
            {[...Array(skeletonConfig.lineChart.bars)].map((_, index) => (
              <LoadingSkeleton
                key={index}
                height={8}
                width={8}
                borderRadius={4}
                style={[
                  styles.dataPoint,
                  {
                    left: 20 + index * ((chartDimensions.width - 140) / 5),
                    top: 30 + Math.random() * 80,
                  },
                ]}
              />
            ))}
          </View>
          
          {/* X-axis labels */}
          <View style={styles.xAxisSkeleton}>
            {[...Array(skeletonConfig.lineChart.bars)].map((_, index) => (
              <LoadingSkeleton
                key={index}
                height={12}
                width={25}
                borderRadius={2}
                style={styles.xAxisLabel}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.pieChartSkeleton, { height: chartDimensions.height }]}>
          {/* Pie chart circle */}
          <LoadingSkeleton
            height={180}
            width={180}
            borderRadius={90}
            style={styles.pieCircle}
          />
          
          {/* Legend */}
          <View style={styles.legendSkeleton}>
            {[...Array(skeletonConfig.pieChart.legendItems)].map((_, index) => (
              <View key={index} style={styles.legendItem}>
                <LoadingSkeleton
                  height={16}
                  width={16}
                  borderRadius={8}
                  style={styles.legendColor}
                />
                <LoadingSkeleton
                  height={14}
                  width={100}
                  borderRadius={2}
                  style={styles.legendText}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// Time period selector loading skeleton
export const TimePeriodLoadingSkeleton: React.FC = () => {
  return (
    <View style={styles.timePeriodSkeleton}>
      {[...Array(4)].map((_, index) => (
        <LoadingSkeleton
          key={index}
          height={36}
          width={80}
          borderRadius={18}
          style={styles.periodButton}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  chartSkeletonContainer: {
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
  titleSkeleton: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  lineChartSkeleton: {
    flexDirection: 'row',
  },
  yAxisSkeleton: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  yAxisLabel: {
    marginBottom: spacing.xs,
  },
  chartAreaSkeleton: {
    flex: 1,
    position: 'relative',
    marginHorizontal: spacing.sm,
  },
  chartLine: {
    position: 'absolute',
  },
  dataPoint: {
    position: 'absolute',
  },
  xAxisSkeleton: {
    width: chartDimensions.width - 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
  },
  xAxisLabel: {
    marginTop: spacing.xs,
  },
  pieChartSkeleton: {
    alignItems: 'center',
  },
  pieCircle: {
    marginBottom: spacing.lg,
  },
  legendSkeleton: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendColor: {
    marginRight: spacing.md,
  },
  legendText: {
    flex: 1,
  },
  timePeriodSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  periodButton: {
    marginHorizontal: spacing.xs,
  },
});