// store/slices/investmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createInvestment as create ,getInvestmentsByUserId as investmentsByUserId, getUserInvestments as userInvestments, updateInvestmentROI as updateRoi,updateInvestmentStatus as updateStatus, deleteInvestment as deleteInvest, getAllInvestments as allInvestments, updateInvestment as update ,getDueForROI  as Due, getInvestmentById as investmentById, getInvestmentStats as stats} from '../../services/api/investment';
import userApi from '../../services/api/userApis';

// Async thunks for investment operations
export const createInvestment = createAsyncThunk(
  'investments/create',
  async (investmentData, { rejectWithValue, getState }) => {
    console.log("investmentData", investmentData)
    try {
      const response = await userApi.investMoney(investmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create investment'
      );
    }
  }
);
export const addAdditionalInvestment = createAsyncThunk(
  'investments/addAdditional',
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      const response = await userApi.reInvestMoney(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create investment'
      );
    }
  }
);

export const getAllInvestments = createAsyncThunk(
  'investments/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await allInvestments('/investments', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch investments'
      );
    }
  }
);

export const getInvestmentStats = createAsyncThunk(
  'investments/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await stats('/investments/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch investment stats'
      );
    }
  }
);

export const getDueForROI = createAsyncThunk(
  'investments/getDueROI',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await Due('/investments/due-roi', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch due ROI investments'
      );
    }
  }
);

export const getInvestmentById = createAsyncThunk(
  'investments/getById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAdmin = state.auth?.isAdminAuthenticated;
      const client = getApiClient(isAdmin);
    
      const response = await investmentById(`/investments/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch investment'
      );
    }
  }
);

export const updateInvestment = createAsyncThunk(
  'investments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await update(`/investments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update investment'
      );
    }
  }
);

export const deleteInvestment = createAsyncThunk(
  'investments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteInvest(`/investments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete investment'
      );
    }
  }
);

export const updateInvestmentStatus = createAsyncThunk(
  'investments/updateStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAdmin = state.auth?.isAdminAuthenticated;
      const client = getApiClient(isAdmin);
      
      const response = await updateStatus(`/investments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update investment status'
      );
    }
  }
);

export const updateInvestmentROI = createAsyncThunk(
  'investments/updateROI',
  async ({ id, roiData }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAdmin = state.auth?.isAdminAuthenticated;
      const client = getApiClient(isAdmin);
      
      const response = await updateRoi(`/investments/${id}/roi`, roiData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update investment ROI'
      );
    }
  }
);

export const getUserInvestments = createAsyncThunk(
  'investments/getUserInvestments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.userInvestments();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user investments'
      );
    }
  }
);

export const getInvestmentsByUserId = createAsyncThunk(
  'investments/getByUserId',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await  investmentsByUserId(`/investments/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user investments'
      );
    }
  }
);

// Initial state
const initialState = {
  // Data
  investments: [],
  summary:{},
  userInvestments: [],
  currentInvestment: null,
  stats: null,
  dueROIInvestments: [],
  
  // Pagination & Filtering
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  },
  
  // Loading states
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    stats: false,
    dueROI: false,
    userInvestments: false
  },
  
  // Error states
  errors: {
    list: null,
    create: null,
    update: null,
    delete: null,
    stats: null,
    dueROI: null,
    userInvestments: null
  },
  
  // UI states
  selectedInvestments: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  lastFetch: null
};

// Investment slice
const investmentSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.errors = {
        list: null,
        create: null,
        update: null,
        delete: null,
        stats: null,
        dueROI: null,
        userInvestments: null
      };
    },
    
    // Clear specific error
    clearError: (state, action) => {
      const errorType = action.payload;
      if (state.errors[errorType] !== undefined) {
        state.errors[errorType] = null;
      }
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: '',
        userId: '',
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: ''
      };
      state.pagination.page = 1;
    },
    
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Set sorting
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    
    // Toggle investment selection
    toggleInvestmentSelection: (state, action) => {
      const investmentId = action.payload;
      const index = state.selectedInvestments.indexOf(investmentId);
      
      if (index > -1) {
        state.selectedInvestments.splice(index, 1);
      } else {
        state.selectedInvestments.push(investmentId);
      }
    },
    
    // Select all investments
    selectAllInvestments: (state) => {
      state.selectedInvestments = state.investments.map(inv => inv.id);
    },
    
    // Clear all selections
    clearSelection: (state) => {
      state.selectedInvestments = [];
    },
    
    // Set current investment
    setCurrentInvestment: (state, action) => {
      state.currentInvestment = action.payload;
    },
    
    // Clear current investment
    clearCurrentInvestment: (state) => {
      state.currentInvestment = null;
    },
    
    // Reset slice
    resetInvestmentSlice: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    // Create Investment
    builder
      .addCase(createInvestment.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(createInvestment.fulfilled, (state, action) => {
        state.loading.create = false;
        state.investments.unshift(action.payload);
        state.userInvestments.unshift(action.payload);
      })
      .addCase(createInvestment.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
      });
    builder
      .addCase(addAdditionalInvestment.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(addAdditionalInvestment.fulfilled, (state, action) => {
        state.loading.create = false;
        state.message =  'Investment added successfully';
        // state.investments.unshift(action.payload);
        // state.userInvestments.unshift(action.payload);
      })
      .addCase(addAdditionalInvestment.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
      });

    // Get All Investments
    builder
      .addCase(getAllInvestments.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(getAllInvestments.fulfilled, (state, action) => {
        state.loading.list = false;
        state.investments = action.payload.data || action.payload;
        
        // Handle pagination if included in response
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
        
        state.lastFetch = new Date().toISOString();
      })
      .addCase(getAllInvestments.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list = action.payload;
      });

    // Get Investment Stats
    builder
      .addCase(getInvestmentStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(getInvestmentStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(getInvestmentStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.errors.stats = action.payload;
      });

    // Get Due ROI
    builder
      .addCase(getDueForROI.pending, (state) => {
        state.loading.dueROI = true;
        state.errors.dueROI = null;
      })
      .addCase(getDueForROI.fulfilled, (state, action) => {
        state.loading.dueROI = false;
        state.dueROIInvestments = action.payload.data || action.payload;
      })
      .addCase(getDueForROI.rejected, (state, action) => {
        state.loading.dueROI = false;
        state.errors.dueROI = action.payload;
      });

    // Get Investment By ID
    builder
      .addCase(getInvestmentById.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(getInvestmentById.fulfilled, (state, action) => {
        state.loading.list = false;
        state.currentInvestment = action.payload;
        
        // Update in investments array if exists
        const index = state.investments.findIndex(inv => inv.id === action.payload.id);
        if (index > -1) {
          state.investments[index] = action.payload;
        }
      })
      .addCase(getInvestmentById.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list = action.payload;
      });

    // Update Investment
    builder
      .addCase(updateInvestment.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.loading.update = false;
        
        // Update in investments array
        const index = state.investments.findIndex(inv => inv.id === action.payload.id);
        if (index > -1) {
          state.investments[index] = action.payload;
        }
        
        // Update current investment if it's the same
        if (state.currentInvestment?.id === action.payload.id) {
          state.currentInvestment = action.payload;
        }
        
        // Update in user investments
        const userIndex = state.userInvestments.findIndex(inv => inv.id === action.payload.id);
        if (userIndex > -1) {
          state.userInvestments[userIndex] = action.payload;
        }
      })
      .addCase(updateInvestment.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
      });

    // Delete Investment
    builder
      .addCase(deleteInvestment.pending, (state) => {
        state.loading.delete = true;
        state.errors.delete = null;
      })
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.loading.delete = false;
        
        const investmentId = action.payload;
        
        // Remove from investments array
        state.investments = state.investments.filter(inv => inv.id !== investmentId);
        
        // Remove from user investments
        state.userInvestments = state.userInvestments.filter(inv => inv.id !== investmentId);
        
        // Clear current investment if it's the deleted one
        if (state.currentInvestment?.id === investmentId) {
          state.currentInvestment = null;
        }
        
        // Remove from selected investments
        state.selectedInvestments = state.selectedInvestments.filter(id => id !== investmentId);
      })
      .addCase(deleteInvestment.rejected, (state, action) => {
        state.loading.delete = false;
        state.errors.delete = action.payload;
      });

    // Update Status
    builder
      .addCase(updateInvestmentStatus.fulfilled, (state, action) => {
        const updatedInvestment = action.payload;
        
        // Update in investments array
        const index = state.investments.findIndex(inv => inv.id === updatedInvestment.id);
        if (index > -1) {
          state.investments[index] = updatedInvestment;
        }
        
        // Update in user investments
        const userIndex = state.userInvestments.findIndex(inv => inv.id === updatedInvestment.id);
        if (userIndex > -1) {
          state.userInvestments[userIndex] = updatedInvestment;
        }
        
        // Update current investment
        if (state.currentInvestment?.id === updatedInvestment.id) {
          state.currentInvestment = updatedInvestment;
        }
      });

    // Update ROI
    builder
      .addCase(updateInvestmentROI.fulfilled, (state, action) => {
        const updatedInvestment = action.payload;
        
        // Update in investments array
        const index = state.investments.findIndex(inv => inv.id === updatedInvestment.id);
        if (index > -1) {
          state.investments[index] = updatedInvestment;
        }
        
        // Update in user investments
        const userIndex = state.userInvestments.findIndex(inv => inv.id === updatedInvestment.id);
        if (userIndex > -1) {
          state.userInvestments[userIndex] = updatedInvestment;
        }
        
        // Update current investment
        if (state.currentInvestment?.id === updatedInvestment.id) {
          state.currentInvestment = updatedInvestment;
        }
      });

    // Get User Investments
    builder
      .addCase(getUserInvestments.pending, (state) => {
        state.loading.userInvestments = true;
        state.errors.userInvestments = null;
      })
      .addCase(getUserInvestments.fulfilled, (state, action) => {
        state.loading.userInvestments = false;
        state.userInvestments = action.payload.data.investments ;
        state.summary = action.payload.data.summary;
      })
      .addCase(getUserInvestments.rejected, (state, action) => {
        state.loading.userInvestments = false;
        state.errors.userInvestments = action.payload;
      });

    // Get Investments By User ID
    builder
      .addCase(getInvestmentsByUserId.fulfilled, (state, action) => {
        // This could be used to populate a specific user's investments
        // You might want to add a separate state property for this
        state.userInvestments = action.payload.data || action.payload;
      });
  }
});

// Export actions
export const {
  clearErrors,
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  setSorting,
  toggleInvestmentSelection,
  selectAllInvestments,
  clearSelection,
  setCurrentInvestment,
  clearCurrentInvestment,
  resetInvestmentSlice
} = investmentSlice.actions;

// Selectors
export const selectInvestments = (state) => state.investments.investments;
export const selectUserInvestments = (state) => state.investments.userInvestments;
export const selectInvestmentSummary = (state) => state.investments.summary;
export const selectCurrentInvestment = (state) => state.investments.currentInvestment;
export const selectInvestmentStats = (state) => state.investments.stats;
export const selectDueROIInvestments = (state) => state.investments.dueROIInvestments;
export const selectInvestmentLoading = (state) => state.investments.loading;
export const selectInvestmentErrors = (state) => state.investments.errors;
export const selectInvestmentFilters = (state) => state.investments.filters;
export const selectInvestmentPagination = (state) => state.investments.pagination;
export const selectSelectedInvestments = (state) => state.investments.selectedInvestments;

// Complex selectors
export const selectFilteredInvestments = (state) => {
  const investments = selectInvestments(state);
  const filters = selectInvestmentFilters(state);
  
  return investments.filter(investment => {
    if (filters.status && investment.status !== filters.status) return false;
    if (filters.userId && investment.userId !== filters.userId) return false;
    if (filters.dateFrom && new Date(investment.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(investment.createdAt) > new Date(filters.dateTo)) return false;
    if (filters.amountMin && investment.amount < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax && investment.amount > parseFloat(filters.amountMax)) return false;
    
    return true;
  });
};

export const selectInvestmentById = (state, investmentId) => {
  return selectInvestments(state).find(investment => investment.id === investmentId);
};

export const selectHasInvestmentData = (state) => {
  return selectInvestments(state).length > 0;
};

export const selectIsDataStale = (state, maxAge = 5 * 60 * 1000) => { // 5 minutes default
  const lastFetch = state.investments.lastFetch;
  if (!lastFetch) return true;
  
  return Date.now() - new Date(lastFetch).getTime() > maxAge;
};

export default investmentSlice.reducer;