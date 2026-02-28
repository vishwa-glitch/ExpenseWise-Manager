/**
 * Calendar layout calculation utilities
 */

export interface CalendarLayoutConfig {
  availableHeight: number;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

export interface ComponentLayout {
  height: number;
  marginBottom: number;
  padding?: {
    horizontal: number;
    vertical: number;
  };
}

export interface CalendarLayout {
  monthNavigation: ComponentLayout;
  summaryContainer: ComponentLayout;
  calendarGrid: ComponentLayout;
  weekHeader: ComponentLayout;
  dayCell: ComponentLayout;
  filterControls: ComponentLayout;
  totalHeight: number;
}

/**
 * Calculate optimal layout for calendar components
 */
export function calculateCalendarLayout(config: CalendarLayoutConfig): CalendarLayout {
  const { availableHeight, isSmallScreen, isMediumScreen, isLargeScreen } = config;

  // Base spacing values
  const baseSpacing = {
    xs: isSmallScreen ? 2 : 4,
    sm: isSmallScreen ? 4 : 6,
    md: isSmallScreen ? 8 : 12,
    lg: isSmallScreen ? 12 : 16,
  };

  // Component layouts
  const monthNavigation: ComponentLayout = {
    height: isSmallScreen ? 45 : isMediumScreen ? 50 : 55,
    marginBottom: baseSpacing.sm,
    padding: {
      horizontal: baseSpacing.md,
      vertical: baseSpacing.sm,
    },
  };

  const summaryContainer: ComponentLayout = {
    height: isSmallScreen ? 60 : isMediumScreen ? 70 : 80,
    marginBottom: baseSpacing.sm,
    padding: {
      horizontal: baseSpacing.md,
      vertical: baseSpacing.sm,
    },
  };

  const weekHeader: ComponentLayout = {
    height: 30,
    marginBottom: baseSpacing.xs,
    padding: {
      horizontal: baseSpacing.md,
      vertical: baseSpacing.xs,
    },
  };

  const filterControls: ComponentLayout = {
    height: isSmallScreen ? 50 : isMediumScreen ? 60 : 70,
    marginBottom: 0, // Bottom component
    padding: {
      horizontal: baseSpacing.md,
      vertical: baseSpacing.sm,
    },
  };

  // Calculate remaining height for calendar grid
  const fixedComponentsHeight = 
    monthNavigation.height + monthNavigation.marginBottom +
    summaryContainer.height + summaryContainer.marginBottom +
    weekHeader.height + weekHeader.marginBottom +
    filterControls.height +
    (baseSpacing.md * 2); // Container padding

  const remainingHeight = availableHeight - fixedComponentsHeight;
  const calendarGridHeight = Math.max(remainingHeight, 180); // Minimum height

  // Calculate day cell dimensions
  const maxCalendarRows = 6; // Maximum weeks in a month view
  const dayMargin = baseSpacing.xs;
  const totalDayMargins = dayMargin * (maxCalendarRows - 1);
  const dayHeight = Math.floor((calendarGridHeight - totalDayMargins) / maxCalendarRows);
  const minDayHeight = isSmallScreen ? 25 : 30;
  const finalDayHeight = Math.max(dayHeight, minDayHeight);

  const calendarGrid: ComponentLayout = {
    height: calendarGridHeight,
    marginBottom: baseSpacing.sm,
    padding: {
      horizontal: baseSpacing.md,
      vertical: baseSpacing.xs,
    },
  };

  const dayCell: ComponentLayout = {
    height: finalDayHeight,
    marginBottom: dayMargin,
    padding: {
      horizontal: baseSpacing.xs,
      vertical: baseSpacing.xs,
    },
  };

  const totalHeight = 
    monthNavigation.height + monthNavigation.marginBottom +
    summaryContainer.height + summaryContainer.marginBottom +
    weekHeader.height + weekHeader.marginBottom +
    calendarGrid.height + calendarGrid.marginBottom +
    filterControls.height;

  return {
    monthNavigation,
    summaryContainer,
    calendarGrid,
    weekHeader,
    dayCell,
    filterControls,
    totalHeight,
  };
}

/**
 * Generate responsive styles for calendar components
 */
export function generateCalendarStyles(layout: CalendarLayout) {
  return {
    container: {
      flex: 1,
      height: '100%',
    },
    monthNavigation: {
      height: layout.monthNavigation.height,
      marginBottom: layout.monthNavigation.marginBottom,
      paddingHorizontal: layout.monthNavigation.padding?.horizontal,
      paddingVertical: layout.monthNavigation.padding?.vertical,
    },
    summaryContainer: {
      height: layout.summaryContainer.height,
      marginBottom: layout.summaryContainer.marginBottom,
      paddingHorizontal: layout.summaryContainer.padding?.horizontal,
      paddingVertical: layout.summaryContainer.padding?.vertical,
    },
    weekHeader: {
      height: layout.weekHeader.height,
      marginBottom: layout.weekHeader.marginBottom,
      paddingHorizontal: layout.weekHeader.padding?.horizontal,
      paddingVertical: layout.weekHeader.padding?.vertical,
    },
    calendarGrid: {
      height: layout.calendarGrid.height,
      marginBottom: layout.calendarGrid.marginBottom,
      paddingHorizontal: layout.calendarGrid.padding?.horizontal,
      paddingVertical: layout.calendarGrid.padding?.vertical,
    },
    dayCell: {
      height: layout.dayCell.height,
      marginBottom: layout.dayCell.marginBottom,
      paddingHorizontal: layout.dayCell.padding?.horizontal,
      paddingVertical: layout.dayCell.padding?.vertical,
    },
    filterControls: {
      height: layout.filterControls.height,
      paddingHorizontal: layout.filterControls.padding?.horizontal,
      paddingVertical: layout.filterControls.padding?.vertical,
    },
  };
}

/**
 * Check if layout fits within available height
 */
export function validateLayout(layout: CalendarLayout, availableHeight: number): {
  isValid: boolean;
  overflow: number;
  suggestions: string[];
} {
  const overflow = layout.totalHeight - availableHeight;
  const isValid = overflow <= 0;
  const suggestions: string[] = [];

  if (!isValid) {
    suggestions.push(`Layout exceeds available height by ${overflow}px`);
    
    if (layout.dayCell.height > 30) {
      suggestions.push('Consider reducing day cell height');
    }
    
    if (layout.summaryContainer.height > 60) {
      suggestions.push('Consider reducing summary container height');
    }
    
    suggestions.push('Consider using smaller spacing values');
  }

  return {
    isValid,
    overflow,
    suggestions,
  };
}