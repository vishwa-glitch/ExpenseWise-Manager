import { colors } from '../constants/colors';

export type TimePeriod = 'weekly' | 'monthly' | '6months' | 'yearly';

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage?: number;
}

export interface LineChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity: number) => string;
    strokeWidth: number;
  }>;
}

export interface PieChartData {
  name: string;
  amount: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

/**
 * Transform spending trends data for LineChart component
 */
export const transformSpendingTrendsData = (
  rawData: any[],
  period: TimePeriod
): LineChartData => {
  try {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return generateMockLineChartData(period);
    }

    const labels = rawData.map(item => 
      formatPeriodLabel(item.period || item.date || '', period)
    );
    
    const data = rawData.map(item => 
      typeof item.amount === 'number' ? Math.max(0, item.amount) : 0
    );

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  } catch (error) {
    console.error('Error transforming spending trends data:', error);
    return generateMockLineChartData(period);
  }
};

/**
 * Transform category breakdown data for PieChart component
 */
export const transformCategoryBreakdownData = (
  rawData: any[],
  period: TimePeriod
): PieChartData[] => {
  try {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return generateMockPieChartData();
    }

    return rawData.map((item, index) => ({
      name: item.name || 'Unknown Category',
      amount: typeof item.amount === 'number' ? Math.max(0, item.amount) : 0,
      color: item.color || colors.categories[index % colors.categories.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));
  } catch (error) {
    console.error('Error transforming category breakdown data:', error);
    return generateMockPieChartData();
  }
};

/**
 * Format period labels based on time period type
 */
export const formatPeriodLabel = (rawLabel: string, period: TimePeriod): string => {
  try {
    if (!rawLabel) return 'N/A';

    switch (period) {
      case 'weekly':
        // For weekly data, show day names or dates
        if (rawLabel.includes('-')) {
          const date = new Date(rawLabel);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
        return rawLabel;
      
      case 'monthly':
        // For monthly data, show week numbers or dates
        if (rawLabel.includes('-')) {
          const date = new Date(rawLabel);
          return `Week ${Math.ceil(date.getDate() / 7)}`;
        }
        return rawLabel;
      
      case '6months':
        // For 6-month data, show month names
        if (rawLabel.includes('-')) {
          const date = new Date(rawLabel);
          return date.toLocaleDateString('en-US', { month: 'short' });
        }
        return rawLabel;
      
      case 'yearly':
        // For yearly data, show quarters or months
        if (rawLabel.includes('-')) {
          const date = new Date(rawLabel);
          const quarter = Math.ceil((date.getMonth() + 1) / 3);
          return `Q${quarter}`;
        }
        return rawLabel;
      
      default:
        return rawLabel;
    }
  } catch (error) {
    console.error('Error formatting period label:', error);
    return rawLabel || 'N/A';
  }
};

/**
 * Calculate date range for a given time period
 */
export const calculateDateRange = (period: TimePeriod): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'weekly':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '6months':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case 'yearly':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
};

/**
 * Format currency values for display
 */
export const formatChartCurrency = (amount: number, currency = '₹'): string => {
  try {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return `${currency}0`;
    }

    if (amount >= 10000000) { // 1 crore
      return `${currency}${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh
      return `${currency}${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) { // 1 thousand
      return `${currency}${(amount / 1000).toFixed(1)}K`;
    } else {
      return `${currency}${amount.toFixed(0)}`;
    }
  } catch (error) {
    console.error('Error formatting chart currency:', error);
    return `${currency}0`;
  }
};

/**
 * Format percentage values for display
 */
export const formatPercentage = (value: number): string => {
  try {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0%';
    }
    return `${Math.round(value)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return '0%';
  }
};

/**
 * Generate mock line chart data for development and fallback
 */
const generateMockLineChartData = (period: TimePeriod): LineChartData => {
  const mockData = getMockSpendingData(period);
  return {
    labels: mockData.labels,
    datasets: [{
      data: mockData.data,
      color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
      strokeWidth: 2,
    }],
  };
};

/**
 * Generate mock pie chart data for development and fallback
 */
const generateMockPieChartData = (): PieChartData[] => {
  return [
    {
      name: 'Food & Dining',
      amount: 15000,
      color: colors.categories[0],
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Transportation',
      amount: 8000,
      color: colors.categories[1],
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Shopping',
      amount: 5000,
      color: colors.categories[2],
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Entertainment',
      amount: 3000,
      color: colors.categories[3],
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];
};

/**
 * Get mock spending data based on time period
 */
const getMockSpendingData = (period: TimePeriod): { labels: string[]; data: number[] } => {
  switch (period) {
    case 'weekly':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [3000, 4500, 2800, 5200, 3800, 6100, 4200],
      };
    case 'monthly':
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [18000, 22000, 19500, 25000],
      };
    case '6months':
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [45000, 52000, 48000, 58000, 51000, 62000],
      };
    case 'yearly':
      return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [180000, 195000, 210000, 225000],
      };
    default:
      return {
        labels: ['No Data'],
        data: [0],
      };
  }
};

/**
 * Validate chart data before rendering
 */
export const validateChartData = (data: any): boolean => {
  try {
    if (!data) return false;
    
    // For line chart data
    if (data.labels && data.datasets) {
      return Array.isArray(data.labels) && 
             Array.isArray(data.datasets) && 
             data.datasets.length > 0 &&
             Array.isArray(data.datasets[0].data) &&
             data.datasets[0].data.length > 0;
    }
    
    // For pie chart data
    if (Array.isArray(data)) {
      return data.length > 0 && 
             data.every(item => 
               typeof item === 'object' && 
               typeof item.amount === 'number' && 
               typeof item.name === 'string'
             );
    }
    
    return false;
  } catch (error) {
    console.error('Error validating chart data:', error);
    return false;
  }
};

/**
 * Calculate trend direction and percentage change
 */
export const calculateTrend = (data: number[]): { direction: 'increasing' | 'decreasing' | 'stable'; percentage: number } => {
  try {
    if (!data || data.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }
    
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    
    if (firstValue === 0) {
      return { direction: lastValue > 0 ? 'increasing' : 'stable', percentage: 0 };
    }
    
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
    
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(percentageChange) < 5) {
      direction = 'stable';
    } else if (percentageChange > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }
    
    return {
      direction,
      percentage: Math.abs(percentageChange),
    };
  } catch (error) {
    console.error('Error calculating trend:', error);
    return { direction: 'stable', percentage: 0 };
  }
};