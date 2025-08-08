// store/slices/transactionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminApiClient, userApiClient } from "../../services/api/client";
import { enableMapSet } from "immer";

enableMapSet();
// Transaction Types Enum
export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  ROI_EARNING: "roi_earning",
  LEVEL_COMMISSION: "level_commission",
  DIRECT_BONUS: "direct_bonus",
  REWARD_BONUS: "reward_bonus",
  TRANSFER_IN: "transfer_in",
  TRANSFER_OUT: "transfer_out",
  INVEST: "invest",
  TOPUP: "topup",
  COMPOUND: "compound",
  PENALTY: "penalty",
  REFUND: "refund",
  SALARY: "salary",
};

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export const SOURCE_TYPES = {
  WALLET: "wallet",
  BANK: "bank",
  CRYPTO: "crypto",
  INTERNAL: "internal",
};

// Async Thunks

// User Transaction Actions
export const fetchUserTransactions = createAsyncThunk(
  "transactions/fetchUserTransactions",
  async (
    { page = 1, limit = 10, userId, filters = {} },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        userId,
        ...filters,
      });
   
      const response = await userApiClient.get(`/transactions/user/?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTransactionByHash = createAsyncThunk(
  "transactions/fetchTransactionByHash",
  async (hash, { rejectWithValue }) => {
    try {
      const response = await userApiClient.get(`/transactions/hash/${hash}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTransactionByReference = createAsyncThunk(
  "transactions/fetchTransactionByReference",
  async (reference, { rejectWithValue }) => {
    try {
      const response = await userApiClient.get(
        `/transactions/reference/${reference}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  "transactions/fetchTransactionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApiClient.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const fetchDailyLimit = createAsyncThunk(
  "transactions/fetchDailyLimit ",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApiClient.get(`/transactions/user/daily-limit`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Admin Transaction Actions
export const fetchAllTransactions = createAsyncThunk(
  "transactions/fetchAllTransactions",
  async ({ page = 1, limit = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await adminApiClient.get(
        `/transactions/admin/all?${params}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await adminApiClient.post(
        "/transactions/admin/create",
        transactionData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  "transactions/updateTransaction",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApiClient.put(
        `/transactions/admin/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTransactionStatus = createAsyncThunk(
  "transactions/updateTransactionStatus",
  async ({ id, status, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await adminApiClient.patch(
        `/transactions/admin/${id}/status`,
        {
          status,
          adminNotes,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id, { rejectWithValue }) => {
    try {
      await adminApiClient.delete(`/transactions/admin/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTransactionStats = createAsyncThunk(
  "transactions/fetchTransactionStats",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await adminApiClient.get(
        `/transactions/admin/stats?${params}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportTransactions = createAsyncThunk(
  "transactions/exportTransactions",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await adminApiClient.get(
        `/transactions/admin/export?${params}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial State
const initialState = {
  // Transaction Lists
  userTransactions: {
    data: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null,
  },
  limit:null,
  adminTransactions: {
    data: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null,
  },

  // Individual Transaction
  currentTransaction: {
    data: null,
    loading: false,
    error: null,
  },

  // Search Results
  searchResults: {
    byHash: { data: null, loading: false, error: null },
    byReference: { data: null, loading: false, error: null },
  },

  // Statistics
  stats: {
    data: null,
    loading: false,
    error: null,
  },

  // UI State
  filters: {
    user: {},
    admin: {},
  },

  // Operation States
  creating: false,
  updating: false,
  deleting: false,
  exporting: false,

  // Error Messages
  lastError: null,

  // Cache
  cache: {
    transactions: new Map(),
    lastFetch: {},
  },
};

// Transaction Slice
const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    // UI State Management
    setUserFilters: (state, action) => {
      state.filters.user = { ...state.filters.user, ...action.payload };
    },
    setAdminFilters: (state, action) => {
      state.filters.admin = { ...state.filters.admin, ...action.payload };
    },
    clearFilters: (state, action) => {
      const filterType = action.payload; // 'user' or 'admin'
      state.filters[filterType] = {};
    },

    // Cache Management
    cacheTransaction: (state, action) => {
      const transaction = action.payload;
      state.cache.transactions.set(transaction.id, transaction);
    },
    clearCache: (state) => {
      state.cache.transactions.clear();
      state.cache.lastFetch = {};
    },

    // Error Management
    clearError: (state) => {
      state.lastError = null;
    },
    clearTransactionError: (state) => {
      state.currentTransaction.error = null;
    },

    // Reset States
    resetSearchResults: (state) => {
      state.searchResults.byHash = { data: null, loading: false, error: null };
      state.searchResults.byReference = {
        data: null,
        loading: false,
        error: null,
      };
    },
    resetCurrentTransaction: (state) => {
      state.currentTransaction = { data: null, loading: false, error: null };
    },

    // Optimistic Updates
    optimisticUpdateTransaction: (state, action) => {
      const { id, updates } = action.payload;

      // Update in user transactions
      const userTransactionIndex = state.userTransactions.data.findIndex(
        (t) => t.id === id
      );
      if (userTransactionIndex !== -1) {
        state.userTransactions.data[userTransactionIndex] = {
          ...state.userTransactions.data[userTransactionIndex],
          ...updates,
        };
      }

      // Update in admin transactions
      const adminTransactionIndex = state.adminTransactions.data.findIndex(
        (t) => t.id === id
      );
      if (adminTransactionIndex !== -1) {
        state.adminTransactions.data[adminTransactionIndex] = {
          ...state.adminTransactions.data[adminTransactionIndex],
          ...updates,
        };
      }

      // Update current transaction
      if (
        state.currentTransaction.data &&
        state.currentTransaction.data.id === id
      ) {
        state.currentTransaction.data = {
          ...state.currentTransaction.data,
          ...updates,
        };
      }

      // Update cache
      if (state.cache.transactions.has(id)) {
        state.cache.transactions.set(id, {
          ...state.cache.transactions.get(id),
          ...updates,
        });
      }
    },
  },

  extraReducers: (builder) => {
    // User Transactions
    builder
      .addCase(fetchUserTransactions.pending, (state) => {
        state.userTransactions.loading = true;
        state.userTransactions.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
      

        state.userTransactions.loading = false;
        state.userTransactions.error = null;

        // Direct assignment - this should work
        state.userTransactions.data = action.payload.transactions || [];

        // Ensure numeric values
        state.userTransactions.totalCount = Number(action.payload.total) || 0;
        state.userTransactions.currentPage = Number(action.payload.page) || 1;
        state.userTransactions.totalPages =
          Number(action.payload.totalPages) || 1;

        // Cache transactions safely
        if (
          action.payload.transactions &&
          Array.isArray(action.payload.transactions)
        ) {
          action.payload.transactions.forEach((transaction) => {
            if (state.cache && state.cache.transactions) {
              state.cache.transactions.set(transaction.id, transaction);
            }
          });
        }
      })

      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.userTransactions.loading = false;
        state.userTransactions.error =
          action.payload?.message || "Failed to fetch user transactions";
        state.lastError =
          action.payload?.message || "Failed to fetch user transactions";
      });

    // Admin Transactions
    builder
      .addCase(fetchAllTransactions.pending, (state) => {
        state.adminTransactions.loading = true;
        state.adminTransactions.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.adminTransactions.loading = false;
        state.adminTransactions.data = action.payload.data.transactions || [];
        state.adminTransactions.totalCount = action.payload.data.pages || 0;
        state.adminTransactions.currentPage = action.payload.data.page || 1;
        state.adminTransactions.totalPages = action.payload.data.total || 0;

        // Cache transactions
        state.cache.transactions = {};
        action.payload.data.transactions?.forEach((transaction) => {
          state.cache.transactions[transaction.id] = transaction;
        });
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.adminTransactions.loading = false;
        state.adminTransactions.error =
          action.payload?.message || "Failed to fetch admin transactions";
        state.lastError =
          action.payload?.message || "Failed to fetch admin transactions";
      });

    // Individual Transaction
    builder
      .addCase(fetchTransactionById.pending, (state) => {
        state.currentTransaction.loading = true;
        state.currentTransaction.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.currentTransaction.loading = false;
        state.currentTransaction.data = action.payload.data;

        // Cache transaction
        if (action.payload.data) {
          state.cache.transactions.set(
            action.payload.data.id,
            action.payload.data
          );
        }
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.currentTransaction.loading = false;
        state.currentTransaction.error =
          action.payload?.message || "Failed to fetch transaction";
        state.lastError =
          action.payload?.message || "Failed to fetch transaction";
      });

    // Search by Hash
    builder
      .addCase(fetchTransactionByHash.pending, (state) => {
        state.searchResults.byHash.loading = true;
        state.searchResults.byHash.error = null;
      })
      .addCase(fetchTransactionByHash.fulfilled, (state, action) => {
        state.searchResults.byHash.loading = false;
        state.searchResults.byHash.data = action.payload.data;

        // Cache transaction
        if (action.payload.data) {
          state.cache.transactions.set(
            action.payload.data.id,
            action.payload.data
          );
        }
      })
      .addCase(fetchTransactionByHash.rejected, (state, action) => {
        state.searchResults.byHash.loading = false;
        state.searchResults.byHash.error =
          action.payload?.message || "Transaction not found";
      });

    // Search by Reference
    builder
      .addCase(fetchTransactionByReference.pending, (state) => {
        state.searchResults.byReference.loading = true;
        state.searchResults.byReference.error = null;
      })
      .addCase(fetchTransactionByReference.fulfilled, (state, action) => {
        state.searchResults.byReference.loading = false;
        state.searchResults.byReference.data = action.payload.data;

        // Cache transaction
        if (action.payload.data) {
          state.cache.transactions.set(
            action.payload.data.id,
            action.payload.data
          );
        }
      })
      .addCase(fetchTransactionByReference.rejected, (state, action) => {
        state.searchResults.byReference.loading = false;
        state.searchResults.byReference.error =
          action.payload?.message || "Transaction not found";
      });

    // Create Transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.creating = true;
        state.lastError = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.creating = false;

        // Add to admin transactions if they're loaded
        if (state.adminTransactions.data.length > 0) {
          state.adminTransactions.data.unshift(action.payload.data);
          state.adminTransactions.totalCount += 1;
        }

        // Cache transaction
        if (action.payload.data) {
          state.cache.transactions.set(
            action.payload.data.id,
            action.payload.data
          );
        }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.creating = false;
        state.lastError =
          action.payload?.message || "Failed to create transaction";
      });

    // Update Transaction
    builder
      .addCase(updateTransaction.pending, (state) => {
        state.updating = true;
        state.lastError = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.updating = false;

        const updatedTransaction = action.payload.data;
        const transactionId = updatedTransaction.id;

        // Update in user transactions
        const userIndex = state.userTransactions.data.findIndex(
          (t) => t.id === transactionId
        );
        if (userIndex !== -1) {
          state.userTransactions.data[userIndex] = updatedTransaction;
        }

        // Update in admin transactions
        const adminIndex = state.adminTransactions.data.findIndex(
          (t) => t.id === transactionId
        );
        if (adminIndex !== -1) {
          state.adminTransactions.data[adminIndex] = updatedTransaction;
        }

        // Update current transaction
        if (
          state.currentTransaction.data &&
          state.currentTransaction.data.id === transactionId
        ) {
          state.currentTransaction.data = updatedTransaction;
        }

        // Update cache
        state.cache.transactions.set(transactionId, updatedTransaction);
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.updating = false;
        state.lastError =
          action.payload?.message || "Failed to update transaction";
      });

    // Update Transaction Status
    builder
      .addCase(updateTransactionStatus.pending, (state) => {
        state.updating = true;
        state.lastError = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.updating = false;

        const updatedTransaction = action.payload.data;
        const transactionId = updatedTransaction.id;

        // Update in user transactions
        const userIndex = state.userTransactions.data.findIndex(
          (t) => t.id === transactionId
        );
        if (userIndex !== -1) {
          state.userTransactions.data[userIndex] = updatedTransaction;
        }

        // Update in admin transactions
        const adminIndex = state.adminTransactions.data.findIndex(
          (t) => t.id === transactionId
        );
        if (adminIndex !== -1) {
          state.adminTransactions.data[adminIndex] = updatedTransaction;
        }

        // Update current transaction
        if (
          state.currentTransaction.data &&
          state.currentTransaction.data.id === transactionId
        ) {
          state.currentTransaction.data = updatedTransaction;
        }

        // Update cache
        state.cache.transactions.set(transactionId, updatedTransaction);
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.updating = false;
        state.lastError =
          action.payload?.message || "Failed to update transaction status";
      });

    // Delete Transaction
    builder
      .addCase(deleteTransaction.pending, (state) => {
        state.deleting = true;
        state.lastError = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.deleting = false;

        const deletedId = action.payload;

        // Remove from user transactions
        state.userTransactions.data = state.userTransactions.data.filter(
          (t) => t.id !== deletedId
        );

        // Remove from admin transactions
        state.adminTransactions.data = state.adminTransactions.data.filter(
          (t) => t.id !== deletedId
        );

        // Update counts
        if (state.userTransactions.totalCount > 0) {
          state.userTransactions.totalCount -= 1;
        }
        if (state.adminTransactions.totalCount > 0) {
          state.adminTransactions.totalCount -= 1;
        }

        // Clear current transaction if it's the deleted one
        if (
          state.currentTransaction.data &&
          state.currentTransaction.data.id === deletedId
        ) {
          state.currentTransaction.data = null;
        }

        // Remove from cache
        state.cache.transactions.delete(deletedId);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.deleting = false;
        state.lastError =
          action.payload?.message || "Failed to delete transaction";
      });

    // Transaction Stats
    builder
      .addCase(fetchTransactionStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload.data;
      })
      .addCase(fetchTransactionStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error =
          action.payload?.message || "Failed to fetch transaction stats";
      });
    builder
      .addCase(fetchDailyLimit.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchDailyLimit.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.limit = action.payload.data;
      })
      .addCase(fetchDailyLimit.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error =
          action.payload?.message || "Failed to fetch daily limit";
      });

    // Export Transactions
    builder
      .addCase(exportTransactions.pending, (state) => {
        state.exporting = true;
        state.lastError = null;
      })
      .addCase(exportTransactions.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportTransactions.rejected, (state, action) => {
        state.exporting = false;
        state.lastError =
          action.payload?.message || "Failed to export transactions";
      });
  },
});

// Export actions
export const {
  setUserFilters,
  setAdminFilters,
  clearFilters,
  cacheTransaction,
  clearCache,
  clearError,
  clearTransactionError,
  resetSearchResults,
  resetCurrentTransaction,
  optimisticUpdateTransaction,
} = transactionSlice.actions;

// Selectors
export const selectUserTransactions = (state) =>
  state.transactions.userTransactions;
export const selectUserDailyLimit = (state) =>
  state.transactions.limit;
export const selectAdminTransactions = (state) =>
  state.transactions.adminTransactions;
export const selectCurrentTransaction = (state) =>
  state.transactions.currentTransaction;
export const selectSearchResults = (state) => state.transactions.searchResults;
export const selectTransactionStats = (state) => state.transactions.stats;
export const selectTransactionFilters = (state) => state.transactions.filters;
export const selectTransactionOperations = (state) => ({
  creating: state.transactions.creating,
  updating: state.transactions.updating,
  deleting: state.transactions.deleting,
  exporting: state.transactions.exporting,
});
export const selectLastError = (state) => state.transactions.lastError;

// Memoized selectors
export const selectTransactionById = (state, id) => {
  return state.transactions.cache.transactions.get(id) || null;
};

export const selectTransactionsByType = (
  state,
  transactionType,
  isAdmin = false
) => {
  const transactions = isAdmin
    ? state.transactions.adminTransactions.data
    : state.transactions.userTransactions.data;
  return transactions.filter((t) => t.transaction_type === transactionType);
};

export const selectTransactionsByStatus = (state, status, isAdmin = false) => {
  const transactions = isAdmin
    ? state.transactions.adminTransactions.data
    : state.transactions.userTransactions.data;
  return transactions.filter((t) => t.status === status);
};

export const selectTransactionsByDateRange = (
  state,
  startDate,
  endDate,
  isAdmin = false
) => {
  const transactions = isAdmin
    ? state.transactions.adminTransactions.data
    : state.transactions.userTransactions.data;
  return transactions.filter((t) => {
    const transactionDate = new Date(t.created_at);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

export default transactionSlice.reducer;
