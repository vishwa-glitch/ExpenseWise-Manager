import {
  getDateRangeForFilter,
  convertFiltersToQueryParams,
  generateCacheKey,
  isCacheValid,
} from '../filterUtils';

describe('filterUtils', () => {
  beforeEach(() => {
    // Mock current date to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getDateRangeForFilter', () => {
    it('should return correct date range for this_week', () => {
      const result = getDateRangeForFilter('this_week');
      expect(result).toEqual({
        startDate: '2024-03-10', // Sunday
        endDate: '2024-03-16',   // Saturday
      });
    });

    it('should return correct date range for this_month', () => {
      const result = getDateRangeForFilter('this_month');
      expect(result).toEqual({
        startDate: '2024-03-01',
        endDate: '2024-03-31',
      });
    });

    it('should return correct date range for last_month', () => {
      const result = getDateRangeForFilter('last_month');
      expect(result).toEqual({
        startDate: '2024-02-01',
        endDate: '2024-02-29', // 2024 is a leap year
      });
    });

    it('should return correct date range for last_3_months', () => {
      const result = getDateRangeForFilter('last_3_months');
      expect(result).toEqual({
        startDate: '2023-12-01',
        endDate: '2024-02-29',
      });
    });

    it('should return null for invalid filter', () => {
      const result = getDateRangeForFilter('invalid_filter');
      expect(result).toBeNull();
    });
  });

  describe('convertFiltersToQueryParams', () => {
    it('should convert date filters correctly', () => {
      const activeFilters = ['this_month'];
      const result = convertFiltersToQueryParams(activeFilters);
      
      expect(result).toEqual({
        dateRange: {
          startDate: '2024-03-01',
          endDate: '2024-03-31',
        },
      });
    });

    it('should convert amount filters correctly', () => {
      const activeFilters = ['high_amount'];
      const result = convertFiltersToQueryParams(activeFilters);
      
      expect(result).toEqual({
        minAmount: 5000,
      });
    });

    it('should convert pattern filters correctly', () => {
      const activeFilters = ['recurring', 'uncategorized'];
      const result = convertFiltersToQueryParams(activeFilters);
      
      expect(result).toEqual({
        isRecurring: true,
        isUncategorized: true,
      });
    });

    it('should convert category filters correctly', () => {
      const activeFilters = ['category_1', 'category_2'];
      const result = convertFiltersToQueryParams(activeFilters);
      
      expect(result).toEqual({
        categories: ['1', '2'],
      });
    });

    it('should handle multiple filter types', () => {
      const activeFilters = ['this_month', 'high_amount', 'recurring', 'category_1'];
      const result = convertFiltersToQueryParams(activeFilters);
      
      expect(result).toEqual({
        dateRange: {
          startDate: '2024-03-01',
          endDate: '2024-03-31',
        },
        minAmount: 5000,
        isRecurring: true,
        categories: ['1'],
      });
    });

    it('should use the latest date filter when multiple are provided', () => {
      const activeFilters = ['this_month', 'last_month'];
      const result = convertFiltersToQueryParams(activeFilters);
      
      expect(result.dateRange).toEqual({
        startDate: '2024-02-01',
        endDate: '2024-02-29',
      });
    });

    it('should return empty object for no filters', () => {
      const result = convertFiltersToQueryParams([]);
      expect(result).toEqual({});
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys for same parameters', () => {
      const params1 = { page: 1, limit: 20, searchQuery: 'test' };
      const params2 = { page: 1, limit: 20, searchQuery: 'test' };
      
      const key1 = generateCacheKey(params1);
      const key2 = generateCacheKey(params2);
      
      expect(key1).toBe(key2);
    });

    it('should generate different cache keys for different parameters', () => {
      const params1 = { page: 1, limit: 20, searchQuery: 'test' };
      const params2 = { page: 1, limit: 20, searchQuery: 'different' };
      
      const key1 = generateCacheKey(params1);
      const key2 = generateCacheKey(params2);
      
      expect(key1).not.toBe(key2);
    });

    it('should sort parameters to ensure consistent keys', () => {
      const params1 = { searchQuery: 'test', page: 1, limit: 20 };
      const params2 = { page: 1, limit: 20, searchQuery: 'test' };
      
      const key1 = generateCacheKey(params1);
      const key2 = generateCacheKey(params2);
      
      expect(key1).toBe(key2);
    });

    it('should handle nested objects', () => {
      const params = {
        dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
        categories: ['1', '2'],
      };
      
      const key = generateCacheKey(params);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });

  describe('isCacheValid', () => {
    it('should return true for valid cache entry', () => {
      const entry = {
        data: [],
        pagination: {},
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000, // 5 minutes
      };
      
      expect(isCacheValid(entry)).toBe(true);
    });

    it('should return false for expired cache entry', () => {
      const entry = {
        data: [],
        pagination: {},
        timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        ttl: 5 * 60 * 1000, // 5 minutes TTL
      };
      
      expect(isCacheValid(entry)).toBe(false);
    });

    it('should return false for null entry', () => {
      expect(isCacheValid(null)).toBe(false);
    });

    it('should return false for undefined entry', () => {
      expect(isCacheValid(undefined)).toBe(false);
    });

    it('should return false for entry without timestamp', () => {
      const entry = {
        data: [],
        pagination: {},
        ttl: 5 * 60 * 1000,
      };
      
      expect(isCacheValid(entry)).toBe(false);
    });

    it('should return false for entry without ttl', () => {
      const entry = {
        data: [],
        pagination: {},
        timestamp: Date.now(),
      };
      
      expect(isCacheValid(entry)).toBe(false);
    });
  });
});