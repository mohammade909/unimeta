// hooks/useInvestments.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  // Actions
  createInvestment,
  getAllInvestments,
  getInvestmentStats,
  getDueForROI,
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  updateInvestmentStatus,
  updateInvestmentROI,
  getUserInvestments,
  getInvestmentsByUserId,
  
  // Sync actions
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
  resetInvestmentSlice,
  
  // Selectors
  selectInvestments,
  selectUserInvestments,
  selectCurrentInvestment,
  selectInvestmentStats,
  selectDueROIInvestments,
  selectInvestmentLoading,
  selectInvestmentErrors,
  selectInvestmentFilters,
  selectInvestmentPagination,
  selectSelectedInvestments,
  selectFilteredInvestments,
  selectInvestmentById,
  selectHasInvestmentData,
  selectIsDataStale,
  selectInvestmentSummary,
  addAdditionalInvestment
} from '../store/slices/investmentSlice';


// Main investments hook
export const useInvestments = (options = {}) => {
  const dispatch = useDispatch();
  
  // Selectors
  const investments = useSelector(selectInvestments);
  const loading = useSelector(selectInvestmentLoading);
  const errors = useSelector(selectInvestmentErrors);
  const filters = useSelector(selectInvestmentFilters);
  const pagination = useSelector(selectInvestmentPagination);
  const filteredInvestments = useSelector(selectFilteredInvestments);
  const hasData = useSelector(selectHasInvestmentData);
  const isStale = useSelector(state => selectIsDataStale(state, options.maxAge));
  
  // Actions
  const actions = useMemo(() => ({
    // Async actions
    create: (data) => dispatch(createInvestment(data)),
    getAll: (params) => dispatch(getAllInvestments(params)),
    getById: (id) => dispatch(getInvestmentById(id)),
    reInvest: (id, data) => dispatch(addAdditionalInvestment({ id, data })),
    update: (id, data) => dispatch(updateInvestment({ id, data })),
    delete: (id) => dispatch(deleteInvestment(id)),
    updateStatus: (id, status) => dispatch(updateInvestmentStatus({ id, status })),
    updateROI: (id, roiData) => dispatch(updateInvestmentROI({ id, roiData })),
    
    // Sync actions
    setFilters: (filters) => dispatch(setFilters(filters)),
    clearFilters: () => dispatch(clearFilters()),
    setPagination: (pagination) => dispatch(setPagination(pagination)),
    setSorting: (sortBy, sortOrder) => dispatch(setSorting({ sortBy, sortOrder })),
    clearErrors: () => dispatch(clearErrors()),
    clearError: (errorType) => dispatch(clearError(errorType))
  }), [dispatch]);
  
  // Auto-fetch on mount if needed
  useEffect(() => {
    if (options.autoFetch && (!hasData || isStale)) {
      actions.getAll(options.defaultParams);
    }
  }, [options.autoFetch, hasData, isStale, actions, options.defaultParams]);
  
  // Refresh function
  const refresh = useCallback((params) => {
    return actions.getAll(params || options.defaultParams);
  }, [actions, options.defaultParams]);
  
  return {
    // Data
    investments,
    filteredInvestments,
    
    // State
    loading,
    errors,
    filters,
    pagination,
    hasData,
    isStale,
    
    // Actions
    actions,
    refresh
  };
};

// User investments hook
export const useUserInvestments = (options = {}) => {
  const dispatch = useDispatch();
  
  const userInvestments = useSelector(selectUserInvestments);
  const investmentSummary = useSelector(selectInvestmentSummary);
  const loading = useSelector(state => state.investments.loading.userInvestments);
  const error = useSelector(state => state.investments.errors.userInvestments);
  
  const actions = useMemo(() => ({
    getUserInvestments: (params) => dispatch(getUserInvestments(params)),
    create: (data) => dispatch(createInvestment(data)),
    updateStatus: (id, status) => dispatch(updateInvestmentStatus({ id, status })),
    updateROI: (id, roiData) => dispatch(updateInvestmentROI({ id, roiData }))
  }), [dispatch]);
  
  // Auto-fetch user investments
  useEffect(() => {
    if (options.autoFetch) {
      actions.getUserInvestments(options.defaultParams);
    }
  }, [options.autoFetch, actions, options.defaultParams]);
  
  const refresh = useCallback((params) => {
    return actions.getUserInvestments(params || options.defaultParams);
  }, [actions, options.defaultParams]);
  
  return {
    userInvestments,
    investmentSummary,
    loading,
    error,
    actions,
    refresh
  };
};

// Investment stats hook
export const useInvestmentStats = (options = {}) => {
  const dispatch = useDispatch();
  
  const stats = useSelector(selectInvestmentStats);
  const loading = useSelector(state => state.investments.loading.stats);
  const error = useSelector(state => state.investments.errors.stats);
  
  const fetchStats = useCallback(() => {
    return dispatch(getInvestmentStats());
  }, [dispatch]);
  
  useEffect(() => {
    if (options.autoFetch) {
      fetchStats();
    }
  }, [options.autoFetch, fetchStats]);
  
  return {
    stats,
    loading,
    error,
    fetchStats,
    refresh: fetchStats
  };
};

// Due ROI investments hook
export const useDueROIInvestments = (options = {}) => {
  const dispatch = useDispatch();
  
  const dueROIInvestments = useSelector(selectDueROIInvestments);
  const loading = useSelector(state => state.investments.loading.dueROI);
  const error = useSelector(state => state.investments.errors.dueROI);
  
  const fetchDueROI = useCallback((params) => {
    return dispatch(getDueForROI(params));
  }, [dispatch]);
  
  useEffect(() => {
    if (options.autoFetch) {
      fetchDueROI(options.defaultParams);
    }
  }, [options.autoFetch, fetchDueROI, options.defaultParams]);
  
  return {
    dueROIInvestments,
    loading,
    error,
    fetchDueROI,
    refresh: fetchDueROI
  };
};

// Single investment hook
export const useInvestment = (investmentId, options = {}) => {
  const dispatch = useDispatch();
  
  const investment = useSelector(state => selectInvestmentById(state, investmentId));
  const currentInvestment = useSelector(selectCurrentInvestment);
  const loading = useSelector(state => state.investments.loading.list);
  const error = useSelector(state => state.investments.errors.list);
  
  const actions = useMemo(() => ({
    fetch: () => dispatch(getInvestmentById(investmentId)),
    update: (data) => dispatch(updateInvestment({ id: investmentId, data })),
    delete: () => dispatch(deleteInvestment(investmentId)),
    updateStatus: (status) => dispatch(updateInvestmentStatus({ id: investmentId, status })),
    updateROI: (roiData) => dispatch(updateInvestmentROI({ id: investmentId, roiData })),
    setCurrent: () => dispatch(setCurrentInvestment(investment)),
    clearCurrent: () => dispatch(clearCurrentInvestment())
  }), [dispatch, investmentId, investment]);
  
  useEffect(() => {
    if (options.autoFetch && investmentId && !investment) {
      actions.fetch();
    }
  }, [options.autoFetch, investmentId, investment, actions]);
  
  return {
    investment: investment || currentInvestment,
    loading,
    error,
    actions
  };
};

// Investment selection hook
export const useInvestmentSelection = () => {
  const dispatch = useDispatch();
  
  const selectedInvestments = useSelector(selectSelectedInvestments);
  const investments = useSelector(selectInvestments);
  
  const actions = useMemo(() => ({
    toggle: (id) => dispatch(toggleInvestmentSelection(id)),
    selectAll: () => dispatch(selectAllInvestments()),
    clear: () => dispatch(clearSelection()),
    isSelected: (id) => selectedInvestments.includes(id),
    getSelectedData: () => investments.filter(inv => selectedInvestments.includes(inv.id))
  }), [dispatch, selectedInvestments, investments]);
  
  return {
    selectedInvestments,
    selectedCount: selectedInvestments.length,
    hasSelection: selectedInvestments.length > 0,
    isAllSelected: selectedInvestments.length === investments.length && investments.length > 0,
    actions
  };
};

// Investment filters hook
export const useInvestmentFilters = () => {
  const dispatch = useDispatch();
  
  const filters = useSelector(selectInvestmentFilters);
  const pagination = useSelector(selectInvestmentPagination);
  
  const actions = useMemo(() => ({
    setFilters: (newFilters) => dispatch(setFilters(newFilters)),
    clearFilters: () => dispatch(clearFilters()),
    setPagination: (paginationData) => dispatch(setPagination(paginationData)),
    setSorting: (sortBy, sortOrder = 'desc') => dispatch(setSorting({ sortBy, sortOrder })),
    
    // Helper methods
    setStatus: (status) => dispatch(setFilters({ status })),
    setUserId: (userId) => dispatch(setFilters({ userId })),
    setDateRange: (dateFrom, dateTo) => dispatch(setFilters({ dateFrom, dateTo })),
    setAmountRange: (amountMin, amountMax) => dispatch(setFilters({ amountMin, amountMax })),
    
    // Pagination helpers
    nextPage: () => {
      if (pagination.page < pagination.totalPages) {
        dispatch(setPagination({ page: pagination.page + 1 }));
      }
    },
    prevPage: () => {
      if (pagination.page > 1) {
        dispatch(setPagination({ page: pagination.page - 1 }));
      }
    },
    goToPage: (page) => dispatch(setPagination({ page })),
    setPageSize: (limit) => dispatch(setPagination({ limit, page: 1 }))
  }), [dispatch, pagination]);
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '' && value !== null && value !== undefined);
  }, [filters]);
  
  return {
    filters,
    pagination,
    hasActiveFilters,
    actions
  };
};

// Investment form hook
export const useInvestmentForm = (initialData = null, options = {}) => {
  const dispatch = useDispatch();
  
  const loading = useSelector(state => 
    options.isEdit 
      ? state.investments.loading.update 
      : state.investments.loading.create
  );
  const error = useSelector(state => 
    options.isEdit 
      ? state.investments.errors.update 
      : state.investments.errors.create
  );
  
  const actions = useMemo(() => ({
    submit: async (data) => {
      try {
        if (options.isEdit && initialData?.id) {
          await dispatch(updateInvestment({ id: initialData.id, data })).unwrap();
        } else {
          await dispatch(createInvestment(data)).unwrap();
        }
        
        if (options.onSuccess) {
          options.onSuccess();
        }
        
        return { success: true };
      } catch (error) {
        if (options.onError) {
          options.onError(error);
        }
        return { success: false, error };
      }
    },
    
    clearError: () => {
      const errorType = options.isEdit ? 'update' : 'create';
      dispatch(clearError(errorType));
    }
  }), [dispatch, options, initialData]);
  
  return {
    loading,
    error,
    actions,
    isEdit: options.isEdit && !!initialData?.id
  };
};

// Investment operations hook (for bulk operations)
export const useInvestmentOperations = () => {
  const dispatch = useDispatch();
  
  const selectedInvestments = useSelector(selectSelectedInvestments);
  const investments = useSelector(selectInvestments);
  const loading = useSelector(selectInvestmentLoading);
  
  const actions = useMemo(() => ({
    // Bulk operations
    bulkUpdateStatus: async (status) => {
      const promises = selectedInvestments.map(id => 
        dispatch(updateInvestmentStatus({ id, status }))
      );
      
      try {
        await Promise.all(promises);
        dispatch(clearSelection());
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    bulkDelete: async () => {
      const promises = selectedInvestments.map(id => 
        dispatch(deleteInvestment(id))
      );
      
      try {
        await Promise.all(promises);
        dispatch(clearSelection());
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    // Single operations
    quickStatusUpdate: async (id, status) => {
      try {
        await dispatch(updateInvestmentStatus({ id, status })).unwrap();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    quickROIUpdate: async (id, roiData) => {
      try {
        await dispatch(updateInvestmentROI({ id, roiData })).unwrap();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    quickDelete: async (id) => {
      try {
        await dispatch(deleteInvestment(id)).unwrap();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }
  }), [dispatch, selectedInvestments]);
  
  const selectedData = useMemo(() => 
    investments.filter(inv => selectedInvestments.includes(inv.id)),
    [investments, selectedInvestments]
  );
  
  return {
    selectedInvestments,
    selectedData,
    selectedCount: selectedInvestments.length,
    hasSelection: selectedInvestments.length > 0,
    loading,
    actions
  };
};

// Investment analytics hook
export const useInvestmentAnalytics = (options = {}) => {
  const investments = useSelector(selectInvestments);
  const userInvestments = useSelector(selectUserInvestments);
  const stats = useSelector(selectInvestmentStats);
  
  // Calculate analytics from local data
  const analytics = useMemo(() => {
    const data = options.userOnly ? userInvestments : investments;
    
    if (!data.length) {
      return {
        totalInvestments: 0,
        totalAmount: 0,
        avgAmount: 0,
        statusBreakdown: {},
        monthlyTrend: [],
        topInvestors: []
      };
    }
    
    // Basic calculations
    const totalInvestments = data.length;
    const totalAmount = data.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const avgAmount = totalAmount / totalInvestments;
    
    // Status breakdown
    const statusBreakdown = data.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});
    
    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = data.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate.getMonth() === date.getMonth() && 
               invDate.getFullYear() === date.getFullYear();
      });
      
      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthData.length,
        amount: monthData.reduce((sum, inv) => sum + (inv.amount || 0), 0)
      });
    }
    
    // Top investors (if not user-only mode)
    const topInvestors = [];
    if (!options.userOnly) {
      const investorMap = data.reduce((acc, inv) => {
        const userId = inv.userId;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: inv.user?.name || `User ${userId}`,
            totalAmount: 0,
            investmentCount: 0
          };
        }
        acc[userId].totalAmount += inv.amount || 0;
        acc[userId].investmentCount += 1;
        return acc;
      }, {});
      
      topInvestors.push(
        ...Object.values(investorMap)
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10)
      );
    }
    
    return {
      totalInvestments,
      totalAmount,
      avgAmount,
      statusBreakdown,
      monthlyTrend,
      topInvestors
    };
  }, [investments, userInvestments, options.userOnly]);
  
  return {
    analytics,
    serverStats: stats,
    loading: useSelector(state => state.investments.loading.stats)
  };
};

// Investment pagination hook
export const useInvestmentPagination = (options = {}) => {
  const dispatch = useDispatch();
  const pagination = useSelector(selectInvestmentPagination);
  const loading = useSelector(state => state.investments.loading.list);
  
  const actions = useMemo(() => ({
    goToPage: (page) => {
      dispatch(setPagination({ page }));
      if (options.refetchOnChange) {
        dispatch(getAllInvestments({ 
          page, 
          limit: pagination.limit,
          ...options.defaultParams 
        }));
      }
    },
    
    changePageSize: (limit) => {
      dispatch(setPagination({ limit, page: 1 }));
      if (options.refetchOnChange) {
        dispatch(getAllInvestments({ 
          page: 1, 
          limit,
          ...options.defaultParams 
        }));
      }
    },
    
    nextPage: () => {
      if (pagination.page < pagination.totalPages) {
        const nextPage = pagination.page + 1;
        dispatch(setPagination({ page: nextPage }));
        if (options.refetchOnChange) {
          dispatch(getAllInvestments({ 
            page: nextPage, 
            limit: pagination.limit,
            ...options.defaultParams 
          }));
        }
      }
    },
    
    prevPage: () => {
      if (pagination.page > 1) {
        const prevPage = pagination.page - 1;
        dispatch(setPagination({ page: prevPage }));
        if (options.refetchOnChange) {
          dispatch(getAllInvestments({ 
            page: prevPage, 
            limit: pagination.limit,
            ...options.defaultParams 
          }));
        }
      }
    }
  }), [dispatch, pagination, options]);
  
  const paginationInfo = useMemo(() => ({
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    pageSize: pagination.limit,
    total: pagination.total,
    hasNext: pagination.page < pagination.totalPages,
    hasPrev: pagination.page > 1,
    startIndex: (pagination.page - 1) * pagination.limit + 1,
    endIndex: Math.min(pagination.page * pagination.limit, pagination.total)
  }), [pagination]);
  
  return {
    pagination: paginationInfo,
    loading,
    actions
  };
};

// Admin-specific investments hook
export const useAdminInvestments = (options = {}) => {
  const dispatch = useDispatch();
  
  const investments = useSelector(selectInvestments);
  const stats = useSelector(selectInvestmentStats);
  const dueROI = useSelector(selectDueROIInvestments);
  const loading = useSelector(selectInvestmentLoading);
  const errors = useSelector(selectInvestmentErrors);
  
  const actions = useMemo(() => ({
    // Admin-specific actions
    getAll: (params) => dispatch(getAllInvestments(params)),
    getStats: () => dispatch(getInvestmentStats()),
    getDueROI: (params) => dispatch(getDueForROI(params)),
    getByUserId: (userId, params) => dispatch(getInvestmentsByUserId({ userId, params })),
    
    // Admin operations
    approveInvestment: (id) => dispatch(updateInvestmentStatus({ id, status: 'approved' })),
    rejectInvestment: (id) => dispatch(updateInvestmentStatus({ id, status: 'rejected' })),
    markCompleted: (id) => dispatch(updateInvestmentStatus({ id, status: 'completed' })),
    
    // ROI operations
    calculateROI: (id, roiData) => dispatch(updateInvestmentROI({ id, roiData })),
    
    // CRUD operations
    update: (id, data) => dispatch(updateInvestment({ id, data })),
    delete: (id) => dispatch(deleteInvestment(id)),
    
    // Bulk operations
    bulkApprove: async (ids) => {
      const promises = ids.map(id => 
        dispatch(updateInvestmentStatus({ id, status: 'approved' }))
      );
      return Promise.all(promises);
    },
    
    bulkReject: async (ids) => {
      const promises = ids.map(id => 
        dispatch(updateInvestmentStatus({ id, status: 'rejected' }))
      );
      return Promise.all(promises);
    }
  }), [dispatch]);
  
  // Auto-fetch admin data
  useEffect(() => {
    if (options.autoFetch) {
      actions.getAll(options.defaultParams);
      if (options.fetchStats) actions.getStats();
      if (options.fetchDueROI) actions.getDueROI();
    }
  }, [options.autoFetch, options.fetchStats, options.fetchDueROI, actions, options.defaultParams]);
  
  return {
    investments,
    stats,
    dueROI,
    loading,
    errors,
    actions
  };
};

// Investment search hook
export const useInvestmentSearch = () => {
  const investments = useSelector(selectInvestments);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFields, setSearchFields] = useState(['user.name', 'user.email', 'status']);
  
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return investments;
    }
    
    const term = searchTerm.toLowerCase();
    return investments.filter(investment => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], investment);
        return value?.toString().toLowerCase().includes(term);
      });
    });
  }, [investments, searchTerm, searchFields]);
  
  return {
    searchTerm,
    setSearchTerm,
    searchFields,
    setSearchFields,
    searchResults,
    hasResults: searchResults.length > 0,
    resultsCount: searchResults.length
  };
};

export default {
  useInvestments,
  useUserInvestments,
  useInvestmentStats,
  useDueROIInvestments,
  useInvestment,
  useInvestmentSelection,
  useInvestmentFilters,
  useInvestmentForm,
  useInvestmentOperations,
  useInvestmentAnalytics,
  useInvestmentPagination,
  useAdminInvestments,
  useInvestmentSearch
};