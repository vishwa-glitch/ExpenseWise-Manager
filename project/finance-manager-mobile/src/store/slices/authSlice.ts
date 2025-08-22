import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: any | null;
  needsCurrencySelection: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  needsCurrencySelection: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await apiService.login(email, password);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any) => {
    const response = await apiService.register(userData);
    return response;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await apiService.logout();
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    console.log('🔍 Checking authentication status...');
    
    const token = await SecureStore.getItemAsync('access_token');
    console.log(`🔑 Token found in SecureStore: ${token ? 'YES' : 'NO'}`);
    
    if (token) {
      console.log('✅ Token exists, fetching user profile...');
      const userProfile = await apiService.getUserProfile();
      
      // Check if user has preferred currency in backend (single source of truth)
      const backendPreferredCurrency = userProfile.user?.preferred_currency;
      const needsCurrencySelection = !backendPreferredCurrency;
      
      // Sync backend currency to local storage if it exists
      if (backendPreferredCurrency) {
        console.log('💰 Syncing backend currency to local storage:', backendPreferredCurrency);
        await SecureStore.setItemAsync('preferred_currency', backendPreferredCurrency);
      }
      
      console.log('👤 User profile fetched successfully');
      console.log(`💰 Backend preferred currency: ${backendPreferredCurrency || 'NONE'}`);
      console.log(`💰 Currency selection needed: ${needsCurrencySelection ? 'YES' : 'NO'}`);
      
      return { ...userProfile, needsCurrencySelection };
    }
    
    console.log('❌ No token found, user not authenticated');
    throw new Error('No token found');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    completeCurrencySelection: (state) => {
      state.needsCurrencySelection = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        state.needsCurrencySelection = false; // Existing users don't need currency selection
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        state.needsCurrencySelection = true; // New users need to select currency
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.needsCurrencySelection = false;
      })
      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.needsCurrencySelection = action.payload.needsCurrencySelection || false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.needsCurrencySelection = false;
      });
  },
});

export const { clearError, setUser, completeCurrencySelection } = authSlice.actions;
export default authSlice.reducer;