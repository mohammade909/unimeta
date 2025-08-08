// hooks/useMlmTree.js
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // Async thunks
  getUserTreePosition,
  getDirectChildren,
  getCompleteTree,
  getTreeByLevels,
  getTeamStatistics,
  getGenealogyReport,
  getDashboardData,
  getTeamPerformanceReport,
  searchUsersInTree,
  getQuickStats,
  getUpline,
  getUsersAtLevel,
  getBinaryTree,
  addUserToTree,
  updateBusinessVolume,
  
  // Actions
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
  
  // Selectors
  selectUserPosition,
  selectUserPositionLoading,
  selectUserPositionError,
  selectDirectChildren,
  selectDirectChildrenPagination,
  selectDirectChildrenLoading,
  selectDirectChildrenError,
  selectCompleteTree,
  selectCompleteTreeLoading,
  selectCompleteTreeError,
  selectTreeByLevels,
  selectTreeByLevelsLoading,
  selectTreeByLevelsError,
  selectTeamStatistics,
  selectTeamStatisticsLoading,
  selectTeamStatisticsError,
  selectGenealogyReport,
  selectGenealogyReportLoading,
  selectGenealogyReportError,
  selectDashboardData,
  selectDashboardDataLoading,
  selectDashboardDataError,
  selectPerformanceReport,
  selectPerformanceReportLoading,
  selectPerformanceReportError,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError,
  selectQuickStats,
  selectQuickStatsLoading,
  selectQuickStatsError,
  selectUpline,
  selectUplineLoading,
  selectUplineError,
  selectUsersAtLevel,
  selectUsersAtLevelLoading,
  selectUsersAtLevelError,
  selectBinaryTree,
  selectBinaryTreeLoading,
  selectBinaryTreeError,
  selectAddUserLoading,
  selectAddUserError,
  selectAddUserSuccess,
  selectUpdateVolumeLoading,
  selectUpdateVolumeError,
  selectUpdateVolumeSuccess,
  selectSelectedUserId,
} from '../store/slices/treeSlice';

/**
 * Main MLM Tree hook - provides all functionality
 */
export const useMlmTree = () => {
  const dispatch = useDispatch();
  
  // All selectors
  const userPosition = useSelector(selectUserPosition);
  const userPositionLoading = useSelector(selectUserPositionLoading);
  const userPositionError = useSelector(selectUserPositionError);
  
  const directChildren = useSelector(selectDirectChildren);
  const directChildrenPagination = useSelector(selectDirectChildrenPagination);
  const directChildrenLoading = useSelector(selectDirectChildrenLoading);
  const directChildrenError = useSelector(selectDirectChildrenError);
  
  const completeTree = useSelector(selectCompleteTree);
  const completeTreeLoading = useSelector(selectCompleteTreeLoading);
  const completeTreeError = useSelector(selectCompleteTreeError);
  
  const treeByLevels = useSelector(selectTreeByLevels);
  const treeByLevelsLoading = useSelector(selectTreeByLevelsLoading);
  const treeByLevelsError = useSelector(selectTreeByLevelsError);
  
  const teamStatistics = useSelector(selectTeamStatistics);
  const teamStatisticsLoading = useSelector(selectTeamStatisticsLoading);
  const teamStatisticsError = useSelector(selectTeamStatisticsError);
  
  const genealogyReport = useSelector(selectGenealogyReport);
  const genealogyReportLoading = useSelector(selectGenealogyReportLoading);
  const genealogyReportError = useSelector(selectGenealogyReportError);
  
  const dashboardData = useSelector(selectDashboardData);
  const dashboardDataLoading = useSelector(selectDashboardDataLoading);
  const dashboardDataError = useSelector(selectDashboardDataError);
  
  const performanceReport = useSelector(selectPerformanceReport);
  const performanceReportLoading = useSelector(selectPerformanceReportLoading);
  const performanceReportError = useSelector(selectPerformanceReportError);
  
  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);
  const searchError = useSelector(selectSearchError);
  
  const quickStats = useSelector(selectQuickStats);
  const quickStatsLoading = useSelector(selectQuickStatsLoading);
  const quickStatsError = useSelector(selectQuickStatsError);
  
  const upline = useSelector(selectUpline);
  const uplineLoading = useSelector(selectUplineLoading);
  const uplineError = useSelector(selectUplineError);
  
  const usersAtLevel = useSelector(selectUsersAtLevel);
  const usersAtLevelLoading = useSelector(selectUsersAtLevelLoading);
  const usersAtLevelError = useSelector(selectUsersAtLevelError);
  
  const binaryTree = useSelector(selectBinaryTree);
  const binaryTreeLoading = useSelector(selectBinaryTreeLoading);
  const binaryTreeError = useSelector(selectBinaryTreeError);
  
  const addUserLoading = useSelector(selectAddUserLoading);
  const addUserError = useSelector(selectAddUserError);
  const addUserSuccess = useSelector(selectAddUserSuccess);
  
  const updateVolumeLoading = useSelector(selectUpdateVolumeLoading);
  const updateVolumeError = useSelector(selectUpdateVolumeError);
  const updateVolumeSuccess = useSelector(selectUpdateVolumeSuccess);
  
  const selectedUserId = useSelector(selectSelectedUserId);

  // Action creators
  const actions = {
    // Fetch data actions
    fetchUserTreePosition: useCallback((params) => {
      return dispatch(getUserTreePosition(params));
    }, [dispatch]),
    
    fetchDirectChildren: useCallback((params) => {
      return dispatch(getDirectChildren(params));
    }, [dispatch]),
    
    fetchCompleteTree: useCallback((params) => {
      return dispatch(getCompleteTree(params));
    }, [dispatch]),
    
    fetchTreeByLevels: useCallback((params) => {
      return dispatch(getTreeByLevels(params));
    }, [dispatch]),
    
    fetchTeamStatistics: useCallback((params) => {
      return dispatch(getTeamStatistics(params));
    }, [dispatch]),
    
    fetchGenealogyReport: useCallback((params) => {
      return dispatch(getGenealogyReport(params));
    }, [dispatch]),
    
    fetchDashboardData: useCallback((params) => {
      return dispatch(getDashboardData(params));
    }, [dispatch]),
    
    fetchPerformanceReport: useCallback((params) => {
      return dispatch(getTeamPerformanceReport(params));
    }, [dispatch]),
    
    searchUsers: useCallback((params) => {
      return dispatch(searchUsersInTree(params));
    }, [dispatch]),
    
    fetchQuickStats: useCallback((params) => {
      return dispatch(getQuickStats(params));
    }, [dispatch]),
    
    fetchUpline: useCallback((params) => {
      return dispatch(getUpline(params));
    }, [dispatch]),
    
    fetchUsersAtLevel: useCallback((params) => {
      return dispatch(getUsersAtLevel(params));
    }, [dispatch]),
    
    fetchBinaryTree: useCallback((params) => {
      return dispatch(getBinaryTree(params));
    }, [dispatch]),
    
    // Mutation actions
    addUser: useCallback((params) => {
      return dispatch(addUserToTree(params));
    }, [dispatch]),
    
    updateVolume: useCallback((params) => {
      return dispatch(updateBusinessVolume(params));
    }, [dispatch]),
    
    // Clear actions
    clearUserPosition: useCallback(() => {
      dispatch(clearUserPosition());
    }, [dispatch]),
    
    clearDirectChildren: useCallback(() => {
      dispatch(clearDirectChildren());
    }, [dispatch]),
    
    clearCompleteTree: useCallback(() => {
      dispatch(clearCompleteTree());
    }, [dispatch]),
    
    clearTreeByLevels: useCallback(() => {
      dispatch(clearTreeByLevels());
    }, [dispatch]),
    
    clearTeamStatistics: useCallback(() => {
      dispatch(clearTeamStatistics());
    }, [dispatch]),
    
    clearGenealogyReport: useCallback(() => {
      dispatch(clearGenealogyReport());
    }, [dispatch]),
    
    clearDashboardData: useCallback(() => {
      dispatch(clearDashboardData());
    }, [dispatch]),
    
    clearPerformanceReport: useCallback(() => {
      dispatch(clearPerformanceReport());
    }, [dispatch]),
    
    clearSearchResults: useCallback(() => {
      dispatch(clearSearchResults());
    }, [dispatch]),
    
    clearQuickStats: useCallback(() => {
      dispatch(clearQuickStats());
    }, [dispatch]),
    
    clearUpline: useCallback(() => {
      dispatch(clearUpline());
    }, [dispatch]),
    
    clearUsersAtLevel: useCallback(() => {
      dispatch(clearUsersAtLevel());
    }, [dispatch]),
    
    clearBinaryTree: useCallback(() => {
      dispatch(clearBinaryTree());
    }, [dispatch]),
    
    clearAllErrors: useCallback(() => {
      dispatch(clearAllErrors());
    }, [dispatch]),
    
    clearAllData: useCallback(() => {
      dispatch(clearAllData());
    }, [dispatch]),
    
    // Reset actions
    resetAddUserState: useCallback(() => {
      dispatch(resetAddUserState());
    }, [dispatch]),
    
    resetUpdateVolumeState: useCallback(() => {
      dispatch(resetUpdateVolumeState());
    }, [dispatch]),
    
    // Selection actions
    setSelectedUserId: useCallback((userId) => {
      dispatch(setSelectedUserId(userId));
    }, [dispatch]),
  };

  return {
    // State
    userPosition,
    userPositionLoading,
    userPositionError,
    
    directChildren,
    directChildrenPagination,
    directChildrenLoading,
    directChildrenError,
    
    completeTree,
    completeTreeLoading,
    completeTreeError,
    
    treeByLevels,
    treeByLevelsLoading,
    treeByLevelsError,
    
    teamStatistics,
    teamStatisticsLoading,
    teamStatisticsError,
    
    genealogyReport,
    genealogyReportLoading,
    genealogyReportError,
    
    dashboardData,
    dashboardDataLoading,
    dashboardDataError,
    
    performanceReport,
    performanceReportLoading,
    performanceReportError,
    
    searchResults,
    searchLoading,
    searchError,
    
    quickStats,
    quickStatsLoading,
    quickStatsError,
    
    upline,
    uplineLoading,
    uplineError,
    
    usersAtLevel,
    usersAtLevelLoading,
    usersAtLevelError,
    
    binaryTree,
    binaryTreeLoading,
    binaryTreeError,
    
    addUserLoading,
    addUserError,
    addUserSuccess,
    
    updateVolumeLoading,
    updateVolumeError,
    updateVolumeSuccess,
    
    selectedUserId,
    
    // Actions
    ...actions,
  };
};

/**
 * Hook for user tree position - auto-fetches on mount
 */
export const useUserTreePosition = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false } = options;
  
  const userPosition = useSelector(selectUserPosition);
  const loading = useSelector(selectUserPositionLoading);
  const error = useSelector(selectUserPositionError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getUserTreePosition({ userId, useAdmin, ...params }));
  }, [dispatch, userId, useAdmin]);
  
  const clearData = useCallback(() => {
    dispatch(clearUserPosition());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    userPosition,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for direct children - auto-fetches on mount
 */
export const useDirectChildren = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false, page = 1, limit = 20 } = options;
  
  const directChildren = useSelector(selectDirectChildren);
  const pagination = useSelector(selectDirectChildrenPagination);
  const loading = useSelector(selectDirectChildrenLoading);
  const error = useSelector(selectDirectChildrenError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getDirectChildren({ 
      userId, 
      useAdmin, 
      page, 
      limit, 
      ...params 
    }));
  }, [dispatch, userId, useAdmin, page, limit]);
  
  const clearData = useCallback(() => {
    dispatch(clearDirectChildren());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    directChildren,
    pagination,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for complete tree - auto-fetches on mount
 */
export const useCompleteTree = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false, maxDepth = 100 } = options;
  
  const completeTree = useSelector(selectCompleteTree);
  const loading = useSelector(selectCompleteTreeLoading);
  const error = useSelector(selectCompleteTreeError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getCompleteTree({ 
      userId, 
      useAdmin, 
      maxDepth, 
      ...params 
    }));
  }, [dispatch, userId, useAdmin, maxDepth]);
  
  const clearData = useCallback(() => {
    dispatch(clearCompleteTree());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    completeTree,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for team statistics - auto-fetches on mount
 */
export const useTeamStatistics = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false } = options;
  
  const teamStatistics = useSelector(selectTeamStatistics);
  const loading = useSelector(selectTeamStatisticsLoading);
  const error = useSelector(selectTeamStatisticsError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getTeamStatistics({ userId, useAdmin, ...params }));
  }, [dispatch, userId, useAdmin]);
  
  const clearData = useCallback(() => {
    dispatch(clearTeamStatistics());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    teamStatistics,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for dashboard data - auto-fetches on mount
 */
export const useDashboardData = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false } = options;
  
  const dashboardData = useSelector(selectDashboardData);
  const loading = useSelector(selectDashboardDataLoading);
  const error = useSelector(selectDashboardDataError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getDashboardData({ userId, useAdmin, ...params }));
  }, [dispatch, userId, useAdmin]);
  
  const clearData = useCallback(() => {
    dispatch(clearDashboardData());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    dashboardData,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for quick stats - auto-fetches on mount
 */
export const useQuickStats = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false } = options;
  
  const quickStats = useSelector(selectQuickStats);
  const loading = useSelector(selectQuickStatsLoading);
  const error = useSelector(selectQuickStatsError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getQuickStats({ userId, useAdmin, ...params }));
  }, [dispatch, userId, useAdmin]);
  
  const clearData = useCallback(() => {
    dispatch(clearQuickStats());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    quickStats,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for binary tree - auto-fetches on mount
 */
export const useBinaryTree = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false } = options;
  
  const binaryTree = useSelector(selectBinaryTree);
  const loading = useSelector(selectBinaryTreeLoading);
  const error = useSelector(selectBinaryTreeError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getBinaryTree({ userId, useAdmin, ...params }));
  }, [dispatch, userId, useAdmin]);
  
  const clearData = useCallback(() => {
    dispatch(clearBinaryTree());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    binaryTree,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for search functionality
 */
export const useSearchUsers = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { useAdmin = false, limit = 50 } = options;
  
  const searchResults = useSelector(selectSearchResults);
  const loading = useSelector(selectSearchLoading);
  const error = useSelector(selectSearchError);
  
  const searchUsers = useCallback((search, params = {}) => {
    if (!userId || !search) return;
    return dispatch(searchUsersInTree({ 
      userId, 
      search, 
      useAdmin, 
      limit, 
      ...params 
    }));
  }, [dispatch, userId, useAdmin, limit]);
  
  const clearResults = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);
  
  return {
    searchResults,
    loading,
    error,
    searchUsers,
    clearResults,
  };
};

/**
 * Hook for adding users to tree
 */
export const useAddUserToTree = (options = {}) => {
  const dispatch = useDispatch();
  const { useAdmin = false } = options;
  
  const loading = useSelector(selectAddUserLoading);
  const error = useSelector(selectAddUserError);
  const success = useSelector(selectAddUserSuccess);
  
  const addUser = useCallback((userId, parentId, params = {}) => {
    return dispatch(addUserToTree({ 
      userId, 
      parentId, 
      useAdmin, 
      ...params 
    }));
  }, [dispatch, useAdmin]);
  
  const resetState = useCallback(() => {
    dispatch(resetAddUserState());
  }, [dispatch]);
  
  return {
    loading,
    error,
    success,
    addUser,
    resetState,
  };
};

/**
 * Hook for updating business volume
 */
export const useUpdateBusinessVolume = (options = {}) => {
  const dispatch = useDispatch();
  const { useAdmin = false } = options;
  
  const loading = useSelector(selectUpdateVolumeLoading);
  const error = useSelector(selectUpdateVolumeError);
  const success = useSelector(selectUpdateVolumeSuccess);
  
  const updateVolume = useCallback((userId, amount, params = {}) => {
    return dispatch(updateBusinessVolume({ 
      userId, 
      amount, 
      useAdmin, 
      ...params 
    }));
  }, [dispatch, useAdmin]);
  
  const resetState = useCallback(() => {
    dispatch(resetUpdateVolumeState());
  }, [dispatch]);
  
  return {
    loading,
    error,
    success,
    updateVolume,
    resetState,
  };
};

/**
 * Hook for tree by levels
 */
export const useTreeByLevels = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { 
    autoFetch = true, 
    useAdmin = false, 
    startLevel = 1, 
    endLevel = 5 
  } = options;
  
  const treeByLevels = useSelector(selectTreeByLevels);
  const loading = useSelector(selectTreeByLevelsLoading);
  const error = useSelector(selectTreeByLevelsError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getTreeByLevels({ 
      userId, 
      useAdmin, 
      startLevel, 
      endLevel, 
      ...params 
    }));
  }, [dispatch, userId, useAdmin, startLevel, endLevel]);
  
  const clearData = useCallback(() => {
    dispatch(clearTreeByLevels());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    treeByLevels,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for getting users at a specific level
 */
export const useUsersAtLevel = (userId, level, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false } = options;
  
  const usersAtLevel = useSelector(selectUsersAtLevel);
  const loading = useSelector(selectUsersAtLevelLoading);
  const error = useSelector(selectUsersAtLevelError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId || !level) return;
    return dispatch(getUsersAtLevel({ userId, level, useAdmin, ...params }));
  }, [dispatch, userId, level, useAdmin]);
  
  const clearData = useCallback(() => {
    dispatch(clearUsersAtLevel());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId && level) {
      fetchData();
    }
  }, [autoFetch, userId, level, fetchData]);
  
  return {
    usersAtLevel,
    loading,
    error,
    fetchData,
    clearData,
  };
};

/**
 * Hook for upline data
 */
export const useUpline = (userId, options = {}) => {
  const dispatch = useDispatch();
  const { autoFetch = true, useAdmin = false } = options;
  
  const upline = useSelector(selectUpline);
  const loading = useSelector(selectUplineLoading);
  const error = useSelector(selectUplineError);
  
  const fetchData = useCallback((params = {}) => {
    if (!userId) return;
    return dispatch(getUpline({ userId, useAdmin, ...params }));
  }, [dispatch, userId, useAdmin]);
  
  const clearData = useCallback(() => {
    dispatch(clearUpline());
  }, [dispatch]);
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchData();
    }
  }, [autoFetch, userId, fetchData]);
  
  return {
    upline,
    loading,
    error,
    fetchData,
    clearData,
  };
};