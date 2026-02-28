import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { setDisplayCurrency } from './userSlice';
import { Account } from '../../types';

interface AccountsState {
  accounts: Account[];
  selectedAccount: any | null;
  balanceHistory: any[];
  accountSummary: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  balanceHistory: [],
  accountSummary: null,
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { dispatch }) => {
    const response = await apiService.getAccounts();
    if (response.accounts && response.accounts.length > 0) {
      const primaryCurrency = response.accounts[0].currency;
      if (primaryCurrency) {
        dispatch(setDisplayCurrency(primaryCurrency));
      }
    }
    return response;
  }
);

export const fetchAccount = createAsyncThunk(
  'accounts/fetchAccount',
  async (id: string) => {
    const response = await apiService.getAccount(id);
    return response;
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: { name: string; type: string; balance: number; currency: string }) => {
    const response = await apiService.createAccount(accountData);
    return response;
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, ...accountData }: { id: string; name: string; type: string; currency: string }) => {
    const response = await apiService.updateAccount(id, accountData);
    return response;
  }
);

export const patchAccountBalance = createAsyncThunk(
  'accounts/patchAccountBalance',
  async ({ id, balance }: { id: string; balance: number }) => {
    console.log('💰 Redux: Dispatching patchAccountBalance thunk with data:', { id, balance });
    const response = await apiService.patchAccountBalance(id, balance);
    console.log('✅ Redux: patchAccountBalance response received:', response);
    return { id, ...response };
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: string) => {
    await apiService.deleteAccount(id);
    return id;
  }
);

export const fetchBalanceHistory = createAsyncThunk(
  'accounts/fetchBalanceHistory',
  async ({ id, days }: { id: string; days?: number }) => {
    const response = await apiService.getAccountBalanceHistory(id, days);
    return response;
  }
);

export const fetchAccountSummary = createAsyncThunk(
  'accounts/fetchAccountSummary',
  async ({ id, period }: { id: string; period?: string }) => {
    const response = await apiService.getAccountSummary(id, period);
    return response;
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    clearAccountSummary: (state) => {
      state.accountSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload.accounts;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      // Fetch single account
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.selectedAccount = action.payload.account;
      })
      // Create account
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload.account);
      })
      // Update account
      .addCase(updateAccount.fulfilled, (state, action) => {
        console.log('🏦 Redux: updateAccount.fulfilled - payload:', action.payload);
        const updatedAccount = action.payload.account;
        if (updatedAccount) {
          const index = state.accounts.findIndex(acc => acc.id === updatedAccount.id);
          if (index !== -1) {
            console.log('🔄 Redux: Updating account in accounts array at index:', index);
            console.log('📊 Redux: Old account data:', state.accounts[index]);
            console.log('📊 Redux: New account data:', updatedAccount);
            state.accounts[index] = updatedAccount;
          }
          
          // Also update selectedAccount if it matches
          if (state.selectedAccount && state.selectedAccount.id === updatedAccount.id) {
            console.log('🔄 Redux: Updating selectedAccount');
            state.selectedAccount = updatedAccount;
          }
        }
      })
      // Patch account balance
      .addCase(patchAccountBalance.fulfilled, (state, action) => {
        console.log('💰 Redux: patchAccountBalance.fulfilled - payload:', action.payload);
        const { id } = action.payload;
        const updatedAccount = action.payload.account;
        
        if (updatedAccount) {
          const index = state.accounts.findIndex(acc => acc.id === id);
          if (index !== -1) {
            console.log('🔄 Redux: Updating account balance in accounts array at index:', index);
            console.log('💰 Redux: Old balance:', state.accounts[index].balance);
            console.log('💰 Redux: New balance:', updatedAccount.balance);
            state.accounts[index] = { ...state.accounts[index], ...updatedAccount };
          }
          
          // Also update selectedAccount if it matches
          if (state.selectedAccount && state.selectedAccount.id === id) {
            console.log('🔄 Redux: Updating selectedAccount balance');
            state.selectedAccount = { ...state.selectedAccount, ...updatedAccount };
          }
        }
      })
      // Delete account
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(acc => acc.id !== action.payload);
      })
      // Fetch balance history
      .addCase(fetchBalanceHistory.fulfilled, (state, action) => {
        state.balanceHistory = action.payload.history || action.payload.balance_history || [];
      })
      // Fetch account summary
      .addCase(fetchAccountSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Map backend response to frontend expected structure
        const backendData = action.payload;
        const backendSummary = backendData.summary || backendData;
        
        // Transform the backend response to match frontend expectations
        state.accountSummary = {
          total_income: backendSummary.total_income || 0,
          total_expenses: backendSummary.total_expenses || 0,
          net_change: backendSummary.net_amount || backendSummary.net_change || 0, // Backend returns net_amount, frontend expects net_change
          transaction_count: backendSummary.total_transactions || backendSummary.transaction_count || 0, // Backend returns total_transactions, frontend expects transaction_count
          average_transaction: backendSummary.avg_expense || backendSummary.average_transaction || 0, // Backend returns avg_expense, frontend expects average_transaction
          largest_expense: backendSummary.max_expense || backendSummary.largest_expense || 0, // Backend returns max_expense, frontend expects largest_expense
          largest_income: backendSummary.largest_income || 0,
          most_frequent_category: backendSummary.most_frequent_category || null,
        };
        
        console.log('📊 Account summary mapped:', {
          backendData,
          mappedSummary: state.accountSummary
        });
      })
      .addCase(fetchAccountSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch account summary';
        // Set fallback data on error
        state.accountSummary = {
          total_income: 0,
          total_expenses: 0,
          net_change: 0,
          transaction_count: 0,
          average_transaction: 0,
          largest_expense: 0,
          largest_income: 0,
          most_frequent_category: null,
        };
      });
  },
});

export const { clearError, setSelectedAccount, clearAccountSummary } = accountsSlice.actions;
export default accountsSlice.reducer;