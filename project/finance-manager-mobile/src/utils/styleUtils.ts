import { ViewStyle, TextStyle, Dimensions } from 'react-native';
import { colors, typography, spacing } from '../constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Common shadow styles
export const shadowStyles = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Common card styles
export const cardStyles = {
  base: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadowStyles.medium,
  } as ViewStyle,
  compact: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadowStyles.small,
  } as ViewStyle,
  elevated: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadowStyles.large,
  } as ViewStyle,
};

// Common button styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 44,
  } as ViewStyle,
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 44,
  } as ViewStyle,
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 44,
  } as ViewStyle,
  disabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.6,
  } as ViewStyle,
};

// Common text styles
export const textStyles = {
  primaryButton: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  } as TextStyle,
  secondaryButton: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  } as TextStyle,
  outlineButton: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,
  disabledButton: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  } as TextStyle,
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  } as TextStyle,
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: spacing.md,
  } as TextStyle,
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  } as TextStyle,
};

// Responsive utilities
export const responsive = {
  isTablet: screenWidth >= 768,
  isLargeScreen: screenWidth >= 1024,
  screenWidth,
  screenHeight,
  
  // Get responsive value based on screen size
  getValue: <T>(phone: T, tablet?: T, desktop?: T): T => {
    if (screenWidth >= 1024 && desktop !== undefined) return desktop;
    if (screenWidth >= 768 && tablet !== undefined) return tablet;
    return phone;
  },
  
  // Get responsive spacing
  getSpacing: (multiplier: number = 1): number => {
    const baseSpacing = responsive.getValue(spacing.md, spacing.lg, spacing.xl);
    return baseSpacing * multiplier;
  },
  
  // Get responsive font size
  getFontSize: (baseSize: number): number => {
    const scale = responsive.getValue(1, 1.1, 1.2);
    return Math.round(baseSize * scale);
  },
};

// Chart-specific styles
export const chartStyles = {
  container: {
    ...cardStyles.base,
  } as ViewStyle,
  titleContainer: {
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  } as ViewStyle,
  title: {
    ...textStyles.cardTitle,
  } as TextStyle,
  subtitle: {
    ...textStyles.subtitle,
  } as TextStyle,
  loadingContainer: {
    height: 220,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  } as ViewStyle,
  emptyContainer: {
    height: 220,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
};

// Animation configurations
export const animationConfig = {
  fast: {
    duration: 200,
    useNativeDriver: true,
  },
  normal: {
    duration: 300,
    useNativeDriver: true,
  },
  slow: {
    duration: 500,
    useNativeDriver: true,
  },
  spring: {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  },
};

// Accessibility helpers
export const accessibilityHelpers = {
  // Minimum touch target size (44x44 points)
  minTouchTarget: {
    minWidth: 44,
    minHeight: 44,
  } as ViewStyle,
  
  // Screen reader helpers
  getAccessibilityLabel: (text: string, context?: string): string => {
    return context ? `${text}, ${context}` : text;
  },
  
  // Color contrast helpers
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation - in production, use a proper contrast library
    const isLight = backgroundColor.includes('fff') || backgroundColor.includes('light');
    return isLight ? colors.text : colors.background;
  },
};

// Layout utilities
export const layoutUtils = {
  // Flexbox shortcuts
  centerContent: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  } as ViewStyle,
  
  spaceBetween: {
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  } as ViewStyle,
  
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  } as ViewStyle,
  
  column: {
    flexDirection: 'column' as const,
  } as ViewStyle,
  
  // Safe area helpers
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  // Common margins and paddings
  marginHorizontal: (size: keyof typeof spacing = 'md') => ({
    marginHorizontal: spacing[size],
  }),
  
  marginVertical: (size: keyof typeof spacing = 'md') => ({
    marginVertical: spacing[size],
  }),
  
  paddingHorizontal: (size: keyof typeof spacing = 'md') => ({
    paddingHorizontal: spacing[size],
  }),
  
  paddingVertical: (size: keyof typeof spacing = 'md') => ({
    paddingVertical: spacing[size],
  }),
};

// Theme utilities (for future dark mode support)
export const themeUtils = {
  isDarkMode: false, // This would come from a theme context
  
  getThemedColor: (lightColor: string, darkColor: string): string => {
    return themeUtils.isDarkMode ? darkColor : lightColor;
  },
  
  getThemedStyle: <T>(lightStyle: T, darkStyle: T): T => {
    return themeUtils.isDarkMode ? darkStyle : lightStyle;
  },
};