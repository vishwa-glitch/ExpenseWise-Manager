import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import accountsSlice from './slices/accountsSlice';
import transactionsSlice from './slices/transactionsSlice';
import categoriesSlice from './slices/categoriesSlice';
import budgetsSlice from './slices/budgetsSlice';
// goalsSlice import removed for now - file kept for future use
import recommendationsSlice from './slices/recommendationsSlice';
import analyticsSlice from './slices/analyticsSlice';
import budgetAnalyticsSlice from './slices/budgetAnalyticsSlice';
import uiSlice from './slices/uiSlice';
import onboardingSlice from './slices/onboardingSlice';

// Persist configuration for critical data
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
    'auth',         // Important: Authentication state
    'transactions', // Critical: User's transaction data
    'budgets',      // Critical: Budget information
    // 'goals',        // Critical: Financial goals - removed for now
    'accounts',     // Important: Account information
    'categories',   // Important: Transaction categories
    'user',         // Important: User preferences
    'onboarding',   // Important: Onboarding progress
  ],
  blacklist: [
    'ui',           // Don't persist UI state
    'analytics',    // Don't persist analytics data
    'budgetAnalytics', // Don't persist analytics data
    'recommendations', // Don't persist recommendations
  ],
  // Transform data before storing to handle complex objects
  transforms: [],
  // Timeout for storage operations
  timeout: 10000,
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(
  { key: 'auth', storage: AsyncStorage },
  authSlice
);

const persistedTransactionsReducer = persistReducer(
  { key: 'transactions', storage: AsyncStorage },
  transactionsSlice
);

const persistedBudgetsReducer = persistReducer(
  { key: 'budgets', storage: AsyncStorage },
  budgetsSlice
);

// const persistedGoalsReducer = persistReducer(
//   { key: 'goals', storage: AsyncStorage },
//   goalsSlice
// );

const persistedAccountsReducer = persistReducer(
  { key: 'accounts', storage: AsyncStorage },
  accountsSlice
);

const persistedCategoriesReducer = persistReducer(
  { key: 'categories', storage: AsyncStorage },
  categoriesSlice
);

const persistedUserReducer = persistReducer(
  { key: 'user', storage: AsyncStorage },
  userSlice
);

const persistedOnboardingReducer = persistReducer(
  { key: 'onboarding', storage: AsyncStorage },
  onboardingSlice
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: persistedUserReducer,
    accounts: persistedAccountsReducer,
    transactions: persistedTransactionsReducer,
    categories: persistedCategoriesReducer,
    budgets: persistedBudgetsReducer,
    // goals: persistedGoalsReducer, // removed for now
    recommendations: recommendationsSlice,
    analytics: analyticsSlice,
    budgetAnalytics: budgetAnalyticsSlice,
    ui: uiSlice,
    onboarding: persistedOnboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor for the store
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;