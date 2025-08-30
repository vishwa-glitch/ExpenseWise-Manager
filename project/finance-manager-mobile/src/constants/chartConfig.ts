import { Dimensions } from 'react-native';
import { colors, spacing } from './colors';

const screenWidth = Dimensions.get('window').width;

// Base chart configuration
export const baseChartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: colors.primaryLight,
  backgroundGradientFromOpacity: 0.1,
  backgroundGradientTo: colors.primary,
  backgroundGradientToOpacity: 0.05,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(33, 37, 41, ${opacity * 0.8})`,
  style: {
    borderRadius: 16,
  },
  propsForBackgroundLines: {
    strokeDasharray: '5,5',
    stroke: colors.border,
    strokeWidth: 0.8,
    strokeOpacity: 0.4,
  },
  fillShadowGradient: colors.primary,
  fillShadowGradientOpacity: 0.1,
};

// Line chart specific configuration
export const lineChartConfig = {
  ...baseChartConfig,
  propsForDots: {
    r: '8',
    strokeWidth: '3',
    stroke: colors.primary,
    fill: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
};

// Bar chart specific configuration
export const barChartConfig = {
  ...baseChartConfig,
  fillShadowGradientOpacity: 0.3,
  barPercentage: 0.7,
};

// Pie chart specific configuration
export const pieChartConfig = {
  backgroundGradientFrom: colors.background,
  backgroundGradientTo: colors.background,
  color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

// Chart dimensions
export const chartDimensions = {
  width: Math.min(screenWidth - 40, 400), // Cap max width for tablets
  height: 220,
  smallHeight: 180,
  largeHeight: 280,
};

// Chart colors for different data series
export const chartColors = {
  primary: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
  secondary: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
  accent: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  warning: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
  danger: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`,
  info: (opacity = 1) => `rgba(23, 162, 184, ${opacity})`,
};

// Utility functions for chart data formatting
export const chartUtils = {
  // Format currency values for chart labels
  formatCurrency: (value: number, currencyCode = 'INR') => {
    // Import the main formatCurrency function dynamically
    const { formatCurrency: mainFormatCurrency } = require('../utils/currency');
    
    if (value >= 100000) {
      // For large values, use abbreviated format but with proper currency symbol
      const { getCurrencySymbol } = require('../utils/currency');
      const symbol = getCurrencySymbol(currencyCode);
      return `${symbol}${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      const { getCurrencySymbol } = require('../utils/currency');
      const symbol = getCurrencySymbol(currencyCode);
      return `${symbol}${(value / 1000).toFixed(1)}K`;
    }
    // For smaller values, use the main formatCurrency function
    return mainFormatCurrency(value, currencyCode, { maximumFractionDigits: 0 });
  },

  // Format percentage values
  formatPercentage: (value: number) => {
    return `${value.toFixed(1)}%`;
  },

  // Generate gradient colors for pie charts
  generatePieColors: (count: number) => {
    return Array.from({ length: count }, (_, index) => 
      colors.categories[index % colors.categories.length]
    );
  },

  // Validate chart data
  validateChartData: (data: any) => {
    if (!data || !data.datasets || !Array.isArray(data.datasets)) {
      return false;
    }
    
    const firstDataset = data.datasets[0];
    if (!firstDataset || !Array.isArray(firstDataset.data)) {
      return false;
    }

    return firstDataset.data.some((value: any) => 
      typeof value === 'number' && !isNaN(value) && value > 0
    );
  },

  // Clean and validate numeric data
  sanitizeData: (data: number[]) => {
    return data.map(value => {
      const num = Number(value);
      return isNaN(num) ? 0 : Math.max(0, num);
    });
  },

  // Truncate long labels for better display
  truncateLabel: (label: string, maxLength = 10) => {
    return label.length > maxLength ? 
      `${label.substring(0, maxLength)}...` : 
      label;
  },
};

// Chart loading skeleton configurations
export const skeletonConfig = {
  lineChart: {
    height: chartDimensions.height,
    bars: 6,
    showYAxis: true,
  },
  barChart: {
    height: chartDimensions.height,
    bars: 5,
    showYAxis: true,
  },
  pieChart: {
    height: chartDimensions.height,
    showLegend: true,
    legendItems: 4,
  },
};

// Responsive chart configurations
export const responsiveChartConfig = {
  // For tablets and larger screens
  large: {
    ...baseChartConfig,
    style: {
      ...baseChartConfig.style,
      borderRadius: 20,
    },
    propsForDots: {
      ...lineChartConfig.propsForDots,
      r: '10',
      strokeWidth: '4',
    },
  },
  
  // For small screens
  small: {
    ...baseChartConfig,
    style: {
      ...baseChartConfig.style,
      borderRadius: 12,
    },
    propsForDots: {
      ...lineChartConfig.propsForDots,
      r: '6',
      strokeWidth: '2',
    },
  },
};

// Animation configurations for charts
export const chartAnimations = {
  fadeIn: {
    duration: 300,
    useNativeDriver: true,
  },
  slideIn: {
    duration: 400,
    useNativeDriver: true,
  },
  stagger: {
    duration: 200,
    delay: 100,
    useNativeDriver: true,
  },
};

// Chart accessibility configurations
export const chartAccessibility = {
  getAccessibilityLabel: (title: string, value?: string | number) => {
    return value ? `${title}: ${value}` : title;
  },
  
  getChartDescription: (type: 'line' | 'bar' | 'pie', dataPoints: number) => {
    return `${type} chart with ${dataPoints} data points`;
  },
};

// Export default configuration object
export const defaultChartConfig = {
  line: lineChartConfig,
  bar: barChartConfig,
  pie: pieChartConfig,
  dimensions: chartDimensions,
  colors: chartColors,
  utils: chartUtils,
  skeleton: skeletonConfig,
  responsive: responsiveChartConfig,
  animations: chartAnimations,
  accessibility: chartAccessibility,
};