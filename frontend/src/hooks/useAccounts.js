// hooks/useAccount.js
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import {
  createAccount,
  getAccountById,
  getUserAccounts,
  updateAccount,
  clearError,
  clearSuccess,
  resetWalletState,
  setCurrentAccount,
} from "../store/slices/accountSlice";

export const useAccount = () => {
  const dispatch = useDispatch();
  const accountState = useSelector((state) => state.accounts);

  // Actions
  const handleCreateAccount = useCallback(
    (walletData) => dispatch(createAccount(walletData)),
    [dispatch]
  );

  const handleGetAccountById = useCallback(
    (walletId) => dispatch(getAccountById(walletId)),
    [dispatch]
  );

  const handleGetUserAccounts = useCallback(
    (userId, params = {}) => dispatch(getUserAccounts({ userId, params })),
    [dispatch]
  );

  const handleUpdateAccount = useCallback(
    (walletId, updateData) => dispatch(updateAccount({ walletId, updateData })),
    [dispatch]
  );

  const handleClearError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  const handleClearSuccess = useCallback(
    () => dispatch(clearSuccess()),
    [dispatch]
  );

  const handleResetWalletState = useCallback(
    () => dispatch(resetWalletState()),
    [dispatch]
  );

  const handleSetCurrentAccount = useCallback(
    (wallet) => dispatch(setCurrentAccount(wallet)),
    [dispatch]
  );

  return {
    // State
    accounts: accountState.accounts,
    currentAccount: accountState.currentAccount,
    pagination: accountState.pagination,
    loading: accountState.loading,
    error: accountState.error,
    success: accountState.success,

    // Actions
    createAccount: handleCreateAccount,
    getAccountById: handleGetAccountById,
    getUserAccounts: handleGetUserAccounts,
    updateAccount: handleUpdateAccount,
    clearError: handleClearError,
    clearSuccess: handleClearSuccess,
    resetWalletState: handleResetWalletState,
    setCurrentAccount: handleSetCurrentAccount,
  };
};

// Hook for wallet creation form
export const useAccountCreate = () => {
  const { createAccount, loading, error, success, clearError, clearSuccess } =
    useAccount();

  const handleSubmit = useCallback(
    async (walletData) => {
      try {
        const result = await createAccount(walletData);
        return result;
      } catch (err) {
        throw err;
      }
    },
    [createAccount]
  );

  // Auto clear messages after some time
  useEffect(() => {
    if (success.create) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success.create, clearSuccess]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return {
    createAccount: handleSubmit,
    isCreating: loading.create,
    createError: error,
    createSuccess: success.create,
    clearError,
    clearSuccess,
  };
};

// Hook for wallet update form
export const useAccountUpdate = () => {
  const { updateAccount, loading, error, success, clearError, clearSuccess } =
    useAccount();

  const handleSubmit = useCallback(
    async (walletId, updateData) => {
      try {
        const result = await updateAccount(walletId, updateData);
        return result;
      } catch (err) {
        throw err;
      }
    },
    [updateAccount]
  );

  // Auto clear messages after some time
  useEffect(() => {
    if (success.update) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success.update, clearSuccess]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return {
    updateAccount: handleSubmit,
    isUpdating: loading.update,
    updateError: error,
    updateSuccess: success.update,
    clearError,
    clearSuccess,
  };
};

// Hook for fetching user wallets with pagination
export const useUserAccounts = () => {
  const { getUserAccounts, accounts, pagination, loading, error } =
    useAccount();

  const fetchWallets = useCallback(
    (params = {}) => {
      return getUserAccounts(params);
    },
    [getUserAccounts]
  );

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading.fetch) {
      const params = {
        limit: pagination.limit,
        offset: pagination.offset + pagination.limit,
      };
      return fetchWallets(params);
    }
  }, [pagination, loading.fetch, fetchWallets]);

  const refresh = useCallback(() => {
    const params = { limit: pagination.limit, offset: 0 };
    return fetchWallets(params);
  }, [pagination.limit, fetchWallets]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    accounts,
    pagination,
    isLoading: loading.fetch,
    error,
    fetchWallets,
    loadMore,
    refresh,
  };
};
