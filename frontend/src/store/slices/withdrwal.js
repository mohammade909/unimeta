// store/slices/withdrawalSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { withdrawalAPI } from '../../services/api/withdrawal';

// Async thunks
export const createWithdrawalRequest = createAsyncThunk(
  'withdrawals/createRequest',
  async (withdrawalData, { rejectWithValue }) => {
    try {
      const response = await withdrawalAPI.createWithdrawal(withdrawalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserWithdrawals = createAsyncThunk(
  'withdrawals/fetchUserWithdrawals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await withdrawalAPI.getUserWithdrawals(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllWithdrawals = createAsyncThunk(
  'withdrawals/fetchAllWithdrawals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await withdrawalAPI.getAllWithdrawals(params);
      console.log("Fetched all withdrawals:", response.data);  
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateWithdrawal = createAsyncThunk(
  'withdrawals/updateWithdrawal',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await withdrawalAPI.updateWithdrawal(id, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWithdrawalStats = createAsyncThunk(
  'withdrawals/fetchStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await withdrawalAPI.getStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWithdrawalById = createAsyncThunk(
  'withdrawals/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await withdrawalAPI.getWithdrawal(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // User withdrawals
  userWithdrawals: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    loading: false,
    error: null
  },
  
  // Admin withdrawals
  allWithdrawals: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    loading: false,
    error: null,
    filters: {
      status: '',
      user_id: '',
      date_from: '',
      date_to: '',
      withdrawalType: '' // e.g., 'ROI', 'income', etc.
    },
    statistics: null
  },
  
  // Single withdrawal
  currentWithdrawal: {
    data: null,
    loading: false,
    error: null
  },
  
  // Statistics
  stats: {
    data: null,
    loading: false,
    error: null
  },
  
  // Create withdrawal
  createRequest: {
    loading: false,
    error: null,
    success: false
  },
  
  // Update withdrawal
  updateRequest: {
    loading: false,
    error: null,
    success: false
  },
  
  // UI state
  ui: {
    selectedWithdrawals: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    viewMode: 'table' // table, card
  }
};

const withdrawalSlice = createSlice({
  name: 'withdrawals',
  initialState,
  reducers: {
    // UI actions
    setFilters: (state, action) => {
      state.allWithdrawals.filters = { ...state.allWithdrawals.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.allWithdrawals.filters = {
        status: '',
        user_id: '',
        date_from: '',
        date_to: '',
        withdrawalType: ''
      };
    },
    
    setSelectedWithdrawals: (state, action) => {
      state.ui.selectedWithdrawals = action.payload;
    },
    
    toggleWithdrawalSelection: (state, action) => {
      const id = action.payload;
      const index = state.ui.selectedWithdrawals.indexOf(id);
      if (index > -1) {
        state.ui.selectedWithdrawals.splice(index, 1);
      } else {
        state.ui.selectedWithdrawals.push(id);
      }
    },
    
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.ui.sortBy = sortBy;
      state.ui.sortOrder = sortOrder;
    },
    
    setViewMode: (state, action) => {
      state.ui.viewMode = action.payload;
    },
    
    // Reset states
    resetCreateRequest: (state) => {
      state.createRequest = {
        loading: false,
        error: null,
        success: false
      };
    },
    
    resetUpdateRequest: (state) => {
      state.updateRequest = {
        loading: false,
        error: null,
        success: false
      };
    },
    
    clearErrors: (state) => {
      state.userWithdrawals.error = null;
      state.allWithdrawals.error = null;
      state.currentWithdrawal.error = null;
      state.stats.error = null;
      state.createRequest.error = null;
      state.updateRequest.error = null;
    },
    
    // Optimistic updates
    optimisticUpdateWithdrawal: (state, action) => {
      const { id, updateData } = action.payload;
      
      // Update in userWithdrawals
      const userIndex = state.userWithdrawals.data.findIndex(w => w.id === id);
      if (userIndex !== -1) {
        state.userWithdrawals.data[userIndex] = { 
          ...state.userWithdrawals.data[userIndex], 
          ...updateData 
        };
      }
      
      // Update in allWithdrawals
      const allIndex = state.allWithdrawals.data.findIndex(w => w.id === id);
      if (allIndex !== -1) {
        state.allWithdrawals.data[allIndex] = { 
          ...state.allWithdrawals.data[allIndex], 
          ...updateData 
        };
      }
      
      // Update current withdrawal
      if (state.currentWithdrawal.data?.id === id) {
        state.currentWithdrawal.data = { 
          ...state.currentWithdrawal.data, 
          ...updateData 
        };
      }
    }
  },
  
  extraReducers: (builder) => {
    // Create withdrawal request
    builder
      .addCase(createWithdrawalRequest.pending, (state) => {
        state.createRequest.loading = true;
        state.createRequest.error = null;
        state.createRequest.success = false;
      })
      .addCase(createWithdrawalRequest.fulfilled, (state, action) => {
        state.createRequest.loading = false;
        state.createRequest.success = true;
        // Add to user withdrawals if it's the current user
        state.userWithdrawals.data.unshift(action.payload);
        state.userWithdrawals.pagination.total += 1;
      })
      .addCase(createWithdrawalRequest.rejected, (state, action) => {
        state.createRequest.loading = false;
        state.createRequest.error = action.payload;
      })
      
      // Fetch user withdrawals
      .addCase(fetchUserWithdrawals.pending, (state) => {
        state.userWithdrawals.loading = true;
        state.userWithdrawals.error = null;
      })
      .addCase(fetchUserWithdrawals.fulfilled, (state, action) => {
        state.userWithdrawals.loading = false;
        state.userWithdrawals.data = action.payload.withdrawals;
        state.userWithdrawals.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchUserWithdrawals.rejected, (state, action) => {
        state.userWithdrawals.loading = false;
        state.userWithdrawals.error = action.payload;
      })
      
      // Fetch all withdrawals
      .addCase(fetchAllWithdrawals.pending, (state) => {
        state.allWithdrawals.loading = true;
        state.allWithdrawals.error = null;
      })
      .addCase(fetchAllWithdrawals.fulfilled, (state, action) => {
        state.allWithdrawals.loading = false;
        state.allWithdrawals.data = action.payload.withdrawals;
        state.allWithdrawals.statistics = action.payload.statistics;
        state.allWithdrawals.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchAllWithdrawals.rejected, (state, action) => {
        state.allWithdrawals.loading = false;
        state.allWithdrawals.error = action.payload;
      })
      
      // Update withdrawal
      .addCase(updateWithdrawal.pending, (state) => {
        state.updateRequest.loading = true;
        state.updateRequest.error = null;
        state.updateRequest.success = false;
      })
      .addCase(updateWithdrawal.fulfilled, (state, action) => {
        state.updateRequest.loading = false;
        state.updateRequest.success = true;
        
        const updatedWithdrawal = action.payload;
        
        // Update in all relevant arrays
        const updateInArray = (array) => {
          const index = array.findIndex(w => w.id === updatedWithdrawal.id);
          if (index !== -1) {
            array[index] = updatedWithdrawal;
          }
        };
        
        updateInArray(state.userWithdrawals.data);
        updateInArray(state.allWithdrawals.data);
        
        if (state.currentWithdrawal.data?.id === updatedWithdrawal.id) {
          state.currentWithdrawal.data = updatedWithdrawal;
        }
      })
      .addCase(updateWithdrawal.rejected, (state, action) => {
        state.updateRequest.loading = false;
        state.updateRequest.error = action.payload;
      })
      
      // Fetch withdrawal stats
      .addCase(fetchWithdrawalStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchWithdrawalStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
      })
      .addCase(fetchWithdrawalStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      })
      
      // Fetch withdrawal by ID
      .addCase(fetchWithdrawalById.pending, (state) => {
        state.currentWithdrawal.loading = true;
        state.currentWithdrawal.error = null;
      })
      .addCase(fetchWithdrawalById.fulfilled, (state, action) => {
        state.currentWithdrawal.loading = false;
        state.currentWithdrawal.data = action.payload;
      })
      .addCase(fetchWithdrawalById.rejected, (state, action) => {
        state.currentWithdrawal.loading = false;
        state.currentWithdrawal.error = action.payload;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setSelectedWithdrawals,
  toggleWithdrawalSelection,
  setSorting,
  setViewMode,
  resetCreateRequest,
  resetUpdateRequest,
  clearErrors,
  optimisticUpdateWithdrawal
} = withdrawalSlice.actions;

export default withdrawalSlice.reducer;