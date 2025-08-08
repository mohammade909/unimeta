import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApiClient, userApiClient } from '../../services/api/client';

// API endpoints
const REWARDS_ENDPOINTS = {
  ASSIGN_TO_USER: '/user-rewards/assign',
  ASSIGN_TO_ALL_USERS: '/user-rewards/assign-all',
  GET_USER_DASHBOARD: '/user-rewards/user/dashboard',
  GET_USER_REWARDS: '/',
  GET_USER_STATS: '/user-rewards/user/stats',
  UPDATE_USER_PROGRESS: '/user-rewards/user/progress',
  CLAIM_REWARD: '/user-rewards/:userRewardId/claim',
  SYSTEM_STATUS: '/user-rewards/system/status',
  GET_PROGRAMS: '/user-rewards/programs',
  CLEANUP_EXPIRED: '/user-rewards/cleanup-expired'
};

// Helper function to replace URL parameters
const replaceUrlParams = (url, params) => {
  let replacedUrl = url;
  Object.keys(params).forEach(key => {
    replacedUrl = replacedUrl.replace(`:${key}`, params[key]);
  });
  return replacedUrl;
};

// Async thunks for reward operations
export const assignRewardsToUser = createAsyncThunk(
  'rewards/assignRewardsToUser',
  async ({ userId, isAdmin = false }, { rejectWithValue }) => {
    try {
      const client = isAdmin ? adminApiClient : userApiClient;
      const response = await client.post(REWARDS_ENDPOINTS.ASSIGN_TO_USER, { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const assignRewardsToAllUsers = createAsyncThunk(
  'rewards/assignRewardsToAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApiClient.post(REWARDS_ENDPOINTS.ASSIGN_TO_ALL_USERS);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserRewardDashboard = createAsyncThunk(
  'rewards/getUserRewardDashboard',
  async ({ userId, isAdmin = false }, { rejectWithValue }) => {
    try {
      const client = isAdmin ? adminApiClient : userApiClient;
      const url = replaceUrlParams(REWARDS_ENDPOINTS.GET_USER_DASHBOARD, { userId });
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserRewards = createAsyncThunk(
  'rewards/getUserRewards',
  async (_, { rejectWithValue }) => {
    try {
      const client = userApiClient;
      // const url = replaceUrlParams(REWARDS_ENDPOINTS.GET_USER_REWARDS);
      const response = await userApiClient.get('/user-rewards');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const getUserBussiness = createAsyncThunk(
  'rewards/getUserBussiness',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApiClient.get('/user-rewards/bussiness');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserRewardStats = createAsyncThunk(
  'rewards/getUserRewardStats',
  async ({isAdmin = false }, { rejectWithValue }) => {
    try {
      const url = replaceUrlParams(REWARDS_ENDPOINTS.GET_USER_STATS,);
      const response = await userApiClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUserProgress = createAsyncThunk(
  'rewards/updateUserProgress',
  async ({ userId, rewardType, newProgress, isAdmin = false }, { rejectWithValue }) => {
    try {
      const client = isAdmin ? adminApiClient : userApiClient;
      const url = replaceUrlParams(REWARDS_ENDPOINTS.UPDATE_USER_PROGRESS, { userId });
      const response = await client.put(url, { rewardType, newProgress });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const claimReward = createAsyncThunk(
  'rewards/claimReward',
  async ({ userRewardId, isAdmin = false }, { rejectWithValue }) => {
    try {
      const client = isAdmin ? adminApiClient : userApiClient;
      const url = replaceUrlParams(REWARDS_ENDPOINTS.CLAIM_REWARD, { userRewardId });
      const response = await client.post(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRewardsSystemStatus = createAsyncThunk(
  'rewards/getRewardsSystemStatus',
  async ({ isAdmin = false }, { rejectWithValue }) => {
    try {
      const client = isAdmin ? adminApiClient : userApiClient;
      const response = await client.get(REWARDS_ENDPOINTS.SYSTEM_STATUS);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAvailableRewardPrograms = createAsyncThunk(
  'rewards/getAvailableRewardPrograms',
  async ({ isAdmin = false }, { rejectWithValue }) => {
    try {
      const client = isAdmin ? adminApiClient : userApiClient;
      const response = await client.get(REWARDS_ENDPOINTS.GET_PROGRAMS);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cleanupExpiredRewards = createAsyncThunk(
  'rewards/cleanupExpiredRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApiClient.post(REWARDS_ENDPOINTS.CLEANUP_EXPIRED);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  // User rewards data
  userRewards: [],
  userStats: null,
  userDashboard: null,
  bussiness:{},
  // System data
  systemStatus: null,
  availablePrograms: [],
  
  // Bulk operations
  bulkAssignmentResult: null,
  
  // Loading states
  loading: {
    assignToUser: false,
    assignToAll: false,
    userDashboard: false,
    userRewards: false,
    userBussiness:false,
    userStats: false,
    updateProgress: false,
    claimReward: false,
    systemStatus: false,
    programs: false,
    cleanup: false
  },
  
  // Error states
  errors: {
    assignToUser: null,
    assignToAll: null,
    userDashboard: null,
    userRewards: null,
    userStats: null,
    updateProgress: null,
    claimReward: null,
    systemStatus: null,
    userBussiness:null,
    programs: null,
    cleanup: null
  },
  
  // Success states
  success: {
    assignToUser: false,
    assignToAll: false,
    updateProgress: false,
    claimReward: false,
    cleanup: false
  }
};

// Rewards slice
const userRewardsSlice = createSlice({
  name: 'userRewards',
  initialState,
  reducers: {
    // Clear specific error
    clearError: (state, action) => {
      const { errorType } = action.payload;
      if (state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },
    
    // Clear all errors
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key] = null;
      });
    },
    
    // Clear success states
    clearSuccess: (state, action) => {
      const { successType } = action.payload;
      if (state.success[successType]) {
        state.success[successType] = false;
      }
    },
    
    // Clear all success states
    clearAllSuccess: (state) => {
      Object.keys(state.success).forEach(key => {
        state.success[key] = false;
      });
    },
    
    // Reset specific section
    resetSection: (state, action) => {
      const { section } = action.payload;
      switch (section) {
        case 'userRewards':
          state.userRewards = [];
          break;
        case 'userStats':
          state.userStats = null;
          break;
        case 'userDashboard':
          state.userDashboard = null;
          break;
        case 'systemStatus':
          state.systemStatus = null;
          break;
        case 'programs':
          state.availablePrograms = [];
          break;
        case 'bulkAssignment':
          state.bulkAssignmentResult = null;
          break;
        default:
          break;
      }
    },
    
    // Reset entire state
    resetRewardsState: () => initialState
  },
  
  extraReducers: (builder) => {
    // Assign rewards to user
    builder
      .addCase(assignRewardsToUser.pending, (state) => {
        state.loading.assignToUser = true;
        state.errors.assignToUser = null;
        state.success.assignToUser = false;
      })
      .addCase(assignRewardsToUser.fulfilled, (state, action) => {
        state.loading.assignToUser = false;
        state.success.assignToUser = true;
        // You might want to update userRewards here if needed
      })
      .addCase(assignRewardsToUser.rejected, (state, action) => {
        state.loading.assignToUser = false;
        state.errors.assignToUser = action.payload;
      })
      
    // Assign rewards to all users
      .addCase(assignRewardsToAllUsers.pending, (state) => {
        state.loading.assignToAll = true;
        state.errors.assignToAll = null;
        state.success.assignToAll = false;
      })
      .addCase(assignRewardsToAllUsers.fulfilled, (state, action) => {
        state.loading.assignToAll = false;
        state.success.assignToAll = true;
        state.bulkAssignmentResult = action.payload;
      })
      .addCase(assignRewardsToAllUsers.rejected, (state, action) => {
        state.loading.assignToAll = false;
        state.errors.assignToAll = action.payload;
      })
      
    // Get user reward dashboard
      .addCase(getUserRewardDashboard.pending, (state) => {
        state.loading.userDashboard = true;
        state.errors.userDashboard = null;
      })
      .addCase(getUserRewardDashboard.fulfilled, (state, action) => {
        state.loading.userDashboard = false;
        state.userDashboard = action.payload;
      })
      .addCase(getUserRewardDashboard.rejected, (state, action) => {
        state.loading.userDashboard = false;
        state.errors.userDashboard = action.payload;
      })
      
    // Get user rewards
      .addCase(getUserRewards.pending, (state) => {
        state.loading.userRewards = true;
        state.errors.userRewards = null;
      })
      .addCase(getUserRewards.fulfilled, (state, action) => {
        
        state.loading.userRewards = false;
        state.userRewards = action.payload.data;
      })
      .addCase(getUserRewards.rejected, (state, action) => {
        state.loading.userRewards = false;
        state.errors.userRewards = action.payload;
      })


       .addCase(getUserBussiness.pending, (state) => {
        state.loading.userBussiness = true;
        state.errors.userBussiness = null;
      })
      .addCase(getUserBussiness.fulfilled, (state, action) => {
        state.loading.userBussiness = false;
        state.bussiness = action.payload.businessData;
      })
      .addCase(getUserBussiness.rejected, (state, action) => {
        state.loading.userBussiness = false;
        state.errors.userBussiness = action.payload;
      })
      
    // Get user stats
      .addCase(getUserRewardStats.pending, (state) => {
        state.loading.userStats = true;
        state.errors.userStats = null;
      })
      .addCase(getUserRewardStats.fulfilled, (state, action) => {
        state.loading.userStats = false;
        state.userStats = action.payload;
      })
      .addCase(getUserRewardStats.rejected, (state, action) => {
        state.loading.userStats = false;
        state.errors.userStats = action.payload;
      })
      
    // Update user progress
      .addCase(updateUserProgress.pending, (state) => {
        state.loading.updateProgress = true;
        state.errors.updateProgress = null;
        state.success.updateProgress = false;
      })
      .addCase(updateUserProgress.fulfilled, (state, action) => {
        state.loading.updateProgress = false;
        state.success.updateProgress = true;
        // Update userRewards if they exist
        if (state.userRewards.length > 0) {
          // You might want to update specific rewards based on the response
          // This depends on your API response structure
        }
      })
      .addCase(updateUserProgress.rejected, (state, action) => {
        state.loading.updateProgress = false;
        state.errors.updateProgress = action.payload;
      })
      
    // Claim reward
      .addCase(claimReward.pending, (state) => {
        state.loading.claimReward = true;
        state.errors.claimReward = null;
        state.success.claimReward = false;
      })
      .addCase(claimReward.fulfilled, (state, action) => {
        state.loading.claimReward = false;
        state.success.claimReward = true;
        // Update the specific reward in userRewards if needed
      })
      .addCase(claimReward.rejected, (state, action) => {
        state.loading.claimReward = false;
        state.errors.claimReward = action.payload;
      })
      
    // Get system status
      .addCase(getRewardsSystemStatus.pending, (state) => {
        state.loading.systemStatus = true;
        state.errors.systemStatus = null;
      })
      .addCase(getRewardsSystemStatus.fulfilled, (state, action) => {
        state.loading.systemStatus = false;
        state.systemStatus = action.payload;
      })
      .addCase(getRewardsSystemStatus.rejected, (state, action) => {
        state.loading.systemStatus = false;
        state.errors.systemStatus = action.payload;
      })
      
    // Get available programs
      .addCase(getAvailableRewardPrograms.pending, (state) => {
        state.loading.programs = true;
        state.errors.programs = null;
      })
      .addCase(getAvailableRewardPrograms.fulfilled, (state, action) => {
        state.loading.programs = false;
        state.availablePrograms = action.payload;
      })
      .addCase(getAvailableRewardPrograms.rejected, (state, action) => {
        state.loading.programs = false;
        state.errors.programs = action.payload;
      })
      
    // Cleanup expired rewards
      .addCase(cleanupExpiredRewards.pending, (state) => {
        state.loading.cleanup = true;
        state.errors.cleanup = null;
        state.success.cleanup = false;
      })
      .addCase(cleanupExpiredRewards.fulfilled, (state, action) => {
        state.loading.cleanup = false;
        state.success.cleanup = true;
      })
      .addCase(cleanupExpiredRewards.rejected, (state, action) => {
        state.loading.cleanup = false;
        state.errors.cleanup = action.payload;
      });
  }
});

// Export actions
export const {
  clearError,
  clearAllErrors,
  clearSuccess,
  clearAllSuccess,
  resetSection,
  resetRewardsState
} = userRewardsSlice.actions;

// Selectors
export const selectRewardsState = (state) => state.userRewards;
export const selectUserBussiness = (state) => state.userRewards.bussiness;
export const selectUserRewards = (state) => state.userRewards.userRewards;
export const selectUserStats = (state) => state.userRewards.userStats;
export const selectUserDashboard = (state) => state.userRewards.userDashboard;
export const selectSystemStatus = (state) => state.userRewards.systemStatus;
export const selectAvailablePrograms = (state) => state.userRewards.availablePrograms;
export const selectBulkAssignmentResult = (state) => state.userRewards.bulkAssignmentResult;
export const selectRewardsLoading = (state) => state.userRewards.loading;
export const selectRewardsErrors = (state) => state.userRewards.errors;
export const selectRewardsSuccess = (state) => state.userRewards.success;

// Export reducer
export default userRewardsSlice.reducer;