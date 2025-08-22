import {
  baseChartConfig,
  lineChartConfig,
  barChartConfig,
  pieChartConfig,
  chartDimensions,
  chartColors,
  chartUtils,
  skeletonConfig,
  responsiveChartConfig,
  chartAnimations,
  chartAccessibility,
} from '../chartConfig';

describe('chartConfig', () => {
  describe('baseChartConfig', () => {
    it('should have required properties', () => {
      expect(baseChartConfig).toHaveProperty('backgroundColor');
      expect(baseChartConfig).toHaveProperty('backgroundGradientFrom');
      expect(baseChartConfig).toHaveProperty('color');
      expect(baseChartConfig).toHaveProperty('labelColor');
      expect(baseChartConfig).toHaveProperty('style');
    });

    it('should have correct color function', () => {
      const colorFunc = baseChartConfig.color;
      expect(typeof colorFunc).toBe('function');
      expect(colorFunc(1)).toBe('rgba(46, 125, 87, 1)');
      expect(colorFunc(0.5)).toBe('rgba(46, 125, 87, 0.5)');
    });
  });

  describe('lineChartConfig', () => {
    it('should extend baseChartConfig', () => {
      expect(lineChartConfig).toMatchObject(baseChartConfig);
      expect(lineChartConfig).toHaveProperty('propsForDots');
    });

    it('should have proper dot configuration', () => {
      expect(lineChartConfig.propsForDots).toHaveProperty('r', '8');
      expect(lineChartConfig.propsForDots).toHaveProperty('strokeWidth', '3');
    });
  });

  describe('barChartConfig', () => {
    it('should extend baseChartConfig', () => {
      expect(barChartConfig).toMatchObject(baseChartConfig);
      expect(barChartConfig).toHaveProperty('barPercentage', 0.7);
    });
  });

  describe('pieChartConfig', () => {
    it('should have pie-specific properties', () => {
      expect(pieChartConfig).toHaveProperty('strokeWidth', 2);
      expect(pieChartConfig).toHaveProperty('barPercentage', 0.5);
      expect(pieChartConfig).toHaveProperty('useShadowColorFromDataset', false);
    });
  });

  describe('chartDimensions', () => {
    it('should have required dimensions', () => {
      expect(chartDimensions).toHaveProperty('width');
      expect(chartDimensions).toHaveProperty('height', 220);
      expect(chartDimensions).toHaveProperty('smallHeight', 180);
      expect(chartDimensions).toHaveProperty('largeHeight', 280);
    });

    it('should have positive values', () => {
      expect(chartDimensions.width).toBeGreaterThan(0);
      expect(chartDimensions.height).toBeGreaterThan(0);
    });
  });

  describe('chartColors', () => {
    it('should have color functions', () => {
      expect(typeof chartColors.primary).toBe('function');
      expect(typeof chartColors.secondary).toBe('function');
      expect(typeof chartColors.accent).toBe('function');
    });

    it('should return correct color values', () => {
      expect(chartColors.primary(1)).toBe('rgba(46, 125, 87, 1)');
      expect(chartColors.secondary(0.5)).toBe('rgba(255, 107, 53, 0.5)');
    });
  });

  describe('chartUtils', () => {
    describe('formatCurrency', () => {
      it('should format large numbers correctly', () => {
        expect(chartUtils.formatCurrency(150000)).toBe('₹1.5L');
        expect(chartUtils.formatCurrency(5000)).toBe('₹5.0K');
        expect(chartUtils.formatCurrency(500)).toBe('₹500');
      });

      it('should handle custom suffix', () => {
        expect(chartUtils.formatCurrency(1000, '$')).toBe('$1.0K');
      });
    });

    describe('formatPercentage', () => {
      it('should format percentages correctly', () => {
        expect(chartUtils.formatPercentage(25.5)).toBe('25.5%');
        expect(chartUtils.formatPercentage(100)).toBe('100.0%');
      });
    });

    describe('validateChartData', () => {
      it('should validate correct data', () => {
        const validData = {
          datasets: [{ data: [1, 2, 3] }]
        };
        expect(chartUtils.validateChartData(validData)).toBe(true);
      });

      it('should reject invalid data', () => {
        expect(chartUtils.validateChartData(null)).toBe(false);
        expect(chartUtils.validateChartData({})).toBe(false);
        expect(chartUtils.validateChartData({ datasets: [] })).toBe(false);
        expect(chartUtils.validateChartData({ datasets: [{ data: [0, 0, 0] }] })).toBe(false);
      });
    });

    describe('sanitizeData', () => {
      it('should clean numeric data', () => {
        const dirtyData = [1, -5, 'invalid', null, 10];
        const cleanData = chartUtils.sanitizeData(dirtyData as any);
        expect(cleanData).toEqual([1, 0, 0, 0, 10]);
      });
    });

    describe('truncateLabel', () => {
      it('should truncate long labels', () => {
        expect(chartUtils.truncateLabel('Very Long Label', 5)).toBe('Very ...');
        expect(chartUtils.truncateLabel('Short', 10)).toBe('Short');
      });
    });

    describe('generatePieColors', () => {
      it('should generate correct number of colors', () => {
        const colors = chartUtils.generatePieColors(5);
        expect(colors).toHaveLength(5);
        expect(colors.every(color => typeof color === 'string')).toBe(true);
      });
    });
  });

  describe('skeletonConfig', () => {
    it('should have configurations for all chart types', () => {
      expect(skeletonConfig).toHaveProperty('lineChart');
      expect(skeletonConfig).toHaveProperty('barChart');
      expect(skeletonConfig).toHaveProperty('pieChart');
    });

    it('should have proper skeleton properties', () => {
      expect(skeletonConfig.lineChart).toHaveProperty('height');
      expect(skeletonConfig.lineChart).toHaveProperty('bars');
      expect(skeletonConfig.pieChart).toHaveProperty('legendItems');
    });
  });

  describe('responsiveChartConfig', () => {
    it('should have large and small configurations', () => {
      expect(responsiveChartConfig).toHaveProperty('large');
      expect(responsiveChartConfig).toHaveProperty('small');
    });

    it('should extend base config', () => {
      expect(responsiveChartConfig.large).toMatchObject(baseChartConfig);
      expect(responsiveChartConfig.small).toMatchObject(baseChartConfig);
    });
  });

  describe('chartAnimations', () => {
    it('should have animation configurations', () => {
      expect(chartAnimations).toHaveProperty('fadeIn');
      expect(chartAnimations).toHaveProperty('slideIn');
      expect(chartAnimations).toHaveProperty('stagger');
    });

    it('should have proper animation properties', () => {
      expect(chartAnimations.fadeIn).toHaveProperty('duration');
      expect(chartAnimations.fadeIn).toHaveProperty('useNativeDriver', true);
    });
  });

  describe('chartAccessibility', () => {
    it('should have accessibility helper functions', () => {
      expect(typeof chartAccessibility.getAccessibilityLabel).toBe('function');
      expect(typeof chartAccessibility.getChartDescription).toBe('function');
    });

    it('should generate proper accessibility labels', () => {
      const label = chartAccessibility.getAccessibilityLabel('Chart Title', '100');
      expect(label).toBe('Chart Title: 100');
      
      const labelWithoutValue = chartAccessibility.getAccessibilityLabel('Chart Title');
      expect(labelWithoutValue).toBe('Chart Title');
    });

    it('should generate chart descriptions', () => {
      const description = chartAccessibility.getChartDescription('line', 5);
      expect(description).toBe('line chart with 5 data points');
    });
  });
});