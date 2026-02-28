/**
 * Filter validation and combination utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FilterCombination {
  searchQuery?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categories?: string[];
  transactionType?: 'all' | 'income' | 'expense';
  minAmount?: number;
  maxAmount?: number;
  isRecurring?: boolean;
  isUncategorized?: boolean;
}

/**
 * Validate filter combinations for logical consistency
 */
export const validateFilterCombination = (filters: FilterCombination): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Date range validation
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        errors.push('Start date must be before end date');
      }
      
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        warnings.push('Date range exceeds 1 year. This may affect performance.');
      }
      
      if (daysDiff < 1) {
        warnings.push('Date range is less than 1 day. Results may be limited.');
      }
    }
  }

  // Amount range validation
  if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
    if (filters.minAmount > filters.maxAmount) {
      errors.push('Minimum amount must be less than maximum amount');
    }
    
    if (filters.minAmount < 0) {
      errors.push('Minimum amount cannot be negative');
    }
    
    if (filters.maxAmount < 0) {
      errors.push('Maximum amount cannot be negative');
    }
  }

  // Logical conflicts
  if (filters.isUncategorized && filters.categories && filters.categories.length > 0) {
    warnings.push('Uncategorized filter conflicts with category selection. Uncategorized will take precedence.');
  }

  // Search query validation
  if (filters.searchQuery) {
    if (filters.searchQuery.length < 2) {
      warnings.push('Search query is very short. Consider using at least 2 characters for better results.');
    }
    
    if (filters.searchQuery.length > 100) {
      warnings.push('Search query is very long. Consider shortening for better performance.');
    }
  }

  // Category validation
  if (filters.categories && filters.categories.length > 10) {
    warnings.push('Many categories selected. Consider reducing selection for better performance.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Combine multiple filter states using AND logic
 */
export const combineFilters = (
  baseFilters: FilterCombination,
  additionalFilters: Partial<FilterCombination>
): FilterCombination => {
  const combined: FilterCombination = { ...baseFilters };

  // Combine search queries (use the most recent one)
  if (additionalFilters.searchQuery !== undefined) {
    combined.searchQuery = additionalFilters.searchQuery;
  }

  // Combine date ranges (use the most restrictive)
  if (additionalFilters.dateRange) {
    if (!combined.dateRange) {
      combined.dateRange = additionalFilters.dateRange;
    } else {
      // Use the intersection of date ranges
      const startDate = new Date(Math.max(
        new Date(combined.dateRange.startDate).getTime(),
        new Date(additionalFilters.dateRange.startDate).getTime()
      )).toISOString().split('T')[0];
      
      const endDate = new Date(Math.min(
        new Date(combined.dateRange.endDate).getTime(),
        new Date(additionalFilters.dateRange.endDate).getTime()
      )).toISOString().split('T')[0];
      
      combined.dateRange = { startDate, endDate };
    }
  }

  // Combine categories (union)
  if (additionalFilters.categories) {
    const existingCategories = combined.categories || [];
    combined.categories = [...new Set([...existingCategories, ...additionalFilters.categories])];
  }

  // Transaction type (use the most recent)
  if (additionalFilters.transactionType !== undefined) {
    combined.transactionType = additionalFilters.transactionType;
  }

  // Amount ranges (use the most restrictive)
  if (additionalFilters.minAmount !== undefined) {
    combined.minAmount = Math.max(combined.minAmount || 0, additionalFilters.minAmount);
  }
  
  if (additionalFilters.maxAmount !== undefined) {
    if (combined.maxAmount === undefined) {
      combined.maxAmount = additionalFilters.maxAmount;
    } else {
      combined.maxAmount = Math.min(combined.maxAmount, additionalFilters.maxAmount);
    }
  }

  // Boolean filters (AND logic)
  if (additionalFilters.isRecurring !== undefined) {
    combined.isRecurring = additionalFilters.isRecurring;
  }
  
  if (additionalFilters.isUncategorized !== undefined) {
    combined.isUncategorized = additionalFilters.isUncategorized;
  }

  return combined;
};

/**
 * Check for filter conflicts and resolve them
 */
export const resolveFilterConflicts = (filters: FilterCombination): FilterCombination => {
  const resolved = { ...filters };

  // Resolve uncategorized vs categories conflict
  if (resolved.isUncategorized && resolved.categories && resolved.categories.length > 0) {
    // Uncategorized takes precedence, clear categories
    resolved.categories = [];
  }

  // Resolve amount range conflicts
  if (resolved.minAmount !== undefined && resolved.maxAmount !== undefined) {
    if (resolved.minAmount > resolved.maxAmount) {
      // Swap values
      const temp = resolved.minAmount;
      resolved.minAmount = resolved.maxAmount;
      resolved.maxAmount = temp;
    }
  }

  // Resolve date range conflicts
  if (resolved.dateRange) {
    const { startDate, endDate } = resolved.dateRange;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      // Swap dates
      resolved.dateRange = {
        startDate: endDate,
        endDate: startDate,
      };
    }
  }

  return resolved;
};

/**
 * Get a human-readable description of active filters
 */
export const getFilterDescription = (filters: FilterCombination): string => {
  const descriptions: string[] = [];

  if (filters.searchQuery) {
    descriptions.push(`Search: "${filters.searchQuery}"`);
  }

  if (filters.dateRange) {
    const start = new Date(filters.dateRange.startDate).toLocaleDateString();
    const end = new Date(filters.dateRange.endDate).toLocaleDateString();
    descriptions.push(`Date: ${start} - ${end}`);
  }

  if (filters.transactionType && filters.transactionType !== 'all') {
    descriptions.push(`Type: ${filters.transactionType}`);
  }

  if (filters.categories && filters.categories.length > 0) {
    descriptions.push(`Categories: ${filters.categories.length} selected`);
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
      descriptions.push(`Amount: ₹${filters.minAmount} - ₹${filters.maxAmount}`);
    } else if (filters.minAmount !== undefined) {
      descriptions.push(`Amount: > ₹${filters.minAmount}`);
    } else if (filters.maxAmount !== undefined) {
      descriptions.push(`Amount: < ₹${filters.maxAmount}`);
    }
  }

  if (filters.isRecurring) {
    descriptions.push('Recurring transactions');
  }

  if (filters.isUncategorized) {
    descriptions.push('Uncategorized transactions');
  }

  return descriptions.length > 0 ? descriptions.join(', ') : 'No filters applied';
};

/**
 * Check if any filters are active
 */
export const hasActiveFilters = (filters: FilterCombination): boolean => {
  return !!(
    filters.searchQuery ||
    filters.dateRange ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.transactionType && filters.transactionType !== 'all') ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined ||
    filters.isRecurring ||
    filters.isUncategorized
  );
};