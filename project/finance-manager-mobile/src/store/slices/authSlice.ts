import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import * as SecureStore from 'expo-secure-store';
import { resetOnboarding } from './onboardingSlice';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: any | null;
  needsCurrencySelection: boolean;
  registrationCredentials: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  needsCurrencySelection: false,
  registrationCredentials: null,
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
  async (userData: any, { dispatch }) => {
    const response = await apiService.register(userData);
    
    // Reset onboarding for new users
    dispatch(resetOnboarding());
    
    return { ...response, registrationData: userData };
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await apiService.logout();
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    console.log('🔍 Checking authentication status...');
    
    // First check if we have any tokens
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    
    console.log(`🔑 Access token found: ${accessToken ? 'YES' : 'NO'}`);
    console.log(`🔑 Refresh token found: ${refreshToken ? 'YES' : 'NO'}`);
    
    // If we have a refresh token but no access token, try to restore it
    if (!accessToken && refreshToken) {
      console.log('🔄 No access token but refresh token exists, attempting restoration...');
      try {
        const restored = await apiService.attemptTokenRestoration();
        if (restored) {
          console.log('✅ Token restoration successful');
        } else {
          console.log('❌ Token restoration failed');
          throw new Error('Token restoration failed');
        }
      } catch (error) {
        console.error('❌ Error during token restoration:', error);
        throw new Error('Token restoration failed');
      }
    }
    
    // Check again for access token after restoration attempt
    const finalAccessToken = await SecureStore.getItemAsync('access_token');
    
    if (finalAccessToken) {
      console.log('✅ Token exists, fetching user profile...');
      try {
        const userProfile = await apiService.getUserProfile();
        
        // Check if user needs currency selection (new users or users without preferred currency)
        const needsCurrencySelection = !userProfile.user?.preferred_currency && !userProfile.user?.display_currency;
        
        console.log('👤 User profile fetched successfully');
        console.log(`💰 Currency selection needed: ${needsCurrencySelection ? 'YES' : 'NO'}`);
        console.log(`💰 User preferred currency: ${userProfile.user?.preferred_currency || userProfile.user?.display_currency || 'NOT SET'}`);
        
        return { ...userProfile, needsCurrencySelection };
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        throw new Error('Failed to fetch user profile');
      }
    }
    
    console.log('❌ No valid tokens found, user not authenticated');
    throw new Error('No valid tokens found');
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
      console.log('✅ Currency selection completed');
      state.needsCurrencySelection = false;
    },
    clearRegistrationCredentials: (state) => {
      state.registrationCredentials = null;
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
        
        // Handle any pending currency changes
        apiService.handlePendingCurrencyChange().catch(error => {
          console.error('❌ Failed to handle pending currency change:', error);
        });
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
        console.log('✅ Registration fulfilled:', {
          user: action.payload.user,
          needsCurrencySelection: true
        });
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        state.needsCurrencySelection = true; // New users need to select currency after registration
        state.registrationCredentials = action.payload.registrationData; // Store credentials for potential re-registration
      })
      .addCase(register.rejected, (state, action) => {
        console.log('❌ Registration rejected:', action.error.message);
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
        console.log('✅ Check auth status fulfilled:', {
          user: action.payload.user,
          needsCurrencySelection: action.payload.needsCurrencySelection
        });
        
        // Handle any pending currency changes
        apiService.handlePendingCurrencyChange().catch(error => {
          console.error('❌ Failed to handle pending currency change:', error);
        });
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.needsCurrencySelection = action.payload.needsCurrencySelection || false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        console.log('❌ Check auth status rejected - user not authenticated');
        state.isAuthenticated = false;
        state.user = null;
        state.needsCurrencySelection = false;
      });
  },
});

export const { clearError, setUser, completeCurrencySelection, clearRegistrationCredentials } = authSlice.actions;
export default authSlice.reducer;