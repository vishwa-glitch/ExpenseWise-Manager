import { apiService } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(require('axios'));

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock axios create
    mockedAxios.create.mockReturnValue({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any);
  });

  describe('Enhanced getTransactions', () => {
    it('should call API with basic parameters', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      // Replace the internal api instance
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20');
    });

    it('should include search query in API call', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        searchQuery: 'test search',
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&search=test%20search');
    });

    it('should include date range in API call', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&start_date=2024-01-01&end_date=2024-01-31');
    });

    it('should include categories in API call', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        categories: ['1', '2', '3'],
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&categories=1%2C2%2C3');
    });

    it('should include transaction type in API call', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        transactionType: 'expense' as const,
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&type=expense');
    });

    it('should include amount range in API call', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        minAmount: 100,
        maxAmount: 1000,
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&min_amount=100&max_amount=1000');
    });

    it('should include pattern filters in API call', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        isRecurring: true,
        isUncategorized: true,
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&is_recurring=true&uncategorized=true');
    });

    it('should include legacy parameters for backward compatibility', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        accountId: 'account123',
        date: '2024-01-15',
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&account_id=account123&date=2024-01-15');
    });

    it('should combine all parameters correctly', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 2,
        limit: 50,
        searchQuery: 'grocery',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        categories: ['food', 'shopping'],
        transactionType: 'expense' as const,
        minAmount: 50,
        maxAmount: 500,
        isRecurring: false,
        isUncategorized: false,
        accountId: 'account123',
      };

      await apiService.getTransactions(params);

      const expectedUrl = '/transactions?page=2&limit=50&account_id=account123&search=grocery&start_date=2024-01-01&end_date=2024-01-31&categories=food%2Cshopping&type=expense&min_amount=50&max_amount=500&is_recurring=false&uncategorized=false';
      expect(mockApi.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      
      const mockApi = {
        get: jest.fn().mockRejectedValue(mockError),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
      };

      await expect(apiService.getTransactions(params)).rejects.toThrow('Network error');
    });

    it('should handle empty parameters', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      await apiService.getTransactions({});

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20');
    });

    it('should handle undefined parameters', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      await apiService.getTransactions();

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20');
    });

    it('should not include null or undefined values in query string', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        searchQuery: undefined,
        categories: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        isRecurring: null,
        isUncategorized: undefined,
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20');
    });

    it('should handle zero values correctly', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          pagination: { page: 1, pages: 1, total: 0 },
        },
      };

      const mockApi = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      
      (apiService as any).api = mockApi;

      const params = {
        page: 1,
        limit: 20,
        minAmount: 0,
        maxAmount: 0,
      };

      await apiService.getTransactions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/transactions?page=1&limit=20&min_amount=0&max_amount=0');
    });
  });
});