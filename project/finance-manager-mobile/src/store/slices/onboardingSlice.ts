import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

interface OnboardingState {
  isOnboardingComplete: boolean;
  currentStep: number;
  totalSteps: number;
  isOverlayVisible: boolean;
  hasCreatedAccount: boolean;
  hasCreatedTransaction: boolean;
  hasCreatedBudget: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  isOnboardingComplete: false,
  currentStep: 0,
  totalSteps: 8, // Welcome, Accounts, Transactions, Calendar, Budgets, Goals, Categories, Complete
  isOverlayVisible: true, // Start with overlay visible for new users
  hasCreatedAccount: false,
  hasCreatedTransaction: false,
  hasCreatedBudget: false,
  isLoading: false,
  error: null,
};

// Async thunk to check onboarding status
export const checkOnboardingStatus = createAsyncThunk(
  'onboarding/checkStatus',
  async () => {
    try {
      const onboardingComplete = await SecureStore.getItemAsync('onboarding_complete');
      const hasCreatedAccount = await SecureStore.getItemAsync('onboarding_account_created');
      const hasCreatedTransaction = await SecureStore.getItemAsync('onboarding_transaction_created');
      const hasCreatedBudget = await SecureStore.getItemAsync('onboarding_budget_created');
      
      return {
        isOnboardingComplete: onboardingComplete === 'true',
        hasCreatedAccount: hasCreatedAccount === 'true',
        hasCreatedTransaction: hasCreatedTransaction === 'true',
        hasCreatedBudget: hasCreatedBudget === 'true',
      };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return {
        isOnboardingComplete: false,
        hasCreatedAccount: false,
        hasCreatedTransaction: false,
        hasCreatedBudget: false,
      };
    }
  }
);

// Async thunk to mark onboarding as complete
export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async () => {
    try {
      await SecureStore.setItemAsync('onboarding_complete', 'true');
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }
);

// Async thunk to mark account creation as complete
export const markAccountCreated = createAsyncThunk(
  'onboarding/markAccountCreated',
  async () => {
    try {
      await SecureStore.setItemAsync('onboarding_account_created', 'true');
      return true;
    } catch (error) {
      console.error('Error marking account created:', error);
      throw error;
    }
  }
);

// Async thunk to mark transaction creation as complete
export const markTransactionCreated = createAsyncThunk(
  'onboarding/markTransactionCreated',
  async () => {
    try {
      await SecureStore.setItemAsync('onboarding_transaction_created', 'true');
      return true;
    } catch (error) {
      console.error('Error marking transaction created:', error);
      throw error;
    }
  }
);

// Async thunk to mark budget creation as complete
export const markBudgetCreated = createAsyncThunk(
  'onboarding/markBudgetCreated',
  async () => {
    try {
      await SecureStore.setItemAsync('onboarding_budget_created', 'true');
      return true;
    } catch (error) {
      console.error('Error marking budget created:', error);
      throw error;
    }
  }
);

// Async thunk to reset onboarding completely
export const resetOnboardingAsync = createAsyncThunk(
  'onboarding/resetAsync',
  async () => {
    try {
      // Clear all onboarding-related stored data
      await SecureStore.deleteItemAsync('onboarding_complete');
      await SecureStore.deleteItemAsync('onboarding_account_created');
      await SecureStore.deleteItemAsync('onboarding_transaction_created');
      await SecureStore.deleteItemAsync('onboarding_budget_created');
      return true;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      console.log('🔄 nextStep called, current step:', state.currentStep, 'total steps:', state.totalSteps);
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
        console.log('✅ Step incremented to:', state.currentStep);
      } else {
        console.log('⚠️ Already at last step');
      }
    },
    showOverlay: (state) => {
      state.isOverlayVisible = true;
    },
    hideOverlay: (state) => {
      state.isOverlayVisible = false;
    },
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    skipOnboarding: (state) => {
      state.isOnboardingComplete = true;
      state.isOverlayVisible = false;
      state.currentStep = state.totalSteps - 1;
    },
    resetOnboarding: (state) => {
      state.isOnboardingComplete = false;
      state.currentStep = 0;
      state.isOverlayVisible = true;
      state.hasCreatedAccount = false;
      state.hasCreatedTransaction = false;
      state.hasCreatedBudget = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check onboarding status
      .addCase(checkOnboardingStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkOnboardingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOnboardingComplete = action.payload.isOnboardingComplete;
        state.hasCreatedAccount = action.payload.hasCreatedAccount;
        state.hasCreatedTransaction = action.payload.hasCreatedTransaction;
        state.hasCreatedBudget = action.payload.hasCreatedBudget;
      })
      .addCase(checkOnboardingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to check onboarding status';
      })
      // Complete onboarding
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.isOnboardingComplete = true;
      })
      // Mark account created
      .addCase(markAccountCreated.fulfilled, (state) => {
        state.hasCreatedAccount = true;
      })
      // Mark transaction created
      .addCase(markTransactionCreated.fulfilled, (state) => {
        state.hasCreatedTransaction = true;
      })
      // Mark budget created
      .addCase(markBudgetCreated.fulfilled, (state) => {
        state.hasCreatedBudget = true;
      })
      // Reset onboarding
      .addCase(resetOnboardingAsync.fulfilled, (state) => {
        state.isOnboardingComplete = false;
        state.currentStep = 0;
        state.isOverlayVisible = true;
        state.hasCreatedAccount = false;
        state.hasCreatedTransaction = false;
        state.hasCreatedBudget = false;
      });
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  skipOnboarding,
  resetOnboarding,
  showOverlay,
  hideOverlay,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
