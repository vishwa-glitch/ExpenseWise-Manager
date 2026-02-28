/**
 * Utility functions for budget display formatting
 */

/**
 * Generates a display name for a budget based on its category name
 * @param categoryName - The name of the category
 * @returns The formatted budget display name (e.g., "Food Budget")
 */
export const getBudgetDisplayName = (categoryName: string): string => {
  if (!categoryName || categoryName.trim() === '') {
    return 'Budget';
  }
  
  const trimmedName = categoryName.trim();
  
  // If the category name already ends with "Budget", don't add it again
  if (trimmedName.toLowerCase().endsWith('budget')) {
    return trimmedName;
  }
  
  return `${trimmedName} Budget`;
};

/**
 * Gets a short display name for a budget (without "Budget" suffix)
 * @param categoryName - The name of the category
 * @returns The short category name
 */
export const getBudgetShortName = (categoryName: string): string => {
  if (!categoryName || categoryName.trim() === '') {
    return 'Unknown';
  }
  
  return categoryName.trim();
};

/**
 * Formats budget name for notifications and alerts
 * @param categoryName - The name of the category
 * @returns The formatted name for notifications (e.g., "Food")
 */
export const getBudgetNotificationName = (categoryName: string): string => {
  if (!categoryName || categoryName.trim() === '') {
    return 'Budget';
  }
  
  const trimmedName = categoryName.trim();
  
  // Remove "Budget" suffix if it exists for cleaner notification text
  if (trimmedName.toLowerCase().endsWith(' budget')) {
    return trimmedName.slice(0, -7); // Remove " budget"
  }
  
  return trimmedName;
};
