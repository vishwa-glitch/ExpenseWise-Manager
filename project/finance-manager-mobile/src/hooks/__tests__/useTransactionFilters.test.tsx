import { renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useTransactionFilters } from '../useTransactionFilters';
import transactionsReducer from '../../store/slices/transactionsSlice';

// Mock the validation utilities
jest.mock('../../utils/filterValidation', () => ({
  validateFilterCombination: jest.fn(() => ({
    isValid: true,
    errors: [],
    warnings: [],
  })),
  getFilterDescription: jest.fn(() => 'Test filter description'),
  hasActiveFilters: jest.fn(() => false),
  resolveFilterConflicts: jest.fn((filters) => filters),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      transactions: transactionsReducer,
    },
    preloadedState: {
      transactions: {
        transactions: [],
        filteredTransactions: [],
        calendarData: null,
        pagination: null,
        activeFilters: {
          searchQuery: '',
          activeQuickFilters: [],
          dateRange: {
            startDate: null,
            endDate: null,
            preset: null,
          },
          categories: [],
          transactionType: 'all',
          amountFilter: {
            isHighAmount: false,
            customRange: {
              min: null,
              max: null,
            },
          },
          patternFilters: {
            isRecurring: null,
            isUncategorized: null,
          },
        },
        queryCache: {},
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

const wrapper = ({ children, store }: any) => (
  <Provider store={store}>{children}</Provider>
);

describe('useTransactionFilters', () => {
  let mockStore: any;

  beforeEach(() => {
    mockStore = createMockStore();
    jest.clearAllMocks();
  });

  it('should initialize with default filter state', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.activeFilters.searchQuery).toBe('');
    expect(result.current.activeFilters.activeQuickFilters).toEqual([]);
    expect(result.current.activeFilters.categories).toEqual([]);
    expect(result.current.activeFilters.transactionType).toBe('all');
  });

  it('should update search query', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setSearchQuery('test query');
    });

    expect(result.current.activeFilters.searchQuery).toBe('test query');
  });

  it('should toggle quick filters', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.toggleFilter('this_month');
    });

    expect(result.current.activeFilters.activeQuickFilters).toContain('this_month');

    act(() => {
      result.current.toggleFilter('this_month');
    });

    expect(result.current.activeFilters.activeQuickFilters).not.toContain('this_month');
  });

  it('should set date range', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setDateRange('2024-01-01', '2024-01-31');
    });

    expect(result.current.activeFilters.dateRange.startDate).toBe('2024-01-01');
    expect(result.current.activeFilters.dateRange.endDate).toBe('2024-01-31');
  });

  it('should set categories', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setCategories(['1', '2', '3']);
    });

    expect(result.current.activeFilters.categories).toEqual(['1', '2', '3']);
  });

  it('should set transaction type', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setTransactionType('expense');
    });

    expect(result.current.activeFilters.transactionType).toBe('expense');
  });

  it('should set amount range', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setAmountRange(100, 1000);
    });

    expect(result.current.activeFilters.amountFilter.customRange.min).toBe(100);
    expect(result.current.activeFilters.amountFilter.customRange.max).toBe(1000);
  });

  it('should set recurring filter', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setRecurringFilter(true);
    });

    expect(result.current.activeFilters.patternFilters.isRecurring).toBe(true);
  });

  it('should set uncategorized filter', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setUncategorizedFilter(true);
    });

    expect(result.current.activeFilters.patternFilters.isUncategorized).toBe(true);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    // Set some filters first
    act(() => {
      result.current.setSearchQuery('test');
      result.current.setCategories(['1', '2']);
      result.current.setTransactionType('expense');
    });

    // Clear all filters
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.activeFilters.searchQuery).toBe('');
    expect(result.current.activeFilters.categories).toEqual([]);
    expect(result.current.activeFilters.transactionType).toBe('all');
  });

  it('should build query parameters', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setDateRange('2024-01-01', '2024-01-31');
      result.current.setCategories(['1', '2']);
      result.current.setTransactionType('expense');
      result.current.setAmountRange(100, 1000);
      result.current.setRecurringFilter(true);
    });

    const queryParams = result.current.buildQueryParams();

    expect(queryParams).toEqual({
      searchQuery: 'test',
      dateRange: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      categories: ['1', '2'],
      transactionType: 'expense',
      minAmount: 100,
      maxAmount: 1000,
      isRecurring: true,
    });
  });

  it('should handle high amount filter', () => {
    const storeWithHighAmount = createMockStore({
      activeFilters: {
        searchQuery: '',
        activeQuickFilters: [],
        dateRange: {
          startDate: null,
          endDate: null,
          preset: null,
        },
        categories: [],
        transactionType: 'all',
        amountFilter: {
          isHighAmount: true,
          customRange: {
            min: null,
            max: null,
          },
        },
        patternFilters: {
          isRecurring: null,
          isUncategorized: null,
        },
      },
    });

    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: storeWithHighAmount }),
    });

    const queryParams = result.current.buildQueryParams();
    expect(queryParams.minAmount).toBe(5000);
  });

  it('should validate current filters', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    const validation = result.current.validateCurrentFilters();
    expect(validation).toEqual({
      isValid: true,
      errors: [],
      warnings: [],
    });
  });

  it('should provide filter description', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.filterDescription).toBe('Test filter description');
  });

  it('should indicate if filters are active', () => {
    const { result } = renderHook(() => useTransactionFilters(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.hasFilters).toBe(false);
  });
});