// hooks/useUserApi.js
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import {
  getAllUsers,
  getAllNonUsers,
  getAllRewards,
  getUser,
  getUserByEmail,
  deleteUser,
  updateUser,
  sendRewardNotification,
  getDefaulterNotification,
  getProfile,
  updateProfile,
  getIncomeStats,
  getIncomeHistory,
  getNetworkTree,
  getReferrals,
  generateReferralLink,
  getReferralStats,
  clearError,
  clearMessage,
  setSearchFilter,
  setStatusFilter,
  setSortFilter,
  resetFilters,
  optimisticUpdateUser,
  optimisticDeleteUser,
  setCurrentPage,
  selectAllUsers,
  selectSingleUser,
  selectProfile,
  selectLoading,
  selectError,
  selectMessage,
  selectFilters,
  selectFilteredUsers,
  selectPagination,
  selfProcessROI,
} from "../store/slices/usersSlice";

// Main hook for user operations
export const useUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const filteredUsers = useSelector(selectFilteredUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const message = useSelector(selectMessage);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);

  const fetchUsers = useCallback(
    (page = 1) => {
      return dispatch(getAllUsers(page));
    },
    [dispatch]
  );

  const fetchNonUsers = useCallback(() => {
    return dispatch(getAllNonUsers());
  }, [dispatch]);

  const searchUsers = useCallback(
    (searchTerm) => {
      dispatch(setSearchFilter(searchTerm));
    },
    [dispatch]
  );

  const filterByStatus = useCallback(
    (status) => {
      dispatch(setStatusFilter(status));
    },
    [dispatch]
  );

  const adminLoginAsUser = useCallback(
    (data) => {
      dispatch(data);
    },
    [dispatch]
  );

  const sortUsers = useCallback(
    (sortBy, sortOrder = "desc") => {
      dispatch(setSortFilter({ sortBy, sortOrder }));
    },
    [dispatch]
  );

  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const changePage = useCallback(
    (page) => {
      dispatch(setCurrentPage(page));
      dispatch(getAllUsers(page));
    },
    [dispatch]
  );

  // Single user operations
  const fetchUser = useCallback(
    (id) => {
      return dispatch(getUser(id));
    },
    [dispatch]
  );

  const fetchUserByEmail = useCallback(
    (email) => {
      return dispatch(getUserByEmail(email));
    },
    [dispatch]
  );

  const removeUser = useCallback(
    (id) => {
      // Optimistic update
      dispatch(optimisticDeleteUser(id));
      return dispatch(deleteUser(id));
    },
    [dispatch]
  );

  const updateUserData = useCallback(
    (id, userData) => {
      // Optimistic update
      dispatch(optimisticUpdateUser({ id, updates: userData }));
      return dispatch(updateUser({ id, userData }));
    },
    [dispatch]
  );

  // Utility functions
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearMessageState = useCallback(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  return {
    // Data
    users,
    filteredUsers,
    loading,
    error,
    message,
    filters,
    pagination,

    // Actions
    fetchUsers,
    fetchNonUsers,
    fetchUser,
    fetchUserByEmail,
    removeUser,
    updateUserData,
    searchUsers,
    filterByStatus,
    sortUsers,
    clearFilters,
    changePage,
    clearErrorState,
    clearMessageState,
  };
};

// Hook for single user operations
export const useUser = (userId) => {
  const dispatch = useDispatch();

  const user = useSelector(selectSingleUser);
  const loading = useSelector((state) => state.users.loading.general);
  const error = useSelector(selectError);

  const fetchUser = useCallback(() => {
    if (userId) {
      return dispatch(getUser(userId));
    }
  }, [dispatch, userId]);

  const updateUser = useCallback(
    (userData) => {
      if (userId) {
        return dispatch(updateUser({ id: userId, userData }));
      }
    },
    [dispatch, userId]
  );

  const deleteUser = useCallback(() => {
    if (userId) {
      return dispatch(deleteUser(userId));
    }
  }, [dispatch, userId]);

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
    deleteUser,
  };
};

// Hook for profile management
export const useProfile = () => {
  const dispatch = useDispatch();

  const profile = useSelector(selectProfile);
  const loading = useSelector((state) => state.users.loading.profile);
  const error = useSelector(selectError);
  const message = useSelector(selectMessage);

  const fetchProfile = useCallback(() => {
    return dispatch(getProfile());
  }, [dispatch]);

  const updateProfileData = useCallback(
    (profileData) => {
      return dispatch(updateProfile(profileData));
    },
    [dispatch]
  );

  return {
    profile,
    loading,
    error,
    message,
    fetchProfile,
    updateProfileData,
  };
};

// Hook for income data
export const useIncome = () => {
  const dispatch = useDispatch();
  const incomeStats = useSelector((state) => state.users.incomeStats);
  const roiData = useSelector((state) => state.users.roiData);
  const incomeHistory = useSelector((state) => state.users.incomeHistory);
  const loading = useSelector((state) => state.users.loading.roi);
  const error = useSelector(selectError);

  const fetchIncomeStats = useCallback(() => {
    return dispatch(getIncomeStats());
  }, [dispatch]);
  const clearData = useCallback(() => {
    return dispatch(clearMessage());
  }, [dispatch]);

  const fetchIncomeHistory = useCallback(
    (params) => {
      return dispatch(getIncomeHistory(params));
    },
    [dispatch]
  );
  const processSelfROI = useCallback(
    (params) => {
      return dispatch(selfProcessROI(params));
    },
    [dispatch]
  );

  return {
    incomeStats,
    incomeHistory,
    roiData,
    loading,
    error,
    processSelfROI,
    clearData,
    fetchIncomeStats,
    fetchIncomeHistory,
  };
};

// Hook for network operations
export const useNetwork = () => {
  const dispatch = useDispatch();

  const networkTree = useSelector((state) => state.users.networkTree);
  const referrals = useSelector((state) => state.users.referrals);
  const loading = useSelector((state) => state.users.loading.network);
  const error = useSelector(selectError);

  const fetchNetworkTree = useCallback(() => {
    return dispatch(getNetworkTree());
  }, [dispatch]);

  const fetchReferrals = useCallback(
    (params) => {
      return dispatch(getReferrals(params));
    },
    [dispatch]
  );

  return {
    networkTree,
    referrals,
    loading,
    error,
    fetchNetworkTree,
    fetchReferrals,
  };
};

// Hook for referral system
export const useReferrals = () => {
  const dispatch = useDispatch();

  const referralLink = useSelector((state) => state.users.referralLink);
  const referralStats = useSelector((state) => state.users.referralStats);
  const loading = useSelector((state) => state.users.loading.referrals);
  const error = useSelector(selectError);
  const message = useSelector(selectMessage);

  const createReferralLink = useCallback(() => {
    return dispatch(generateReferralLink());
  }, [dispatch]);

  const fetchReferralStats = useCallback(() => {
    return dispatch(getReferralStats());
  }, [dispatch]);

  return {
    referralLink,
    referralStats,
    loading,
    error,
    message,
    createReferralLink,
    fetchReferralStats,
  };
};
// Hook for rewards system
export const useRewards = () => {
  const dispatch = useDispatch();

  const rewards = useSelector((state) => state.users.allRewards);
  const loading = useSelector((state) => state.users.loading.general);
  const error = useSelector(selectError);
  const message = useSelector(selectMessage);

  const fetchRewards = useCallback(() => {
    return dispatch(getAllRewards());
  }, [dispatch]);

  const sendReward = useCallback(
    (rewardData) => {
      return dispatch(sendRewardNotification(rewardData));
    },
    [dispatch]
  );

  const fetchDefaulterNotification = useCallback(
    (id) => {
      return dispatch(getDefaulterNotification(id));
    },
    [dispatch]
  );

  return {
    rewards,
    loading,
    error,
    message,
    fetchRewards,
    sendReward,
    fetchDefaulterNotification,
  };
};
