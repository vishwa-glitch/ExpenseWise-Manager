import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import * as SecureStore from 'expo-secure-store';

interface UserState {
  profile: any | null;
  subscriptionStatus: any | null;
  displayCurrency: string;
  preferredCurrency: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  subscriptionStatus: null,
  displayCurrency: 'USD', // Default to USD, will be updated when user preference is loaded
  preferredCurrency: 'USD', // Default to USD
  isLoading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    console.log('👤 Fetching user profile...');
    try {
      // Check if user is authenticated first
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        console.log('❌ No access token found, skipping profile fetch');
        throw new Error('No access token found');
      }
      
      const response = await apiService.getUserProfile();
      console.log('✅ User profile fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      throw error;
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: any) => {
    const response = await apiService.updateUserProfile(userData);
    return response;
  }
);

export const fetchSubscriptionStatus = createAsyncThunk(
  'user/fetchSubscriptionStatus',
  async () => {
    const response = await apiService.getSubscriptionStatus();
    return response;
  }
);

export const upgradeToPremium = createAsyncThunk(
  'user/upgradeToPremium',
  async () => {
    const response = await apiService.upgradeToPremium();
    return response;
  }
);

export const loadUserCurrency = createAsyncThunk(
  'user/loadCurrency',
  async () => {
    try {
      // Check if user is authenticated first
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        console.log('❌ No access token found, skipping currency load');
        return '';
      }
      
      // Try to get user's currency preference from secure store
      const storedCurrency = await SecureStore.getItemAsync('user_currency');
      if (storedCurrency) {
        console.log('💰 Found stored currency:', storedCurrency);
        return storedCurrency;
      }
      
      // If no stored currency, try to get it from user profile
      try {
        console.log('🔍 Fetching user profile for currency...');
        const userProfile = await apiService.getUserProfile();
        const displayCurrency = userProfile.user?.preferred_currency || userProfile.user?.display_currency;
        
        if (displayCurrency) {
          console.log('💰 Found display currency in profile:', displayCurrency);
          return displayCurrency;
        } else {
          // If no display currency is set, don't default to USD
          // This will force the user to select a currency
          console.log('❌ No display currency set, user needs to select currency');
          return '';
        }
      } catch (error) {
        // If user profile is not available, don't default to USD
        console.log('❌ User profile not available, user needs to select currency:', error);
        return '';
      }
    } catch (error) {
      console.error('❌ Failed to load user currency:', error);
      return '';
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDisplayCurrency: (state, action) => {
      state.displayCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload.user;
      })
      // Fetch subscription status
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.subscriptionStatus = action.payload;
      })
      // Upgrade to premium
      .addCase(upgradeToPremium.fulfilled, (state, action) => {
        state.subscriptionStatus = action.payload;
      })
      // Load user currency
      .addCase(loadUserCurrency.fulfilled, (state, action) => {
        state.displayCurrency = action.payload;
      });
  },
});

export const { clearError, setDisplayCurrency } = userSlice.actions;
export default userSlice.reducer;