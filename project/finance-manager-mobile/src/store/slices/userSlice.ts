import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import * as SecureStore from 'expo-secure-store';

interface UserState {
  profile: any | null;
  subscriptionStatus: any | null;
  preferredCurrency: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  subscriptionStatus: null,
  preferredCurrency: 'USD',
  isLoading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    const response = await apiService.getUserProfile();
    return response;
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

export const setUserCurrency = createAsyncThunk(
  'user/setUserCurrency',
  async (currency: string) => {
    // Store currency preference locally
    await SecureStore.setItemAsync('preferred_currency', currency);
    
    // Also update on server if user profile exists
    try {
      const response = await apiService.updateUserProfile({ preferred_currency: currency });
      return { currency, profile: response.user };
    } catch (error) {
      // If server update fails, still return the currency for local storage
      return { currency, profile: null };
    }
  }
);

export const loadUserCurrency = createAsyncThunk(
  'user/loadUserCurrency',
  async () => {
    const currency = await SecureStore.getItemAsync('preferred_currency');
    return currency || 'USD';
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPreferredCurrency: (state, action) => {
      state.preferredCurrency = action.payload;
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
        // Update preferred currency from profile if available
        if (action.payload.user?.preferred_currency) {
          state.preferredCurrency = action.payload.user.preferred_currency;
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload.user;
        if (action.payload.user?.preferred_currency) {
          state.preferredCurrency = action.payload.user.preferred_currency;
        }
      })
      // Fetch subscription status
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.subscriptionStatus = action.payload;
      })
      // Upgrade to premium
      .addCase(upgradeToPremium.fulfilled, (state, action) => {
        state.subscriptionStatus = action.payload;
      })
      // Set user currency
      .addCase(setUserCurrency.fulfilled, (state, action) => {
        state.preferredCurrency = action.payload.currency;
        if (action.payload.profile) {
          state.profile = action.payload.profile;
        }
      })
      // Load user currency
      .addCase(loadUserCurrency.fulfilled, (state, action) => {
        state.preferredCurrency = action.payload;
      });
  },
});

export const { clearError, setPreferredCurrency } = userSlice.actions;
export default userSlice.reducer;