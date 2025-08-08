// store/slices/walletSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletApi, userApi } from '../../services/api/userApis';

// Initial state
const initialState = {
  userWallet: null,
  walletBalance: null,
  transactions: [],
  transactionsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  },
  walletStats: null,
  withdrawalHistory: [],
  withdrawalPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  },
  
  allWallets: [],
  walletsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  },
  
  loading: {
    fetchUserWallet: false,
    fetchBalance: false,
    fetchTransactions: false,
    fetchStats: false,
    fetchWithdrawals: false,
    createWithdrawal: false,
    cancelWithdrawal: false,
    fetchAllWallets: false,
    addBalance: false,
    deductBalance: false,
    updateWallet: false,
    deleteWallet: false,
    transferBalance: false
  },
  
  // Error states
  errors: {
    fetchUserWallet: null,
    fetchBalance: null,
    fetchTransactions: null,
    fetchStats: null,
    fetchWithdrawals: null,
    createWithdrawal: null,
    cancelWithdrawal: null,
    fetchAllWallets: null,
    addBalance: null,
    deductBalance: null,
    updateWallet: null,
    deleteWallet: null,
    transferBalance: null
  },
  
  // Success messages
  successMessages: {
    addBalance: null,
    deductBalance: null,
    updateWallet: null,
    deleteWallet: null,
    transferBalance: null,
    createWithdrawal: null,
    cancelWithdrawal: null
  }
};

// Async thunks for user wallet operations
export const fetchUserWallet = createAsyncThunk(
  'wallet/fetchUserWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletApi.getUserWallet();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user wallet');
    }
  }
);

export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchWalletBalance',
  async (_, { rejectWithValue }) => {
    try {
      // const response = await userApi.getWalletBalance();
      // return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet balance');
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'wallet/fetchTransactionHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await walletApi.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

export const fetchWalletStats = createAsyncThunk(
  'wallet/fetchWalletStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getWalletStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet stats');
    }
  }
);

export const createWithdrawalRequest = createAsyncThunk(
  'wallet/createWithdrawalRequest',
  async ({ amount, method, details }, { rejectWithValue }) => {
    try {
      const response = await userApi.createWithdrawalRequest(amount, method, details);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create withdrawal request');
    }
  }
);

export const fetchWithdrawalHistory = createAsyncThunk(
  'wallet/fetchWithdrawalHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.getWithdrawalHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawal history');
    }
  }
);

export const cancelWithdrawal = createAsyncThunk(
  'wallet/cancelWithdrawal',
  async (withdrawalId, { rejectWithValue }) => {
    try {
      const response = await userApi.cancelWithdrawal(withdrawalId);
      return { ...response.data, withdrawalId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel withdrawal');
    }
  }
);

// Async thunks for admin wallet operations
export const fetchAllWallets = createAsyncThunk(
  'wallet/fetchAllWallets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllWallets(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all wallets');
    }
  }
);

export const addBalance = createAsyncThunk(
  'wallet/addBalance',
  async ({ userId, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await walletApi.addWalletBalance(userId, { amount, reason });
      return { ...response.data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add balance');
    }
  }
);

export const deductBalance = createAsyncThunk(
  'wallet/deductBalance',
  async ({ userId, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await walletApi.deductWalletBalance(userId, { amount, reason });
      return { ...response.data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deduct balance');
    }
  }
);

export const updateWallet = createAsyncThunk(
  'wallet/updateWallet',
  async ({ userId, walletData }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateWallet(userId, walletData);
      return { ...response.data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update wallet');
    }
  }
);

export const deleteWallet = createAsyncThunk(
  'wallet/deleteWallet',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userApi.deleteWallet(userId);
      return { ...response.data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete wallet');
    }
  }
);

export const transferBalance = createAsyncThunk(
  'wallet/transferBalance',
  async ({ fromUserId, toUserId, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await userApi.transferBalance({ fromUserId, toUserId, amount, reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to transfer balance');
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Clear error messages
    clearError: (state, action) => {
      const { errorType } = action.payload;
      if (errorType && state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },
    
    // Clear success messages
    clearSuccessMessage: (state, action) => {
      const { messageType } = action.payload;
      if (messageType && state.successMessages[messageType]) {
        state.successMessages[messageType] = null;
      }
    },
    
    // Clear all errors
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key] = null;
      });
    },
    
    // Clear all success messages
    clearAllSuccessMessages: (state) => {
      Object.keys(state.successMessages).forEach(key => {
        state.successMessages[key] = null;
      });
    },
    
    // Reset wallet state
    resetWalletState: (state) => {
      return { ...initialState };
    },
    
    // Update transaction status locally
    updateTransactionStatus: (state, action) => {
      const { transactionId, status } = action.payload;
      const transaction = state.transactions.find(t => t.id === transactionId);
      if (transaction) {
        transaction.status = status;
      }
    },
    
    // Update withdrawal status locally
    updateWithdrawalStatus: (state, action) => {
      const { withdrawalId, status } = action.payload;
      const withdrawal = state.withdrawalHistory.find(w => w.id === withdrawalId);
      if (withdrawal) {
        withdrawal.status = status;
      }
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch User Wallet
      .addCase(fetchUserWallet.pending, (state) => {
        state.loading.fetchUserWallet = true;
        state.errors.fetchUserWallet = null;
      })
      .addCase(fetchUserWallet.fulfilled, (state, action) => {
       
        state.loading.fetchUserWallet = false;
        state.userWallet = action.payload.wallet;
        state.errors.fetchUserWallet = null;
      })
      .addCase(fetchUserWallet.rejected, (state, action) => {
        state.loading.fetchUserWallet = false;
        state.errors.fetchUserWallet = action.payload;
      })
      
      // Fetch Wallet Balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading.fetchBalance = true;
        state.errors.fetchBalance = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading.fetchBalance = false;
        state.walletBalance = action.payload.balance;
        state.errors.fetchBalance = null;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading.fetchBalance = false;
        state.errors.fetchBalance = action.payload;
      })
      
      // Fetch Transaction History
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading.fetchTransactions = true;
        state.errors.fetchTransactions = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.loading.fetchTransactions = false;
        state.transactions = action.payload.transactions || [];
        state.transactionsPagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalItems || 0,
          limit: action.payload.limit || 10
        };
        state.errors.fetchTransactions = null;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading.fetchTransactions = false;
        state.errors.fetchTransactions = action.payload;
      })
      
      // Fetch Wallet Stats
      .addCase(fetchWalletStats.pending, (state) => {
        state.loading.fetchStats = true;
        state.errors.fetchStats = null;
      })
      .addCase(fetchWalletStats.fulfilled, (state, action) => {
        state.loading.fetchStats = false;
        state.walletStats = action.payload.stats;
        state.errors.fetchStats = null;
      })
      .addCase(fetchWalletStats.rejected, (state, action) => {
        state.loading.fetchStats = false;
        state.errors.fetchStats = action.payload;
      })
      
      // Create Withdrawal Request
      .addCase(createWithdrawalRequest.pending, (state) => {
        state.loading.createWithdrawal = true;
        state.errors.createWithdrawal = null;
      })
      .addCase(createWithdrawalRequest.fulfilled, (state, action) => {
        state.loading.createWithdrawal = false;
        state.withdrawalHistory.unshift(action.payload.withdrawal);
        state.successMessages.createWithdrawal = 'Withdrawal request created successfully';
        state.errors.createWithdrawal = null;
      })
      .addCase(createWithdrawalRequest.rejected, (state, action) => {
        state.loading.createWithdrawal = false;
        state.errors.createWithdrawal = action.payload;
      })
      
      // Fetch Withdrawal History
      .addCase(fetchWithdrawalHistory.pending, (state) => {
        state.loading.fetchWithdrawals = true;
        state.errors.fetchWithdrawals = null;
      })
      .addCase(fetchWithdrawalHistory.fulfilled, (state, action) => {
        state.loading.fetchWithdrawals = false;
        state.withdrawalHistory = action.payload.withdrawals || [];
        state.withdrawalPagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalItems || 0,
          limit: action.payload.limit || 10
        };
        state.errors.fetchWithdrawals = null;
      })
      .addCase(fetchWithdrawalHistory.rejected, (state, action) => {
        state.loading.fetchWithdrawals = false;
        state.errors.fetchWithdrawals = action.payload;
      })
      
      // Cancel Withdrawal
      .addCase(cancelWithdrawal.pending, (state) => {
        state.loading.cancelWithdrawal = true;
        state.errors.cancelWithdrawal = null;
      })
      .addCase(cancelWithdrawal.fulfilled, (state, action) => {
        state.loading.cancelWithdrawal = false;
        const { withdrawalId } = action.payload;
        const withdrawal = state.withdrawalHistory.find(w => w.id === withdrawalId);
        if (withdrawal) {
          withdrawal.status = 'cancelled';
        }
        state.successMessages.cancelWithdrawal = 'Withdrawal cancelled successfully';
        state.errors.cancelWithdrawal = null;
      })
      .addCase(cancelWithdrawal.rejected, (state, action) => {
        state.loading.cancelWithdrawal = false;
        state.errors.cancelWithdrawal = action.payload;
      })
      
      // Fetch All Wallets (Admin)
      .addCase(fetchAllWallets.pending, (state) => {
        state.loading.fetchAllWallets = true;
        state.errors.fetchAllWallets = null;
      })
      .addCase(fetchAllWallets.fulfilled, (state, action) => {
        state.loading.fetchAllWallets = false;
        state.allWallets = action.payload.wallets || [];
        state.walletsPagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalItems || 0,
          limit: action.payload.limit || 10
        };
        state.errors.fetchAllWallets = null;
      })
      .addCase(fetchAllWallets.rejected, (state, action) => {
        state.loading.fetchAllWallets = false;
        state.errors.fetchAllWallets = action.payload;
      })
      
      // Add Balance (Admin)
      .addCase(addBalance.pending, (state) => {
        state.loading.addBalance = true;
        state.errors.addBalance = null;
      })
      .addCase(addBalance.fulfilled, (state, action) => {
        state.loading.addBalance = false;
        const { userId } = action.payload;
        const wallet = state.allWallets.find(w => w.userId === userId);
        if (wallet) {
          wallet.balance = action.payload.newBalance;
        }
        state.successMessages.addBalance = 'Balance added successfully';
        state.errors.addBalance = null;
      })
      .addCase(addBalance.rejected, (state, action) => {
        state.loading.addBalance = false;
        state.errors.addBalance = action.payload;
      })
      
      // Deduct Balance (Admin)
      .addCase(deductBalance.pending, (state) => {
        state.loading.deductBalance = true;
        state.errors.deductBalance = null;
      })
      .addCase(deductBalance.fulfilled, (state, action) => {
        state.loading.deductBalance = false;
        const { userId } = action.payload;
        const wallet = state.allWallets.find(w => w.userId === userId);
        if (wallet) {
          wallet.balance = action.payload.newBalance;
        }
        state.successMessages.deductBalance = 'Balance deducted successfully';
        state.errors.deductBalance = null;
      })
      .addCase(deductBalance.rejected, (state, action) => {
        state.loading.deductBalance = false;
        state.errors.deductBalance = action.payload;
      })
      
      // Update Wallet (Admin)
      .addCase(updateWallet.pending, (state) => {
        state.loading.updateWallet = true;
        state.errors.updateWallet = null;
      })
      .addCase(updateWallet.fulfilled, (state, action) => {
        state.loading.updateWallet = false;
        const { userId } = action.payload;
        const walletIndex = state.allWallets.findIndex(w => w.userId === userId);
        if (walletIndex !== -1) {
          state.allWallets[walletIndex] = { ...state.allWallets[walletIndex], ...action.payload.wallet };
        }
        state.successMessages.updateWallet = 'Wallet updated successfully';
        state.errors.updateWallet = null;
      })
      .addCase(updateWallet.rejected, (state, action) => {
        state.loading.updateWallet = false;
        state.errors.updateWallet = action.payload;
      })
      
      // Delete Wallet (Admin)
      .addCase(deleteWallet.pending, (state) => {
        state.loading.deleteWallet = true;
        state.errors.deleteWallet = null;
      })
      .addCase(deleteWallet.fulfilled, (state, action) => {
        state.loading.deleteWallet = false;
        const { userId } = action.payload;
        state.allWallets = state.allWallets.filter(w => w.userId !== userId);
        state.successMessages.deleteWallet = 'Wallet deleted successfully';
        state.errors.deleteWallet = null;
      })
      .addCase(deleteWallet.rejected, (state, action) => {
        state.loading.deleteWallet = false;
        state.errors.deleteWallet = action.payload;
      })
      
      // Transfer Balance (Admin)
      .addCase(transferBalance.pending, (state) => {
        state.loading.transferBalance = true;
        state.errors.transferBalance = null;
      })
      .addCase(transferBalance.fulfilled, (state, action) => {
        state.loading.transferBalance = false;
        const { fromUserId, toUserId, fromBalance, toBalance } = action.payload;
        
        // Update sender wallet balance
        const fromWallet = state.allWallets.find(w => w.userId === fromUserId);
        if (fromWallet) {
          fromWallet.balance = fromBalance;
        }
        
        // Update receiver wallet balance
        const toWallet = state.allWallets.find(w => w.userId === toUserId);
        if (toWallet) {
          toWallet.balance = toBalance;
        }
        
        state.successMessages.transferBalance = 'Balance transferred successfully';
        state.errors.transferBalance = null;
      })
      .addCase(transferBalance.rejected, (state, action) => {
        state.loading.transferBalance = false;
        state.errors.transferBalance = action.payload;
      });
  }
});

// Export actions
export const {
  clearError,
  clearSuccessMessage,
  clearAllErrors,
  clearAllSuccessMessages,
  resetWalletState,
  updateTransactionStatus,
  updateWithdrawalStatus
} = walletSlice.actions;

// Selectors
export const selectWalletState = (state) => state.wallet;
export const selectUserWallet = (state) => state.wallet.userWallet;
export const selectWalletBalance = (state) => state.wallet.walletBalance;
export const selectTransactions = (state) => state.wallet.transactions;
export const selectTransactionsPagination = (state) => state.wallet.transactionsPagination;
export const selectWalletStats = (state) => state.wallet.walletStats;
export const selectWithdrawalHistory = (state) => state.wallet.withdrawalHistory;
export const selectWithdrawalPagination = (state) => state.wallet.withdrawalPagination;
export const selectAllWallets = (state) => state.wallet.allWallets;
export const selectWalletsPagination = (state) => state.wallet.walletsPagination;
export const selectWalletLoading = (state) => state.wallet.loading;
export const selectWalletErrors = (state) => state.wallet.errors;
export const selectWalletSuccessMessages = (state) => state.wallet.successMessages;

// Memoized selectors for better performance
export const selectWalletById = (state, userId) => 
  state.wallet.allWallets.find(wallet => wallet.userId === userId);

export const selectTransactionById = (state, transactionId) => 
  state.wallet.transactions.find(transaction => transaction.id === transactionId);

export const selectWithdrawalById = (state, withdrawalId) => 
  state.wallet.withdrawalHistory.find(withdrawal => withdrawal.id === withdrawalId);

export const selectIsWalletLoading = (state) => 
  Object.values(state.wallet.loading).some(loading => loading);

export const selectHasWalletErrors = (state) => 
  Object.values(state.wallet.errors).some(error => error !== null);

// Export reducer
export default walletSlice.reducer;