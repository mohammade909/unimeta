import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect, useMemo } from "react";
import {
  assignRewardsToUser,
  assignRewardsToAllUsers,
  getUserRewardDashboard,
  getUserRewards,
  getUserRewardStats,
  getUserBussiness,
  updateUserProgress,
  claimReward,
  getRewardsSystemStatus,
  getAvailableRewardPrograms,
  cleanupExpiredRewards,
  clearError,
  clearAllErrors,
  clearSuccess,
  clearAllSuccess,
  resetSection,
  resetRewardsState,
  selectRewardsState,
  selectUserRewards,
  selectUserStats,
  selectUserDashboard,
  selectSystemStatus,
  selectAvailablePrograms,
  selectBulkAssignmentResult,
  selectRewardsLoading,
  selectRewardsErrors,
  selectRewardsSuccess,
  selectUserBussiness,
} from "../store/slices/userRewardSlice";

// Main rewards hook with all functionality
export const useRewards = () => {
  const dispatch = useDispatch();
  const rewardsState = useSelector(selectRewardsState);

  // Actions
  const actions = useMemo(
    () => ({
      assignToUser: (userId, isAdmin = false) =>
        dispatch(assignRewardsToUser({ userId, isAdmin })),
      assignToAllUsers: () => dispatch(assignRewardsToAllUsers()),
      getUserDashboard: (userId, isAdmin = false) =>
        dispatch(getUserRewardDashboard({ userId, isAdmin })),
      getUserRewards: (userId, isAdmin = false) =>
        dispatch(getUserRewards({ userId, isAdmin })),
      getUserStats: (userId, isAdmin = false) =>
        dispatch(getUserRewardStats({ userId, isAdmin })),
      updateProgress: (userId, rewardType, newProgress, isAdmin = false) =>
        dispatch(
          updateUserProgress({ userId, rewardType, newProgress, isAdmin })
        ),
      claimReward: (userRewardId, isAdmin = false) =>
        dispatch(claimReward({ userRewardId, isAdmin })),
      getSystemStatus: (isAdmin = false) =>
        dispatch(getRewardsSystemStatus({ isAdmin })),
      getPrograms: (isAdmin = false) =>
        dispatch(getAvailableRewardPrograms({ isAdmin })),
      cleanupExpired: () => dispatch(cleanupExpiredRewards()),
      clearError: (errorType) => dispatch(clearError({ errorType })),
      clearAllErrors: () => dispatch(clearAllErrors()),
      clearSuccess: (successType) => dispatch(clearSuccess({ successType })),
      clearAllSuccess: () => dispatch(clearAllSuccess()),
      resetSection: (section) => dispatch(resetSection({ section })),
      resetState: () => dispatch(resetRewardsState()),
    }),
    [dispatch]
  );

  return {
    ...rewardsState,
    actions,
  };
};

// Hook for user-specific rewards (commonly used in user dashboard)
export const useUserRewards = (userId, autoFetch = true) => {
  const dispatch = useDispatch();
  const userRewards = useSelector(selectUserRewards);
  const userStats = useSelector(selectUserStats);
  const userDashboard = useSelector(selectUserDashboard);
  const userBussiness = useSelector(selectUserBussiness);
  const loading = useSelector(selectRewardsLoading);
  const errors = useSelector(selectRewardsErrors);
  const success = useSelector(selectRewardsSuccess);

  // Fetch user data on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      dispatch(getUserRewards({isAdmin: false }));
      dispatch(getUserBussiness({ isAdmin: false }));
      dispatch(getUserRewardStats({ isAdmin: false }));
      dispatch(getUserRewardDashboard({  isAdmin: false }));
    }
  }, [dispatch,  autoFetch]);

  // Actions specific to user rewards
  const actions = useMemo(
    () => ({
      fetchRewards: () => dispatch(getUserRewards({ isAdmin: false })),
      fetchStats: () =>
        dispatch(getUserRewardStats({ userId, isAdmin: false })),
      fetchDashboard: () =>
        dispatch(getUserRewardDashboard({ userId, isAdmin: false })),
      updateProgress: (rewardType, newProgress) =>
        dispatch(
          updateUserProgress({
            userId,
            rewardType,
            newProgress,
            isAdmin: false,
          })
        ),
      claimReward: (userRewardId) =>
        dispatch(claimReward({ userRewardId, isAdmin: false })),
      refreshAll: () => {
        dispatch(getUserRewards({ isAdmin: false }));
        dispatch(getUserRewardStats({ isAdmin: false }));
        dispatch(getUserRewardDashboard({  isAdmin: false }));
      },
    }),
    [dispatch]
  );

  return {
    rewards: userRewards,
    stats: userStats,
    dashboard: userDashboard,
    bussiness: userBussiness, 
    loading: {
      rewards: loading.userRewards,
      stats: loading.userStats,
      dashboard: loading.userDashboard,
      updateProgress: loading.updateProgress,
      claimReward: loading.claimReward,
    },
    // errors: {
    //   rewards: errors.userRewards,
    //   stats: errors.userStats,
    //   dashboard: errors.userDashboard,
    //   updateProgress: errors.updateProgress,
    //   claimReward: errors.claimReward,
    // },
    // success: {
    //   updateProgress: success.updateProgress,
    //   claimReward: success.claimReward,
    // },
    actions,
  };
};

// Hook for admin rewards management
export const useAdminRewards = () => {
  const dispatch = useDispatch();
  const systemStatus = useSelector(selectSystemStatus);
  const availablePrograms = useSelector(selectAvailablePrograms);
  const bulkAssignmentResult = useSelector(selectBulkAssignmentResult);
  const loading = useSelector(selectRewardsLoading);
  const errors = useSelector(selectRewardsErrors);
  const success = useSelector(selectRewardsSuccess);

  // Auto-fetch system status and programs on mount
  useEffect(() => {
    dispatch(getRewardsSystemStatus({ isAdmin: true }));
    dispatch(getAvailableRewardPrograms({ isAdmin: true }));
  }, [dispatch]);

  // Admin-specific actions
  const actions = useMemo(
    () => ({
      assignToUser: (userId) =>
        dispatch(assignRewardsToUser({ userId, isAdmin: true })),
      assignToAllUsers: () => dispatch(assignRewardsToAllUsers()),
      getUserDashboard: (userId) =>
        dispatch(getUserRewardDashboard({ userId, isAdmin: true })),
      getUserRewards: (userId) =>
        dispatch(getUserRewards({ userId, isAdmin: true })),
      getUserStats: (userId) =>
        dispatch(getUserRewardStats({ userId, isAdmin: true })),
      updateUserProgress: (userId, rewardType, newProgress) =>
        dispatch(
          updateUserProgress({ userId, rewardType, newProgress, isAdmin: true })
        ),
      claimReward: (userRewardId) =>
        dispatch(claimReward({ userRewardId, isAdmin: true })),
      refreshSystemStatus: () =>
        dispatch(getRewardsSystemStatus({ isAdmin: true })),
      refreshPrograms: () =>
        dispatch(getAvailableRewardPrograms({ isAdmin: true })),
      cleanupExpired: () => dispatch(cleanupExpiredRewards()),
    }),
    [dispatch]
  );

  return {
    systemStatus,
    availablePrograms,
    bulkAssignmentResult,
    loading: {
      systemStatus: loading.systemStatus,
      programs: loading.programs,
      assignToUser: loading.assignToUser,
      assignToAll: loading.assignToAll,
      cleanup: loading.cleanup,
    },
    errors: {
      systemStatus: errors.systemStatus,
      programs: errors.programs,
      assignToUser: errors.assignToUser,
      assignToAll: errors.assignToAll,
      cleanup: errors.cleanup,
    },
    success: {
      assignToUser: success.assignToUser,
      assignToAll: success.assignToAll,
      cleanup: success.cleanup,
    },
    actions,
  };
};

// Hook for reward progress tracking
export const useRewardProgress = (userId) => {
  const dispatch = useDispatch();
  const userRewards = useSelector(selectUserRewards);
  const loading = useSelector((state) => state.rewards.loading.updateProgress);
  const error = useSelector((state) => state.rewards.errors.updateProgress);
  const success = useSelector((state) => state.rewards.success.updateProgress);

  const updateProgress = useCallback(
    (rewardType, newProgress, isAdmin = false) => {
      return dispatch(
        updateUserProgress({ userId, rewardType, newProgress, isAdmin })
      );
    },
    [dispatch, userId]
  );

  // Calculate progress percentage for a specific reward type
  const getProgressPercentage = useCallback(
    (rewardType) => {
      if (!userRewards || !Array.isArray(userRewards)) return 0;

      const reward = userRewards.find((r) => r.reward_type === rewardType);
      if (!reward) return 0;

      return reward.achievement_percentage || 0;
    },
    [userRewards]
  );

  // Get rewards by status
  const getRewardsByStatus = useCallback(
    (status) => {
      if (!userRewards || !Array.isArray(userRewards)) return [];

      return userRewards.filter((reward) => reward.status === status);
    },
    [userRewards]
  );

  // Get achievable rewards (close to completion)
  const getAchievableRewards = useCallback(
    (threshold = 80) => {
      if (!userRewards || !Array.isArray(userRewards)) return [];

      return userRewards.filter(
        (reward) =>
          reward.status === "in_progress" &&
          reward.achievement_percentage >= threshold
      );
    },
    [userRewards]
  );

  return {
    rewards: userRewards,
    loading,
    error,
    success,
    updateProgress,
    getProgressPercentage,
    getRewardsByStatus,
    getAchievableRewards,
  };
};

// Hook for reward claiming
export const useRewardClaim = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.rewards.loading.claimReward);
  const error = useSelector((state) => state.rewards.errors.claimReward);
  const success = useSelector((state) => state.rewards.success.claimReward);

  const claimReward = useCallback(
    (userRewardId, isAdmin = false) => {
      return dispatch(claimReward({ userRewardId, isAdmin }));
    },
    [dispatch]
  );

  // Clear claim status
  const clearClaimStatus = useCallback(() => {
    dispatch(clearError({ errorType: "claimReward" }));
    dispatch(clearSuccess({ successType: "claimReward" }));
  }, [dispatch]);

  return {
    loading,
    error,
    success,
    claimReward,
    clearClaimStatus,
  };
};

// Hook for system status monitoring
export const useRewardsSystemStatus = (
  autoRefresh = false,
  refreshInterval = 30000
) => {
  const dispatch = useDispatch();
  const systemStatus = useSelector(selectSystemStatus);
  const loading = useSelector((state) => state.rewards.loading.systemStatus);
  const error = useSelector((state) => state.rewards.errors.systemStatus);

  // Fetch system status
  const fetchSystemStatus = useCallback(
    (isAdmin = false) => {
      dispatch(getRewardsSystemStatus({ isAdmin }));
    },
    [dispatch]
  );

  // Auto-refresh system status
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSystemStatus(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchSystemStatus]);

  // Initial fetch
  useEffect(() => {
    fetchSystemStatus(false);
  }, [fetchSystemStatus]);

  return {
    systemStatus,
    loading,
    error,
    fetchSystemStatus,
    isEnabled: systemStatus?.enabled || false,
    enabledRewardTypes: systemStatus?.enabledRewardTypes || [],
  };
};

// Hook for available programs
export const useAvailablePrograms = (filterByType = null) => {
  const dispatch = useDispatch();
  const allPrograms = useSelector(selectAvailablePrograms);
  const loading = useSelector((state) => state.rewards.loading.programs);
  const error = useSelector((state) => state.rewards.errors.programs);

  // Filter programs by type
  const filteredPrograms = useMemo(() => {
    if (!filterByType || !Array.isArray(allPrograms)) return allPrograms;

    return allPrograms.filter(
      (program) => program.reward_type === filterByType
    );
  }, [allPrograms, filterByType]);

  // Fetch programs
  const fetchPrograms = useCallback(
    (isAdmin = false) => {
      dispatch(getAvailableRewardPrograms({ isAdmin }));
    },
    [dispatch]
  );

  // Initial fetch
  useEffect(() => {
    fetchPrograms(false);
  }, [fetchPrograms]);

  return {
    programs: filteredPrograms,
    allPrograms,
    loading,
    error,
    fetchPrograms,
  };
};
