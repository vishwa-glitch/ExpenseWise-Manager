import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

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

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        console.log(`🔍 Making API request to: ${config.url}`);
        
        const token = await SecureStore.getItemAsync('access_token');
        console.log(`🔑 Token retrieved from SecureStore: ${token ? 'present' : 'missing'}`);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`✅ Setting Authorization header for request to: ${config.url}`);
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

        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('🔄 Attempting token refresh due to 401 error');
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('✅ Token refreshed, retrying original request');
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed, logging out user');
            await this.logout();
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
          } else {
            await SecureStore.deleteItemAsync('access_token');
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
    
    try {
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

      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Registration error response:', error.response?.data);
      
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
      await SecureStore.deleteItemAsync('access_token').catch(() => {});
      await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
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
    const response = await this.api.get(API_ENDPOINTS.ACCOUNTS.SUMMARY(id, period));
    return response.data;
  }

  // Transaction methods
  async getTransactions(page = 1, limit = 20, accountId?: string, date?: string) {
    let url = `/transactions?page=${page}&limit=${limit}`;
    
    if (accountId) {
      url += `&account_id=${accountId}`;
    }
    
    if (date) {
      url += `&date=${date}`;
    }
    
    const response = await this.api.get(url);
    return response.data;
  }

  async getTransactionCalendar(year?: number, month?: number, startDate?: string, endDate?: string) {
    const response = await this.api.get(API_ENDPOINTS.TRANSACTIONS.CALENDAR(year, month, startDate, endDate));
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
    const response = await this.api.get(API_ENDPOINTS.TRANSACTIONS.EXPORT(format, startDate, endDate), {
      responseType: 'blob',
    });
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

  async createBudget(budgetData: any) {
    const response = await this.api.post(API_ENDPOINTS.BUDGETS.CREATE, budgetData);
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

  async contributeToGoal(id: string, amount: number) {
    const response = await this.api.post(API_ENDPOINTS.GOALS.CONTRIBUTE(id), { amount });
    return response.data;
  }

  // AI Goal methods
  async startAIGoalSession() {
    const response = await this.api.post(API_ENDPOINTS.GOALS.AI_START_SESSION);
    return response.data;
  }

  async chatWithAI(sessionId: string, message: string) {
    const response = await this.api.post(API_ENDPOINTS.GOALS.AI_CHAT, {
      session_id: sessionId,
      message,
    });
    return response.data;
  }

  async finalizeAIGoal(sessionId: string) {
    const response = await this.api.post(API_ENDPOINTS.GOALS.AI_FINALIZE, {
      session_id: sessionId,
    });
    return response.data;
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

  // Notification methods
  async getNotifications() {
    const response = await this.api.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data;
  }

  async getUnreadNotifications() {
    const response = await this.api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD);
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.api.post(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return response.data;
  }

  // Analytics methods
  async getSpendingTrends(months = 6) {
    const response = await this.api.get(API_ENDPOINTS.ANALYTICS.SPENDING_TRENDS(months));
    return response.data;
  }

  async getCategoryBreakdown(startDate: string, endDate: string) {
    const response = await this.api.get(API_ENDPOINTS.ANALYTICS.CATEGORY_BREAKDOWN(startDate, endDate));
    return response.data;
  }

  // Insights methods
  async getDashboardInsights() {
    const response = await this.api.get(API_ENDPOINTS.INSIGHTS.DASHBOARD);
    return response.data;
  }

  async getWeeklyReport() {
    const response = await this.api.get(API_ENDPOINTS.INSIGHTS.WEEKLY_REPORT);
    return response.data;
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
}

export const apiService = new ApiService();