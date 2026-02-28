/**
 * Accessibility utilities for better screen reader support
 */

import { AccessibilityInfo, findNodeHandle } from 'react-native';

/**
 * Announce a message to screen readers
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Set focus to a specific component
 */
export function setAccessibilityFocus(component: any): void {
  const reactTag = findNodeHandle(component);
  if (reactTag) {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }
}

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  return AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Get animation duration for accessibility
 * Returns reduced duration if reduce motion is enabled
 */
export function getAnimationDuration(defaultDuration: number = 300): number {
  // For now, return the default duration
  // In a full implementation, you would check for reduce motion preference
  return defaultDuration;
}

/**
 * Generate accessibility label for filter states
 */
export function getFilterAccessibilityLabel(
  filterType: string,
  isActive: boolean,
  additionalInfo?: string
): string {
  const state = isActive ? 'active' : 'inactive';
  const info = additionalInfo ? `, ${additionalInfo}` : '';
  return `${filterType} filter, ${state}${info}`;
}

/**
 * Generate accessibility hint for filter actions
 */
export function getFilterAccessibilityHint(
  filterType: string,
  isActive: boolean
): string {
  const action = isActive ? 'Remove' : 'Apply';
  return `${action} ${filterType} filter to transactions`;
}

/**
 * Generate accessibility label for transaction counts
 */
export function getTransactionCountLabel(
  count: number,
  filtered?: number
): string {
  if (filtered !== undefined && filtered !== count) {
    return `Showing ${filtered} of ${count} transactions`;
  }
  return `${count} transaction${count !== 1 ? 's' : ''}`;
}

/**
 * Generate accessibility label for date ranges
 */
export function getDateRangeLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString();
  const end = new Date(endDate).toLocaleDateString();
  return `Date range from ${start} to ${end}`;
}

/**
 * Generate accessibility label for amount ranges
 */
export function getAmountRangeLabel(
  minAmount?: number,
  maxAmount?: number,
  currency = '₹'
): string {
  if (minAmount !== undefined && maxAmount !== undefined) {
    return `Amount range from ${currency}${minAmount} to ${currency}${maxAmount}`;
  } else if (minAmount !== undefined) {
    return `Amount greater than ${currency}${minAmount}`;
  } else if (maxAmount !== undefined) {
    return `Amount less than ${currency}${maxAmount}`;
  }
  return 'No amount filter';
}

/**
 * Generate accessibility label for search results
 */
export function getSearchResultsLabel(
  query: string,
  resultCount: number
): string {
  if (query.trim() === '') {
    return `${resultCount} transaction${resultCount !== 1 ? 's' : ''}`;
  }
  return `${resultCount} transaction${resultCount !== 1 ? 's' : ''} found for "${query}"`;
}

/**
 * Generate accessibility announcement for filter changes
 */
export function announceFilterChange(
  filterType: string,
  isActive: boolean,
  resultCount?: number
): void {
  const action = isActive ? 'Applied' : 'Removed';
  let message = `${action} ${filterType} filter`;
  
  if (resultCount !== undefined) {
    message += `. ${resultCount} transaction${resultCount !== 1 ? 's' : ''} found`;
  }
  
  announceForAccessibility(message);
}

/**
 * Generate accessibility announcement for loading states
 */
export function announceLoadingState(isLoading: boolean, context = 'transactions'): void {
  const message = isLoading 
    ? `Loading ${context}...` 
    : `${context} loaded`;
  
  announceForAccessibility(message);
}

/**
 * Generate accessibility announcement for errors
 */
export function announceError(errorMessage: string): void {
  announceForAccessibility(`Error: ${errorMessage}`);
}

/**
 * Create accessibility props for filter chips
 */
export function createFilterChipAccessibilityProps(
  label: string,
  isActive: boolean,
  type: 'date' | 'amount' | 'category' | 'pattern' = 'category'
) {
  return {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: getFilterAccessibilityLabel(label, isActive),
    accessibilityHint: getFilterAccessibilityHint(label, isActive),
    accessibilityState: { selected: isActive },
  };
}

/**
 * Create accessibility props for search inputs
 */
export function createSearchAccessibilityProps(
  currentValue: string,
  placeholder: string
) {
  return {
    accessible: true,
    accessibilityRole: 'none' as const,
    accessibilityLabel: `Search transactions. Current search: ${currentValue || 'empty'}`,
    accessibilityHint: placeholder,
  };
}

/**
 * Create accessibility props for clear buttons
 */
export function createClearButtonAccessibilityProps(context: string) {
  return {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: `Clear ${context}`,
    accessibilityHint: `Removes the current ${context}`,
  };
}

/**
 * Create accessibility props for summary information
 */
export function createSummaryAccessibilityProps(summaryText: string) {
  return {
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: summaryText,
  };
}