import {
  transformSpendingTrendsData,
  transformCategoryBreakdownData,
  formatPeriodLabel,
  calculateDateRange,
  formatChartCurrency,
  formatPercentage,
  validateChartData,
  calculateTrend,
  TimePeriod,
} from '../chartDataTransformers';

describe('chartDataTransformers', () => {
  describe('transformSpendingTrendsData', () => {
    it('should transform valid spending trends data', () => {
      const rawData = [
        { period: 'Jan', amount: 1000 },
        { period: 'Feb', amount: 1500 },
        { period: 'Mar', amount: 1200 },
      ];
      
      const result = transformSpendingTrendsData(rawData, 'monthly');
      
      expect(result.labels).toEqual(['Jan', 'Feb', 'Mar']);
      expect(result.datasets[0].data).toEqual([1000, 1500, 1200]);
      expect(result.datasets[0].strokeWidth).toBe(2);
    });

    it('should handle empty or invalid data', () => {
      const result = transformSpendingTrendsData([], 'monthly');
      
      expect(result.labels).toBeDefined();
      expect(result.datasets[0].data).toBeDefined();
      expect(result.datasets[0].data.length).toBeGreaterThan(0);
    });

    it('should handle negative amounts by converting to zero', () => {
      const rawData = [
        { period: 'Jan', amount: -500 },
        { period: 'Feb', amount: 1500 },
      ];
      
      const result = transformSpendingTrendsData(rawData, 'monthly');
      
      expect(result.datasets[0].data[0]).toBe(0);
      expect(result.datasets[0].data[1]).toBe(1500);
    });
  });

  describe('transformCategoryBreakdownData', () => {
    it('should transform valid category data', () => {
      const rawData = [
        { name: 'Food', amount: 1000, color: '#FF0000' },
        { name: 'Transport', amount: 500, color: '#00FF00' },
      ];
      
      const result = transformCategoryBreakdownData(rawData, 'monthly');
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Food');
      expect(result[0].amount).toBe(1000);
      expect(result[0].color).toBe('#FF0000');
    });

    it('should handle empty data', () => {
      const result = transformCategoryBreakdownData([], 'monthly');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatPeriodLabel', () => {
    it('should format weekly labels correctly', () => {
      const result = formatPeriodLabel('2024-01-15', 'weekly');
      expect(result).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
    });

    it('should format monthly labels correctly', () => {
      const result = formatPeriodLabel('2024-01-15', 'monthly');
      expect(result).toMatch(/^Week \d$/);
    });

    it('should format 6-month labels correctly', () => {
      const result = formatPeriodLabel('2024-01-15', '6months');
      expect(result).toMatch(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/);
    });

    it('should format yearly labels correctly', () => {
      const result = formatPeriodLabel('2024-01-15', 'yearly');
      expect(result).toMatch(/^Q[1-4]$/);
    });

    it('should handle invalid dates', () => {
      const result = formatPeriodLabel('invalid-date', 'weekly');
      expect(result).toBe('invalid-date');
    });
  });

  describe('calculateDateRange', () => {
    it('should calculate weekly date range', () => {
      const { startDate, endDate } = calculateDateRange('weekly');
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(7);
    });

    it('should calculate monthly date range', () => {
      const { startDate, endDate } = calculateDateRange('monthly');
      const monthsDiff = endDate.getMonth() - startDate.getMonth();
      expect(Math.abs(monthsDiff)).toBe(1);
    });
  });

  describe('formatChartCurrency', () => {
    it('should format large amounts correctly', () => {
      expect(formatChartCurrency(10000000)).toBe('₹1.0Cr');
      expect(formatChartCurrency(100000)).toBe('₹1.0L');
      expect(formatChartCurrency(1000)).toBe('₹1.0K');
      expect(formatChartCurrency(500)).toBe('₹500');
    });

    it('should handle invalid amounts', () => {
      expect(formatChartCurrency(NaN)).toBe('₹0');
      expect(formatChartCurrency(null as any)).toBe('₹0');
    });

    it('should use custom currency symbol', () => {
      expect(formatChartCurrency(1000, '$')).toBe('$1.0K');
    });
  });

  describe('formatPercentage', () => {
    it('should format valid percentages', () => {
      expect(formatPercentage(25.7)).toBe('26%');
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(100)).toBe('100%');
    });

    it('should handle invalid values', () => {
      expect(formatPercentage(NaN)).toBe('0%');
      expect(formatPercentage(null as any)).toBe('0%');
    });
  });

  describe('validateChartData', () => {
    it('should validate line chart data', () => {
      const validLineData = {
        labels: ['A', 'B', 'C'],
        datasets: [{ data: [1, 2, 3] }],
      };
      expect(validateChartData(validLineData)).toBe(true);
    });

    it('should validate pie chart data', () => {
      const validPieData = [
        { name: 'Category 1', amount: 100 },
        { name: 'Category 2', amount: 200 },
      ];
      expect(validateChartData(validPieData)).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(validateChartData(null)).toBe(false);
      expect(validateChartData({})).toBe(false);
      expect(validateChartData([])).toBe(false);
    });
  });

  describe('calculateTrend', () => {
    it('should calculate increasing trend', () => {
      const data = [100, 120, 150];
      const result = calculateTrend(data);
      expect(result.direction).toBe('increasing');
      expect(result.percentage).toBe(50);
    });

    it('should calculate decreasing trend', () => {
      const data = [150, 120, 100];
      const result = calculateTrend(data);
      expect(result.direction).toBe('decreasing');
      expect(result.percentage).toBeCloseTo(33.33, 1);
    });

    it('should calculate stable trend', () => {
      const data = [100, 102, 98];
      const result = calculateTrend(data);
      expect(result.direction).toBe('stable');
    });

    it('should handle edge cases', () => {
      expect(calculateTrend([]).direction).toBe('stable');
      expect(calculateTrend([100]).direction).toBe('stable');
      expect(calculateTrend([0, 100]).direction).toBe('increasing');
    });
  });
});