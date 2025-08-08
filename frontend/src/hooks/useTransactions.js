// hooks/useTransactions.js
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserTransactions,
  fetchAllTransactions,
  fetchTransactionById,
  fetchTransactionByHash,
  fetchTransactionByReference,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
  fetchTransactionStats,
  exportTransactions,
  setUserFilters,
  setAdminFilters,
  clearFilters,
  clearError,
  resetSearchResults,
  resetCurrentTransaction,
  optimisticUpdateTransaction,
  selectUserTransactions,
  selectAdminTransactions,
  selectCurrentTransaction,
  selectSearchResults,
  selectTransactionStats,
  selectTransactionFilters,
  selectTransactionOperations,
  selectLastError,
  selectTransactionById,
  selectTransactionsByType,
  selectTransactionsByStatus,
  selectTransactionsByDateRange,
  selectUserDailyLimit,
  fetchDailyLimit,
} from "../store/slices/transactions";

// Main hook for user transactions
export const useUserTransactions = (options = {}) => {
  const dispatch = useDispatch();
  const transactions = useSelector(selectUserTransactions);
  const filters = useSelector(selectTransactionFilters);
  const operations = useSelector(selectTransactionOperations);
  const lastError = useSelector(selectLastError);

  const {
    autoFetch = true,
    page = 1,
    limit = 10,
    userId,
    transaction_type,
  } = options;

  const fetchTransactions = useCallback(
    (customOptions = {}) => {
      const fetchOptions = {
        userId,
        page,
        limit,
        filters: { ...filters.user, transaction_type },
        ...customOptions,
      };
      dispatch(fetchUserTransactions(fetchOptions));
    },
    [dispatch, userId, page, limit, filters.user, transaction_type]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setUserFilters(newFilters));
    },
    [dispatch]
  );

  const clearUserFilters = useCallback(() => {
    dispatch(clearFilters("user"));
  }, [dispatch]);

  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchTransactions();
    }
  }, [autoFetch, userId, page, limit, filters.user, fetchTransactions]);

  return {
    transactions: transactions.data,
    totalCount: transactions.totalCount,
    currentPage: transactions.currentPage,
    totalPages: transactions.totalPages,
    loading: transactions.loading,
    error: transactions.error,
    filters: filters.user,
    operations,
    lastError,
    fetchTransactions,
    setFilters,
    clearFilters: clearUserFilters,
    refetch,
  };
};

// Hook for admin transactions
export const useAdminTransactions = (options = {}) => {
  const dispatch = useDispatch();
  const transactions = useSelector(selectAdminTransactions);
  const filters = useSelector(selectTransactionFilters);
  const operations = useSelector(selectTransactionOperations);
  const lastError = useSelector(selectLastError);
  const { autoFetch = true, page = 1, limit = 50, transaction_type } = options;

  const fetchTransactions = useCallback(
    (customOptions = {}) => {
      const fetchOptions = {
        page,
        limit,
        filters: { ...filters.admin, transaction_type },
        ...customOptions,
      };
      dispatch(fetchAllTransactions(fetchOptions));
    },
    [dispatch, page, limit, filters.admin, transaction_type]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setAdminFilters(newFilters));
    },
    [dispatch]
  );

  const clearAdminFilters = useCallback(() => {
    dispatch(clearFilters("admin"));
  }, [dispatch]);

  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [autoFetch, page, limit, filters.admin, fetchTransactions]);

  return {
    transactions: transactions.data,
    totalCount: transactions.totalCount,
    currentPage: transactions.currentPage,
    totalPages: transactions.totalPages,
    loading: transactions.loading,
    error: transactions.error,
    filters: filters.admin,
    operations,
    lastError,
    fetchTransactions,
    setFilters,
    clearFilters: clearAdminFilters,
    refetch,
  };
};

// Hook for individual transaction
export const useTransaction = (id) => {
  const dispatch = useDispatch();
  const transaction = useSelector(selectCurrentTransaction);
  const cachedTransaction = useSelector((state) =>
    selectTransactionById(state, id)
  );

  const fetchTransaction = useCallback(() => {
    if (id) {
      dispatch(fetchTransactionById(id));
    }
  }, [dispatch, id]);

  const clearTransaction = useCallback(() => {
    dispatch(resetCurrentTransaction());
  }, [dispatch]);

  useEffect(() => {
    if (id && !cachedTransaction) {
      fetchTransaction();
    } else if (cachedTransaction && !transaction.data) {
      // Use cached version if available
      dispatch(resetCurrentTransaction());
    }
  }, [id, cachedTransaction, transaction.data, fetchTransaction, dispatch]);

  return {
    transaction: transaction.data || cachedTransaction,
    loading: transaction.loading,
    error: transaction.error,
    fetchTransaction,
    clearTransaction,
  };
};

// Hook for transaction search
export const useTransactionSearch = () => {
  const dispatch = useDispatch();
  const searchResults = useSelector(selectSearchResults);

  const searchByHash = useCallback(
    (hash) => {
      dispatch(fetchTransactionByHash(hash));
    },
    [dispatch]
  );

  const searchByReference = useCallback(
    (reference) => {
      dispatch(fetchTransactionByReference(reference));
    },
    [dispatch]
  );

  const clearSearchResults = useCallback(() => {
    dispatch(resetSearchResults());
  }, [dispatch]);

  return {
    searchResults,
    searchByHash,
    searchByReference,
    clearSearchResults,
  };
};

// Hook for transaction operations (admin)
export const useTransactionOperations = () => {
  const dispatch = useDispatch();
  const operations = useSelector(selectTransactionOperations);
  const lastError = useSelector(selectLastError);

  const createNewTransaction = useCallback(
    async (transactionData) => {
      try {
        const result = await dispatch(
          createTransaction(transactionData)
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to create transaction",
        };
      }
    },
    [dispatch]
  );

  const updateExistingTransaction = useCallback(
    async (id, data) => {
      try {
        const result = await dispatch(updateTransaction({ id, data })).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to update transaction",
        };
      }
    },
    [dispatch]
  );

  const updateStatus = useCallback(
    async (id, status, adminNotes = "") => {
      try {
        // Optimistic update
        dispatch(
          optimisticUpdateTransaction({
            id,
            updates: {
              status,
              admin_notes: adminNotes,
              processed_at: new Date().toISOString(),
            },
          })
        );

        const result = await dispatch(
          updateTransactionStatus({ id, status, adminNotes })
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        // Revert optimistic update on failure
        return {
          success: false,
          error: error.message || "Failed to update transaction status",
        };
      }
    },
    [dispatch]
  );

  const deleteTransactionById = useCallback(
    async (id) => {
      try {
        await dispatch(deleteTransaction(id)).unwrap();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to delete transaction",
        };
      }
    },
    [dispatch]
  );

  const clearOperationError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    operations,
    lastError,
    createNewTransaction,
    updateExistingTransaction,
    updateStatus,
    deleteTransactionById,
    clearOperationError,
  };
};

// Hook for transaction statistics
export const useTransactionStats = (filters = {}) => {
  const dispatch = useDispatch();
  const stats = useSelector(selectTransactionStats);
  const limit = useSelector(selectUserDailyLimit);

  const filtersString = JSON.stringify(filters);

  const fetchStats = useCallback(
    (customFilters = {}) => {
      const parsedFilters = JSON.parse(filtersString);
      const mergedFilters = { ...parsedFilters, ...customFilters };
      dispatch(fetchTransactionStats(mergedFilters));
    },
    [dispatch, filtersString]
  );
  const fetchLimit = useCallback(() => {
    dispatch(fetchDailyLimit());
  }, [dispatch]);

  const refreshStats = useCallback(() => {
    const parsedFilters = JSON.parse(filtersString);
    dispatch(fetchTransactionStats(parsedFilters));
  }, [dispatch, filtersString]);

  // Only fetch when filters change (not when fetchStats changes)
  useEffect(() => {
    const parsedFilters = JSON.parse(filtersString);
    dispatch(fetchTransactionStats(parsedFilters));
    fetchLimit();
  }, [dispatch]);

  return {
    stats: stats.data,
    loading: stats.loading,
    limit,
    error: stats.error,
    fetchStats,
    fetchLimit,
    refreshStats,
  };
};
export const useUserLimit = () => {
  const dispatch = useDispatch();
   const stats = useSelector(selectTransactionStats);
  const limit = useSelector(selectUserDailyLimit);

  const fetchLimit = useCallback(() => {
    dispatch(fetchDailyLimit());
  }, [dispatch]);

  useEffect(() => {
    fetchLimit();
  }, [fetchLimit]);

  return {
    limit,
    error: stats.error,
    loading: stats.loading,
    fetchLimit,
  };
};

// Hook for transaction export
export const useTransactionExport = () => {
  const dispatch = useDispatch();
  const { exporting } = useSelector(selectTransactionOperations);
  const lastError = useSelector(selectLastError);

  const exportData = useCallback(
    async (filters = {}) => {
      try {
        const result = await dispatch(exportTransactions(filters)).unwrap();

        // Create download link
        const blob = new Blob([result], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `transactions_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to export transactions",
        };
      }
    },
    [dispatch]
  );

  return {
    exporting,
    lastError,
    exportData,
  };
};

// Hook for filtered transactions
export const useFilteredTransactions = (filterOptions = {}) => {
  const {
    transactionType,
    status,
    startDate,
    endDate,
    isAdmin = false,
  } = filterOptions;

  const transactionsByType = useSelector((state) =>
    transactionType
      ? selectTransactionsByType(state, transactionType, isAdmin)
      : null
  );

  const transactionsByStatus = useSelector((state) =>
    status ? selectTransactionsByStatus(state, status, isAdmin) : null
  );

  const transactionsByDateRange = useSelector((state) =>
    startDate && endDate
      ? selectTransactionsByDateRange(state, startDate, endDate, isAdmin)
      : null
  );

  const filteredTransactions = useMemo(() => {
    const baseTransactions = isAdmin
      ? useSelector(selectAdminTransactions).data
      : useSelector(selectUserTransactions).data;

    let filtered = baseTransactions;

    if (transactionType) {
      filtered = filtered.filter((t) => t.transaction_type === transactionType);
    }

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (startDate && endDate) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.created_at);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return filtered;
  }, [
    transactionType,
    status,
    startDate,
    endDate,
    isAdmin,
    transactionsByType,
    transactionsByStatus,
    transactionsByDateRange,
  ]);

  return {
    transactions: filteredTransactions,
    count: filteredTransactions.length,
  };
};

// Hook for transaction pagination
export const useTransactionPagination = (isAdmin = false) => {
  const transactions = useSelector(
    isAdmin ? selectAdminTransactions : selectUserTransactions
  );

  const paginationInfo = useMemo(
    () => ({
      currentPage: transactions.currentPage,
      totalPages: transactions.totalPages,
      totalCount: transactions.totalCount,
      hasNextPage: transactions.currentPage < transactions.totalPages,
      hasPrevPage: transactions.currentPage > 1,
      itemsPerPage:
        Math.ceil(transactions.totalCount / transactions.totalPages) || 10,
    }),
    [transactions]
  );

  return paginationInfo;
};

// Hook for transaction form validation
export const useTransactionValidation = () => {
  const validateTransaction = useCallback((transactionData) => {
    const errors = {};

    // Required fields
    if (!transactionData.user_id) {
      errors.user_id = "User ID is required";
    }

    if (!transactionData.transaction_type) {
      errors.transaction_type = "Transaction type is required";
    }

    if (!transactionData.amount || transactionData.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!transactionData.source_type) {
      errors.source_type = "Source type is required";
    }

    // Validate amount format
    if (
      transactionData.amount &&
      !/^\d+(\.\d{1,2})?$/.test(transactionData.amount.toString())
    ) {
      errors.amount =
        "Amount must be a valid decimal with up to 2 decimal places";
    }

    // Validate fee amount if provided
    if (transactionData.fee_amount && transactionData.fee_amount < 0) {
      errors.fee_amount = "Fee amount cannot be negative";
    }

    // Validate currency
    if (transactionData.currency && transactionData.currency.length !== 3) {
      errors.currency = "Currency must be a 3-character code";
    }

    // Validate transaction hash format if provided
    if (
      transactionData.transaction_hash &&
      transactionData.transaction_hash.length > 255
    ) {
      errors.transaction_hash = "Transaction hash too long";
    }

    // Validate reference ID format if provided
    if (
      transactionData.reference_id &&
      transactionData.reference_id.length > 100
    ) {
      errors.reference_id = "Reference ID too long";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  const validateStatusUpdate = useCallback((status, adminNotes) => {
    const errors = {};

    if (!status) {
      errors.status = "Status is required";
    }

    if (
      !["pending", "processing", "completed", "failed", "cancelled"].includes(
        status
      )
    ) {
      errors.status = "Invalid status value";
    }

    if (adminNotes && adminNotes.length > 1000) {
      errors.admin_notes = "Admin notes too long (max 1000 characters)";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  return {
    validateTransaction,
    validateStatusUpdate,
  };
};

// Hook for transaction utilities
export const useTransactionUtils = () => {
  const formatAmount = useCallback((amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: "yellow",
      processing: "blue",
      completed: "green",
      failed: "red",
      cancelled: "gray",
    };
    return colors[status] || "gray";
  }, []);

  const getTransactionTypeLabel = useCallback((type) => {
    const labels = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      roi_earning: "ROI Earning",
      level_commission: "Level Commission",
      direct_bonus: "Direct Bonus",
      reward_bonus: "Reward Bonus",
      transfer_in: "Transfer In",
      transfer_out: "Transfer Out",
      invest: "Investment",
      topup: "Top Up",
      compound: "Compound",
      penalty: "Penalty",
      refund: "Refund",
      salary: "Salary",
    };
    return labels[type] || type;
  }, []);

  const calculateNetAmount = useCallback((amount, feeAmount = 0) => {
    return parseFloat(amount) - parseFloat(feeAmount);
  }, []);

  const generateTransactionHash = useCallback(() => {
    return "TXN_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }, []);

  const generateReferenceId = useCallback(() => {
    return "REF_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
  }, []);

  return {
    formatAmount,
    formatDate,
    getStatusColor,
    getTransactionTypeLabel,
    calculateNetAmount,
    generateTransactionHash,
    generateReferenceId,
  };
};

// Hook for real-time transaction updates
export const useTransactionRealTime = (transactionId) => {
  const dispatch = useDispatch();
  const transaction = useSelector((state) =>
    selectTransactionById(state, transactionId)
  );

  useEffect(() => {
    if (!transactionId) return;

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(
      `${process.env.REACT_APP_WS_URL}/transactions/${transactionId}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "TRANSACTION_UPDATE") {
        dispatch(
          optimisticUpdateTransaction({
            id: transactionId,
            updates: data.transaction,
          })
        );
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [transactionId, dispatch]);

  return transaction;
};

// Hook for bulk transaction operations
export const useBulkTransactionOperations = () => {
  const dispatch = useDispatch();
  const operations = useSelector(selectTransactionOperations);

  const bulkUpdateStatus = useCallback(
    async (transactionIds, status, adminNotes = "") => {
      const results = [];

      for (const id of transactionIds) {
        try {
          // Optimistic update
          dispatch(
            optimisticUpdateTransaction({
              id,
              updates: {
                status,
                admin_notes: adminNotes,
                processed_at: new Date().toISOString(),
              },
            })
          );

          const result = await dispatch(
            updateTransactionStatus({ id, status, adminNotes })
          ).unwrap();
          results.push({ id, success: true, data: result });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      return results;
    },
    [dispatch]
  );

  const bulkDelete = useCallback(
    async (transactionIds) => {
      const results = [];

      for (const id of transactionIds) {
        try {
          await dispatch(deleteTransaction(id)).unwrap();
          results.push({ id, success: true });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      return results;
    },
    [dispatch]
  );

  return {
    operations,
    bulkUpdateStatus,
    bulkDelete,
  };
};
