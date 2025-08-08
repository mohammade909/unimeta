// store/slices/accountSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApiClient } from '../../services/api/client';

// Async thunks
export const createAccount = createAsyncThunk(
  'wallet/createAccount',
  async (walletData, { rejectWithValue }) => {
    try {
      const response = await userApiClient.post('/accounts', walletData);
      console.log(response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create wallet'
      );
    }
  }
);

export const getAccountById = createAsyncThunk(
  'wallet/getAccountById',
  async (walletId, { rejectWithValue }) => {
    try {
      const response = await userApiClient.get(`/accounts/${walletId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wallet'
      );
    }
  }
);

export const getUserAccounts = createAsyncThunk(
  'wallet/getUserAccounts',
  async ({ params = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `/accounts/user${queryParams ? `?${queryParams}` : ''}`;
      const response = await userApiClient.get(url);
      console.log("accounts",response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user wallets'
      );
    }
  }
);

export const updateAccount = createAsyncThunk(
  'wallet/updateAccount',
  async ({ walletId, updateData }, { rejectWithValue }) => {
    try {
      const response = await userApiClient.put(`/accounts/${walletId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update wallet'
      );
    }
  }
);

const initialState = {
  accounts: [],
  currentAccount: null,
  pagination: {
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  },
  loading: {
    create: false,
    fetch: false,
    update: false,
    fetchById: false
  },
  error: null,
  success: {
    create: false,
    update: false
  }
};

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = {
        create: false,
        update: false
      };
    },
    resetWalletState: (state) => {
      return { ...initialState };
    },
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create wallet
      .addCase(createAccount.pending, (state) => {
        state.loading.create = true;
        state.error = null;
        state.success.create = false;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading.create = false;
        state.success.create = true;
        state.accounts.unshift(action.payload.data);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
        state.success.create = false;
      })
      
      // Get wallet by ID
      .addCase(getAccountById.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(getAccountById.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.currentAccount = action.payload.data;
      })
      .addCase(getAccountById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = action.payload;
      })
      
      // Get user wallets
      .addCase(getUserAccounts.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(getUserAccounts.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.accounts = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserAccounts.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload;
      })
      
      // Update wallet
      .addCase(updateAccount.pending, (state) => {
        state.loading.update = true;
        state.error = null;
        state.success.update = false;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading.update = false;
        state.success.update = true;
        const updatedWallet = action.payload.data;
        const index = state.accounts.findIndex(w => w.id === updatedWallet.id);
        if (index !== -1) {
          state.accounts[index] = updatedWallet;
        }
        if (state.currentAccount && state.currentAccount.id === updatedWallet.id) {
          state.currentAccount = updatedWallet;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
        state.success.update = false;
      });
  }
});

export const { 
  clearError, 
  clearSuccess, 
  resetWalletState, 
  setCurrentAccount 
} = accountSlice.actions;

export default accountSlice.reducer;