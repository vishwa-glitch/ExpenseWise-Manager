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
  authMode?: 'online' | 'offline' | 'none';
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
  authMode: undefined,
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
  async (_, { getState, dispatch }) => {
    console.log('🔍 Checking authentication status...');
    
    // Get current state to check if user is already authenticated
    const state = getState() as any;
    const isCurrentlyAuthenticated = state.auth.isAuthenticated;
    const currentUser = state.auth.user;
    
    console.log('📊 Current auth state:', {
      isCurrentlyAuthenticated,
      hasUser: !!currentUser,
      userEmail: currentUser?.email
    });
    
    // Use the offline-aware authentication check
    try {
      console.log('🔍 Starting offline-aware authentication check...');
      const authResult = await apiService.checkAuthStatusWithOfflineFallback();
      
      console.log('📊 Authentication result:', authResult);
      
      if (authResult.isAuthenticated) {
        console.log(`✅ Authentication successful in ${authResult.mode} mode`);
        
        // If we're in offline mode, we need to get user data from the persisted state
        if (authResult.mode === 'offline') {
          console.log('📱 Offline mode - using persisted user data');
          
          // Return the current user data from state if available
          if (currentUser) {
            const needsCurrencySelection = !currentUser?.preferred_currency && !currentUser?.display_currency;
            return { 
              user: currentUser, 
              needsCurrencySelection, 
              mode: 'offline' 
            };
          } else {
            // If no user data in state, we can't authenticate offline
            console.log('❌ No user data available for offline authentication');
            throw new Error('No user data available for offline authentication');
          }
        } else {
          // Online mode - fetch fresh user data
          console.log('🌐 Online mode - fetching fresh user data');
          const userProfile = await apiService.getUserProfile();
          
          console.log('👤 User profile response structure:', {
            userProfile,
            userProfileType: typeof userProfile,
            hasUser: !!userProfile.user,
            userData: userProfile.user,
            directUser: userProfile.user || userProfile,
          });
          
          // Handle different response structures - some APIs return user directly, others nested
          const userData = userProfile.user || userProfile;
          
          // Check if user needs currency selection (new users or users without preferred currency)
          const needsCurrencySelection = !userData?.preferred_currency && !userData?.display_currency;
          
          console.log('👤 User profile fetched successfully');
          console.log(`💰 Currency selection needed: ${needsCurrencySelection ? 'YES' : 'NO'}`);
          console.log(`💰 User preferred currency: ${userData?.preferred_currency || userData?.display_currency || 'NOT SET'}`);
          console.log(`👤 User first name: ${userData?.first_name || 'NOT SET'}`);
          
          return { user: userData, needsCurrencySelection, mode: 'online' };
        }
      } else {
        console.log('❌ Authentication failed in both online and offline modes');
        
        // If we have persisted auth state but authentication failed, 
        // we should clear the auth state and require re-login
        if (isCurrentlyAuthenticated) {
          console.log('⚠️ User was authenticated but authentication failed, clearing auth state');
          await SecureStore.deleteItemAsync('access_token').catch(() => {});
          await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
          await SecureStore.deleteItemAsync('offline_token').catch(() => {});
          dispatch(clearAuthState());
        }
        
        throw new Error('Authentication failed in both online and offline modes');
      }
    } catch (error) {
      console.error('❌ Error during authentication check:', error);
      
      // If we have persisted auth state but authentication failed, 
      // we should clear the auth state and require re-login
      if (isCurrentlyAuthenticated) {
        console.log('⚠️ User was authenticated but authentication failed, clearing auth state');
        await SecureStore.deleteItemAsync('access_token').catch(() => {});
        await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
        await SecureStore.deleteItemAsync('offline_token').catch(() => {});
        dispatch(clearAuthState());
      }
      
      throw error;
    }
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
    clearAuthState: (state) => {
      console.log('🧹 Clearing authentication state');
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.needsCurrencySelection = false;
      state.authMode = undefined;
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
        console.log('🔐 Login fulfilled - user data structure:', {
          payload: action.payload,
          user: action.payload.user,
          hasUser: !!action.payload.user,
          userType: typeof action.payload.user,
        });
        
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        state.authMode = 'online'; // Login is always online
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
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.authMode = undefined;
        state.needsCurrencySelection = false;
        state.registrationCredentials = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Logout failed';
      })
      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        console.log('✅ Check auth status fulfilled:', {
          user: action.payload.user,
          needsCurrencySelection: action.payload.needsCurrencySelection,
          mode: action.payload.mode
        });
        
        // Handle any pending currency changes
        apiService.handlePendingCurrencyChange().catch(error => {
          console.error('❌ Failed to handle pending currency change:', error);
        });
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.authMode = (action.payload.mode as 'online' | 'offline' | 'none') || 'online';
        state.needsCurrencySelection = action.payload.needsCurrencySelection || false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        console.log('❌ Check auth status rejected - user not authenticated');
        state.isAuthenticated = false;
        state.user = null;
        state.authMode = undefined;
        state.needsCurrencySelection = false;
      });
  },
});

export const { clearError, setUser, completeCurrencySelection, clearRegistrationCredentials, clearAuthState } = authSlice.actions;
export default authSlice.reducer;