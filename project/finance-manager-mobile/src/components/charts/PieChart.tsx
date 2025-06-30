import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { colors, typography, spacing } from '../../constants/colors';

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
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  showLegend = true,
  centerText,
  centerSubtext,
}) => {
  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const chartData = data.map((item, index) => ({
    name: item.name,
    population: item.amount,
    color: item.color || colors.categories[index % colors.categories.length],
    legendFontColor: item.legendFontColor || colors.text,
    legendFontSize: item.legendFontSize || 12,
  }));

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.chartContainer}>
        <RNPieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute={false}
        />
        
        {centerText && (
          <View style={styles.centerTextContainer}>
            <Text style={styles.centerText}>{centerText}</Text>
            {centerSubtext && (
              <Text style={styles.centerSubtext}>{centerSubtext}</Text>
            )}
          </View>
        )}
      </View>

      {showLegend && (
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color || colors.categories[index % colors.categories.length] },
                ]}
              />
              <View style={styles.legendText}>
                <Text style={styles.legendName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.legendAmount}>
                  {formatAmount(item.amount)} ({((item.amount / totalAmount) * 100).toFixed(1)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  legendContainer: {
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
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
});