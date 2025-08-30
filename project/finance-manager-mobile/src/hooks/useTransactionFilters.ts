import { useState, useCallback, useMemo } from 'react';

interface FilterState {
  timePeriod: string;
  categories: string[];
  transactionType: string;
  customDateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

interface UseTransactionFiltersReturn {
  filterState: FilterState;
  setTimePeriod: (period: string) => void;
  toggleCategory: (categoryId: string) => void;
  setTransactionType: (type: string) => void;
  setCustomDateRange: (startDate: string, endDate: string) => void;
  clearAllFilters: () => void;
  getQueryParams: () => Record<string, any>;
  hasActiveFilters: boolean;
  getFilterDescription: () => string;
}

const initialFilterState: FilterState = {
  timePeriod: 'all',
  categories: ['all-categories'],
  transactionType: 'all-types',
  customDateRange: {
    startDate: null,
    endDate: null,
  },
};

export const useTransactionFilters = (): UseTransactionFiltersReturn => {
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);

  const setTimePeriod = useCallback((period: string) => {
    setFilterState(prev => ({
      ...prev,
      timePeriod: period,
      // Clear custom date range if switching away from custom
      customDateRange: period === 'custom' 
        ? prev.customDateRange 
        : { startDate: null, endDate: null }
    }));
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setFilterState(prev => {
      let newCategories: string[];
      
      if (categoryId === 'all-categories') {
        // If selecting "All Categories", clear other selections
        newCategories = ['all-categories'];
      } else {
        // Remove "All Categories" if selecting specific category
        const filteredCategories = prev.categories.filter(id => id !== 'all-categories');
        
        if (prev.categories.includes(categoryId)) {
          // Remove the category
          newCategories = filteredCategories.filter(id => id !== categoryId);
          // If no categories left, default to "All Categories"
          if (newCategories.length === 0) {
            newCategories = ['all-categories'];
          }
        } else {
          // Add the category
          newCategories = [...filteredCategories, categoryId];
        }
      }
      
      return {
        ...prev,
        categories: newCategories,
      };
    });
  }, []);

  const setTransactionType = useCallback((type: string) => {
    setFilterState(prev => ({
      ...prev,
      transactionType: type,
    }));
  }, []);

  const setCustomDateRange = useCallback((startDate: string, endDate: string) => {
    setFilterState(prev => ({
      ...prev,
      customDateRange: {
        startDate,
        endDate,
      },
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterState(initialFilterState);
  }, []);

  const getDateRangeForPeriod = useCallback((period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      
      case 'week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        
        return {
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: endOfWeek.toISOString().split('T')[0],
        };
      }
      
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
        };
      }
      
      case 'quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        
        return {
          startDate: startOfQuarter.toISOString().split('T')[0],
          endDate: endOfQuarter.toISOString().split('T')[0],
        };
      }
      
      case 'year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        
        return {
          startDate: startOfYear.toISOString().split('T')[0],
          endDate: endOfYear.toISOString().split('T')[0],
        };
      }
      
      case 'custom':
        return {
          startDate: filterState.customDateRange.startDate,
          endDate: filterState.customDateRange.endDate,
        };
      
      default:
        return null;
    }
  }, [filterState.customDateRange]);

  const getQueryParams = useCallback(() => {
    const params: Record<string, any> = {};
    
    // Date range
    if (filterState.timePeriod !== 'all') {
      const dateRange = getDateRangeForPeriod(filterState.timePeriod);
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        params.dateRange = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        };
      }
    }
    
    // Handle custom date range specifically
    if (filterState.timePeriod === 'custom' && 
        filterState.customDateRange.startDate && 
        filterState.customDateRange.endDate) {
      params.dateRange = {
        startDate: filterState.customDateRange.startDate,
        endDate: filterState.customDateRange.endDate,
      };
    }
    
    // Categories
    if (!filterState.categories.includes('all-categories') && filterState.categories.length > 0) {
      // Map UI category IDs to backend category names/IDs
      const categoryMapping: Record<string, string> = {
        'food-dining': 'Food & Dining',
        'transportation': 'Transportation',
        'shopping': 'Shopping',
        'entertainment': 'Entertainment',
        'utilities': 'Utilities',
        'healthcare': 'Healthcare',
        'education': 'Education',
        'other': 'Other',
      };
      
      const mappedCategories = filterState.categories
        .map(id => categoryMapping[id] || id)
        .filter(Boolean);
      
      if (mappedCategories.length > 0) {
        params.categories = mappedCategories;
      }
    }
    
    // Transaction type
    if (filterState.transactionType !== 'all-types') {
      const typeMapping: Record<string, string> = {
        'income': 'income',
        'expense': 'expense',
        'transfer': 'transfer',
      };
      
      params.transactionType = typeMapping[filterState.transactionType] || 'all';
    }
    
    return params;
  }, [filterState, getDateRangeForPeriod]);

  const hasActiveFilters = useMemo(() => {
    return (
      filterState.timePeriod !== 'all' ||
      !filterState.categories.includes('all-categories') ||
      filterState.transactionType !== 'all-types' ||
      (filterState.timePeriod === 'custom' && 
       filterState.customDateRange.startDate && 
       filterState.customDateRange.endDate)
    );
  }, [filterState]);

  const getFilterDescription = useCallback(() => {
    const descriptions: string[] = [];
    
    // Time period
    if (filterState.timePeriod !== 'all') {
      if (filterState.timePeriod === 'custom' && 
          filterState.customDateRange.startDate && 
          filterState.customDateRange.endDate) {
        const startDate = new Date(filterState.customDateRange.startDate);
        const endDate = new Date(filterState.customDateRange.endDate);
        
        if (filterState.customDateRange.startDate === filterState.customDateRange.endDate) {
          // Single date
          descriptions.push(startDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }));
        } else {
          // Date range
          descriptions.push(`${startDate.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          })} - ${endDate.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`);
        }
      } else {
        const periodLabels: Record<string, string> = {
          'today': 'Today',
          'week': 'This Week',
          'month': 'This Month',
          'quarter': 'This Quarter',
          'year': 'This Year',
          'custom': 'Custom Range',
        };
        descriptions.push(periodLabels[filterState.timePeriod] || filterState.timePeriod);
      }
    }
    
    // Categories
    if (!filterState.categories.includes('all-categories')) {
      const categoryLabels: Record<string, string> = {
        'food-dining': 'Food & Dining',
        'transportation': 'Transport',
        'shopping': 'Shopping',
        'entertainment': 'Entertainment',
        'utilities': 'Bills & Utilities',
        'healthcare': 'Healthcare',
        'education': 'Education',
        'other': 'Other',
      };
      
      if (filterState.categories.length === 1) {
        descriptions.push(categoryLabels[filterState.categories[0]] || filterState.categories[0]);
      } else {
        descriptions.push(`${filterState.categories.length} categories`);
      }
    }
    
    // Transaction type
    if (filterState.transactionType !== 'all-types') {
      const typeLabels: Record<string, string> = {
        'income': 'Income only',
        'expense': 'Expenses only',
        'transfer': 'Transfers only',
      };
      descriptions.push(typeLabels[filterState.transactionType] || filterState.transactionType);
    }
    
    return descriptions.length > 0 
      ? `Filtered by: ${descriptions.join(', ')}` 
      : 'No filters applied';
  }, [filterState]);

  return {
    filterState,
    setTimePeriod,
    toggleCategory,
    setTransactionType,
    setCustomDateRange,
    clearAllFilters,
    getQueryParams,
    hasActiveFilters,
    getFilterDescription,
  };
};