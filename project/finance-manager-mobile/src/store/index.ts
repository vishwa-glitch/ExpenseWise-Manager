import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import accountsSlice from './slices/accountsSlice';
import transactionsSlice from './slices/transactionsSlice';
import categoriesSlice from './slices/categoriesSlice';
import budgetsSlice from './slices/budgetsSlice';
import goalsSlice from './slices/goalsSlice';
import recommendationsSlice from './slices/recommendationsSlice';
import analyticsSlice from './slices/analyticsSlice';
import budgetAnalyticsSlice from './slices/budgetAnalyticsSlice';
import uiSlice from './slices/uiSlice';
import onboardingSlice from './slices/onboardingSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    accounts: accountsSlice,
    transactions: transactionsSlice,
    categories: categoriesSlice,
    budgets: budgetsSlice,
    goals: goalsSlice,
    recommendations: recommendationsSlice,
    analytics: analyticsSlice,
    budgetAnalytics: budgetAnalyticsSlice,
    ui: uiSlice,
    onboarding: onboardingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;