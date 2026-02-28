import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { BudgetStatusResponse, WeeklyHealthResponse, DashboardInsightsResponse } from '../types/api';

interface TransactionQueryParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categories?: string[];
  transactionType?: 'all' | 'income' | 'expense';
  minAmount?: number;
  maxAmount?: number;
  isRecurring?: boolean | null;
  isUncategorized?: boolean;
  accountId?: string;
  date?: string; // Legacy support
}

class ApiService {
  private api: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public async get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.api.get(url, config);
  }

  public async post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.api.post(url, data, config);
  }

  public async put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.api.put(url, data, config);
  }

  public async delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.api.delete(url, config);
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        console.log(`🔍 Making API request to: ${config.url}`);
        
        // Skip adding authorization header for authentication endpoints and public endpoints
        const publicEndpoints = [
          API_ENDPOINTS.AUTH.LOGIN,
          API_ENDPOINTS.AUTH.REGISTER,
          API_ENDPOINTS.AUTH.REFRESH,
          API_ENDPOINTS.AUTH.LOGOUT,
          '/currency/supported', // Public currency endpoint
        ];
        
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
          config.url?.includes(endpoint)
        );
        
        if (isPublicEndpoint) {
          console.log(`🔓 Skipping authorization for public endpoint: ${config.url}`);
          return config;
        }
        
        const token = await SecureStore.getItemAsync('access_token');
        console.log(`🔑 Token retrieved from SecureStore: ${token ? 'present' : 'missing'}`);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`✅ Setting Authorization header for request to: ${config.url}`);
          console.log(`🔑 Authorization header value: Bearer ${token.substring(0, 20)}...`);
        } else {
          console.log(`❌ No token available for request to: ${config.url}`);
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API response received from: ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      async (error) => {
        console.error(`❌ API error from: ${error.config?.url} - Status: ${error.response?.status}`);
        console.error('❌ Full error response:', error.response?.data);
        
        const originalRequest = error.config;

        // Skip token refresh for authentication endpoints and public endpoints
        const publicEndpoints = [
          API_ENDPOINTS.AUTH.LOGIN,
          API_ENDPOINTS.AUTH.REGISTER,
          API_ENDPOINTS.AUTH.REFRESH,
          API_ENDPOINTS.AUTH.LOGOUT,
          '/currency/supported', // Public currency endpoint
        ];
        
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
          originalRequest.url?.includes(endpoint)
        );

        if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
          console.log('🔄 Attempting token refresh due to 401 error');
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('✅ Token refreshed, retrying original request');
            return this.api(originalRequest);
          } catch (refreshError: any) {
            console.error('❌ Token refresh failed');
            
            // Only logout if refresh token is actually invalid (401/403)
            if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
              console.log('❌ Refresh token invalid, logging out user');
              await this.logout();
            } else {
              console.log('❌ Token refresh failed due to network/server error, not logging out');
            }
            
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      console.log('🔄 Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) {
          console.error('❌ No refresh token available for token refresh');
          throw new Error('No refresh token available');
        }

        console.log('🔄 Sending refresh token request');
        
        try {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refresh_token: refreshToken }
          );

          console.log('✅ Refresh token response received:', response.data);

          // Extract access_token from the correct location in response
          const access_token = response.data.tokens?.access_token || response.data.access_token;
          
          // Validate and store access token
          if (typeof access_token === 'string' && access_token.length > 0) {
            await SecureStore.setItemAsync('access_token', access_token);
            console.log('✅ New access token stored successfully');
            
            // Also store refresh token if provided in response
            const new_refresh_token = response.data.tokens?.refresh_token || response.data.refresh_token;
            if (new_refresh_token && typeof new_refresh_token === 'string' && new_refresh_token.length > 0) {
              await SecureStore.setItemAsync('refresh_token', new_refresh_token);
              console.log('✅ New refresh token stored successfully');
            }
          } else {
            console.error('❌ Invalid access token received from refresh endpoint');
            throw new Error('Invalid access token received from refresh endpoint');
          }
          
          return access_token;
        } catch (refreshRequestError: any) {
          console.error('❌ Refresh token request failed:', {
            status: refreshRequestError.response?.status,
            statusText: refreshRequestError.response?.statusText,
            data: refreshRequestError.response?.data,
            message: refreshRequestError.message,
          });
          
          // Log specific error details for debugging
          if (refreshRequestError.response?.data) {
            console.error('❌ Refresh endpoint error details:', refreshRequestError.response.data);
          }
          
          // Only clear tokens if it's a 401 or 403 error (token invalid)
          if (refreshRequestError.response?.status === 401 || refreshRequestError.response?.status === 403) {
            console.log('❌ Refresh token is invalid, clearing tokens');
            await SecureStore.deleteItemAsync('access_token').catch(() => {});
            await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
          }
          
          // Re-throw the error to maintain existing error flow
          throw refreshRequestError;
        }
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Authentication methods
  async login(email: string, password: string) {
    console.log('🔐 Attempting login for:', email);
    
          // Clear any existing tokens before login to ensure clean state
      await SecureStore.deleteItemAsync('access_token').catch(() => {});
      await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
      await SecureStore.deleteItemAsync('account_deleted').catch(() => {});
      console.log('🧹 Cleared existing tokens and account deletion flag before login');
    
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      console.log('📥 Login response received:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        hasTokens: !!response.data.tokens,
        tokensType: typeof response.data.tokens,
      });

      // Extract tokens from the correct location in response
      // Based on logs, tokens are in response.data.tokens
      const tokens = response.data.tokens || {};
      const access_token = tokens.access_token || response.data.access_token;
      const refresh_token = tokens.refresh_token || response.data.refresh_token;
      
      console.log('🔍 Extracted tokens:', {
        access_token: access_token ? 'present' : 'missing',
        refresh_token: refresh_token ? 'present' : 'missing',
        access_token_type: typeof access_token,
        refresh_token_type: typeof refresh_token,
      });
      
      // Validate and store access token
      if (access_token && typeof access_token === 'string' && access_token.length > 0) {
        try {
          await SecureStore.setItemAsync('access_token', access_token);
          console.log('✅ Access token stored successfully');
        } catch (error) {
          console.error('❌ Error storing access token:', error);
          throw new Error('Failed to store access token');
        }
      } else {
        console.error('❌ Invalid access_token received from backend:', {
          original: access_token,
          type: typeof access_token,
          tokens: tokens,
          responseData: response.data
        });
        await SecureStore.deleteItemAsync('access_token').catch(() => {});
        throw new Error('Login failed: Invalid access token received from server');
      }
      
      // Validate and store refresh token
      if (refresh_token && typeof refresh_token === 'string' && refresh_token.length > 0) {
        try {
          await SecureStore.setItemAsync('refresh_token', refresh_token);
          console.log('✅ Refresh token stored successfully');
        } catch (error) {
          console.error('❌ Error storing refresh token:', error);
          // Don't fail login if refresh token storage fails
        }
      } else {
        console.warn('⚠️ Invalid refresh_token received from backend:', {
          original: refresh_token,
          type: typeof refresh_token
        });
        await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
      }

      // Validate and store offline token
      const offline_token = tokens.offline_token || response.data.offline_token;
      if (offline_token && typeof offline_token === 'string' && offline_token.length > 0) {
        try {
          await SecureStore.setItemAsync('offline_token', offline_token);
          console.log('✅ Offline token stored successfully');
        } catch (error) {
          console.error('❌ Error storing offline token:', error);
          // Don't fail login if offline token storage fails
        }
      } else {
        console.warn('⚠️ Invalid offline_token received from backend:', {
          original: offline_token,
          type: typeof offline_token
        });
        await SecureStore.deleteItemAsync('offline_token').catch(() => {});
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Login failed. Please check your internet connection and try again.');
      }
    }
  }

  async register(userData: any) {
    console.log('📝 Attempting registration for:', userData.email);
    console.log('🌐 API Configuration:', {
      baseURL: this.api.defaults.baseURL,
      timeout: this.api.defaults.timeout,
      headers: this.api.defaults.headers
    });
    console.log('📤 Registration data:', userData);
    
    // Clear any existing tokens before registration to ensure clean state
    await SecureStore.deleteItemAsync('access_token').catch(() => {});
    await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
    await SecureStore.deleteItemAsync('account_deleted').catch(() => {});
    console.log('🧹 Cleared existing tokens and account deletion flag before registration');
    
    try {
      console.log('🚀 Making API request to:', `${this.api.defaults.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`);
      const response = await this.api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      console.log('📥 Registration response received:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        hasTokens: !!response.data.tokens,
        tokensType: typeof response.data.tokens,
      });

      // Extract tokens from the correct location in response
      const tokens = response.data.tokens || {};
      const access_token = tokens.access_token || response.data.access_token;
      const refresh_token = tokens.refresh_token || response.data.refresh_token;
      
      console.log('🔍 Extracted tokens:', {
        access_token: access_token ? 'present' : 'missing',
        refresh_token: refresh_token ? 'present' : 'missing',
        access_token_type: typeof access_token,
        refresh_token_type: typeof refresh_token,
      });
      
      // Validate and store access token
      if (access_token && typeof access_token === 'string' && access_token.length > 0) {
        try {
          await SecureStore.setItemAsync('access_token', access_token);
          console.log('✅ Access token stored successfully');
        } catch (error) {
          console.error('❌ Error storing access token:', error);
          throw new Error('Failed to store access token');
        }
      } else {
        console.error('❌ Invalid access_token received from backend:', {
          original: access_token,
          type: typeof access_token,
          tokens: tokens,
          responseData: response.data
        });
        await SecureStore.deleteItemAsync('access_token').catch(() => {});
        throw new Error('Registration failed: Invalid access token received from server');
      }
      
      // Validate and store refresh token
      if (refresh_token && typeof refresh_token === 'string' && refresh_token.length > 0) {
        try {
          await SecureStore.setItemAsync('refresh_token', refresh_token);
          console.log('✅ Refresh token stored successfully');
        } catch (error) {
          console.error('❌ Error storing refresh token:', error);
          // Don't fail registration if refresh token storage fails
        }
      } else {
        console.warn('⚠️ Invalid refresh_token received from backend:', {
          original: refresh_token,
          type: typeof refresh_token
        });
        await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
      }

      // Validate and store offline token
      const offline_token = tokens.offline_token || response.data.offline_token;
      if (offline_token && typeof offline_token === 'string' && offline_token.length > 0) {
        try {
          await SecureStore.setItemAsync('offline_token', offline_token);
          console.log('✅ Offline token stored successfully');
        } catch (error) {
          console.error('❌ Error storing offline token:', error);
          // Don't fail registration if offline token storage fails
        }
      } else {
        console.warn('⚠️ Invalid offline_token received from backend:', {
          original: offline_token,
          type: typeof offline_token
        });
        await SecureStore.deleteItemAsync('offline_token').catch(() => {});
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Registration error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout,
          headers: error.config?.headers
        }
      });
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        // Conflict - email already exists
        throw new Error('An account with this email address already exists. Please use a different email or try logging in instead.');
      } else if (error.response?.status === 400) {
        // Bad request - validation errors
        const errorData = error.response?.data;
        
        // Check for specific validation error messages
        if (errorData?.error) {
          // If there's a specific error message, use it
          throw new Error(errorData.error);
        } else if (errorData?.message) {
          // Check for message field
          if (errorData.message.includes('password') || errorData.message.includes('Password')) {
            throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
          } else if (errorData.message.includes('email') || errorData.message.includes('Email')) {
            throw new Error('Please enter a valid email address.');
          } else {
            throw new Error(errorData.message);
          }
        } else if (errorData?.details && Array.isArray(errorData.details)) {
          // Handle validation details array
          const validationErrors = errorData.details.map((detail: any) => {
            if (typeof detail === 'string') return detail;
            if (detail.message) return detail.message;
            if (detail.msg) return detail.msg;
            return 'Validation error';
          });
          throw new Error(validationErrors.join('. '));
        } else {
          // Generic validation error
          throw new Error('Please check your information:\n\n• Password must be at least 8 characters long\n• Password must contain uppercase, lowercase, and number\n• Email must be valid\n• All fields are required');
        }
      } else if (error.response?.status === 429) {
        throw new Error('Too many registration attempts. Please try again later.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Registration failed. Please check your internet connection and try again.');
      }
    }
  }

  async logout() {
    console.log('🚪 Logging out user');
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        await this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear all authentication data
      await SecureStore.deleteItemAsync('access_token').catch(() => {});
      await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
      await SecureStore.deleteItemAsync('offline_token').catch(() => {});
      console.log('🧹 Tokens cleared from SecureStore');
    }
  }

  // User methods
  async getUserProfile() {
    const response = await this.api.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  }

  async updateUserProfile(userData: any) {
    const response = await this.api.put(API_ENDPOINTS.USER.PROFILE, userData);
    return response.data;
  }

  async getSubscriptionStatus() {
    const response = await this.api.get(API_ENDPOINTS.USER.SUBSCRIPTION_STATUS);
    return response.data;
  }

  async upgradeToPremium() {
    const response = await this.api.post(API_ENDPOINTS.USER.UPGRADE_PREMIUM);
    return response.data;
  }

  // Account methods
  async getAccounts() {
    const response = await this.api.get(API_ENDPOINTS.ACCOUNTS.LIST);
    return response.data;
  }

  async getAccount(id: string) {
    const response = await this.api.get(API_ENDPOINTS.ACCOUNTS.DETAIL(id));
    return response.data;
  }

  async createAccount(accountData: any) {
    const response = await this.api.post(API_ENDPOINTS.ACCOUNTS.CREATE, accountData);
    return response.data;
  }

  async updateAccount(id: string, accountData: any) {
    console.log('🏦 Updating account via PUT:', { id, accountData });
    const response = await this.api.put(API_ENDPOINTS.ACCOUNTS.UPDATE(id), accountData);
    console.log('✅ Account PUT response:', response.data);
    return response.data;
  }

  async patchAccountBalance(id: string, balance: number) {
    console.log('💰 Updating account balance via PATCH:', { id, balance });
    const response = await this.api.patch(`/accounts/${id}/balance`, { balance });
    console.log('✅ Account balance PATCH response:', response.data);
    return response.data;
  }

  async deleteAccount(id: string) {
    const response = await this.api.delete(API_ENDPOINTS.ACCOUNTS.DELETE(id));
    return response.data;
  }

  async getAccountBalanceHistory(id: string, days = 30) {
    const response = await this.api.get(API_ENDPOINTS.ACCOUNTS.BALANCE_HISTORY(id, days));
    return response.data;
  }

  async getAccountSummary(id: string, period = 'month') {
    const endpoint = API_ENDPOINTS.ACCOUNTS.SUMMARY(id, period);
    console.log('🔍 Fetching account summary for:', { id, period });
    console.log('🌐 API endpoint:', endpoint);
    console.log('🔗 Full URL:', `${this.api.defaults.baseURL}${endpoint}`);
    
    const response = await this.api.get(endpoint);
    console.log('📊 Account summary API response:', response.data);
    return response.data;
  }

  // Transaction methods
  async getTransactions(params: TransactionQueryParams = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    // Basic pagination
    queryParams.append('page', params.page?.toString() || '1');
    queryParams.append('limit', params.limit?.toString() || '20');
    
    // Legacy support for existing calls
    if (params.accountId) {
      queryParams.append('account_id', params.accountId);
    }
    
    if (params.date) {
      queryParams.append('date', params.date);
    }
    
    // Enhanced filtering
    if (params.searchQuery) {
      queryParams.append('search', params.searchQuery);
    }
    
    if (params.dateRange) {
      queryParams.append('start_date', params.dateRange.startDate);
      queryParams.append('end_date', params.dateRange.endDate);
    }
    
    if (params.categories?.length) {
      queryParams.append('categories', params.categories.join(','));
    }
    
    if (params.transactionType && params.transactionType !== 'all') {
      queryParams.append('type', params.transactionType);
    }
    
    if (params.minAmount !== undefined) {
      queryParams.append('min_amount', params.minAmount.toString());
    }
    
    if (params.maxAmount !== undefined) {
      queryParams.append('max_amount', params.maxAmount.toString());
    }
    
    if (params.isRecurring !== null && params.isRecurring !== undefined) {
      queryParams.append('is_recurring', params.isRecurring.toString());
    }
    
    if (params.isUncategorized) {
      queryParams.append('uncategorized', 'true');
    }
    
    const response = await this.api.get(`/transactions?${queryParams.toString()}`);
    return response.data;
  }

  async getTransactionCalendar(year: number, month: number) {
    const response = await this.api.get(API_ENDPOINTS.TRANSACTIONS.CALENDAR(year, month));
    return response.data;
  }

  async getTransactionsByDateRange(startDate: string, endDate: string) {
    const response = await this.api.get(API_ENDPOINTS.TRANSACTIONS.CALENDAR_DATE_RANGE(startDate, endDate));
    return response.data;
  }

  async createTransaction(transactionData: any) {
    const response = await this.api.post(API_ENDPOINTS.TRANSACTIONS.CREATE, transactionData);
    return response.data;
  }

  async updateTransaction(id: string, transactionData: any) {
    const response = await this.api.put(API_ENDPOINTS.TRANSACTIONS.UPDATE(id), transactionData);
    return response.data;
  }

  async deleteTransaction(id: string) {
    const response = await this.api.delete(API_ENDPOINTS.TRANSACTIONS.DELETE(id));
    return response.data;
  }

  // Export transactions with date range support
  async exportTransactions(format = 'excel', startDate?: string, endDate?: string) {
    // Always use blob response type for binary files (PDF, Excel, CSV)
    const response = await this.api.get(API_ENDPOINTS.TRANSACTIONS.EXPORT(format, startDate, endDate), {
      responseType: 'blob',
    });
    
    console.log('📄 Export response received:', {
      status: response.status,
      dataType: typeof response.data,
      dataLength: response.data?.length || 'unknown',
      isBlob: response.data instanceof Blob,
      hasArrayBuffer: typeof response.data?.arrayBuffer === 'function',
      blobSize: response.data instanceof Blob ? response.data.size : 'N/A',
      blobType: response.data instanceof Blob ? response.data.type : 'N/A',
    });
    
    // Validate that we received a proper Blob
    if (!response.data || !(response.data instanceof Blob)) {
      console.error('❌ Invalid export response:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isBlob: response.data instanceof Blob,
        responseHeaders: response.headers,
      });
      throw new Error('Invalid response: Expected Blob data for file export');
    }
    
    // Additional validation for blob
    if (response.data.size === 0) {
      console.warn('⚠️ Export blob is empty (size: 0)');
    }
    
    return response.data;
  }



  // Category methods
  async getCategories() {
    const response = await this.api.get(API_ENDPOINTS.CATEGORIES.LIST);
    return response.data;
  }

  async getCategoryHierarchy() {
    const response = await this.api.get(API_ENDPOINTS.CATEGORIES.HIERARCHY);
    return response.data;
  }

  async createCategory(categoryData: any) {
    const response = await this.api.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
    return response.data;
  }

  async updateCategory(id: string, categoryData: any) {
    const response = await this.api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), categoryData);
    return response.data;
  }

  async deleteCategory(id: string) {
    const response = await this.api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return response.data;
  }

  // Budget methods
  async getBudgets() {
    const response = await this.api.get(API_ENDPOINTS.BUDGETS.LIST);
    return response.data;
  }

  async getBudget(id: string) {
    const response = await this.api.get(API_ENDPOINTS.BUDGETS.DETAIL(id));
    return response.data;
  }

  async createBudget(budgetData: any) {
    try {
      const response = await this.api.post(API_ENDPOINTS.BUDGETS.CREATE, budgetData);
      return response.data;
    } catch (error: any) {
      // Re-throw the error so it can be handled by the Redux slice
      throw error;
    }
  }

  async updateBudget(id: string, budgetData: any) {
    const response = await this.api.put(API_ENDPOINTS.BUDGETS.UPDATE(id), budgetData);
    return response.data;
  }

  async deleteBudget(id: string) {
    const response = await this.api.delete(API_ENDPOINTS.BUDGETS.DELETE(id));
    return response.data;
  }

  async toggleBudget(id: string, isActive: boolean) {
    const response = await this.api.patch(`/budgets/${id}/toggle`, { is_active: isActive });
    return response.data;
  }

  async getBudgetStatus(): Promise<BudgetStatusResponse> {
    try {
      const response = await this.api.get<BudgetStatusResponse>('/budgets/status');
      return response.data;
    } catch (error: any) {
      // If the specific budget status endpoint doesn't exist, fall back to regular budgets
      console.log('📊 Budget status endpoint not available, using budgets data for calculation');
      const budgetsResponse = await this.getBudgets();
      
      // Transform regular budgets response to match BudgetStatusResponse format
      const budgets = budgetsResponse.budgets || [];
      const activeBudgets = budgets.filter((budget: any) => budget.is_active !== false);
      const totalBudget = activeBudgets.reduce((sum: number, budget: any) => sum + (budget.amount || 0), 0);
      const totalSpent = activeBudgets.reduce((sum: number, budget: any) => sum + (budget.spent_amount || 0), 0);
      const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      const isOverBudget = totalSpent > totalBudget;
      
      // Calculate days left in current month
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysLeft = Math.max(0, lastDayOfMonth.getDate() - now.getDate());
      
      return {
        budgetStatus: {
          totalBudget,
          totalSpent,
          percentage,
          daysLeft,
          isOverBudget,
          budgetCount: activeBudgets.length,
          overBudgetAmount: isOverBudget ? totalSpent - totalBudget : undefined,
        },
        budgets,
      };
    }
  }

  // Budget Analytics methods
  async getBudgetAnalytics(period = "current_month", months = 6) {
    const response = await this.api.get(API_ENDPOINTS.BUDGETS.ANALYTICS(period, months));
    return response.data;
  }

  async getBudgetVarianceReport(startDate?: string, endDate?: string, includeInactive = false) {
    const response = await this.api.get(API_ENDPOINTS.BUDGETS.VARIANCE_REPORT(startDate, endDate, includeInactive));
    return response.data;
  }

  // Goal methods
  async getGoals() {
    const response = await this.api.get(API_ENDPOINTS.GOALS.LIST);
    return response.data;
  }

  async getGoal(id: string) {
    const response = await this.api.get(API_ENDPOINTS.GOALS.DETAIL(id));
    return response.data;
  }

  async createGoal(goalData: any) {
    const response = await this.api.post(API_ENDPOINTS.GOALS.CREATE, goalData);
    return response.data;
  }

  async getGoalProgress(id: string) {
    const response = await this.api.get(API_ENDPOINTS.GOALS.PROGRESS(id));
    return response.data;
  }

  async getGoalPredictions(id: string) {
    try {
      const response = await this.api.get(API_ENDPOINTS.GOALS.PREDICTIONS(id));
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching goal predictions:', error);
      // Return fallback data if predictions endpoint is not available
      return {
        estimated_completion_date: null,
        monthly_contribution_needed: 0,
        probability_of_success: 0,
        suggestions: []
      };
    }
  }

  async contributeToGoal(id: string, amount: number, accountId: string, description?: string) {
    // First create a transaction for the contribution
    const transactionData: any = {
      account_id: accountId,
      amount: amount,
      type: 'expense' as const, // Goal contributions are typically expenses
      description: description || 'Goal contribution',
      transaction_date: new Date().toISOString().split('T')[0],
      tags: ['goal-contribution'], // Add special tag to identify goal contributions
    };

    // Note: category_id is omitted for goal contributions - backend will handle default category

    console.log('🎯 Creating transaction for goal contribution:', transactionData);
    
    // Create the transaction first
    const transactionResponse = await this.api.post(API_ENDPOINTS.TRANSACTIONS.CREATE, transactionData);
    const transaction = transactionResponse.data.transaction;
    
    if (!transaction || !transaction.id) {
      throw new Error('Failed to create transaction for goal contribution');
    }

    console.log('✅ Transaction created for goal contribution:', transaction.id);

    // Now contribute to the goal with the transaction ID
    const contributionData = {
      transaction_id: transaction.id,
      amount: amount,
    };

    console.log('🎯 Contributing to goal with transaction:', contributionData);
    
    const response = await this.api.post(API_ENDPOINTS.GOALS.CONTRIBUTE(id), contributionData);
    return response.data;
  }

  async updateGoal(id: string, goalData: any) {
    const response = await this.api.put(API_ENDPOINTS.GOALS.UPDATE(id), goalData);
    return response.data;
  }

  async deleteGoal(id: string) {
    const response = await this.api.delete(API_ENDPOINTS.GOALS.DELETE(id));
    return response.data;
  }

  // AI Goal methods
  async startAIGoalSession() {
    try {
      // Send a default goal statement to avoid validation error
      const response = await this.api.post(API_ENDPOINTS.GOALS.AI_START_SESSION, {
        goal_statement: "I want to set a financial goal with your help."
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error starting AI goal session:', error);
      throw error;
    }
  }

  async chatWithAI(sessionId: string, message: string) {
    console.log('🤖 API: Sending chat request:', { sessionId, message });
    try {
      const response = await this.api.post(API_ENDPOINTS.GOALS.AI_CHAT, {
        session_id: sessionId,
        message,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error chatting with AI:', error);
      throw error;
    }
  }

  async finalizeAIGoal(sessionId: string) {
    try {
      const response = await this.api.post(API_ENDPOINTS.GOALS.AI_FINALIZE, {
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error finalizing AI goal:', error);
      throw error;
    }
  }

  // Recommendation methods
  async getRecommendations() {
    const response = await this.api.get(API_ENDPOINTS.RECOMMENDATIONS.LIST);
    return response.data;
  }

  async dismissRecommendation(id: string) {
    const response = await this.api.post(API_ENDPOINTS.RECOMMENDATIONS.DISMISS(id));
    return response.data;
  }

  async actOnRecommendation(id: string) {
    const response = await this.api.post(API_ENDPOINTS.RECOMMENDATIONS.ACT(id));
    return response.data;
  }



  // Analytics methods
  async getSpendingTrends(months = 6) {
    try {
      const response = await this.api.get(API_ENDPOINTS.ANALYTICS.SPENDING_TRENDS(months));
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching spending trends for months=${months}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      console.log(`📊 Spending trends API not available for months=${months}, returning null`);
      return null;
    }
  }

  async getCategoryBreakdown(startDate: string, endDate: string) {
    try {
      const response = await this.api.get(API_ENDPOINTS.ANALYTICS.CATEGORY_BREAKDOWN(startDate, endDate));
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch category breakdown:', error);
      throw error; // Let the calling code handle the error
    }
  }

  // Enhanced analytics methods with time period support
  async getSpendingTrendsByPeriod(period: 'weekly' | 'monthly' | '6months' | 'yearly') {
    try {
      const months = period === '6months' ? 6 : period === 'yearly' ? 12 : 1;
      const response = await this.api.get(`${API_ENDPOINTS.ANALYTICS.SPENDING_TRENDS(months)}?period=${period}`);
      return response.data;
    } catch (error: any) {
      console.log(`📊 Spending trends API not available for ${period}, returning null`);
      return null;
    }
  }

  async getCategoryBreakdownByPeriod(period: 'weekly' | 'monthly' | '6months' | 'yearly', startDate: string, endDate: string) {
    try {
      const response = await this.api.get(`${API_ENDPOINTS.ANALYTICS.CATEGORY_BREAKDOWN(startDate, endDate)}?period=${period}`);
      return response.data;
    } catch (error: any) {
      console.log(`📊 Category breakdown API not available for ${period}, returning null`);
      return null;
    }
  }

  async getDashboardInsightsByPeriod(period: 'weekly' | 'monthly' | '6months' | 'yearly') {
    try {
      const response = await this.api.get(`${API_ENDPOINTS.INSIGHTS.DASHBOARD}?period=${period}`);
      return response.data;
    } catch (error: any) {
      console.log(`📊 Dashboard insights API not available for ${period}, returning null`);
      return null;
    }
  }



  // Insights methods
  async getDashboardInsights() {
    try {
      const response = await this.api.get(API_ENDPOINTS.INSIGHTS.DASHBOARD);
      return response.data;
    } catch (error: any) {
      console.log('📊 Dashboard insights API not available, returning null');
      return null;
    }
  }

  async getWeeklyReport() {
    const response = await this.api.get(API_ENDPOINTS.INSIGHTS.WEEKLY_REPORT);
    return response.data;
  }

  async getWeeklyHealthReport(): Promise<WeeklyHealthResponse | null> {
    try {
      const response = await this.api.get<WeeklyHealthResponse>(API_ENDPOINTS.INSIGHTS.WEEKLY_REPORT);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('📊 Weekly health report endpoint not available (404) - returning null');
        return null;
      }
      throw error;
    }
  }

  // Currency methods
  async getSupportedCurrencies() {
    const response = await this.api.get('/currency/supported');
    return response.data;
  }

  async getExchangeRates(baseCurrency = 'USD') {
    const response = await this.api.get(`/currency/rates/${baseCurrency}`);
    return response.data;
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string) {
    const response = await this.api.post('/currency/convert', {
      amount,
      from: fromCurrency,
      to: toCurrency,
    });
    return response.data;
  }

  async changeUserCurrency(newCurrency: string, convertData = true) {
    console.log('💰 Changing user currency to:', newCurrency);
    
    try {
      // Check if we have a valid token before making the request
      const token = await SecureStore.getItemAsync('access_token');
      console.log('🔑 Token for currency change:', token ? 'present' : 'missing');
      
      if (!token) {
        throw new Error('No access token available for currency change');
      }
      
      // Log token details for debugging
      console.log('🔍 Token details:', {
        length: token.length,
        start: token.substring(0, 20) + '...',
        end: '...' + token.substring(token.length - 10)
      });
      
      const response = await this.api.post('/user/change-currency', {
        new_currency: newCurrency,
        convert_existing_data: convertData,
      });
      
      console.log('✅ Currency change successful');
      
      // Store the new currency preference locally
      try {
        await SecureStore.setItemAsync('user_currency', newCurrency);
        console.log('✅ User currency preference stored locally:', newCurrency);
      } catch (error) {
        console.error('❌ Failed to store currency preference locally:', error);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Currency change failed:', error.response?.data || error.message);
      
      // If it's a 401 error, try to refresh token and retry once
      if (error.response?.status === 401) {
        console.log('🔄 401 error, attempting token refresh and retry...');
        try {
          await this.refreshToken();
          // Retry the currency change
          const retryResponse = await this.api.post('/user/change-currency', {
            new_currency: newCurrency,
            convert_existing_data: convertData,
          });
          console.log('✅ Currency change successful after token refresh');
          return retryResponse.data;
        } catch (refreshError) {
          console.error('❌ Token refresh failed during currency change:', refreshError);
          throw refreshError;
        }
      }
      
      throw error;
    }
  }

  // Statement import methods
  async uploadStatement(file: any) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(API_ENDPOINTS.STATEMENTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('🤖 API: Chat response received:', response.data);
    return response.data;
  }

  async getUploadStatus(id: string) {
    const response = await this.api.get(API_ENDPOINTS.STATEMENTS.STATUS(id));
    return response.data;
  }

  async previewImport(id: string) {
    const response = await this.api.get(API_ENDPOINTS.STATEMENTS.PREVIEW(id));
    return response.data;
  }

  async importTransactions(id: string) {
    const response = await this.api.post(API_ENDPOINTS.STATEMENTS.IMPORT(id));
    return response.data;
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.request(config);
  }

  // Debug method to check token status
  async checkTokenStatus() {
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    
    console.log('🔍 Token Status Check:', {
      accessToken: accessToken ? `present (${accessToken.substring(0, 20)}...)` : 'missing',
      refreshToken: refreshToken ? `present (${refreshToken.substring(0, 20)}...)` : 'missing',
    });
    
    return { accessToken, refreshToken };
  }

  // Method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      // User is authenticated if they have either access token or refresh token
      const hasTokens = !!(accessToken || refreshToken);
      console.log(`🔐 Authentication check: ${hasTokens ? 'Authenticated' : 'Not authenticated'}`);
      
      return hasTokens;
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      return false;
    }
  }

  // Method to attempt token restoration
  async attemptTokenRestoration(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      if (!refreshToken) {
        console.log('❌ No refresh token available for restoration');
        return false;
      }

      console.log('🔄 Attempting token restoration...');
      const newToken = await this.refreshToken();
      
      if (newToken) {
        console.log('✅ Token restoration successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Token restoration failed:', error);
      return false;
    }
  }

  // Method to validate offline token locally (without network request)
  async validateOfflineToken(): Promise<boolean> {
    try {
      const offlineToken = await SecureStore.getItemAsync('offline_token');
      
      if (!offlineToken) {
        console.log('❌ No offline token available');
        return false;
      }

      console.log('🔍 Validating offline token locally...');
      console.log('🔑 Offline token (first 50 chars):', offlineToken.substring(0, 50) + '...');
      
      // For now, if we have an offline token, consider it valid
      // This is a simple approach that prevents users from being logged out when offline
      console.log('✅ Offline token exists, considering valid for offline use');
      return true;
    } catch (error) {
      console.error('❌ Offline token validation failed:', error);
      return false;
    }
  }

  // Method to check authentication status with offline fallback
  async checkAuthStatusWithOfflineFallback(): Promise<{ isAuthenticated: boolean; mode: 'online' | 'offline' | 'none' }> {
    // Check if account was recently deleted first
    const accountDeleted = await SecureStore.getItemAsync('account_deleted');
    if (accountDeleted === 'true') {
      console.log('🚫 Account deletion detected, preventing authentication');
      return { isAuthenticated: false, mode: 'none' };
    }
    
    try {
      // Check all tokens first
      const accessToken = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const offlineToken = await SecureStore.getItemAsync('offline_token');
      
      console.log('🔑 Token status:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasOfflineToken: !!offlineToken
      });
      
      // First try online authentication
      console.log('🌐 Attempting online authentication...');
      
      if (accessToken) {
        try {
          const userProfile = await this.getUserProfile();
          console.log('✅ Online authentication successful');
          return { isAuthenticated: true, mode: 'online' };
        } catch (onlineError) {
          console.log('⚠️ Online authentication failed:', onlineError);
          console.log('📱 Falling back to offline authentication...');
        }
      } else {
        console.log('📱 No access token found, trying offline authentication...');
      }

      // Fall back to offline authentication
      console.log('📱 Attempting offline authentication...');
      const isOfflineValid = await this.validateOfflineToken();
      
      if (isOfflineValid) {
        console.log('✅ Offline authentication successful');
        return { isAuthenticated: true, mode: 'offline' };
      }

      // Last resort: if we have any tokens at all, allow offline access
      // But only if account wasn't recently deleted
      if ((refreshToken || offlineToken) && accountDeleted !== 'true') {
        console.log('⚠️ Token validation failed but tokens exist, allowing offline access');
        return { isAuthenticated: true, mode: 'offline' };
      }

      console.log('❌ Both online and offline authentication failed');
      return { isAuthenticated: false, mode: 'none' };
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      
      // If there's an error, still try offline authentication as a last resort
      console.log('📱 Error occurred, trying offline authentication as fallback...');
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        const offlineToken = await SecureStore.getItemAsync('offline_token');
        
        // Only allow offline access if account wasn't recently deleted
        if ((refreshToken || offlineToken) && accountDeleted !== 'true') {
          console.log('⚠️ Error occurred but tokens exist, allowing offline access');
          return { isAuthenticated: true, mode: 'offline' };
        }
      } catch (offlineError) {
        console.error('❌ Offline authentication also failed:', offlineError);
      }
      
      return { isAuthenticated: false, mode: 'none' };
    }
  }

  // Test method to verify token refresh works
  async testTokenRefresh() {
    try {
      console.log('🧪 Testing token refresh...');
      const result = await this.refreshToken();
      console.log('✅ Token refresh test successful:', result ? 'Token obtained' : 'No token');
      return result;
    } catch (error) {
      console.error('❌ Token refresh test failed:', error);
      throw error;
    }
  }

  // Test method to verify authentication flow
  async testAuthenticationFlow() {
    try {
      console.log('🧪 Testing authentication flow...');
      
      // Check current token status
      const tokenStatus = await this.checkTokenStatus();
      console.log('📊 Current token status:', tokenStatus);
      
      // Check if authenticated
      const isAuth = await this.isAuthenticated();
      console.log('🔐 Is authenticated:', isAuth);
      
      // Try to restore tokens if needed
      if (!tokenStatus.accessToken && tokenStatus.refreshToken) {
        console.log('🔄 Attempting token restoration...');
        const restored = await this.attemptTokenRestoration();
        console.log('✅ Token restoration result:', restored);
      }
      
      return {
        tokenStatus,
        isAuthenticated: isAuth,
        hasAccessToken: !!tokenStatus.accessToken,
        hasRefreshToken: !!tokenStatus.refreshToken
      };
    } catch (error) {
      console.error('❌ Authentication flow test failed:', error);
      throw error;
    }
  }

  // Direct API call method that bypasses interceptors for critical operations
  async directApiCall(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, token?: string) {
    console.log(`🔧 Making direct API call to: ${endpoint}`);
    
    const config = {
      method,
      url: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...(data && { data }),
    };
    
    try {
      const response = await axios(config);
      console.log(`✅ Direct API call successful: ${endpoint}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Direct API call failed: ${endpoint}`, error.response?.data || error.message);
      throw error;
    }
  }

  // Method to handle pending currency changes
  async handlePendingCurrencyChange() {
    try {
      const pendingCurrency = await SecureStore.getItemAsync('selected_currency');
      if (pendingCurrency) {
        console.log('🔄 Found pending currency change:', pendingCurrency);
        
        // Try to set the currency
        await this.changeUserCurrency(pendingCurrency, false);
        
        // Clear the pending currency
        await SecureStore.deleteItemAsync('selected_currency');
        console.log('✅ Pending currency change completed');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to handle pending currency change:', error);
      return false;
    }
  }

  // Method to get user's current currency preference
  async getUserCurrencyPreference(): Promise<string> {
    try {
      // First try to get from secure store
      const storedCurrency = await SecureStore.getItemAsync('user_currency');
      if (storedCurrency) {
        return storedCurrency;
      }
      
      // If not in secure store, try to get from user profile
      const userProfile = await this.getUserProfile();
      const displayCurrency = userProfile.user?.preferred_currency || userProfile.user?.display_currency;
      
      console.log('🔍 User profile currency fields:', {
        preferred_currency: userProfile.user?.preferred_currency,
        display_currency: userProfile.user?.display_currency,
        selected: displayCurrency
      });
      
      if (displayCurrency) {
        // Store it locally for future use
        await SecureStore.setItemAsync('user_currency', displayCurrency);
        return displayCurrency;
      }
      
      return 'USD'; // Default fallback
    } catch (error) {
      console.error('❌ Failed to get user currency preference:', error);
      return 'USD'; // Default fallback
    }
  }

  // User deletion methods
  async getDeletionInfo() {
    const response = await this.api.get(API_ENDPOINTS.USER.DELETION_INFO);
    return response.data;
  }

  async deleteUserAccount(confirmationPhrase: string, password: string) {
    const response = await this.api.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
      data: {
        confirmation_phrase: confirmationPhrase,
        password: password,
      },
    });
    return response.data;
  }

  // Test method to debug offline authentication
  async debugOfflineAuthentication() {
    console.log('🔍 Debugging offline authentication...');
    
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const offlineToken = await SecureStore.getItemAsync('offline_token');
      
      console.log('🔑 Token status:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasOfflineToken: !!offlineToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        offlineTokenLength: offlineToken?.length || 0
      });
      
      if (offlineToken) {
        console.log('🔑 Offline token preview:', offlineToken.substring(0, 100) + '...');
      }
      
      // Test offline validation
      const isOfflineValid = await this.validateOfflineToken();
      console.log('✅ Offline validation result:', isOfflineValid);
      
      return {
        hasTokens: !!(accessToken || refreshToken || offlineToken),
        isOfflineValid,
        tokenCount: [accessToken, refreshToken, offlineToken].filter(Boolean).length
      };
    } catch (error) {
      console.error('❌ Debug error:', error);
      return { hasTokens: false, isOfflineValid: false, tokenCount: 0 };
    }
  }
}

export const apiService = new ApiService();