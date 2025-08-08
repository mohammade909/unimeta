// store/slices/treeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApiClient, adminApiClient } from "../../services/api/client";

// Async thunks for MLM Tree operations

// GET operations
export const getUserTreePosition = createAsyncThunk(
  "tree/getUserTreePosition",
  async ({ userId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/position`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get user tree position" }
      );
    }
  }
);

export const getDirectChildren = createAsyncThunk(
  "tree/getDirectChildren",
  async (
    { userId, page = 1, limit = 20, useAdmin = false },
    { rejectWithValue }
  ) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`tree/user/${userId}/direct-children`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get direct children" }
      );
    }
  }
);

export const getCompleteTree = createAsyncThunk(
  "tree/getCompleteTree",
  async ({ userId, maxDepth = 10, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`tree/user/${userId}/complete-tree`, {
        params: { maxDepth },
      });
      console.log(response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get complete tree" }
      );
    }
  }
);

export const getTreeByLevels = createAsyncThunk(
  "tree/getTreeByLevels",
  async (
    { userId, startLevel = 1, endLevel = 5, useAdmin = false },
    { rejectWithValue }
  ) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/tree-by-levels`, {
        params: { startLevel, endLevel },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get tree by levels" }
      );
    }
  }
);

export const getTeamStatistics = createAsyncThunk(
  "tree/getTeamStatistics",
  async ({ userId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/team-statistics`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get team statistics" }
      );
    }
  }
);

export const getGenealogyReport = createAsyncThunk(
  "tree/getGenealogyReport",
  async ({ userId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(
        `/tree/user/${userId}/genealogy-report`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get genealogy report" }
      );
    }
  }
);

export const getDashboardData = createAsyncThunk(
  "tree/getDashboardData",
  async ({ userId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/dashboard`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get dashboard data" }
      );
    }
  }
);

export const getTeamPerformanceReport = createAsyncThunk(
  "tree/getTeamPerformanceReport",
  async (
    { userId, startDate, endDate, useAdmin = false },
    { rejectWithValue }
  ) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(
        `/tree/user/${userId}/performance-report`,
        {
          params: { startDate, endDate },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get performance report" }
      );
    }
  }
);

export const searchUsersInTree = createAsyncThunk(
  "tree/searchUsersInTree",
  async (
    { userId, search, limit = 50, useAdmin = false },
    { rejectWithValue }
  ) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/search`, {
        params: { search, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to search users" }
      );
    }
  }
);

export const getQuickStats = createAsyncThunk(
  "tree/getQuickStats",
  async ({ userId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/quick-stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get quick stats" }
      );
    }
  }
);

export const getUpline = createAsyncThunk(
  "tree/getUpline",
  async ({ userId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/upline`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get upline" }
      );
    }
  }
);

export const getUsersAtLevel = createAsyncThunk(
  "tree/getUsersAtLevel",
  async ({ userId, level, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/level/${level}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get users at level" }
      );
    }
  }
);

export const getBinaryTree = createAsyncThunk(
  "tree/getBinaryTree",
  async ({ userId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.get(`/tree/user/${userId}/binary-tree`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get binary tree" }
      );
    }
  }
);

// POST operations
export const addUserToTree = createAsyncThunk(
  "tree/addUserToTree",
  async ({ userId, parentId, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.post("/tree/add-user", {
        userId,
        parentId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add user to tree" }
      );
    }
  }
);

export const updateBusinessVolume = createAsyncThunk(
  "tree/updateBusinessVolume",
  async ({ userId, amount, useAdmin = false }, { rejectWithValue }) => {
    try {
      const client = useAdmin ? adminApiClient : userApiClient;
      const response = await client.post(
        `/tree/user/${userId}/update-business-volume`,
        {
          amount,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update business volume" }
      );
    }
  }
);

// Initial state
const initialState = {
  // User position data
  userPosition: null,
  userPositionLoading: false,
  userPositionError: null,

  // Direct children data
  directChildren: [],
  directChildrenPagination: null,
  directChildrenLoading: false,
  directChildrenError: null,

  // Complete tree data
  completeTree: null,
  completeTreeLoading: false,
  completeTreeError: null,

  // Tree by levels data
  treeByLevels: null,
  treeByLevelsLoading: false,
  treeByLevelsError: null,

  // Team statistics data
  teamStatistics: null,
  teamStatisticsLoading: false,
  teamStatisticsError: null,

  // Genealogy report data
  genealogyReport: null,
  genealogyReportLoading: false,
  genealogyReportError: null,

  // Dashboard data
  dashboardData: null,
  dashboardDataLoading: false,
  dashboardDataError: null,

  // Performance report data
  performanceReport: null,
  performanceReportLoading: false,
  performanceReportError: null,

  // Search results
  searchResults: [],
  searchLoading: false,
  searchError: null,

  // Quick stats
  quickStats: null,
  quickStatsLoading: false,
  quickStatsError: null,

  // Upline data
  upline: null,
  uplineLoading: false,
  uplineError: null,

  // Users at level
  usersAtLevel: null,
  usersAtLevelLoading: false,
  usersAtLevelError: null,

  // Binary tree
  binaryTree: null,
  binaryTreeLoading: false,
  binaryTreeError: null,

  // Operation states
  addUserLoading: false,
  addUserError: null,
  addUserSuccess: false,

  updateVolumeLoading: false,
  updateVolumeError: null,
  updateVolumeSuccess: false,

  // Selected user for operations
  selectedUserId: null,
};

// Slice
const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    // Clear individual states
    clearUserPosition: (state) => {
      state.userPosition = null;
      state.userPositionError = null;
    },
    clearDirectChildren: (state) => {
      state.directChildren = [];
      state.directChildrenPagination = null;
      state.directChildrenError = null;
    },
    clearCompleteTree: (state) => {
      state.completeTree = null;
      state.completeTreeError = null;
    },
    clearTreeByLevels: (state) => {
      state.treeByLevels = null;
      state.treeByLevelsError = null;
    },
    clearTeamStatistics: (state) => {
      state.teamStatistics = null;
      state.teamStatisticsError = null;
    },
    clearGenealogyReport: (state) => {
      state.genealogyReport = null;
      state.genealogyReportError = null;
    },
    clearDashboardData: (state) => {
      state.dashboardData = null;
      state.dashboardDataError = null;
    },
    clearPerformanceReport: (state) => {
      state.performanceReport = null;
      state.performanceReportError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    clearQuickStats: (state) => {
      state.quickStats = null;
      state.quickStatsError = null;
    },
    clearUpline: (state) => {
      state.upline = null;
      state.uplineError = null;
    },
    clearUsersAtLevel: (state) => {
      state.usersAtLevel = null;
      state.usersAtLevelError = null;
    },
    clearBinaryTree: (state) => {
      state.binaryTree = null;
      state.binaryTreeError = null;
    },

    // Clear all errors
    clearAllErrors: (state) => {
      state.userPositionError = null;
      state.directChildrenError = null;
      state.completeTreeError = null;
      state.treeByLevelsError = null;
      state.teamStatisticsError = null;
      state.genealogyReportError = null;
      state.dashboardDataError = null;
      state.performanceReportError = null;
      state.searchError = null;
      state.quickStatsError = null;
      state.uplineError = null;
      state.usersAtLevelError = null;
      state.binaryTreeError = null;
      state.addUserError = null;
      state.updateVolumeError = null;
    },

    // Clear all data
    clearAllData: (state) => {
      return { ...initialState };
    },

    // Reset operation states
    resetAddUserState: (state) => {
      state.addUserLoading = false;
      state.addUserError = null;
      state.addUserSuccess = false;
    },
    resetUpdateVolumeState: (state) => {
      state.updateVolumeLoading = false;
      state.updateVolumeError = null;
      state.updateVolumeSuccess = false;
    },

    // Set selected user
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // User tree position
    builder
      .addCase(getUserTreePosition.pending, (state) => {
        state.userPositionLoading = true;
        state.userPositionError = null;
      })
      .addCase(getUserTreePosition.fulfilled, (state, action) => {
        state.userPositionLoading = false;
        state.userPosition = action.payload.data;
      })
      .addCase(getUserTreePosition.rejected, (state, action) => {
        state.userPositionLoading = false;
        state.userPositionError =
          action.payload?.message || "Failed to get user tree position";
      });

    // Direct children
    builder
      .addCase(getDirectChildren.pending, (state) => {
        state.directChildrenLoading = true;
        state.directChildrenError = null;
      })
      .addCase(getDirectChildren.fulfilled, (state, action) => {
        state.directChildrenLoading = false;
        state.directChildren = action.payload.data.children;
        state.directChildrenPagination = action.payload.data.pagination;
      })
      .addCase(getDirectChildren.rejected, (state, action) => {
        state.directChildrenLoading = false;
        state.directChildrenError =
          action.payload?.message || "Failed to get direct children";
      });

    // Complete tree
    builder
      .addCase(getCompleteTree.pending, (state) => {
        state.completeTreeLoading = true;
        state.completeTreeError = null;
      })
      .addCase(getCompleteTree.fulfilled, (state, action) => {
        state.completeTreeLoading = false;
        state.completeTree = action.payload.data;
      })
      .addCase(getCompleteTree.rejected, (state, action) => {
        state.completeTreeLoading = false;
        state.completeTreeError =
          action.payload?.message || "Failed to get complete tree";
      });

    // Tree by levels
    builder
      .addCase(getTreeByLevels.pending, (state) => {
        state.treeByLevelsLoading = true;
        state.treeByLevelsError = null;
      })
      .addCase(getTreeByLevels.fulfilled, (state, action) => {
        state.treeByLevelsLoading = false;
        state.treeByLevels = action.payload.data;
      })
      .addCase(getTreeByLevels.rejected, (state, action) => {
        state.treeByLevelsLoading = false;
        state.treeByLevelsError =
          action.payload?.message || "Failed to get tree by levels";
      });

    // Team statistics
    builder
      .addCase(getTeamStatistics.pending, (state) => {
        state.teamStatisticsLoading = true;
        state.teamStatisticsError = null;
      })
      .addCase(getTeamStatistics.fulfilled, (state, action) => {
        state.teamStatisticsLoading = false;
        state.teamStatistics = action.payload.data;
      })
      .addCase(getTeamStatistics.rejected, (state, action) => {
        state.teamStatisticsLoading = false;
        state.teamStatisticsError =
          action.payload?.message || "Failed to get team statistics";
      });

    // Genealogy report
    builder
      .addCase(getGenealogyReport.pending, (state) => {
        state.genealogyReportLoading = true;
        state.genealogyReportError = null;
      })
      .addCase(getGenealogyReport.fulfilled, (state, action) => {
        state.genealogyReportLoading = false;
        state.genealogyReport = action.payload.data;
      })
      .addCase(getGenealogyReport.rejected, (state, action) => {
        state.genealogyReportLoading = false;
        state.genealogyReportError =
          action.payload?.message || "Failed to get genealogy report";
      });

    // Dashboard data
    builder
      .addCase(getDashboardData.pending, (state) => {
        state.dashboardDataLoading = true;
        state.dashboardDataError = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.dashboardDataLoading = false;
        state.dashboardData = action.payload.data;
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.dashboardDataLoading = false;
        state.dashboardDataError =
          action.payload?.message || "Failed to get dashboard data";
      });

    // Performance report
    builder
      .addCase(getTeamPerformanceReport.pending, (state) => {
        state.performanceReportLoading = true;
        state.performanceReportError = null;
      })
      .addCase(getTeamPerformanceReport.fulfilled, (state, action) => {
        state.performanceReportLoading = false;
        state.performanceReport = action.payload.data;
      })
      .addCase(getTeamPerformanceReport.rejected, (state, action) => {
        state.performanceReportLoading = false;
        state.performanceReportError =
          action.payload?.message || "Failed to get performance report";
      });

    // Search users
    builder
      .addCase(searchUsersInTree.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchUsersInTree.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data.results;
      })
      .addCase(searchUsersInTree.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload?.message || "Failed to search users";
      });

    // Quick stats
    builder
      .addCase(getQuickStats.pending, (state) => {
        state.quickStatsLoading = true;
        state.quickStatsError = null;
      })
      .addCase(getQuickStats.fulfilled, (state, action) => {
        state.quickStatsLoading = false;
        state.quickStats = action.payload.data;
      })
      .addCase(getQuickStats.rejected, (state, action) => {
        state.quickStatsLoading = false;
        state.quickStatsError =
          action.payload?.message || "Failed to get quick stats";
      });

    // Upline
    builder
      .addCase(getUpline.pending, (state) => {
        state.uplineLoading = true;
        state.uplineError = null;
      })
      .addCase(getUpline.fulfilled, (state, action) => {
        state.uplineLoading = false;
        state.upline = action.payload.data;
      })
      .addCase(getUpline.rejected, (state, action) => {
        state.uplineLoading = false;
        state.uplineError = action.payload?.message || "Failed to get upline";
      });

    // Users at level
    builder
      .addCase(getUsersAtLevel.pending, (state) => {
        state.usersAtLevelLoading = true;
        state.usersAtLevelError = null;
      })
      .addCase(getUsersAtLevel.fulfilled, (state, action) => {
        state.usersAtLevelLoading = false;
        state.usersAtLevel = action.payload.data;
      })
      .addCase(getUsersAtLevel.rejected, (state, action) => {
        state.usersAtLevelLoading = false;
        state.usersAtLevelError =
          action.payload?.message || "Failed to get users at level";
      });

    // Binary tree
    builder
      .addCase(getBinaryTree.pending, (state) => {
        state.binaryTreeLoading = true;
        state.binaryTreeError = null;
      })
      .addCase(getBinaryTree.fulfilled, (state, action) => {
        state.binaryTreeLoading = false;
        state.binaryTree = action.payload.data;
      })
      .addCase(getBinaryTree.rejected, (state, action) => {
        state.binaryTreeLoading = false;
        state.binaryTreeError =
          action.payload?.message || "Failed to get binary tree";
      });

    // Add user to tree
    builder
      .addCase(addUserToTree.pending, (state) => {
        state.addUserLoading = true;
        state.addUserError = null;
        state.addUserSuccess = false;
      })
      .addCase(addUserToTree.fulfilled, (state, action) => {
        state.addUserLoading = false;
        state.addUserSuccess = true;
      })
      .addCase(addUserToTree.rejected, (state, action) => {
        state.addUserLoading = false;
        state.addUserError =
          action.payload?.message || "Failed to add user to tree";
      });

    // Update business volume
    builder
      .addCase(updateBusinessVolume.pending, (state) => {
        state.updateVolumeLoading = true;
        state.updateVolumeError = null;
        state.updateVolumeSuccess = false;
      })
      .addCase(updateBusinessVolume.fulfilled, (state, action) => {
        state.updateVolumeLoading = false;
        state.updateVolumeSuccess = true;
      })
      .addCase(updateBusinessVolume.rejected, (state, action) => {
        state.updateVolumeLoading = false;
        state.updateVolumeError =
          action.payload?.message || "Failed to update business volume";
      });
  },
});

// Export actions
export const {
  clearUserPosition,
  clearDirectChildren,
  clearCompleteTree,
  clearTreeByLevels,
  clearTeamStatistics,
  clearGenealogyReport,
  clearDashboardData,
  clearPerformanceReport,
  clearSearchResults,
  clearQuickStats,
  clearUpline,
  clearUsersAtLevel,
  clearBinaryTree,
  clearAllErrors,
  clearAllData,
  resetAddUserState,
  resetUpdateVolumeState,
  setSelectedUserId,
} = treeSlice.actions;

// Export reducer
export default treeSlice.reducer;

// Selectors
export const selectUserPosition = (state) => state.tree.userPosition;
export const selectUserPositionLoading = (state) =>
  state.tree.userPositionLoading;
export const selectUserPositionError = (state) => state.tree.userPositionError;

export const selectDirectChildren = (state) => state.tree.directChildren;
export const selectDirectChildrenPagination = (state) =>
  state.tree.directChildrenPagination;
export const selectDirectChildrenLoading = (state) =>
  state.tree.directChildrenLoading;
export const selectDirectChildrenError = (state) =>
  state.tree.directChildrenError;

export const selectCompleteTree = (state) => state.tree.completeTree;
export const selectCompleteTreeLoading = (state) =>
  state.tree.completeTreeLoading;
export const selectCompleteTreeError = (state) => state.tree.completeTreeError;

export const selectTreeByLevels = (state) => state.tree.treeByLevels;
export const selectTreeByLevelsLoading = (state) =>
  state.tree.treeByLevelsLoading;
export const selectTreeByLevelsError = (state) => state.tree.treeByLevelsError;

export const selectTeamStatistics = (state) => state.tree.teamStatistics;
export const selectTeamStatisticsLoading = (state) =>
  state.tree.teamStatisticsLoading;
export const selectTeamStatisticsError = (state) =>
  state.tree.teamStatisticsError;

export const selectGenealogyReport = (state) => state.tree.genealogyReport;
export const selectGenealogyReportLoading = (state) =>
  state.tree.genealogyReportLoading;
export const selectGenealogyReportError = (state) =>
  state.tree.genealogyReportError;

export const selectDashboardData = (state) => state.tree.dashboardData;
export const selectDashboardDataLoading = (state) =>
  state.tree.dashboardDataLoading;
export const selectDashboardDataError = (state) =>
  state.tree.dashboardDataError;

export const selectPerformanceReport = (state) => state.tree.performanceReport;
export const selectPerformanceReportLoading = (state) =>
  state.tree.performanceReportLoading;
export const selectPerformanceReportError = (state) =>
  state.tree.performanceReportError;

export const selectSearchResults = (state) => state.tree.searchResults;
export const selectSearchLoading = (state) => state.tree.searchLoading;
export const selectSearchError = (state) => state.tree.searchError;

export const selectQuickStats = (state) => state.tree.quickStats;
export const selectQuickStatsLoading = (state) => state.tree.quickStatsLoading;
export const selectQuickStatsError = (state) => state.tree.quickStatsError;

export const selectUpline = (state) => state.tree.upline;
export const selectUplineLoading = (state) => state.tree.uplineLoading;
export const selectUplineError = (state) => state.tree.uplineError;

export const selectUsersAtLevel = (state) => state.tree.usersAtLevel;
export const selectUsersAtLevelLoading = (state) =>
  state.tree.usersAtLevelLoading;
export const selectUsersAtLevelError = (state) => state.tree.usersAtLevelError;

export const selectBinaryTree = (state) => state.tree.binaryTree;
export const selectBinaryTreeLoading = (state) => state.tree.binaryTreeLoading;
export const selectBinaryTreeError = (state) => state.tree.binaryTreeError;

export const selectAddUserLoading = (state) => state.tree.addUserLoading;
export const selectAddUserError = (state) => state.tree.addUserError;
export const selectAddUserSuccess = (state) => state.tree.addUserSuccess;

export const selectUpdateVolumeLoading = (state) =>
  state.tree.updateVolumeLoading;
export const selectUpdateVolumeError = (state) => state.tree.updateVolumeError;
export const selectUpdateVolumeSuccess = (state) =>
  state.tree.updateVolumeSuccess;

export const selectSelectedUserId = (state) => state.tree.selectedUserId;
