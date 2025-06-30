import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface TransactionsState {
  transactions: any[];
  calendarData: any;
  pagination: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  calendarData: null,
  pagination: null,
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async ({ 
    page = 1, 
    limit = 20, 
    accountId, 
    date 
  }: { 
    page?: number; 
    limit?: number; 
    accountId?: string; 
    date?: string; 
  } = {}) => {
    const response = await apiService.getTransactions(page, limit, accountId, date);
    return response;
  }
);

export const fetchTransactionCalendar = createAsyncThunk(
  'transactions/fetchCalendar',
  async ({ 
    year, 
    month, 
    startDate, 
    endDate 
  }: { 
    year?: number; 
    month?: number; 
    startDate?: string; 
    endDate?: string; 
  }) => {
    const response = await apiService.getTransactionCalendar(year, month, startDate, endDate);
    return response;
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData: any) => {
    const response = await apiService.createTransaction(transactionData);
    return response;
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await apiService.updateTransaction(id, data);
    return response;
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string) => {
    await apiService.deleteTransaction(id);
    return id;
  }
);

export const bulkImportTransactions = createAsyncThunk(
  'transactions/bulkImport',
  async (transactionsData: any[]) => {
    const response = await apiService.request({
      url: '/transactions/bulk-import',
      method: 'POST',
      data: { transactions: transactionsData },
    });
    return response.data;
  }
);

export const exportTransactions = createAsyncThunk(
  'transactions/export',
  async ({ format = 'excel', startDate, endDate }: { format?: string; startDate?: string; endDate?: string } = {}) => {
    const response = await apiService.exportTransactions(format, startDate, endDate);

    if (Platform.OS === 'web') {
      // Web-specific code
      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Native (iOS/Android) specific code
      const blob = response;
      const fileName = `transactions_export.${format}`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      // Convert Blob to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise<void>((resolve, reject) => {
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(',')[1]; // Get base64 part
          if (base64data) {
            try {
              await FileSystem.writeAsStringAsync(fileUri, base64data, {
                encoding: FileSystem.EncodingType.Base64,
              });
              
              // Check if sharing is available and share the file
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                  mimeType: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
                  dialogTitle: 'Export Transactions',
                });
              } else {
                throw new Error("Sharing is not available on this device.");
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Failed to convert blob to base64."));
          }
        };
        reader.onerror = reject;
      });
    }

    return response;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      // Fetch calendar
      .addCase(fetchTransactionCalendar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionCalendar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.calendarData = action.payload;
      })
      .addCase(fetchTransactionCalendar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch calendar data';
      })
      // Create transaction
      .addCase(createTransaction.fulfilled, (state, action) => {
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t.id === action.payload.transaction?.id);
        if (index !== -1 && action.payload.transaction) {
          state.transactions[index] = action.payload.transaction;
        }
      })
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      })
      // Bulk import
      .addCase(bulkImportTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkImportTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.transactions) {
          // Add imported transactions to the beginning of the list
          state.transactions = [...action.payload.transactions, ...state.transactions];
        }
      })
      .addCase(bulkImportTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to import transactions';
      })
      // Export transactions
      .addCase(exportTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportTransactions.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to export transactions';
      });
  },
});

export const { clearError, addTransaction, clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;