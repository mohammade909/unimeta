// store/slices/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi, adminApi } from "../../services/api/userApis";

// Async Thunks with optimized error handling
export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllUsers({ page });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAllNonUsers = createAsyncThunk(
  "users/getAllNonUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllNonUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAllRewards = createAsyncThunk(
  "users/getAllRewards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllRewards();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getUser = createAsyncThunk(
  "users/getUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.getUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getUserByEmail = createAsyncThunk(
  "users/getUserByEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserByEmail(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.deleteUser(id);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser(id, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const sendRewardNotification = createAsyncThunk(
  "users/sendRewardNotification",
  async (rewardData, { rejectWithValue }) => {
    try {
      const response = await userApi.sendRewardNotification(rewardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getDefaulterNotification = createAsyncThunk(
  "users/getDefaulterNotification",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.getDefaulterNotification(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Profile Management Thunks
export const getProfile = createAsyncThunk(
  "users/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile();
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const selfProcessROI = createAsyncThunk(
  "users/selfProcessROI",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.selfRoiProcess();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "users/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      // const response = await userApi.updateProfile(profileData);
      // return response.data;
      console.log("Updating profile with data:", profileData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Income Data Thunks
export const getIncomeStats = createAsyncThunk(
  "users/getIncomeStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getIncomeStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getIncomeHistory = createAsyncThunk(
  "users/getIncomeHistory",
  async (params, { rejectWithValue }) => {
    try {
      const response = await userApi.getIncomeHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Network Data Thunks
export const getNetworkTree = createAsyncThunk(
  "users/getNetworkTree",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getNetworkTree();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReferrals = createAsyncThunk(
  "users/getReferrals",
  async (params, { rejectWithValue }) => {
    try {
      const response = await userApi.getReferrals(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Referral System Thunks
export const generateReferralLink = createAsyncThunk(
  "users/generateReferralLink",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.generateReferralLink();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReferralStats = createAsyncThunk(
  "users/getReferralStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getReferralStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial State
const initialState = {
  // User Lists
  allUsers: [],
  allNonUsers: [],
  totalPages: 0,
  currentPage: 1,

  // Single User Data
  singleUser: null,
  emailUser: null,
  profile: null,
  roiData: null,

  // Rewards and Notifications
  allRewards: [],
  userRewardNotification: null,

  // Income Data
  incomeStats: null,
  incomeHistory: [],

  // Network Data
  networkTree: null,
  referrals: [],

  // Referral System
  referralLink: null,
  referralStats: null,

  // UI State
  loading: {
    users: false,
    profile: false,
    income: false,
    network: false,
    referrals: false,
    general: false,
    roi: false,
  },
  error: null,
  message: null,

  // Filters and Search
  filters: {
    search: "",
    status: "all",
    sortBy: "created_at",
    sortOrder: "desc",
  },
};



const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Clear states
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.roiData = null;
    },
    clearSingleUser: (state) => {
      state.singleUser = null;
    },

    // Filter actions
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSortFilter: (state, action) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Optimistic updates
    optimisticUpdateUser: (state, action) => {
      const { id, updates } = action.payload;
      const userIndex = state.allUsers.findIndex((user) => user.id === id);
      if (userIndex !== -1) {
        state.allUsers[userIndex] = {
          ...state.allUsers[userIndex],
          ...updates,
        };
      }
    },

    optimisticDeleteUser: (state, action) => {
      const id = action.payload;
      state.allUsers = state.allUsers.filter((user) => user.id !== id);
    },

    // Pagination
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading.users = false;
        state.allUsers = action.payload.users || action.payload.users || [];
        state.totalPages = action.payload.pagination.total || 1;
        state.currentPage = action.payload.pagination.page || 1;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading.users = false;
        state.error = action.payload;
      })

      // Get All Non-Users
      .addCase(getAllNonUsers.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(getAllNonUsers.fulfilled, (state, action) => {
        state.loading.users = false;
        state.allNonUsers =
          action.payload.allnonusers || action.payload.nonUsers || [];
      })
      .addCase(getAllNonUsers.rejected, (state, action) => {
        state.loading.users = false;
        state.error = action.payload;
      })

      // Get All Rewards
      .addCase(getAllRewards.pending, (state) => {
        state.loading.general = true;
        state.error = null;
      })
      .addCase(getAllRewards.fulfilled, (state, action) => {
        state.loading.general = false;
        state.allRewards =
          action.payload.allrewards || action.payload.rewards || [];
      })
      .addCase(getAllRewards.rejected, (state, action) => {
        state.loading.general = false;
        state.error = action.payload;
      })

      // Get Single User
      .addCase(getUser.pending, (state) => {
        state.loading.general = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading.general = false;
        state.singleUser =
          action.payload.singleuser || action.payload.user || action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading.general = false;
        state.error = action.payload;
      })

      // Get User by Email
      .addCase(getUserByEmail.pending, (state) => {
        state.loading.general = true;
        state.error = null;
      })
      .addCase(getUserByEmail.fulfilled, (state, action) => {
        state.loading.general = false;
        state.emailUser =
          action.payload.emailuser || action.payload.user || action.payload;
      })
      .addCase(getUserByEmail.rejected, (state, action) => {
        state.loading.general = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading.general = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading.general = false;
        state.message = action.payload.message;
        state.allUsers = state.allUsers.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading.general = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading.general = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading.general = false;
        state.message = action.payload.message;
        // Update user in the list if it exists
        const updatedUser = action.payload.user || action.payload;
        const userIndex = state.allUsers.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (userIndex !== -1) {
          state.allUsers[userIndex] = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading.general = false;
        state.error = action.payload;
      })

      // Profile Management
      .addCase(getProfile.pending, (state) => {
        state.loading.profile = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload.user || action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.payload;
      })
      .addCase(selfProcessROI.pending, (state) => {
        state.loading.roi = true;
        state.error = null;
      })
      .addCase(selfProcessROI.fulfilled, (state, action) => {
        
        state.loading.roi = false;
        state.roiData = action.payload.data;
      })
      .addCase(selfProcessROI.rejected, (state, action) => {
        state.loading.roi  = false;
        state.error = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading.profile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload.profile || action.payload;
        state.message =
          action.payload.message || "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.payload;
      })

      // Income Data
      .addCase(getIncomeStats.pending, (state) => {
        state.loading.income = true;
        state.error = null;
      })
      .addCase(getIncomeStats.fulfilled, (state, action) => {
        state.loading.income = false;
        state.incomeStats = action.payload.stats || action.payload;
      })
      .addCase(getIncomeStats.rejected, (state, action) => {
        state.loading.income = false;
        state.error = action.payload;
      })

      .addCase(getIncomeHistory.pending, (state) => {
        state.loading.income = true;
        state.error = null;
      })
      .addCase(getIncomeHistory.fulfilled, (state, action) => {
        state.loading.income = false;
        state.incomeHistory = action.payload.history || action.payload;
      })
      .addCase(getIncomeHistory.rejected, (state, action) => {
        state.loading.income = false;
        state.error = action.payload;
      })

      // Network Data
      .addCase(getNetworkTree.pending, (state) => {
        state.loading.network = true;
        state.error = null;
      })
      .addCase(getNetworkTree.fulfilled, (state, action) => {
        state.loading.network = false;
        state.networkTree = action.payload.tree || action.payload;
      })
      .addCase(getNetworkTree.rejected, (state, action) => {
        state.loading.network = false;
        state.error = action.payload;
      })

      .addCase(getReferrals.pending, (state) => {
        state.loading.referrals = true;
        state.error = null;
      })
      .addCase(getReferrals.fulfilled, (state, action) => {
        state.loading.referrals = false;
        state.referrals = action.payload.referrals || action.payload;
      })
      .addCase(getReferrals.rejected, (state, action) => {
        state.loading.referrals = false;
        state.error = action.payload;
      })

      // Referral System
      .addCase(generateReferralLink.pending, (state) => {
        state.loading.referrals = true;
        state.error = null;
      })
      .addCase(generateReferralLink.fulfilled, (state, action) => {
        state.loading.referrals = false;
        state.referralLink = action.payload.link || action.payload;
        state.message =
          action.payload.message || "Referral link generated successfully";
      })
      .addCase(generateReferralLink.rejected, (state, action) => {
        state.loading.referrals = false;
        state.error = action.payload;
      })

      .addCase(getReferralStats.pending, (state) => {
        state.loading.referrals = true;
        state.error = null;
      })
      .addCase(getReferralStats.fulfilled, (state, action) => {
        state.loading.referrals = false;
        state.referralStats = action.payload.stats || action.payload;
      })
      .addCase(getReferralStats.rejected, (state, action) => {
        state.loading.referrals = false;
        state.error = action.payload;
      })

      // Reward Notifications
      .addCase(sendRewardNotification.pending, (state) => {
        state.loading.general = true;
        state.error = null;
      })
      .addCase(sendRewardNotification.fulfilled, (state, action) => {
        state.loading.general = false;
        state.message =
          action.payload.message || "Reward notification sent successfully";
      })
      .addCase(sendRewardNotification.rejected, (state, action) => {
        state.loading.general = false;
        state.error = action.payload;
      })

      .addCase(getDefaulterNotification.pending, (state) => {
        state.loading.general = true;
        state.error = null;
      })
      .addCase(getDefaulterNotification.fulfilled, (state, action) => {
        state.loading.general = false;
        state.userRewardNotification =
          action.payload.userrewardnotification || action.payload;
      })
      .addCase(getDefaulterNotification.rejected, (state, action) => {
        state.loading.general = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  clearMessage,
  clearSingleUser,
  setSearchFilter,
  setStatusFilter,
  setSortFilter,
  resetFilters,
  optimisticUpdateUser,
  optimisticDeleteUser,
  setCurrentPage,
} = usersSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.allUsers;
export const selectAllNonUsers = (state) => state.users.allNonUsers;
export const selectSingleUser = (state) => state.users.singleUser;
export const selectProfile = (state) => state.users.profile;
export const selectIncomeStats = (state) => state.users.incomeStats;
export const selectIncomeHistory = (state) => state.users.incomeHistory;
export const selectNetworkTree = (state) => state.users.networkTree;
export const selectReferrals = (state) => state.users.referrals;
export const selectReferralStats = (state) => state.users.referralStats;
export const selectLoading = (state) => state.users.loading;
export const selectError = (state) => state.users.error;
export const selectMessage = (state) => state.users.message;
export const selectFilters = (state) => state.users.filters;
export const selectPagination = (state) => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages,
});

// Filtered selectors
export const selectFilteredUsers = (state) => {
  const users = selectAllUsers(state);
  const filters = selectFilters(state);

  return users
    .filter((user) => {
      const matchesSearch =
        !filters.search ||
        user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" || user.status === filters.status;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
      if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
      return 0;
    });
};

export default usersSlice.reducer;
