import { useState, useEffect, useCallback, useRef } from "react";
import { BASEURL } from "../baseurl";
// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// API configuration
const API_CONFIG = {
  baseURL: BASEURL,
  endpoints: {
    dashboard: "/admin/stats", // Adjust to your actual endpoint
  },
  timeout: 10000, // 10 seconds
};

// Utility function for API calls
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // console.log(await response.json())
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Cache utilities
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Main dashboard data hook
export const useDashboardData = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableCache = true,
    onError = null,
    onSuccess = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const cacheKey = "dashboard_data";

      // Check cache first (unless force refresh)
      if (enableCache && !forceRefresh) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          if (mountedRef.current) {
            setData(cachedData);
            setLoading(false);
            setError(null);
            setLastUpdated(new Date());
          }
          return cachedData;
        }
      }

      // Set loading state
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetchWithTimeout(
          `${API_CONFIG.baseURL}${API_CONFIG.endpoints.dashboard}`,
          {
            method: "GET",
            signal: abortControllerRef.current.signal,
          }
        );
       
        
        
        // if (!mountedRef.current) return;

        

        // Validate response structure
        if (!response.success || !response.data) {
          throw new Error("Invalid response structure");
        }

        const dashboardData = response.data;

        // Cache the data
        if (enableCache) {
          setCachedData(cacheKey, dashboardData);
        }

        // Update state
        setData(dashboardData);
        setLoading(false);
        setError(null);
        setLastUpdated(new Date());
        setRetryCount(0);

        // Call success callback
        if (onSuccess) {
          onSuccess(dashboardData);
        }

        return dashboardData;
      } catch (err) {
        if (!mountedRef.current) return;

        // Handle different error types
        let errorMessage = "Failed to fetch dashboard data";

        if (err.name === "AbortError") {
          errorMessage = "Request was cancelled";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (err.message.includes("401")) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (err.message.includes("403")) {
          errorMessage = "Access denied. Insufficient permissions.";
        } else if (err.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = err.message || errorMessage;
        }

        const errorObj = {
          message: errorMessage,
          status: err.status || null,
          timestamp: new Date(),
        };

        setError(errorObj);
        setLoading(false);
        setRetryCount((prev) => prev + 1);

        // Call error callback
        if (onError) {
          onError(errorObj);
        }

        throw errorObj;
      }
    },
    [enableCache, onError, onSuccess]
  );

  // Retry mechanism
  const retry = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (!loading && mountedRef.current) {
          fetchDashboardData();
        }
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, loading, fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Computed values
  const isStale =
    lastUpdated && Date.now() - lastUpdated.getTime() > CACHE_DURATION;
  const canRetry = retryCount < 3;

  return {
    // Data
    data,
    loading,
    error,
    lastUpdated,
    isStale,

    // Actions
    refresh,
    retry,

    // Status
    retryCount,
    canRetry,

    // Utility
    clearCache: () => cache.clear(),
  };
};

// Specialized hooks for different data sections
export const useUserStats = (options = {}) => {
  const { data, loading, error, ...rest } = useDashboardData(options);

  return {
    data: data?.users || null,
    loading,
    error,
    ...rest,
  };
};


export const useTransactionStats = (options = {}) => {
  const { data, loading, error, ...rest } = useDashboardData(options);

  return {
    data: data?.transactions || null,
    loading,
    error,
    ...rest,
  };
};

export const useInvestmentStats = (options = {}) => {
  const { data, loading, error, ...rest } = useDashboardData(options);

  return {
    data: data?.investments || null,
    loading,
    error,
    ...rest,
  };
};

export const useWithdrawalStats = (options = {}) => {
  const { data, loading, error, ...rest } = useDashboardData(options);

  return {
    data: data?.withdrawals || null,
    loading,
    error,
    ...rest,
  };
};

export const useRecentActivity = (options = {}) => {
  const { data, loading, error, ...rest } = useDashboardData(options);

  return {
    data: data?.recentActivity || [],
    loading,
    error,
    ...rest,
  };
};
