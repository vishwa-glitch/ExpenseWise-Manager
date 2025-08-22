import {
  validateFilterCombination,
  combineFilters,
  resolveFilterConflicts,
  getFilterDescription,
  hasActiveFilters,
  FilterCombination,
} from '../filterValidation';

describe('filterValidation', () => {
  describe('validateFilterCombination', () => {
    it('should validate correct filter combination', () => {
      const filters: FilterCombination = {
        searchQuery: 'test',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        categories: ['1', '2'],
        transactionType: 'expense',
        minAmount: 100,
        maxAmount: 1000,
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid date range', () => {
      const filters: FilterCombination = {
        dateRange: {
          startDate: '2024-01-31',
          endDate: '2024-01-01', // End before start
        },
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start date must be before end date');
    });

    it('should detect invalid amount range', () => {
      const filters: FilterCombination = {
        minAmount: 1000,
        maxAmount: 100, // Max less than min
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum amount must be less than maximum amount');
    });

    it('should detect negative amounts', () => {
      const filters: FilterCombination = {
        minAmount: -100,
        maxAmount: -50,
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum amount cannot be negative');
      expect(result.errors).toContain('Maximum amount cannot be negative');
    });

    it('should warn about large date ranges', () => {
      const filters: FilterCombination = {
        dateRange: {
          startDate: '2023-01-01',
          endDate: '2024-12-31', // More than 1 year
        },
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Date range exceeds 1 year. This may affect performance.');
    });

    it('should warn about conflicting filters', () => {
      const filters: FilterCombination = {
        isUncategorized: true,
        categories: ['1', '2'], // Conflict
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Uncategorized filter conflicts with category selection. Uncategorized will take precedence.');
    });

    it('should warn about short search queries', () => {
      const filters: FilterCombination = {
        searchQuery: 'a', // Too short
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Search query is very short. Consider using at least 2 characters for better results.');
    });

    it('should warn about long search queries', () => {
      const filters: FilterCombination = {
        searchQuery: 'a'.repeat(101), // Too long
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Search query is very long. Consider shortening for better performance.');
    });

    it('should warn about too many categories', () => {
      const filters: FilterCombination = {
        categories: Array.from({ length: 15 }, (_, i) => i.toString()), // Too many
      };

      const result = validateFilterCombination(filters);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Many categories selected. Consider reducing selection for better performance.');
    });
  });

  describe('combineFilters', () => {
    it('should combine search queries (use latest)', () => {
      const base: FilterCombination = { searchQuery: 'old' };
      const additional: Partial<FilterCombination> = { searchQuery: 'new' };

      const result = combineFilters(base, additional);
      expect(result.searchQuery).toBe('new');
    });

    it('should combine date ranges (intersection)', () => {
      const base: FilterCombination = {
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-03-31',
        },
      };
      const additional: Partial<FilterCombination> = {
        dateRange: {
          startDate: '2024-02-01',
          endDate: '2024-02-29',
        },
      };

      const result = combineFilters(base, additional);
      expect(result.dateRange).toEqual({
        startDate: '2024-02-01', // Later start
        endDate: '2024-02-29',   // Earlier end
      });
    });

    it('should combine categories (union)', () => {
      const base: FilterCombination = { categories: ['1', '2'] };
      const additional: Partial<FilterCombination> = { categories: ['2', '3'] };

      const result = combineFilters(base, additional);
      expect(result.categories).toEqual(['1', '2', '3']);
    });

    it('should combine amount ranges (most restrictive)', () => {
      const base: FilterCombination = { minAmount: 100, maxAmount: 1000 };
      const additional: Partial<FilterCombination> = { minAmount: 200, maxAmount: 800 };

      const result = combineFilters(base, additional);
      expect(result.minAmount).toBe(200); // Higher minimum
      expect(result.maxAmount).toBe(800); // Lower maximum
    });

    it('should handle boolean filters', () => {
      const base: FilterCombination = { isRecurring: false };
      const additional: Partial<FilterCombination> = { isRecurring: true };

      const result = combineFilters(base, additional);
      expect(result.isRecurring).toBe(true);
    });
  });

  describe('resolveFilterConflicts', () => {
    it('should resolve uncategorized vs categories conflict', () => {
      const filters: FilterCombination = {
        isUncategorized: true,
        categories: ['1', '2'],
      };

      const result = resolveFilterConflicts(filters);
      expect(result.isUncategorized).toBe(true);
      expect(result.categories).toEqual([]);
    });

    it('should resolve amount range conflicts', () => {
      const filters: FilterCombination = {
        minAmount: 1000,
        maxAmount: 100, // Swapped
      };

      const result = resolveFilterConflicts(filters);
      expect(result.minAmount).toBe(100);
      expect(result.maxAmount).toBe(1000);
    });

    it('should resolve date range conflicts', () => {
      const filters: FilterCombination = {
        dateRange: {
          startDate: '2024-01-31',
          endDate: '2024-01-01', // Swapped
        },
      };

      const result = resolveFilterConflicts(filters);
      expect(result.dateRange).toEqual({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  describe('getFilterDescription', () => {
    it('should describe search query', () => {
      const filters: FilterCombination = { searchQuery: 'test' };
      const result = getFilterDescription(filters);
      expect(result).toBe('Search: "test"');
    });

    it('should describe date range', () => {
      const filters: FilterCombination = {
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };
      const result = getFilterDescription(filters);
      expect(result).toContain('Date: ');
    });

    it('should describe transaction type', () => {
      const filters: FilterCombination = { transactionType: 'expense' };
      const result = getFilterDescription(filters);
      expect(result).toBe('Type: expense');
    });

    it('should describe categories', () => {
      const filters: FilterCombination = { categories: ['1', '2', '3'] };
      const result = getFilterDescription(filters);
      expect(result).toBe('Categories: 3 selected');
    });

    it('should describe amount ranges', () => {
      const filters: FilterCombination = { minAmount: 100, maxAmount: 1000 };
      const result = getFilterDescription(filters);
      expect(result).toBe('Amount: ₹100 - ₹1000');
    });

    it('should describe pattern filters', () => {
      const filters: FilterCombination = { isRecurring: true, isUncategorized: true };
      const result = getFilterDescription(filters);
      expect(result).toBe('Recurring transactions, Uncategorized transactions');
    });

    it('should combine multiple filters', () => {
      const filters: FilterCombination = {
        searchQuery: 'test',
        transactionType: 'expense',
        categories: ['1'],
      };
      const result = getFilterDescription(filters);
      expect(result).toContain('Search: "test"');
      expect(result).toContain('Type: expense');
      expect(result).toContain('Categories: 1 selected');
    });

    it('should return default message for no filters', () => {
      const filters: FilterCombination = {};
      const result = getFilterDescription(filters);
      expect(result).toBe('No filters applied');
    });
  });

  describe('hasActiveFilters', () => {
    it('should return true for search query', () => {
      const filters: FilterCombination = { searchQuery: 'test' };
      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return true for date range', () => {
      const filters: FilterCombination = {
        dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
      };
      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return true for categories', () => {
      const filters: FilterCombination = { categories: ['1'] };
      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return true for non-default transaction type', () => {
      const filters: FilterCombination = { transactionType: 'expense' };
      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return true for amount filters', () => {
      const filters: FilterCombination = { minAmount: 100 };
      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return true for pattern filters', () => {
      const filters: FilterCombination = { isRecurring: true };
      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return false for empty filters', () => {
      const filters: FilterCombination = {};
      expect(hasActiveFilters(filters)).toBe(false);
    });

    it('should return false for default transaction type', () => {
      const filters: FilterCombination = { transactionType: 'all' };
      expect(hasActiveFilters(filters)).toBe(false);
    });

    it('should return false for empty arrays', () => {
      const filters: FilterCombination = { categories: [] };
      expect(hasActiveFilters(filters)).toBe(false);
    });
  });
});