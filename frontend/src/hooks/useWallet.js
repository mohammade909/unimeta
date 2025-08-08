// hooks/useWallet.js
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // User actions
  fetchUserWallet,
  fetchWalletBalance,
  fetchTransactionHistory,
  fetchWalletStats,
  createWithdrawalRequest,
  fetchWithdrawalHistory,
  cancelWithdrawal,
  
  // Admin actions
  fetchAllWallets,
  addBalance,
  deductBalance,
  updateWallet,
  deleteWallet,
  transferBalance,
  
  // Utility actions
  clearError,
  clearSuccessMessage,
  clearAllErrors,
  clearAllSuccessMessages,
  resetWalletState,
  updateTransactionStatus,
  updateWithdrawalStatus,
  
  // Selectors
  selectWalletState,
  selectUserWallet,
  selectWalletBalance,
  selectTransactions,
  selectTransactionsPagination,
  selectWalletStats,
  selectWithdrawalHistory,
  selectWithdrawalPagination,
  selectAllWallets,
  selectWalletsPagination,
  selectWalletLoading,
  selectWalletErrors,
  selectWalletSuccessMessages,
  selectWalletById,
  selectTransactionById,
  selectWithdrawalById,
  selectIsWalletLoading,
  selectHasWalletErrors
} from '../store/slices/walletSlice';

// ========================================
// MAIN WALLET HOOK
// ========================================
export const useWallet = () => {
  const dispatch = useDispatch();
  const walletState = useSelector(selectWalletState);
  const loading = useSelector(selectWalletLoading);
  const errors = useSelector(selectWalletErrors);
  const successMessages = useSelector(selectWalletSuccessMessages);
  const isLoading = useSelector(selectIsWalletLoading);
  const hasErrors = useSelector(selectHasWalletErrors);

  // User wallet operations
  const getUserWallet = useCallback(() => {
    return dispatch(fetchUserWallet());
  }, [dispatch]);

  const getWalletBalance = useCallback(() => {
    return dispatch(fetchWalletBalance());
  }, [dispatch]);

  const getWalletStats = useCallback(() => {
    return dispatch(fetchWalletStats());
  }, [dispatch]);

  // Clear functions
  const clearWalletError = useCallback((errorType) => {
    dispatch(clearError({ errorType }));
  }, [dispatch]);

  const clearWalletSuccessMessage = useCallback((messageType) => {
    dispatch(clearSuccessMessage({ messageType }));
  }, [dispatch]);

  const clearAllWalletErrors = useCallback(() => {
    dispatch(clearAllErrors());
  }, [dispatch]);

  const clearAllWalletSuccessMessages = useCallback(() => {
    dispatch(clearAllSuccessMessages());
  }, [dispatch]);

  const resetWallet = useCallback(() => {
    dispatch(resetWalletState());
  }, [dispatch]);

  return {
    // State
    walletState,
    userWallet: walletState.userWallet,
    walletBalance: walletState.walletBalance,
    walletStats: walletState.walletStats,
    loading,
    errors,
    successMessages,
    isLoading,
    hasErrors,
    
    // Actions
    getUserWallet,
    getWalletBalance,
    getWalletStats,
    clearWalletError,
    clearWalletSuccessMessage,
    clearAllWalletErrors,
    clearAllWalletSuccessMessages,
    resetWallet
  };
};


export const useTransactions = () => {
  const dispatch = useDispatch();
  const transactions = useSelector(selectTransactions);
  const transactionsPagination = useSelector(selectTransactionsPagination);
  const loading = useSelector(state => state.wallet.loading.fetchTransactions);
  const error = useSelector(state => state.wallet.errors.fetchTransactions);

  const getTransactions = useCallback((params = {}) => {
    return dispatch(fetchTransactionHistory(params));
  }, [dispatch]);

  const refreshTransactions = useCallback(() => {
    return dispatch(fetchTransactionHistory({ 
      page: transactionsPagination.currentPage,
      limit: transactionsPagination.limit 
    }));
  }, [dispatch, transactionsPagination]);

  const loadMoreTransactions = useCallback(() => {
    if (transactionsPagination.currentPage < transactionsPagination.totalPages) {
      return dispatch(fetchTransactionHistory({
        page: transactionsPagination.currentPage + 1,
        limit: transactionsPagination.limit
      }));
    }
  }, [dispatch, transactionsPagination]);

  const getTransactionById = useCallback((transactionId) => {
    return useSelector(state => selectTransactionById(state, transactionId));
  }, []);

  const updateTransactionStatusLocal = useCallback((transactionId, status) => {
    dispatch(updateTransactionStatus({ transactionId, status }));
  }, [dispatch]);

  // Auto-fetch transactions on mount
  useEffect(() => {
    if (transactions.length === 0 && !loading && !error) {
      getTransactions();
    }
  }, [getTransactions, transactions.length, loading, error]);

  return {
    // State
    transactions,
    pagination: transactionsPagination,
    loading,
    error,
    
    // Computed
    hasTransactions: transactions.length > 0,
    canLoadMore: transactionsPagination.currentPage < transactionsPagination.totalPages,
    totalTransactions: transactionsPagination.totalItems,
    
    // Actions
    getTransactions,
    refreshTransactions,
    loadMoreTransactions,
    getTransactionById,
    updateTransactionStatusLocal
  };
};


export const useWithdrawals = () => {
  const dispatch = useDispatch();
  const withdrawalHistory = useSelector(selectWithdrawalHistory);
  const withdrawalPagination = useSelector(selectWithdrawalPagination);
  const loading = useSelector(state => ({
    fetch: state.wallet.loading.fetchWithdrawals,
    create: state.wallet.loading.createWithdrawal,
    cancel: state.wallet.loading.cancelWithdrawal
  }));
  const errors = useSelector(state => ({
    fetch: state.wallet.errors.fetchWithdrawals,
    create: state.wallet.errors.createWithdrawal,
    cancel: state.wallet.errors.cancelWithdrawal
  }));
  const successMessages = useSelector(state => ({
    create: state.wallet.successMessages.createWithdrawal,
    cancel: state.wallet.successMessages.cancelWithdrawal
  }));

  const getWithdrawals = useCallback((params = {}) => {
    return dispatch(fetchWithdrawalHistory(params));
  }, [dispatch]);

  const createWithdrawal = useCallback(async (amount, method, details) => {
    try {
      const result = await dispatch(createWithdrawalRequest({ amount, method, details }));
      if (createWithdrawalRequest.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const cancelWithdrawalRequest = useCallback(async (withdrawalId) => {
    try {
      const result = await dispatch(cancelWithdrawal(withdrawalId));
      if (cancelWithdrawal.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const refreshWithdrawals = useCallback(() => {
    return dispatch(fetchWithdrawalHistory({ 
      page: withdrawalPagination.currentPage,
      limit: withdrawalPagination.limit 
    }));
  }, [dispatch, withdrawalPagination]);

  const getWithdrawalById = useCallback((withdrawalId) => {
    return useSelector(state => selectWithdrawalById(state, withdrawalId));
  }, []);

  const updateWithdrawalStatusLocal = useCallback((withdrawalId, status) => {
    dispatch(updateWithdrawalStatus({ withdrawalId, status }));
  }, [dispatch]);

  // Computed values
  const pendingWithdrawals = useMemo(() => 
    withdrawalHistory.filter(w => w.status === 'pending'),
    [withdrawalHistory]
  );

  const completedWithdrawals = useMemo(() => 
    withdrawalHistory.filter(w => w.status === 'completed'),
    [withdrawalHistory]
  );

  const cancelledWithdrawals = useMemo(() => 
    withdrawalHistory.filter(w => w.status === 'cancelled'),
    [withdrawalHistory]
  );

  return {
    // State
    withdrawalHistory,
    pagination: withdrawalPagination,
    loading,
    errors,
    successMessages,
    
    // Computed
    pendingWithdrawals,
    completedWithdrawals,
    cancelledWithdrawals,
    totalWithdrawals: withdrawalPagination.totalItems,
    hasPendingWithdrawals: pendingWithdrawals.length > 0,
    
    // Actions
    getWithdrawals,
    createWithdrawal,
    cancelWithdrawal: cancelWithdrawalRequest,
    refreshWithdrawals,
    getWithdrawalById,
    updateWithdrawalStatusLocal
  };
};


export const useAdminWallet = () => {
  const dispatch = useDispatch();
  const allWallets = useSelector(selectAllWallets);
  const walletsPagination = useSelector(selectWalletsPagination);
  const loading = useSelector(state => ({
    fetch: state.wallet.loading.fetchAllWallets,
    add: state.wallet.loading.addBalance,
    deduct: state.wallet.loading.deductBalance,
    update: state.wallet.loading.updateWallet,
    delete: state.wallet.loading.deleteWallet,
    transfer: state.wallet.loading.transferBalance
  }));
  const errors = useSelector(state => ({
    fetch: state.wallet.errors.fetchAllWallets,
    add: state.wallet.errors.addBalance,
    deduct: state.wallet.errors.deductBalance,
    update: state.wallet.errors.updateWallet,
    delete: state.wallet.errors.deleteWallet,
    transfer: state.wallet.errors.transferBalance
  }));
  const successMessages = useSelector(state => ({
    add: state.wallet.successMessages.addBalance,
    deduct: state.wallet.successMessages.deductBalance,
    update: state.wallet.successMessages.updateWallet,
    delete: state.wallet.successMessages.deleteWallet,
    transfer: state.wallet.successMessages.transferBalance
  }));

  const getAllWallets = useCallback((params = {}) => {
    return dispatch(fetchAllWallets(params));
  }, [dispatch]);

  const addUserBalance = useCallback(async (userId, amount, reason) => {
    try {
      const result = await dispatch(addBalance({ userId, amount, reason }));
      if (addBalance.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const deductUserBalance = useCallback(async (userId, amount, reason) => {
    try {
      const result = await dispatch(deductBalance({ userId, amount, reason }));
      if (deductBalance.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const updateUserWallet = useCallback(async (userId, walletData) => {
    try {
      const result = await dispatch(updateWallet({ userId, walletData }));
      if (updateWallet.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const deleteUserWallet = useCallback(async (userId) => {
    try {
      const result = await dispatch(deleteWallet(userId));
      if (deleteWallet.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const transferUserBalance = useCallback(async (fromUserId, toUserId, amount, reason) => {
    try {
      const result = await dispatch(transferBalance({ fromUserId, toUserId, amount, reason }));
      if (transferBalance.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const getWalletByUserId = useCallback((userId) => {
    return useSelector(state => selectWalletById(state, userId));
  }, []);

  const refreshWallets = useCallback(() => {
    return dispatch(fetchAllWallets({ 
      page: walletsPagination.currentPage,
      limit: walletsPagination.limit 
    }));
  }, [dispatch, walletsPagination]);

  // Computed values
  const totalWalletBalance = useMemo(() => 
    allWallets.reduce((total, wallet) => total + (wallet.balance || 0), 0),
    [allWallets]
  );

  const activeWallets = useMemo(() => 
    allWallets.filter(wallet => wallet.status === 'active'),
    [allWallets]
  );

  const suspendedWallets = useMemo(() => 
    allWallets.filter(wallet => wallet.status === 'suspended'),
    [allWallets]
  );

  return {
    // State
    allWallets,
    pagination: walletsPagination,
    loading,
    errors,
    successMessages,
    
    // Computed
    totalWalletBalance,
    activeWallets,
    suspendedWallets,
    totalWalletsCount: walletsPagination.totalItems,
    
    // Actions
    getAllWallets,
    addBalance: addUserBalance,
    deductBalance: deductUserBalance,
    updateWallet: updateUserWallet,
    deleteWallet: deleteUserWallet,
    transferBalance: transferUserBalance,
    getWalletByUserId,
    refreshWallets
  };
};


export const useDeposit = () => {
  const dispatch = useDispatch();
  
  // Note: Add deposit-related actions to your slice if needed
  const createDeposit = useCallback(async (amount, method, details) => {
    // This would be implemented if you have deposit functionality
    // For now, returning a placeholder
    console.log('Deposit functionality not implemented in slice');
    return { success: false, error: 'Deposit not implemented' };
  }, []);

  return {
    createDeposit
  };
};


export const useWalletOperations = () => {
  const walletHook = useWallet();
  const transactionsHook = useTransactions();
  const withdrawalsHook = useWithdrawals();
  const adminHook = useAdminWallet();
  const depositHook = useDeposit();

  // Combined loading state
  const isAnyOperationLoading = useMemo(() => {
    return walletHook.isLoading || 
           transactionsHook.loading || 
           withdrawalsHook.loading.create || 
           withdrawalsHook.loading.cancel ||
           adminHook.loading.add ||
           adminHook.loading.deduct ||
           adminHook.loading.transfer;
  }, [walletHook.isLoading, transactionsHook.loading, withdrawalsHook.loading, adminHook.loading]);

  // Combined error checking
  const hasAnyError = useMemo(() => {
    return walletHook.hasErrors ||
           !!transactionsHook.error ||
           !!withdrawalsHook.errors.create ||
           !!withdrawalsHook.errors.cancel ||
           !!adminHook.errors.add ||
           !!adminHook.errors.deduct ||
           !!adminHook.errors.transfer;
  }, [walletHook.hasErrors, transactionsHook.error, withdrawalsHook.errors, adminHook.errors]);

  // Initialize wallet data
  const initializeWallet = useCallback(async () => {
    try {
      await Promise.all([
        walletHook.getUserWallet(),
        walletHook.getWalletBalance(),
        walletHook.getWalletStats(),
        transactionsHook.getTransactions(),
        withdrawalsHook.getWithdrawals()
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [walletHook, transactionsHook, withdrawalsHook]);

  return {
    // Individual hooks
    wallet: walletHook,
    transactions: transactionsHook,
    withdrawals: withdrawalsHook,
    admin: adminHook,
    deposit: depositHook,
    
    // Combined states
    isAnyOperationLoading,
    hasAnyError,
    
    // Combined actions
    initializeWallet
  };
};


export const useWalletAutoRefresh = (interval = 30000) => { // 30 seconds default
  const { wallet, transactions, withdrawals } = useWalletOperations();

  useEffect(() => {
    const refreshData = () => {
      wallet.getWalletBalance();
      transactions.refreshTransactions();
      withdrawals.refreshWithdrawals();
    };

    const intervalId = setInterval(refreshData, interval);
    
    return () => clearInterval(intervalId);
  }, [wallet, transactions, withdrawals, interval]);

  return {
    isAutoRefreshActive: true,
    refreshInterval: interval
  };
};