// store/slices/investmentPlansSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, adminApiClient, userApiClient } from '../../services/api/client';

// Helper function to determine which API client to use
const getApiClient = (requiresAdmin = false, userRole = null) => {
  if (requiresAdmin || userRole === 'admin') {
    return adminApiClient;
  }
  return userApiClient;
};

// Async thunks for API calls
export const fetchActivePlans = createAsyncThunk(
  'investmentPlans/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/investment-plans/active');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active plans');
    }
  }
);

export const fetchAllPlans = createAsyncThunk(
  'investmentPlans/fetchAll',
  async ({ page = 1, limit = 10, filters = {} }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const client = getApiClient(false, auth.user?.role);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await client.get(`/investment-plans?${params}`);
      return {
        data: response.data.data || response.data,
        pagination: response.data.pagination || {
          page,
          limit,
          total: response.data.length || 0
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const fetchPlanById = createAsyncThunk(
  'investmentPlans/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const client = getApiClient(false, auth.user?.role);
      
      const response = await client.get(`/investment-plans/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plan');
    }
  }
);

export const createPlan = createAsyncThunk(
  'investmentPlans/create',
  async (planData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const client = getApiClient(false, auth.user?.role);
      
      const response = await client.post('/investment-plans', planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create plan');
    }
  }
);

export const updatePlan = createAsyncThunk(
  'investmentPlans/update',
  async ({ id, planData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const client = getApiClient(true, auth.user?.role); // Admin required
      
      const response = await client.put(`/investment-plans/${id}`, planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update plan');
    }
  }
);

export const deletePlan = createAsyncThunk(
  'investmentPlans/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const client = getApiClient(true, auth.user?.role); // Admin required
      
      await client.delete(`/investment-plans/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete plan');
    }
  }
);

export const validatePlanAmount = createAsyncThunk(
  'investmentPlans/validateAmount',
  async ({ id, amount }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const client = getApiClient(false, auth.user?.role);
      
      const response = await client.post(`/investment-plans/${id}/validate`, { amount });
      return { id, validationResult: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate amount');
    }
  }
);

export const calculatePlanROI = createAsyncThunk(
  'investmentPlans/calculateROI',
  async ({ id, amount, duration }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const client = getApiClient(false, auth.user?.role);
      
      const response = await client.post(`/investment-plans/${id}/roi`, { amount, duration });
      return { id, roiCalculation: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate ROI');
    }
  }
);

// Initial state
const initialState = {
  activePlans: [],
  allPlans: [],
  currentPlan: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  
  // Loading states
  loading: {
    active: false,
    all: false,
    current: false,
    create: false,
    update: false,
    delete: false,
    validate: false,
    roi: false
  },
  
  // Error states
  errors: {
    active: null,
    all: null,
    current: null,
    create: null,
    update: null,
    delete: null,
    validate: null,
    roi: null
  },
  
  // UI states
  filters: {},
  selectedPlans: [],
  
  // Validation and ROI results
  validationResults: {},
  roiCalculations: {},
  
  // Cache management
  lastFetch: {
    active: null,
    all: null
  },
  
  // Feature flags
  isInitialized: false
};

// Investment Plans slice
const investmentPlansSlice = createSlice({
  name: 'investmentPlans',
  initialState,
  reducers: {
    // UI actions
    clearErrors: (state) => {
      state.errors = { ...initialState.errors };
    },
    
    clearError: (state, action) => {
      const errorType = action.payload;
      if (state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    selectPlan: (state, action) => {
      const planId = action.payload;
      if (!state.selectedPlans.includes(planId)) {
        state.selectedPlans.push(planId);
      }
    },
    
    deselectPlan: (state, action) => {
      const planId = action.payload;
      state.selectedPlans = state.selectedPlans.filter(id => id !== planId);
    },
    
    clearSelection: (state) => {
      state.selectedPlans = [];
    },
    
    togglePlanSelection: (state, action) => {
      const planId = action.payload;
      if (state.selectedPlans.includes(planId)) {
        state.selectedPlans = state.selectedPlans.filter(id => id !== planId);
      } else {
        state.selectedPlans.push(planId);
      }
    },
    
    // Cache management
    invalidateCache: (state, action) => {
      const cacheTypes = action.payload || ['active', 'all'];
      cacheTypes.forEach(type => {
        if (state.lastFetch[type]) {
          state.lastFetch[type] = null;
        }
      });
    },
    
    // Reset states
    resetCurrentPlan: (state) => {
      state.currentPlan = null;
      state.errors.current = null;
      state.loading.current = false;
    },
    
    resetValidationResults: (state) => {
      state.validationResults = {};
      state.errors.validate = null;
    },
    
    resetROICalculations: (state) => {
      state.roiCalculations = {};
      state.errors.roi = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Active Plans
      .addCase(fetchActivePlans.pending, (state) => {
        state.loading.active = true;
        state.errors.active = null;
      })
      .addCase(fetchActivePlans.fulfilled, (state, action) => {
        state.loading.active = false;
        state.activePlans = action.payload;
        state.lastFetch.active = Date.now();
        state.isInitialized = true;
      })
      .addCase(fetchActivePlans.rejected, (state, action) => {
        state.loading.active = false;
        state.errors.active = action.payload;
      })
      
      // Fetch All Plans
      .addCase(fetchAllPlans.pending, (state) => {
        state.loading.all = true;
        state.errors.all = null;
      })
      .addCase(fetchAllPlans.fulfilled, (state, action) => {
        state.loading.all = false;
        state.allPlans = action.payload.data;
        state.pagination = { ...state.pagination, ...action.payload.pagination };
        state.lastFetch.all = Date.now();
      })
      .addCase(fetchAllPlans.rejected, (state, action) => {
        state.loading.all = false;
        state.errors.all = action.payload;
      })
      
      // Fetch Plan by ID
      .addCase(fetchPlanById.pending, (state) => {
        state.loading.current = true;
        state.errors.current = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.loading.current = false;
        state.currentPlan = action.payload;
        
        // Update the plan in allPlans if it exists
        const index = state.allPlans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.allPlans[index] = action.payload;
        }
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.loading.current = false;
        state.errors.current = action.payload;
      })
      
      // Create Plan
      .addCase(createPlan.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.loading.create = false;
        state.allPlans.unshift(action.payload);
        
        // Add to active plans if it's active
        if (action.payload.isActive) {
          state.activePlans.unshift(action.payload);
        }
        
        // Update pagination
        state.pagination.total += 1;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
      })
      
      // Update Plan
      .addCase(updatePlan.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.loading.update = false;
        
        // Update in allPlans
        const allIndex = state.allPlans.findIndex(plan => plan.id === action.payload.id);
        if (allIndex !== -1) {
          state.allPlans[allIndex] = action.payload;
        }
        
        // Update in activePlans
        const activeIndex = state.activePlans.findIndex(plan => plan.id === action.payload.id);
        if (action.payload.isActive) {
          if (activeIndex !== -1) {
            state.activePlans[activeIndex] = action.payload;
          } else {
            state.activePlans.push(action.payload);
          }
        } else if (activeIndex !== -1) {
          state.activePlans.splice(activeIndex, 1);
        }
        
        // Update current plan if it's the same
        if (state.currentPlan?.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
      })
      
      // Delete Plan
      .addCase(deletePlan.pending, (state) => {
        state.loading.delete = true;
        state.errors.delete = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.loading.delete = false;
        const deletedId = action.payload;
        
        // Remove from allPlans
        state.allPlans = state.allPlans.filter(plan => plan.id !== deletedId);
        
        // Remove from activePlans
        state.activePlans = state.activePlans.filter(plan => plan.id !== deletedId);
        
        // Clear current plan if it was deleted
        if (state.currentPlan?.id === deletedId) {
          state.currentPlan = null;
        }
        
        // Remove from selection
        state.selectedPlans = state.selectedPlans.filter(id => id !== deletedId);
        
        // Update pagination
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.loading.delete = false;
        state.errors.delete = action.payload;
      })
      
      // Validate Amount
      .addCase(validatePlanAmount.pending, (state) => {
        state.loading.validate = true;
        state.errors.validate = null;
      })
      .addCase(validatePlanAmount.fulfilled, (state, action) => {
        state.loading.validate = false;
        const { id, validationResult } = action.payload;
        state.validationResults[id] = validationResult;
      })
      .addCase(validatePlanAmount.rejected, (state, action) => {
        state.loading.validate = false;
        state.errors.validate = action.payload;
      })
      
      // Calculate ROI
      .addCase(calculatePlanROI.pending, (state) => {
        state.loading.roi = true;
        state.errors.roi = null;
      })
      .addCase(calculatePlanROI.fulfilled, (state, action) => {
        state.loading.roi = false;
        const { id, roiCalculation } = action.payload;
        state.roiCalculations[id] = roiCalculation;
      })
      .addCase(calculatePlanROI.rejected, (state, action) => {
        state.loading.roi = false;
        state.errors.roi = action.payload;
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
  selectPlan,
  deselectPlan,
  clearSelection,
  togglePlanSelection,
  invalidateCache,
  resetCurrentPlan,
  resetValidationResults,
  resetROICalculations
} = investmentPlansSlice.actions;

// Selectors
export const selectInvestmentPlansState = (state) => state.investmentPlans;
export const selectActivePlans = (state) => state.investmentPlans.activePlans;
export const selectAllPlans = (state) => state.investmentPlans.allPlans;
export const selectCurrentPlan = (state) => state.investmentPlans.currentPlan;
export const selectPlansPagination = (state) => state.investmentPlans.pagination;
export const selectPlansLoading = (state) => state.investmentPlans.loading;
export const selectPlansErrors = (state) => state.investmentPlans.errors;
export const selectPlansFilters = (state) => state.investmentPlans.filters;
export const selectSelectedPlans = (state) => state.investmentPlans.selectedPlans;
export const selectValidationResults = (state) => state.investmentPlans.validationResults;
export const selectROICalculations = (state) => state.investmentPlans.roiCalculations;

// Complex selectors
export const selectPlanById = (state, planId) => {
  return state.investmentPlans.allPlans.find(plan => plan.id === planId) ||
         state.investmentPlans.activePlans.find(plan => plan.id === planId);
};

export const selectFilteredPlans = (state) => {
  const { allPlans, filters } = state.investmentPlans;
  
  if (Object.keys(filters).length === 0) return allPlans;
  
  return allPlans.filter(plan => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      
      const planValue = plan[key];
      
      if (typeof value === 'string') {
        return planValue?.toString().toLowerCase().includes(value.toLowerCase());
      }
      
      return planValue === value;
    });
  });
};

export const selectPlansStats = (state) => {
  const { activePlans, allPlans } = state.investmentPlans;
  
  return {
    totalPlans: allPlans.length,
    activePlans: activePlans.length,
    inactivePlans: allPlans.filter(plan => !plan.isActive).length,
    selectedCount: state.investmentPlans.selectedPlans.length
  };
};

export default investmentPlansSlice.reducer;