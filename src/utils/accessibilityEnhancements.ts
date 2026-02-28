import { AccessibilityInfo } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

// Enhanced accessibility utilities
export interface AccessibilityEnhancements {
  announceChange: (message: string) => void;
  setFocus: (ref: any) => void;
  generateFinancialLabel: (amount: number, context?: string) => string;
  generatePercentageLabel: (percentage: number, context?: string) => string;
  generateHealthScoreLabel: (score: number, maxScore: number) => string;
  generateBudgetStatusLabel: (status: any) => string;
  generateWeeklyHealthLabel: (health: any) => string;
}

export const useAccessibilityEnhancements = (): AccessibilityEnhancements => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Check if screen reader is enabled
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  const announceChange = useCallback((message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [isScreenReaderEnabled]);

  const setFocus = useCallback((ref: any) => {
    if (ref && ref.current) {
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  }, []);

  const generateFinancialLabel = useCallback((amount: number, context?: string): string => {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    if (context) {
      return `${context}: ${formattedAmount}`;
    }

    return formattedAmount;
  }, []);

  const generatePercentageLabel = useCallback((percentage: number, context?: string): string => {
    const label = `${percentage} percent`;
    
    if (context) {
      return `${context}: ${label}`;
    }

    return label;
  }, []);

  const generateHealthScoreLabel = useCallback((score: number, maxScore: number): string => {
    const normalizedScore = Math.round((score / maxScore) * 10 * 10) / 10; // Convert to 0-10 scale
    return `Financial health score: ${normalizedScore} out of 10`;
  }, []);

  const generateBudgetStatusLabel = useCallback((status: any): string => {
    if (!status) return 'Budget status unavailable';

    const spentLabel = generateFinancialLabel(status.totalSpent, 'Spent');
    const budgetLabel = generateFinancialLabel(status.totalBudget, 'out of budget');
    const percentageLabel = generatePercentageLabel(status.percentage, 'Usage');
    
    let statusDescription = '';
    if (status.isOverBudget) {
      const overAmount = status.overBudgetAmount || (status.totalSpent - status.totalBudget);
      statusDescription = `Over budget by ${generateFinancialLabel(overAmount)}`;
    } else {
      statusDescription = `${status.daysLeft} days remaining in budget period`;
    }

    return `Budget Status. ${spentLabel} ${budgetLabel}. ${percentageLabel}. ${statusDescription}`;
  }, [generateFinancialLabel, generatePercentageLabel]);

  const generateWeeklyHealthLabel = useCallback((health: any): string => {
    if (!health) return 'Weekly financial health unavailable';

    const scoreLabel = generateHealthScoreLabel(health.overallScore, health.maxScore);
    
    let itemsDescription = '';
    const totalItems = (health.achievements?.length || 0) + 
                      (health.warnings?.length || 0) + 
                      (health.issues?.length || 0);
    
    if (totalItems > 0) {
      const parts = [];
      if (health.achievements?.length) {
        parts.push(`${health.achievements.length} achievement${health.achievements.length > 1 ? 's' : ''}`);
      }
      if (health.warnings?.length) {
        parts.push(`${health.warnings.length} warning${health.warnings.length > 1 ? 's' : ''}`);
      }
      if (health.issues?.length) {
        parts.push(`${health.issues.length} issue${health.issues.length > 1 ? 's' : ''}`);
      }
      itemsDescription = `. Includes ${parts.join(', ')}`;
    }

    return `Weekly Financial Health. ${scoreLabel}${itemsDescription}`;
  }, [generateHealthScoreLabel]);

  return {
    announceChange,
    setFocus,
    generateFinancialLabel,
    generatePercentageLabel,
    generateHealthScoreLabel,
    generateBudgetStatusLabel,
    generateWeeklyHealthLabel,
  };
};

// Focus management utilities
export class FocusManager {
  private static focusStack: any[] = [];

  static pushFocus(element: any): void {
    this.focusStack.push(element);
  }

  static popFocus(): any | null {
    return this.focusStack.pop() || null;
  }

  static restorePreviousFocus(): void {
    const previousElement = this.popFocus();
    if (previousElement) {
      AccessibilityInfo.setAccessibilityFocus(previousElement);
    }
  }

  static clearFocusStack(): void {
    this.focusStack = [];
  }
}

// Keyboard navigation utilities
export const useKeyboardNavigation = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addEventListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addEventListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      if (showSubscription?.remove) {
        showSubscription.remove();
      }
      if (hideSubscription?.remove) {
        hideSubscription.remove();
      }
    };
  }, []);

  return { isKeyboardVisible };
};

// Color contrast utilities for accessibility
export const getAccessibleColor = (
  foreground: string,
  background: string,
  minContrast: number = 4.5
): string => {
  // This is a simplified version - in a real app you'd use a proper color contrast library
  // For now, return the original color
  return foreground;
};

// Text scaling utilities
export const getScaledFontSize = (baseFontSize: number, scaleFactor: number = 1): number => {
  // In React Native, font scaling is handled automatically by the system
  // This function can be used for custom scaling if needed
  return baseFontSize * scaleFactor;
};

// Accessibility testing utilities
export const testAccessibility = {
  hasAccessibilityLabel: (element: any): boolean => {
    return !!(element.props?.accessibilityLabel || element.props?.accessible);
  },

  hasAccessibilityRole: (element: any): boolean => {
    return !!element.props?.accessibilityRole;
  },

  hasAccessibilityHint: (element: any): boolean => {
    return !!element.props?.accessibilityHint;
  },

  isAccessible: (element: any): boolean => {
    return element.props?.accessible !== false;
  },

  hasMinimumTouchTarget: (element: any, minSize: number = 44): boolean => {
    const style = element.props?.style;
    if (!style) return false;

    const width = style.width || style.minWidth;
    const height = style.height || style.minHeight;

    return width >= minSize && height >= minSize;
  },
};

// React Native imports
import { Keyboard } from 'react-native';