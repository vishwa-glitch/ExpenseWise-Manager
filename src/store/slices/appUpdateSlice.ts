import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppUpdateInfo } from '../../services/appUpdateService';

interface AppUpdateState {
  isUpdateRequired: boolean;
  updateInfo: AppUpdateInfo | null;
  isLoading: boolean;
  lastChecked: string | null;
}

const initialState: AppUpdateState = {
  isUpdateRequired: false,
  updateInfo: null,
  isLoading: false,
  lastChecked: null,
};

const appUpdateSlice = createSlice({
  name: 'appUpdate',
  initialState,
  reducers: {
    setUpdateRequired: (state, action: PayloadAction<boolean>) => {
      state.isUpdateRequired = action.payload;
    },
    setUpdateInfo: (state, action: PayloadAction<AppUpdateInfo>) => {
      state.updateInfo = action.payload;
      state.lastChecked = new Date().toISOString();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearUpdateInfo: (state) => {
      state.updateInfo = null;
      state.isUpdateRequired = false;
      state.lastChecked = null;
    },
    resetUpdateState: (state) => {
      return initialState;
    },
  },
});

export const {
  setUpdateRequired,
  setUpdateInfo,
  setLoading,
  clearUpdateInfo,
  resetUpdateState,
} = appUpdateSlice.actions;

export default appUpdateSlice.reducer;
