/**
 * Utility functions for handling goal contributions
 */

/**
 * Check if a transaction is a goal contribution
 * @param transaction - The transaction to check
 * @returns boolean indicating if it's a goal contribution
 */
export const isGoalContribution = (transaction: any): boolean => {
  if (!transaction) return false;
  
  // Check if it has the goal-contribution tag
  if (transaction.tags && Array.isArray(transaction.tags)) {
    if (transaction.tags.includes('goal-contribution')) {
      return true;
    }
  }
  
  // Check if the description contains goal contribution keywords
  if (transaction.description) {
    const description = transaction.description.toLowerCase();
    if (description.includes('goal contribution') || 
        description.includes('goal contrib') ||
        description.includes('savings goal')) {
      return true;
    }
  }
  
  // Check if category name is "Goal Contribution" (from backend)
  if (transaction.category_name) {
    const categoryName = transaction.category_name.toLowerCase();
    if (categoryName === 'goal contribution' || 
        categoryName.includes('goal contribution')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get the display name for a goal contribution
 * @param transaction - The transaction to get display name for
 * @returns The display name
 */
export const getGoalContributionDisplayName = (transaction: any): string => {
  if (isGoalContribution(transaction)) {
    return 'Goal Contribution';
  }
  return transaction.category_name || 'Uncategorized';
};

/**
 * Get the icon for a goal contribution
 * @returns The emoji icon for goal contributions
 */
export const getGoalContributionIcon = (): string => {
  return '🎯';
};

/**
 * Get the color for goal contributions
 * @returns The hex color for goal contributions
 */
export const getGoalContributionColor = (): string => {
  return '#4CAF50'; // Green color
};

