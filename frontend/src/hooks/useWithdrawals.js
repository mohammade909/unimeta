import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  createWithdrawalRequest,
  fetchUserWithdrawals,
  fetchAllWithdrawals,
  updateWithdrawal,
  fetchWithdrawalStats,
  fetchWithdrawalById,
  setFilters,
  clearFilters,
  setSelectedWithdrawals,
  toggleWithdrawalSelection,
  setSorting,
  setViewMode,
  resetCreateRequest,
  resetUpdateRequest,
  clearErrors,
  optimisticUpdateWithdrawal,
} from "../store/slices/withdrwal";

// Main withdrawal hook
export const useWithdrawals = () => {
  const dispatch = useDispatch();
  const withdrawalState = useSelector((state) => state.withdrawals);

  // Actions
  const actions = useMemo(
    () => ({
      createWithdrawal: (data) => dispatch(createWithdrawalRequest(data)),
      fetchUserWithdrawals: (params) => dispatch(fetchUserWithdrawals(params)),
      fetchAllWithdrawals: (params) => dispatch(fetchAllWithdrawals(params)),
      updateWithdrawal: (id, data) =>
        dispatch(updateWithdrawal({ id, updateData: data })),
      fetchStats: (params) => dispatch(fetchWithdrawalStats(params)),
      fetchById: (id) => dispatch(fetchWithdrawalById(id)),
      setFilters: (filters) => dispatch(setFilters(filters)),
      clearFilters: () => dispatch(clearFilters()),
      setSelectedWithdrawals: (ids) => dispatch(setSelectedWithdrawals(ids)),
      toggleSelection: (id) => dispatch(toggleWithdrawalSelection(id)),
      setSorting: (sortBy, sortOrder) =>
        dispatch(setSorting({ sortBy, sortOrder })),
      setViewMode: (mode) => dispatch(setViewMode(mode)),
      resetCreateRequest: () => dispatch(resetCreateRequest()),
      resetUpdateRequest: () => dispatch(resetUpdateRequest()),
      clearErrors: () => dispatch(clearErrors()),
      optimisticUpdate: (id, data) =>
        dispatch(optimisticUpdateWithdrawal({ id, updateData: data })),
    }),
    [dispatch]
  );

  return {
    ...withdrawalState,
    actions,
  };
};

// User-specific withdrawals hook
export const useUserWithdrawals = (autoFetch = true) => {
  const dispatch = useDispatch();
  const { userWithdrawals, createRequest } = useSelector(
    (state) => state.withdrawals
  );

  const fetchWithdrawals = useCallback(
    (params = {}) => {
      return dispatch(fetchUserWithdrawals(params));
    },
    [dispatch]
  );

  const createWithdrawal = useCallback(
    (data) => {
      return dispatch(createWithdrawalRequest(data));
    },
    [dispatch]
  );

  const resetCreate = useCallback(() => {
    dispatch(resetCreateRequest());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch) {
      fetchWithdrawals();
    }
  }, [autoFetch, fetchWithdrawals]);

  return {
    withdrawals: userWithdrawals.data,
    pagination: userWithdrawals.pagination,
    loading: userWithdrawals.loading,
    error: userWithdrawals.error,
    createRequest,
    fetchWithdrawals,
    createWithdrawal,
    resetCreate,
  };
};

// export const useAdminWithdrawals = (autoFetch = true, options) => {
//   const dispatch = useDispatch();
//   const { allWithdrawals, updateRequest } = useSelector(
//     (state) => state.withdrawals
//   );

//   // Memoize options to prevent unnecessary re-renders
//   const memoizedOptions = useMemo(() => options || {}, [options]);


//   // Memoize action creators
//   const fetchWithdrawals = useCallback(
//     (params = {}) => {
//       return dispatch(fetchAllWithdrawals(params));
//     },
//     [dispatch]
//   );

//   const updateWithdrawalStatus = useCallback(
//     (id, data) => {
//       return dispatch(updateWithdrawal({ id, updateData: data }));
//     },
//     [dispatch]
//   );

//   const optimisticUpdate = useCallback(
//     (id, data) => {
//       dispatch(optimisticUpdateWithdrawal({ id, updateData: data }));
//     },
//     [dispatch]
//   );

//   const setFiltersAndFetch = useCallback(
//     (filters) => {
//       dispatch(setFilters(filters));
//       // Fetch immediately with new filters instead of relying on useEffect
//       if (autoFetch) {
//         dispatch(fetchAllWithdrawals(filters));
//       }
//     },
//     [dispatch, autoFetch]
//   );

//   const clearFiltersAndFetch = useCallback(() => {
//     dispatch(clearFilters());
//     // Fetch with cleared filters
//     if (autoFetch) {
//       dispatch(fetchAllWithdrawals({}));
//     }
//   }, [dispatch, autoFetch]);

//   const resetUpdate = useCallback(() => {
//     dispatch(resetUpdateRequest());
//   }, [dispatch]);

//   // Track initial fetch
//   const initialFetchDone = useRef(false);

//   // Initial fetch effect - runs once when component mounts
//   useEffect(() => {
//     if (autoFetch && !initialFetchDone.current) {
//       dispatch(fetchAllWithdrawals(memoizedOptions));
//       initialFetchDone.current = true;
//     }
//   }, [autoFetch, dispatch, memoizedOptions]);

//   // Reset initial fetch flag when autoFetch is disabled
//   useEffect(() => {
//     if (!autoFetch) {
//       initialFetchDone.current = false;
//     }
//   }, [autoFetch]);

//   return {
//     withdrawals: allWithdrawals.data,
//     statistics: allWithdrawals.statistics,
//     pagination: allWithdrawals.pagination,
//     filters: allWithdrawals.filters,
//     loading: allWithdrawals.loading,
//     error: allWithdrawals.error,
//     updateRequest,
//     fetchWithdrawals,
//     updateWithdrawalStatus,
//     optimisticUpdate,
//     setFilters: setFiltersAndFetch, // Combined action
//     clearFilters: clearFiltersAndFetch, // Combined action
//     resetUpdate,
//   };
// };


export const useAdminWithdrawals = (autoFetch = true, options = {}) => {
  // Ensure options is always an object
  const safeOptions = options || {};
  const { withdrawalType } = safeOptions;

  const dispatch = useDispatch();
  const { allWithdrawals, updateRequest } = useSelector(
    (state) => state.withdrawals || { allWithdrawals: {}, updateRequest: {} }
  );

  // Create stable reference for options
  const optionsRef = useRef();
  const memoizedOptions = useMemo(() => {
    const newOptions = {
      ...safeOptions,
      ...(withdrawalType && { withdrawalType })
    };
    optionsRef.current = newOptions;
    return newOptions;
  }, [withdrawalType, safeOptions]);

  // Memoize action creators
  const fetchWithdrawals = useCallback(
    (params = {}) => {
      return dispatch(fetchAllWithdrawals(params));
    },
    [dispatch]
  );

  const updateWithdrawalStatus = useCallback(
    (id, data) => {
      return dispatch(updateWithdrawal({ id, updateData: data }));
    },
    [dispatch]
  );

  const optimisticUpdate = useCallback(
    (id, data) => {
      dispatch(optimisticUpdateWithdrawal({ id, updateData: data }));
    },
    [dispatch]
  );

  const setFiltersAndFetch = useCallback(
    (filters) => {
      dispatch(setFilters(filters));
      if (autoFetch) {
        dispatch(fetchAllWithdrawals({ ...memoizedOptions, ...filters }));
      }
    },
    [dispatch, autoFetch, memoizedOptions]
  );

  const clearFiltersAndFetch = useCallback(() => {
    dispatch(clearFilters());
    if (autoFetch) {
      dispatch(fetchAllWithdrawals(memoizedOptions));
    }
  }, [dispatch, autoFetch, memoizedOptions]);

  const resetUpdate = useCallback(() => {
    dispatch(resetUpdateRequest());
  }, [dispatch]);

  // Track if component is mounted
  const isMounted = useRef(true);

  // Fetch data when withdrawalType changes or on initial mount
  useEffect(() => {
    if (autoFetch && isMounted.current) {
      dispatch(fetchAllWithdrawals(memoizedOptions));
    }
  }, [autoFetch, dispatch, withdrawalType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    withdrawals: allWithdrawals?.data || [],
    statistics: allWithdrawals?.statistics || {},
    pagination: allWithdrawals?.pagination || {},
    filters: allWithdrawals?.filters || {},
    loading: allWithdrawals?.loading || false,
    error: allWithdrawals?.error || null,
    updateRequest: updateRequest || {},
    fetchWithdrawals,
    updateWithdrawalStatus,
    optimisticUpdate,
    setFilters: setFiltersAndFetch,
    clearFilters: clearFiltersAndFetch,
    resetUpdate,
  };
};

// Withdrawal statistics hook
export const useWithdrawalStats = (params = {}, autoFetch = true) => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.withdrawals);

  const fetchStats = useCallback(
    (statsParams = params) => {
      return dispatch(fetchWithdrawalStats(statsParams));
    },
    [dispatch, params]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  // Memoized computed stats
  const computedStats = useMemo(() => {
    if (!stats.data) return null;

    return {
      ...stats.data,
      completion_rate:
        stats.data.total_requests > 0
          ? (
              (stats.data.completed_requests / stats.data.total_requests) *
              100
            ).toFixed(2)
          : 0,
      rejection_rate:
        stats.data.total_requests > 0
          ? (
              (stats.data.rejected_requests / stats.data.total_requests) *
              100
            ).toFixed(2)
          : 0,
      avg_fee_percentage:
        stats.data.total_requested > 0
          ? (
              (stats.data.total_fees / stats.data.total_requested) *
              100
            ).toFixed(2)
          : 0,
    };
  }, [stats.data]);

  return {
    stats: computedStats,
    loading: stats.loading,
    error: stats.error,
    fetchStats,
  };
};

// Single withdrawal hook
export const useWithdrawal = (id) => {
  const dispatch = useDispatch();
  const { currentWithdrawal } = useSelector((state) => state.withdrawals);

  const fetchWithdrawal = useCallback(() => {
    if (id) {
      return dispatch(fetchWithdrawalById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchWithdrawal();
  }, [fetchWithdrawal]);

  return {
    withdrawal: currentWithdrawal.data,
    loading: currentWithdrawal.loading,
    error: currentWithdrawal.error,
    fetchWithdrawal,
  };
};

// Withdrawal selection hook
export const useWithdrawalSelection = () => {
  const dispatch = useDispatch();
  const { selectedWithdrawals } = useSelector((state) => state.withdrawals.ui);

  const selectWithdrawals = useCallback(
    (ids) => {
      dispatch(setSelectedWithdrawals(ids));
    },
    [dispatch]
  );

  const toggleSelection = useCallback(
    (id) => {
      dispatch(toggleWithdrawalSelection(id));
    },
    [dispatch]
  );

  const selectAll = useCallback(
    (withdrawals) => {
      const allIds = withdrawals.map((w) => w.id);
      dispatch(setSelectedWithdrawals(allIds));
    },
    [dispatch]
  );

  const clearSelection = useCallback(() => {
    dispatch(setSelectedWithdrawals([]));
  }, [dispatch]);

  const isSelected = useCallback(
    (id) => {
      return selectedWithdrawals.includes(id);
    },
    [selectedWithdrawals]
  );

  const isAllSelected = useCallback(
    (withdrawals) => {
      return (
        withdrawals.length > 0 &&
        withdrawals.every((w) => selectedWithdrawals.includes(w.id))
      );
    },
    [selectedWithdrawals]
  );

  return {
    selectedWithdrawals,
    selectWithdrawals,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    selectedCount: selectedWithdrawals.length,
  };
};

// Optimistic updates hook
export const useOptimisticWithdrawals = () => {
  const dispatch = useDispatch();

  const optimisticUpdate = useCallback(
    (id, updateData) => {
      // Add safety checks
      if (!id || !updateData) {
        console.warn('optimisticUpdate: id and updateData are required');
        return;
      }
      
      try {
        dispatch(optimisticUpdateWithdrawal({ id, updateData }));
      } catch (error) {
        console.error('Error in optimisticUpdate:', error);
      }
    },
    [dispatch]
  );

  const optimisticStatusUpdate = useCallback(
    (id, status, additionalData = {}) => {
      // Add safety checks
      if (!id || !status) {
        console.warn('optimisticStatusUpdate: id and status are required');
        return;
      }

      try {
        const updateData = {
          status,
          processed_at: new Date().toISOString(),
          ...additionalData,
        };
        dispatch(optimisticUpdateWithdrawal({ id, updateData }));
      } catch (error) {
        console.error('Error in optimisticStatusUpdate:', error);
      }
    },
    [dispatch]
  );

  return {
    optimisticUpdate,
    optimisticStatusUpdate,
  };
};
