import { useState, useEffect } from 'react';
import { Dimensions, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../constants/colors';

interface CalendarDimensions {
  screenHeight: number;
  screenWidth: number;
  availableHeight: number;
  componentHeights: {
    monthNavigation: number;
    summaryContainer: number;
    calendarGridHeight: number;
    calendarDayHeight: number;
    filterControls: number;
    weekHeader: number;
  };
  spacing: {
    vertical: number;
    horizontal: number;
    betweenComponents: number;
  };
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

/**
 * Custom hook for calculating dynamic calendar dimensions
 * Ensures all components fit within screen bounds without scrolling
 */
export function useCalendarDimensions(): CalendarDimensions {
  const [screenData, setScreenData] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });
  
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const calculateDimensions = (): CalendarDimensions => {
    const { width: screenWidth, height: screenHeight } = screenData;
    
    // Calculate available height accounting for system UI
    const statusBarHeight = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0;
    const safeAreaTop = insets.top || statusBarHeight;
    const safeAreaBottom = insets.bottom || 0;
    const availableHeight = screenHeight - safeAreaTop - safeAreaBottom;

    // Determine screen size category
    const isSmallScreen = availableHeight < 600;
    const isMediumScreen = availableHeight >= 600 && availableHeight < 800;
    const isLargeScreen = availableHeight >= 800;

    // Define spacing based on screen size
    const verticalSpacing = isSmallScreen ? spacing.xs : spacing.sm;
    const horizontalSpacing = spacing.md;
    const betweenComponents = isSmallScreen ? spacing.xs : spacing.sm;

    // Calculate component heights based on screen size
    let componentHeights = {
      monthNavigation: isSmallScreen ? 45 : isMediumScreen ? 50 : 55,
      summaryContainer: isSmallScreen ? 60 : isMediumScreen ? 70 : 80,
      filterControls: isSmallScreen ? 50 : isMediumScreen ? 60 : 70,
      weekHeader: 30, // Fixed height for week day headers
      calendarGridHeight: 0, // Will be calculated
      calendarDayHeight: 0, // Will be calculated
    };

    // Calculate total fixed height (everything except calendar grid)
    const totalFixedHeight = 
      componentHeights.monthNavigation +
      componentHeights.summaryContainer +
      componentHeights.filterControls +
      componentHeights.weekHeader +
      (betweenComponents * 4) + // Spacing between 5 components
      (verticalSpacing * 2); // Top and bottom padding

    // Calculate remaining height for calendar grid
    const remainingHeight = availableHeight - totalFixedHeight;
    const calendarGridHeight = Math.max(remainingHeight, 200); // Minimum 200px

    // Calculate individual day cell height
    // Calendar has maximum 6 rows (weeks)
    const calendarRows = 6;
    const dayMargin = 2; // Small margin between day cells
    const calendarDayHeight = Math.floor(
      (calendarGridHeight - (dayMargin * (calendarRows - 1))) / calendarRows
    );

    // Ensure minimum day height for usability
    const minDayHeight = 35;
    const finalDayHeight = Math.max(calendarDayHeight, minDayHeight);

    // Recalculate grid height if we had to enforce minimum day height
    const finalGridHeight = (finalDayHeight * calendarRows) + (dayMargin * (calendarRows - 1));

    componentHeights.calendarGridHeight = finalGridHeight;
    componentHeights.calendarDayHeight = finalDayHeight;

    return {
      screenHeight,
      screenWidth,
      availableHeight,
      componentHeights,
      spacing: {
        vertical: verticalSpacing,
        horizontal: horizontalSpacing,
        betweenComponents,
      },
      isSmallScreen,
      isMediumScreen,
      isLargeScreen,
    };
  };

  return calculateDimensions();
}

/**
 * Hook for getting responsive font sizes based on screen size
 */
export function useResponsiveFontSizes() {
  const { isSmallScreen, isMediumScreen } = useCalendarDimensions();

  return {
    title: isSmallScreen ? 18 : isMediumScreen ? 20 : 22,
    subtitle: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
    body: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
    caption: isSmallScreen ? 10 : isMediumScreen ? 12 : 14,
    dayNumber: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
    amount: isSmallScreen ? 8 : isMediumScreen ? 9 : 10,
  };
}

/**
 * Hook for getting responsive spacing values
 */
export function useResponsiveSpacing() {
  const { isSmallScreen, isMediumScreen } = useCalendarDimensions();

  return {
    xs: isSmallScreen ? 2 : 4,
    sm: isSmallScreen ? 4 : isMediumScreen ? 6 : 8,
    md: isSmallScreen ? 8 : isMediumScreen ? 12 : 16,
    lg: isSmallScreen ? 12 : isMediumScreen ? 16 : 20,
    xl: isSmallScreen ? 16 : isMediumScreen ? 20 : 24,
  };
}