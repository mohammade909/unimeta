// hooks/useInvestmentPlans.js
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // Async actions
  fetchActivePlans,

  fetchPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  validatePlanAmount,
  calculatePlanROI,
  
  // Sync actions
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
  resetROICalculations,
  
  // Selectors
  selectInvestmentPlansState,
  selectActivePlans,
  selectAllPlans,
  selectCurrentPlan,
  selectPlansPagination,
  selectPlansLoading,
  selectPlansErrors,
  selectPlansFilters,
  selectSelectedPlans,
  selectValidationResults,
  selectROICalculations,
  selectPlanById,
  selectFilteredPlans,
  selectPlansStats
} from '../store/slices/investmentPlansSlice';

// Main hook for investment plans
export const useInvestmentPlans = (options = {}) => {
  const {
    autoFetch = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    fetchActive = true,
  } = options;

  const dispatch = useDispatch();
  
  // Selectors
  const state = useSelector(selectInvestmentPlansState);
  const activePlans = useSelector(selectActivePlans);
  const loading = useSelector(selectPlansLoading);
  const errors = useSelector(selectPlansErrors);
  const pagination = useSelector(selectPlansPagination);
  const filters = useSelector(selectPlansFilters);
  const selectedPlans = useSelector(selectSelectedPlans);
  const stats = useSelector(selectPlansStats);
  const filteredPlans = useSelector(selectFilteredPlans);

  // Check if cache is valid
  const isCacheValid = useCallback((type) => {
    const lastFetch = state.lastFetch[type];
    return lastFetch && (Date.now() - lastFetch < cacheTimeout);
  }, [state.lastFetch, cacheTimeout]);

  // Fetch functions with cache management
  const loadActivePlans = useCallback((force = false) => {
    if (force || !isCacheValid('active')) {
      return dispatch(fetchActivePlans());
    }
    return Promise.resolve(activePlans);
  }, [dispatch, isCacheValid, activePlans]);


  const createNewPlan = useCallback((planData) => {
    return dispatch(createPlan(planData));
  }, [dispatch]);

  const updateExistingPlan = useCallback((id, planData) => {
    return dispatch(updatePlan({ id, planData }));
  }, [dispatch]);

  const removePlan = useCallback((id) => {
    return dispatch(deletePlan(id));
  }, [dispatch]);

  // Validation and ROI
  const validateAmount = useCallback((id, amount) => {
    return dispatch(validatePlanAmount({ id, amount }));
  }, [dispatch]);

  const calculateROI = useCallback((id, amount, duration) => {
    return dispatch(calculatePlanROI({ id, amount, duration }));
  }, [dispatch]);

  // Filter and pagination management
  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const updatePagination = useCallback((paginationData) => {
    dispatch(setPagination(paginationData));
  }, [dispatch]);

  // Selection management
  const handleSelectPlan = useCallback((id) => {
    dispatch(selectPlan(id));
  }, [dispatch]);

  const handleDeselectPlan = useCallback((id) => {
    dispatch(deselectPlan(id));
  }, [dispatch]);

  const handleToggleSelection = useCallback((id) => {
    dispatch(togglePlanSelection(id));
  }, [dispatch]);

  const clearPlanSelection = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  // Error management
  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearSpecificError = useCallback((errorType) => {
    dispatch(clearError(errorType));
  }, [dispatch]);

  // Cache management
  const refreshCache = useCallback((types) => {
    dispatch(invalidateCache(types));
    if (types?.includes('active') || !types) {
      loadActivePlans(true);
    }

  }, [dispatch, loadActivePlans,]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      if (fetchActive) {
        loadActivePlans();
      }
    
    }
  }, [autoFetch, fetchActive, loadActivePlans]);

  // Memoized computed values
  const computedValues = useMemo(() => ({
    hasActivePlans: activePlans.length > 0,
    hasSelection: selectedPlans.length > 0,
    isAnyLoading: Object.values(loading).some(Boolean),
    hasAnyError: Object.values(errors).some(Boolean),
    totalPages: Math.ceil(pagination.total / pagination.limit)
  }), [activePlans,  selectedPlans, loading, errors, pagination]);

  return {
    // Data
    activePlans,
    filteredPlans,
    pagination,
    filters,
    selectedPlans,
    stats,
    
    // States
    loading,
    errors,
    isInitialized: state.isInitialized,
   
    ...computedValues,
    
    // Actions
    loadActivePlans,
    createNewPlan,
    updateExistingPlan,
    removePlan,
    validateAmount,
    calculateROI,
    
    // Filter and pagination
    updateFilters,
    resetFilters,
    updatePagination,
    
    // Selection
    handleSelectPlan,
    handleDeselectPlan,
    handleToggleSelection,
    clearPlanSelection,
    
    // Utilities
    clearAllErrors,
    clearSpecificError,
    refreshCache,
    isCacheValid
  };
};

// Hook for individual plan management
export const useInvestmentPlan = (planId, options = {}) => {
  const { autoFetch = true } = options;
  
  const dispatch = useDispatch();
  const currentPlan = useSelector(selectCurrentPlan);
  const plan = useSelector(state => selectPlanById(state, planId));
  const loading = useSelector(state => state.investmentPlans.loading.current);
  const error = useSelector(state => state.investmentPlans.errors.current);
  const validationResults = useSelector(selectValidationResults);
  const roiCalculations = useSelector(selectROICalculations);

  // Get specific validation and ROI results for this plan
  const planValidation = validationResults[planId];
  const planROI = roiCalculations[planId];

  const fetchPlan = useCallback(() => {
    if (planId) {
      return dispatch(fetchPlanById(planId));
    }
  }, [dispatch, planId]);

  const updatePlan = useCallback((planData) => {
    if (planId) {
      return dispatch(updatePlan({ id: planId, planData }));
    }
  }, [dispatch, planId]);

  const deletePlan = useCallback(() => {
    if (planId) {
      return dispatch(deletePlan(planId));
    }
  }, [dispatch, planId]);

  const validateAmount = useCallback((amount) => {
    if (planId) {
      return dispatch(validatePlanAmount({ id: planId, amount }));
    }
  }, [dispatch, planId]);

  const calculateROI = useCallback((amount, duration) => {
    if (planId) {
      return dispatch(calculatePlanROI({ id: planId, amount, duration }));
    }
  }, [dispatch, planId]);

  const resetPlan = useCallback(() => {
    dispatch(resetCurrentPlan());
  }, [dispatch]);

  // Auto-fetch on mount or planId change
  useEffect(() => {
    if (autoFetch && planId && (!currentPlan || currentPlan.id !== planId) && !plan) {
      fetchPlan();
    }
  }, [autoFetch, planId, currentPlan, plan, fetchPlan]);

  const effectivePlan = currentPlan?.id === planId ? currentPlan : plan;

  return {
    plan: effectivePlan,
    loading,
    error,
    planValidation,
    planROI,
    
    // Actions
    fetchPlan,
    updatePlan,
    deletePlan,
    validateAmount,
    calculateROI,
    resetPlan,
    
    // Computed
    exists: !!effectivePlan,
    isActive: effectivePlan?.isActive || false
  };
};

// Hook for plan validation
export const usePlanValidation = () => {
  const dispatch = useDispatch();
  const validationResults = useSelector(selectValidationResults);
  const loading = useSelector(state => state.investmentPlans.loading.validate);
  const error = useSelector(state => state.investmentPlans.errors.validate);

  const validatePlanAmount = useCallback((planId, amount) => {
    return dispatch(validatePlanAmount({ id: planId, amount }));
  }, [dispatch]);

  const getValidationResult = useCallback((planId) => {
    return validationResults[planId];
  }, [validationResults]);

  const clearValidationResults = useCallback(() => {
    dispatch(resetValidationResults());
  }, [dispatch]);

  return {
    validationResults,
    loading,
    error,
    validatePlanAmount,
    getValidationResult,
    clearValidationResults
  };
};

// Hook for ROI calculations
export const usePlanROI = () => {
  const dispatch = useDispatch();
  const roiCalculations = useSelector(selectROICalculations);
  const loading = useSelector(state => state.investmentPlans.loading.roi);
  const error = useSelector(state => state.investmentPlans.errors.roi);

  const calculatePlanROI = useCallback((planId, amount, duration) => {
    return dispatch(calculatePlanROI({ id: planId, amount, duration }));
  }, [dispatch]);

  const getROICalculation = useCallback((planId) => {
    return roiCalculations[planId];
  }, [roiCalculations]);

  const clearROICalculations = useCallback(() => {
    dispatch(resetROICalculations());
  }, [dispatch]);

  return {
    roiCalculations,
    loading,
    error,
    calculatePlanROI,
    getROICalculation,
    clearROICalculations
  };
};

// Hook for plan selection management
export const usePlanSelection = () => {
  const dispatch = useDispatch();
  const selectedPlans = useSelector(selectSelectedPlans);
  const allPlans = useSelector(selectActivePlans);

  const selectPlan = useCallback((id) => {
    dispatch(selectPlan(id));
  }, [dispatch]);

  const deselectPlan = useCallback((id) => {
    dispatch(deselectPlan(id));
  }, [dispatch]);

  const togglePlanSelection = useCallback((id) => {
    dispatch(togglePlanSelection(id));
  }, [dispatch]);

  const selectAllPlans = useCallback(() => {
    allPlans.forEach(plan => {
      if (!selectedPlans.includes(plan.id)) {
        dispatch(selectPlan(plan.id));
      }
    });
  }, [dispatch, allPlans, selectedPlans]);

  const deselectAllPlans = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const selectMultiplePlans = useCallback((planIds) => {
    planIds.forEach(id => {
      if (!selectedPlans.includes(id)) {
        dispatch(selectPlan(id));
      }
    });
  }, [dispatch, selectedPlans]);

  const isSelected = useCallback((planId) => {
    return selectedPlans.includes(planId);
  }, [selectedPlans]);

  const getSelectedPlansData = useCallback(() => {
    return allPlans.filter(plan => selectedPlans.includes(plan.id));
  }, [allPlans, selectedPlans]);

  return {
    selectedPlans,
    selectedCount: selectedPlans.length,
    hasSelection: selectedPlans.length > 0,
    
    // Actions
    selectPlan,
    deselectPlan,
    togglePlanSelection,
    selectAllPlans,
    deselectAllPlans,
    selectMultiplePlans,
    
    // Utilities
    isSelected,
    getSelectedPlansData
  };
};

// Hook for plan filtering and search
export const usePlanFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectPlansFilters);
  const filteredPlans = useSelector(selectFilteredPlans);
  const allPlans = useSelector(selectAllPlans);

  const setFilter = useCallback((key, value) => {
    dispatch(setFilters({ [key]: value }));
  }, [dispatch]);

  const setMultipleFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearFilter = useCallback((key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    dispatch(setFilters(newFilters));
  }, [dispatch, filters]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key] !== null && filters[key] !== undefined && filters[key] !== ''
  );

  return {
    filters,
    filteredPlans,
    hasActiveFilters,
    filteredCount: filteredPlans.length,
    totalCount: allPlans.length,
    
    // Actions
    setFilter,
    setMultipleFilters,
    clearFilter,
    clearAllFilters
  };
};

// Hook for pagination management
export const usePlanPagination = () => {
  const dispatch = useDispatch();
  const pagination = useSelector(selectPlansPagination);
  const loading = useSelector(state => state.investmentPlans.loading.all);

  const { loadAllPlans } = useInvestmentPlans({ autoFetch: false });

  const goToPage = useCallback((page) => {
    if (page !== pagination.page && page > 0) {
      dispatch(setPagination({ page }));
      loadAllPlans({ page, limit: pagination.limit });
    }
  }, [dispatch, pagination, loadAllPlans]);

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    if (pagination.page < totalPages) {
      goToPage(pagination.page + 1);
    }
  }, [pagination, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination, goToPage]);

  const changePageSize = useCallback((limit) => {
    dispatch(setPagination({ limit, page: 1 }));
    loadAllPlans({ page: 1, limit });
  }, [dispatch, loadAllPlans]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    goToPage(totalPages);
  }, [pagination, goToPage]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  return {
    ...pagination,
    totalPages,
    hasNextPage,
    hasPrevPage,
    loading,
    
    // Actions
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    goToFirstPage,
    goToLastPage
  };
};

// Hook for plan statistics and analytics
export const usePlanStats = () => {
  const stats = useSelector(selectPlansStats);
  const activePlans = useSelector(selectActivePlans);
  const allPlans = useSelector(selectAllPlans);

  const advancedStats = useMemo(() => {
    if (allPlans.length === 0) {
      return {
        ...stats,
        averageMinInvestment: 0,
        averageMaxInvestment: 0,
        averageROI: 0,
        plansByCategory: {},
        plansByDuration: {}
      };
    }

    const avgMinInvestment = allPlans.reduce((sum, plan) => sum + (plan.minInvestment || 0), 0) / allPlans.length;
    const avgMaxInvestment = allPlans.reduce((sum, plan) => sum + (plan.maxInvestment || 0), 0) / allPlans.length;
    const avgROI = allPlans.reduce((sum, plan) => sum + (plan.roi || 0), 0) / allPlans.length;

    const plansByCategory = allPlans.reduce((acc, plan) => {
      const category = plan.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const plansByDuration = allPlans.reduce((acc, plan) => {
      const duration = plan.duration || 'Unknown';
      acc[duration] = (acc[duration] || 0) + 1;
      return acc;
    }, {});

    return {
      ...stats,
      averageMinInvestment: avgMinInvestment,
      averageMaxInvestment: avgMaxInvestment,
      averageROI: avgROI,
      plansByCategory,
      plansByDuration
    };
  }, [stats, allPlans]);

  return advancedStats;
};

// Hook for bulk operations
export const useBulkOperations = () => {
  const dispatch = useDispatch();
  const selectedPlans = useSelector(selectSelectedPlans);
  const { getSelectedPlansData } = usePlanSelection();

  const bulkDelete = useCallback(async () => {
    const promises = selectedPlans.map(id => dispatch(deletePlan(id)));
    const results = await Promise.allSettled(promises);
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }, [dispatch, selectedPlans]);

  const bulkUpdate = useCallback(async (updateData) => {
    const promises = selectedPlans.map(id => 
      dispatch(updatePlan({ id, planData: updateData }))
    );
    const results = await Promise.allSettled(promises);
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }, [dispatch, selectedPlans]);

  const bulkActivate = useCallback(() => {
    return bulkUpdate({ isActive: true });
  }, [bulkUpdate]);

  const bulkDeactivate = useCallback(() => {
    return bulkUpdate({ isActive: false });
  }, [bulkUpdate]);

  return {
    selectedCount: selectedPlans.length,
    hasSelection: selectedPlans.length > 0,
    getSelectedPlansData,
    
    // Bulk operations
    bulkDelete,
    bulkUpdate,
    bulkActivate,
    bulkDeactivate
  };
};

// Hook for plan comparison
export const usePlanComparison = (planIds = []) => {
  const allPlans = useSelector(selectAllPlans);
  
  const comparisonPlans = useMemo(() => {
    return planIds.map(id => allPlans.find(plan => plan.id === id)).filter(Boolean);
  }, [planIds, allPlans]);

  const comparison = useMemo(() => {
    if (comparisonPlans.length === 0) return null;

    const fields = ['minInvestment', 'maxInvestment', 'roi', 'duration', 'category'];
    const comparisonData = {};

    fields.forEach(field => {
      comparisonData[field] = comparisonPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        value: plan[field]
      }));
    });

    // Find best and worst for numerical fields
    const numericalFields = ['minInvestment', 'maxInvestment', 'roi'];
    const bestWorst = {};

    numericalFields.forEach(field => {
      const values = comparisonPlans.map(plan => plan[field] || 0);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      
      bestWorst[field] = {
        best: comparisonPlans.find(plan => (plan[field] || 0) === maxValue),
        worst: comparisonPlans.find(plan => (plan[field] || 0) === minValue)
      };
    });

    return {
      plans: comparisonPlans,
      data: comparisonData,
      bestWorst,
      count: comparisonPlans.length
    };
  }, [comparisonPlans]);

  return comparison;
};

