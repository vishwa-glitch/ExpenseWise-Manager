import { colors } from '../constants/colors';

// Category color mapping with the new Goal Contribution category
export const CATEGORY_COLORS: { [key: string]: string } = {
  'Goal Contribution': '#4CAF50',    // Green - NEW!
  'Uncategorized': '#9E9E9E',        // Gray
  'Food & Dining': '#FF6B6B',        // Red
  'Transportation': '#4ECDC4',       // Teal
  'Bills & Utilities': '#FFEAA7',    // Yellow
  'Shopping': '#FF6B35',             // Orange
  'Entertainment': '#45B7D1',        // Blue
  'Healthcare': '#96CEB4',           // Light Green
  'Education': '#DDA0DD',            // Light Purple
  'Travel': '#98D8C8',               // Mint
  'Investment': '#F7DC6F',           // Light Yellow
  'Insurance': '#BB8FCE',            // Purple
  'Personal Care': '#85C1E9',        // Light Blue
  'Gifts & Donations': '#F8C471',    // Peach
  'Business': '#82E0AA',             // Light Green
};

// Get color for a category, with fallback to default colors
export const getCategoryColor = (categoryName: string | undefined | null): string => {
  if (!categoryName || typeof categoryName !== 'string') {
    return CATEGORY_COLORS['Uncategorized'];
  }
  
  // Check if we have a specific color for this category
  if (CATEGORY_COLORS[categoryName]) {
    return CATEGORY_COLORS[categoryName];
  }
  
  // Special handling for Goal Contribution variations
  if (categoryName.toLowerCase().includes('goal')) {
    return CATEGORY_COLORS['Goal Contribution'];
  }
  
  // Fallback to cycling through default category colors
  const categoryKeys = Object.keys(CATEGORY_COLORS);
  const index = categoryKeys.indexOf(categoryName) % colors.categories.length;
  return colors.categories[index] || colors.categories[0];
};

// Check if a category is a goal contribution
export const isGoalContribution = (categoryName: string | undefined | null): boolean => {
  if (!categoryName || typeof categoryName !== 'string') return false;
  return categoryName === 'Goal Contribution' || 
         categoryName.toLowerCase().includes('goal contribution');
};

// Get category display name with emoji for goal contributions
export const getCategoryDisplayName = (categoryName: string | undefined | null): string => {
  if (!categoryName || typeof categoryName !== 'string') return 'Uncategorized';
  if (isGoalContribution(categoryName)) {
    return `💰 ${categoryName}`;
  }
  return categoryName;
};

// Get special styling for goal contributions
export const getCategoryStyle = (categoryName: string | undefined | null) => {
  if (isGoalContribution(categoryName)) {
    return {
      color: CATEGORY_COLORS['Goal Contribution'],
      fontWeight: '600' as const,
      highlight: true,
    };
  }
  
  return {
    color: getCategoryColor(categoryName),
    fontWeight: 'normal' as const,
    highlight: false,
  };
};