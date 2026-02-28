import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { Transaction } from "../../types/transaction";

interface FilterState {
  searchQuery: string;
  activeQuickFilters: string[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
    preset:
      | "this_week"
      | "this_month"
      | "last_month"
      | "last_3_months"
      | "custom"
      | null;
  };
  categories: string[];
  transactionType: "all" | "income" | "expense";
  amountFilter: {
    isHighAmount: boolean; // >₹5000
    customRange: {
      min: number | null;
      max: number | null;
    };
  };
  patternFilters: {
    isRecurring: boolean | null;
    isUncategorized: boolean | null;
  };
}

interface QueryCache {
  [key: string]: {
    data: Transaction[];
    pagination: any;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  };
}

interface TransactionsState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  calendarData: any;
  pagination: any;
  activeFilters: FilterState;
  queryCache: QueryCache;
  isLoading: boolean;
  error: string | null;
}

const initialFilterState: FilterState = {
  searchQuery: "",
  activeQuickFilters: [],
  dateRange: {
    startDate: null,
    endDate: null,
    preset: null,
  },
  categories: [],
  transactionType: "all",
  amountFilter: {
    isHighAmount: false,
    customRange: {
      min: null,
      max: null,
    },
  },
  patternFilters: {
    isRecurring: null,
    isUncategorized: null,
  },
};

const initialState: TransactionsState = {
  transactions: [],
  filteredTransactions: [],
  calendarData: null,
  pagination: null,
  activeFilters: initialFilterState,
  queryCache: {},
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (params: any = {}) => {
    const response = await apiService.getTransactions(params);
    return response;
  }
);

export const fetchTransactionsByAccount = createAsyncThunk(
  "transactions/fetchTransactionsByAccount",
  async ({ accountId, page = 1, limit = 20, filters = {} }: {
    accountId: string;
    page?: number;
    limit?: number;
    filters?: {
      startDate?: string;
      endDate?: string;
      type?: string;
      categoryId?: string;
      minAmount?: number;
      maxAmount?: number;
    };
  }) => {
    const params = {
      accountId,
      page,
      limit,
      ...filters,
    };
    
    console.log('🏦 Fetching transactions for account:', { accountId, page, limit, filters });
    const response = await apiService.getTransactions(params);
    console.log('📊 Account transactions response:', {
      count: response.transactions?.length || 0,
      pagination: response.pagination
    });
    return response;
  }
);

export const fetchTransactionCalendar = createAsyncThunk(
  "transactions/fetchCalendar",
  async ({
    year,
    month,
    startDate,
    endDate,
  }: {
    year?: number;
    month?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    // If year and month are provided, use the calendar endpoint
    if (year && month) {
      console.log('📅 Fetching calendar data for:', { year, month });
      const response = await apiService.getTransactionCalendar(year, month);
      console.log('📅 Calendar API response:', {
        hasData: !!response,
        dataKeys: response ? Object.keys(response) : null,
        hasCalendarData: !!(response?.calendar_data),
        calendarDataKeys: response?.calendar_data ? Object.keys(response.calendar_data) : null,
        sampleDayData: response?.calendar_data ? Object.values(response.calendar_data)[0] : null,
      });
      return response;
    }

    // If startDate and endDate are provided, use the regular transactions endpoint
    // and transform the data to calendar format
    if (startDate && endDate) {
      console.log(
        `🔍 Fetching transactions for date range: ${startDate} to ${endDate}`
      );

      // Fetch all transactions using pagination since limit is max 100
      let allTransactions: any[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        console.log(`📄 Fetching page ${currentPage} for date range`);

        const response = await apiService.getTransactions({
          dateRange: { startDate, endDate },
          limit: 100, // Use maximum allowed limit
          page: currentPage,
        });

        console.log(`📊 Page ${currentPage} response:`, {
          transactionsCount:
            response.transactions?.length || response.data?.length || 0,
          pagination: response.pagination,
          totalTransactions: response.pagination?.total || 0,
        });

        const transactions = response.transactions || response.data || [];
        allTransactions = [...allTransactions, ...transactions];

        // Check if there are more pages
        const pagination = response.pagination;
        hasMorePages = pagination && currentPage < pagination.pages;
        currentPage++;

        // Safety check to prevent infinite loops
        if (currentPage > 10) {
          console.warn("⚠️ Breaking pagination loop after 10 pages");
          break;
        }
      }

      console.log(`✅ Total transactions fetched: ${allTransactions.length}`);
      if (allTransactions.length > 0) {
        console.log("📝 Sample transaction:", allTransactions[0]);
      }

      // Transform regular transaction data to calendar format
      let totalIncome = 0;
      let totalExpenses = 0;

      allTransactions.forEach((transaction: any, index: number) => {
        const amount = transaction.amount || 0;
        const type = transaction.type?.toLowerCase();

        if (index < 3) {
          // Log first 3 transactions for debugging
          console.log(`📝 Transaction ${index + 1}:`, {
            amount,
            type,
            date: transaction.transaction_date,
            description: transaction.description,
          });
        }

        if (type === "income") {
          totalIncome += amount;
        } else if (type === "expense") {
          totalExpenses += amount;
        }
      });

      console.log("💰 Calculated totals:", {
        totalIncome,
        totalExpenses,
        transactionCount: allTransactions.length,
      });

      const result = {
        summary: {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          transaction_count: allTransactions.length,
        },
        transactions: allTransactions,
        calendar_data: {}, // Empty for date range view
      };

      console.log("📤 Returning calendar data:", {
        summaryKeys: Object.keys(result.summary),
        summary: result.summary,
        transactionsLength: result.transactions.length,
      });

      return result;
    }

    throw new Error("Either year/month or startDate/endDate must be provided");
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (transactionData: any) => {
    const response = await apiService.createTransaction(transactionData);
    
    // Trigger budget monitoring check after transaction creation
    try {
      const { checkBudgetsAfterTransaction } = await import('../../utils/budgetMonitoringUtils');
      await checkBudgetsAfterTransaction(transactionData);
    } catch (error) {
      console.error('❌ Error triggering budget check after transaction:', error);
    }
    
    return response;
  }
);

export const updateTransaction = createAsyncThunk(
  "transactions/updateTransaction",
  async ({ id, data }: { id: string; data: any }) => {
    const response = await apiService.updateTransaction(id, data);
    
    // Trigger budget monitoring check after transaction update
    try {
      const { checkBudgetsAfterTransaction } = await import('../../utils/budgetMonitoringUtils');
      await checkBudgetsAfterTransaction(data);
    } catch (error) {
      console.error('❌ Error triggering budget check after transaction update:', error);
    }
    
    return response;
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id: string) => {
    await apiService.deleteTransaction(id);
    return id;
  }
);

export const bulkImportTransactions = createAsyncThunk(
  "transactions/bulkImport",
  async (transactionsData: any[]) => {
    const response = await apiService.request({
      url: "/transactions/bulk-import",
      method: "POST",
      data: { transactions: transactionsData },
    });
    return response.data;
  }
);

export const exportTransactions = createAsyncThunk(
  "transactions/export",
  async ({
    format = "excel",
    startDate,
    endDate,
  }: { format?: string; startDate?: string; endDate?: string } = {}) => {
    const response = await apiService.exportTransactions(
      format,
      startDate,
      endDate
    );

    if (Platform.OS === "web") {
      // Web-specific code
      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions_export.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Native (iOS/Android) specific code
      const blob = response;
      const fileName = `transactions_export.${format === 'excel' ? 'xlsx' : format}`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      // Convert Blob to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise<void>((resolve, reject) => {
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(",")[1]; // Get base64 part
          if (base64data) {
            try {
              await FileSystem.writeAsStringAsync(fileUri, base64data, {
                encoding: FileSystem.EncodingType.Base64,
              });

              // Check if sharing is available and share the file
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                  mimeType:
                    format === "excel"
                      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      : "text/csv",
                  dialogTitle: "Export Transactions",
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
  name: "transactions",
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
    // Filter management actions
    updateSearchQuery: (state, action) => {
      state.activeFilters.searchQuery = action.payload;
    },
    toggleQuickFilter: (state, action) => {
      const filterId = action.payload;
      const index = state.activeFilters.activeQuickFilters.indexOf(filterId);
      if (index > -1) {
        state.activeFilters.activeQuickFilters.splice(index, 1);
      } else {
        state.activeFilters.activeQuickFilters.push(filterId);
      }
    },
    updateDateRange: (state, action) => {
      state.activeFilters.dateRange = action.payload;
    },
    updateCategories: (state, action) => {
      state.activeFilters.categories = action.payload;
    },
    updateTransactionType: (state, action) => {
      state.activeFilters.transactionType = action.payload;
    },
    updateAmountFilter: (state, action) => {
      state.activeFilters.amountFilter = {
        ...state.activeFilters.amountFilter,
        ...action.payload,
      };
    },
    updatePatternFilters: (state, action) => {
      state.activeFilters.patternFilters = {
        ...state.activeFilters.patternFilters,
        ...action.payload,
      };
    },
    clearAllFilters: (state) => {
      state.activeFilters = initialFilterState;
    },
    // Query cache management
    setCacheEntry: (state, action) => {
      const { key, data, pagination } = action.payload;
      state.queryCache[key] = {
        data,
        pagination,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000, // 5 minutes
      };
    },
    clearExpiredCache: (state) => {
      const now = Date.now();
      Object.keys(state.queryCache).forEach((key) => {
        const entry = state.queryCache[key];
        if (now - entry.timestamp > entry.ttl) {
          delete state.queryCache[key];
        }
      });
    },
    clearCache: (state) => {
      state.queryCache = {};
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
        state.error = action.error.message || "Failed to fetch transactions";
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
        state.error = action.error.message || "Failed to fetch calendar data";
      })
      // Fetch transactions by account
      .addCase(fetchTransactionsByAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const newTransactions = action.payload.transactions || [];
        const pagination = action.payload.pagination;
        
        // If this is page 1, replace all transactions
        // If this is a subsequent page, append new transactions
        if (pagination && pagination.page === 1) {
          state.transactions = newTransactions;
        } else {
          // Append new transactions to existing ones
          state.transactions = [...state.transactions, ...newTransactions];
        }
        
        state.pagination = pagination;
        console.log('✅ Account transactions stored:', {
          count: state.transactions.length,
          pagination: state.pagination,
          newTransactionsCount: newTransactions.length,
          isPage1: pagination?.page === 1
        });
      })
      .addCase(fetchTransactionsByAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch account transactions";
      })
      // Create transaction
      .addCase(createTransaction.fulfilled, (state, action) => {
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.transaction?.id
        );
        if (index !== -1 && action.payload.transaction) {
          state.transactions[index] = action.payload.transaction;
        }
      })
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload
        );
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
          state.transactions = [
            ...action.payload.transactions,
            ...state.transactions,
          ];
        }
      })
      .addCase(bulkImportTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to import transactions";
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
        state.error = action.error.message || "Failed to export transactions";
      });
  },
});

export const {
  clearError,
  addTransaction,
  clearTransactions,
  updateSearchQuery,
  toggleQuickFilter,
  updateDateRange,
  updateCategories,
  updateTransactionType,
  updateAmountFilter,
  updatePatternFilters,
  clearAllFilters,
  setCacheEntry,
  clearExpiredCache,
  clearCache,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
