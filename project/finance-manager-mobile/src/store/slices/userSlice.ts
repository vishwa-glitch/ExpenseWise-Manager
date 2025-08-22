import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import * as SecureStore from 'expo-secure-store';

interface UserState {
  profile: any | null;
  subscriptionStatus: any | null;
  displayCurrency: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  subscriptionStatus: null,
  displayCurrency: '',
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
      });
  },
});

export const { clearError, setDisplayCurrency } = userSlice.actions;
export default userSlice.reducer;