import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  activeTab: string;

  showAddTransactionModal: boolean;
  showAddGoalModal: boolean;
  showPremiumModal: boolean;
  // Font settings
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'system' | 'serif' | 'monospace';
  boldNumbers: boolean;
}

const initialState: UIState = {
  theme: 'light',
  isLoading: false,
  activeTab: 'Dashboard',

  showAddTransactionModal: false,
  showAddGoalModal: false,
  showPremiumModal: false,
  // Font settings defaults
  fontSize: 'medium',
  fontFamily: 'system',
  boldNumbers: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },

    showAddTransactionModal: (state) => {
      state.showAddTransactionModal = true;
    },
    hideAddTransactionModal: (state) => {
      state.showAddTransactionModal = false;
    },
    showAddGoalModal: (state) => {
      state.showAddGoalModal = true;
    },
    hideAddGoalModal: (state) => {
      state.showAddGoalModal = false;
    },
    showPremiumModal: (state) => {
      state.showPremiumModal = true;
    },
    hidePremiumModal: (state) => {
      state.showPremiumModal = false;
    },
    // Font settings actions
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    setFontFamily: (state, action: PayloadAction<'system' | 'serif' | 'monospace'>) => {
      state.fontFamily = action.payload;
    },
    setBoldNumbers: (state, action: PayloadAction<boolean>) => {
      state.boldNumbers = action.payload;
    },
  },
});

export const {
  setTheme,
  setLoading,
  setActiveTab,

  showAddTransactionModal,
  hideAddTransactionModal,
  showAddGoalModal,
  hideAddGoalModal,
  showPremiumModal,
  hidePremiumModal,
  setFontSize,
  setFontFamily,
  setBoldNumbers,
} = uiSlice.actions;

export default uiSlice.reducer;