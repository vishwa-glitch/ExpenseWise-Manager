/**
 * Utility functions for transaction filtering
 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Get date range for quick filter presets
 */
export const getDateRangeForFilter = (filterId: string): DateRange | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filterId) {
    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      
      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
      };
    }
    
    case 'this_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
      };
    }
    
    case 'last_month': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      return {
        startDate: startOfLastMonth.toISOString().split('T')[0],
        endDate: endOfLastMonth.toISOString().split('T')[0],
      };
    }
    
    case 'last_3_months': {
      const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      return {
        startDate: startOf3MonthsAgo.toISOString().split('T')[0],
        endDate: endOfLastMonth.toISOString().split('T')[0],
      };
    }
    
    default:
      return null;
  }
};

/**
 * Convert filter chips to API query parameters
 */
export const convertFiltersToQueryParams = (activeFilters: string[], categories: any[] = []) => {
  const params: any = {};
  
  // Handle date filters
  const dateFilters = activeFilters.filter(f => 
    ['this_week', 'this_month', 'last_month', 'last_3_months'].includes(f)
  );
  
  if (dateFilters.length > 0) {
    // Use the most restrictive date filter (latest one selected)
    const latestDateFilter = dateFilters[dateFilters.length - 1];
    const dateRange = getDateRangeForFilter(latestDateFilter);
    if (dateRange) {
      params.dateRange = dateRange;
    }
  }
  
  // Handle amount filters
  if (activeFilters.includes('high_amount')) {
    params.minAmount = 5000;
  }
  
  // Handle pattern filters
  if (activeFilters.includes('recurring')) {
    params.isRecurring = true;
  }
  
  if (activeFilters.includes('uncategorized')) {
    params.isUncategorized = true;
  }
  
  // Handle category filters
  const categoryFilters = activeFilters
    .filter(f => f.startsWith('category_'))
    .map(f => f.replace('category_', ''));
    
  if (categoryFilters.length > 0) {
    params.categories = categoryFilters;
  }
  
  return params;
};

/**
 * Generate cache key for query parameters
 */
export const generateCacheKey = (params: any): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result: any, key) => {
      result[key] = params[key];
      return result;
    }, {});
    
  return JSON.stringify(sortedParams);
};

/**
 * Check if cache entry is still valid
 */
export const isCacheValid = (entry: any): boolean => {
  if (!entry) return false;
  
  const now = Date.now();
  return (now - entry.timestamp) < entry.ttl;
};