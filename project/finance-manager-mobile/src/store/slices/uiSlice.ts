import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  activeTab: string;
  showPremiumModal: boolean;
  showAddTransactionModal: boolean;
  showAddGoalModal: boolean;
}

const initialState: UIState = {
  theme: 'light',
  isLoading: false,
  activeTab: 'Dashboard',
  showPremiumModal: false,
  showAddTransactionModal: false,
  showAddGoalModal: false,
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
    showPremiumModal: (state) => {
      state.showPremiumModal = true;
    },
    hidePremiumModal: (state) => {
      state.showPremiumModal = false;
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
  },
});

export const {
  setTheme,
  setLoading,
  setActiveTab,
  showPremiumModal,
  hidePremiumModal,
  showAddTransactionModal,
  hideAddTransactionModal,
  showAddGoalModal,
  hideAddGoalModal,
} = uiSlice.actions;

export default uiSlice.reducer;