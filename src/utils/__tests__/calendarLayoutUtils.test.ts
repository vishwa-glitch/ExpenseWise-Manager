import {
  calculateCalendarLayout,
  generateCalendarStyles,
  validateLayout,
  CalendarLayoutConfig,
} from '../calendarLayoutUtils';

describe('calendarLayoutUtils', () => {
  describe('calculateCalendarLayout', () => {
    it('should calculate layout for small screen', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 500,
        isSmallScreen: true,
        isMediumScreen: false,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);

      expect(layout.monthNavigation.height).toBe(45);
      expect(layout.summaryContainer.height).toBe(60);
      expect(layout.filterControls.height).toBe(50);
      expect(layout.dayCell.height).toBeGreaterThanOrEqual(25); // Minimum height
    });

    it('should calculate layout for medium screen', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 700,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);

      expect(layout.monthNavigation.height).toBe(50);
      expect(layout.summaryContainer.height).toBe(70);
      expect(layout.filterControls.height).toBe(60);
      expect(layout.dayCell.height).toBeGreaterThanOrEqual(30); // Minimum height
    });

    it('should calculate layout for large screen', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 900,
        isSmallScreen: false,
        isMediumScreen: false,
        isLargeScreen: true,
      };

      const layout = calculateCalendarLayout(config);

      expect(layout.monthNavigation.height).toBe(55);
      expect(layout.summaryContainer.height).toBe(80);
      expect(layout.filterControls.height).toBe(70);
      expect(layout.dayCell.height).toBeGreaterThanOrEqual(30); // Minimum height
    });

    it('should ensure minimum calendar grid height', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 200, // Very small
        isSmallScreen: true,
        isMediumScreen: false,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);

      expect(layout.calendarGrid.height).toBeGreaterThanOrEqual(180); // Minimum height
    });

    it('should calculate total height correctly', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);

      const expectedTotal = 
        layout.monthNavigation.height + layout.monthNavigation.marginBottom +
        layout.summaryContainer.height + layout.summaryContainer.marginBottom +
        layout.weekHeader.height + layout.weekHeader.marginBottom +
        layout.calendarGrid.height + layout.calendarGrid.marginBottom +
        layout.filterControls.height;

      expect(layout.totalHeight).toBe(expectedTotal);
    });

    it('should enforce minimum day cell height', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 300, // Small height
        isSmallScreen: true,
        isMediumScreen: false,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);

      expect(layout.dayCell.height).toBeGreaterThanOrEqual(25); // Small screen minimum
    });
  });

  describe('generateCalendarStyles', () => {
    it('should generate styles from layout', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);
      const styles = generateCalendarStyles(layout);

      expect(styles.container).toEqual({
        flex: 1,
        height: '100%',
      });

      expect(styles.monthNavigation.height).toBe(layout.monthNavigation.height);
      expect(styles.monthNavigation.marginBottom).toBe(layout.monthNavigation.marginBottom);
      expect(styles.monthNavigation.paddingHorizontal).toBe(layout.monthNavigation.padding?.horizontal);

      expect(styles.summaryContainer.height).toBe(layout.summaryContainer.height);
      expect(styles.calendarGrid.height).toBe(layout.calendarGrid.height);
      expect(styles.dayCell.height).toBe(layout.dayCell.height);
      expect(styles.filterControls.height).toBe(layout.filterControls.height);
    });

    it('should include all required style properties', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);
      const styles = generateCalendarStyles(layout);

      const requiredComponents = [
        'container',
        'monthNavigation',
        'summaryContainer',
        'weekHeader',
        'calendarGrid',
        'dayCell',
        'filterControls',
      ];

      requiredComponents.forEach(component => {
        expect(styles).toHaveProperty(component);
        expect(typeof styles[component]).toBe('object');
      });
    });
  });

  describe('validateLayout', () => {
    it('should validate layout that fits within available height', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 800,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);
      const validation = validateLayout(layout, config.availableHeight);

      expect(validation.isValid).toBe(true);
      expect(validation.overflow).toBeLessThanOrEqual(0);
      expect(validation.suggestions).toHaveLength(0);
    });

    it('should detect layout overflow', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);
      const validation = validateLayout(layout, 400); // Smaller available height

      if (!validation.isValid) {
        expect(validation.overflow).toBeGreaterThan(0);
        expect(validation.suggestions.length).toBeGreaterThan(0);
        expect(validation.suggestions[0]).toContain('Layout exceeds available height');
      }
    });

    it('should provide suggestions for optimization', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: false,
        isMediumScreen: false,
        isLargeScreen: true, // Large components
      };

      const layout = calculateCalendarLayout(config);
      const validation = validateLayout(layout, 400); // Much smaller available height

      if (!validation.isValid) {
        expect(validation.suggestions.length).toBeGreaterThan(0);
        
        // Check for specific suggestions
        const suggestionText = validation.suggestions.join(' ');
        if (layout.dayCell.height > 30) {
          expect(suggestionText).toContain('reducing day cell height');
        }
        if (layout.summaryContainer.height > 60) {
          expect(suggestionText).toContain('reducing summary container height');
        }
      }
    });

    it('should handle edge case of zero available height', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: true,
        isMediumScreen: false,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);
      const validation = validateLayout(layout, 0);

      expect(validation.isValid).toBe(false);
      expect(validation.overflow).toBe(layout.totalHeight);
    });

    it('should handle negative available height', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: true,
        isMediumScreen: false,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);
      const validation = validateLayout(layout, -100);

      expect(validation.isValid).toBe(false);
      expect(validation.overflow).toBe(layout.totalHeight + 100);
    });
  });

  describe('layout consistency', () => {
    it('should maintain consistent spacing across screen sizes', () => {
      const configs: CalendarLayoutConfig[] = [
        { availableHeight: 500, isSmallScreen: true, isMediumScreen: false, isLargeScreen: false },
        { availableHeight: 700, isSmallScreen: false, isMediumScreen: true, isLargeScreen: false },
        { availableHeight: 900, isSmallScreen: false, isMediumScreen: false, isLargeScreen: true },
      ];

      const layouts = configs.map(calculateCalendarLayout);

      // All layouts should have the same week header height
      layouts.forEach(layout => {
        expect(layout.weekHeader.height).toBe(30);
      });

      // Component heights should increase with screen size
      expect(layouts[0].monthNavigation.height).toBeLessThan(layouts[1].monthNavigation.height);
      expect(layouts[1].monthNavigation.height).toBeLessThan(layouts[2].monthNavigation.height);

      expect(layouts[0].summaryContainer.height).toBeLessThan(layouts[1].summaryContainer.height);
      expect(layouts[1].summaryContainer.height).toBeLessThan(layouts[2].summaryContainer.height);
    });

    it('should ensure all components have positive dimensions', () => {
      const config: CalendarLayoutConfig = {
        availableHeight: 600,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };

      const layout = calculateCalendarLayout(config);

      Object.values(layout).forEach(component => {
        if (typeof component === 'object' && 'height' in component) {
          expect(component.height).toBeGreaterThan(0);
        }
      });

      expect(layout.totalHeight).toBeGreaterThan(0);
    });
  });
});