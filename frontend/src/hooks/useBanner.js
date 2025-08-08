// hooks/useBanner.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  uploadBanner,
  fetchBanners,
  fetchBannerById,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  clearErrors,
  clearSuccess,
  clearCurrentBanner,
  resetBannerState,
} from '../store/slices/bannerSlice';

// Main banner hook
export const useBanner = () => {
  const dispatch = useDispatch();
  const bannerState = useSelector((state) => state.banners);

  const actions = {
    uploadBanner: useCallback((bannerData) => dispatch(uploadBanner(bannerData)), [dispatch]),
    fetchBanners: useCallback((params) => dispatch(fetchBanners(params)), [dispatch]),
    fetchBannerById: useCallback((id) => dispatch(fetchBannerById(id)), [dispatch]),
    updateBanner: useCallback((id, bannerData) => dispatch(updateBanner({ id, bannerData })), [dispatch]),
    deleteBanner: useCallback((id) => dispatch(deleteBanner(id)), [dispatch]),
    toggleBannerStatus: useCallback((id) => dispatch(toggleBannerStatus(id)), [dispatch]),
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearSuccess: useCallback(() => dispatch(clearSuccess()), [dispatch]),
    clearCurrentBanner: useCallback(() => dispatch(clearCurrentBanner()), [dispatch]),
    resetBannerState: useCallback(() => dispatch(resetBannerState()), [dispatch]),
  };

  return {
    ...bannerState,
    actions,
  };
};

// Banner upload hook with form handling
export const useBannerUpload = (onSuccess, onError) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => ({
    loading: state.banners.loading.upload,
    error: state.banners.error.upload,
    success: state.banners.success.upload,
  }));

  const uploadBannerWithCallback = useCallback(
    async (bannerData) => {
      try {
        const result = await dispatch(uploadBanner(bannerData)).unwrap();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        if (onError) onError(err);
        throw err;
      }
    },
    [dispatch, onSuccess, onError]
  );

  const clearUploadState = useCallback(() => {
    dispatch(clearErrors());
    dispatch(clearSuccess());
  }, [dispatch]);

  return {
    uploadBanner: uploadBannerWithCallback,
    loading,
    error,
    success,
    clearUploadState,
  };
};

// Banner list hook with pagination
export const useBannerList = (initialParams = {}) => {
  const dispatch = useDispatch();
  const { banners, pagination, loading, error } = useSelector((state) => ({
    banners: state.banners.banners,
    pagination: state.banners.pagination,
    loading: state.banners.loading.fetch,
    error: state.banners.error.fetch,
  }));

  const fetchBannersWithParams = useCallback(
    (params = {}) => {
      const mergedParams = { ...initialParams, ...params };
      return dispatch(fetchBanners(mergedParams));
    },
    [dispatch, initialParams]
  );

  const refreshBanners = useCallback(() => {
    return fetchBannersWithParams(initialParams);
  }, [fetchBannersWithParams, initialParams]);

  useEffect(() => {
    fetchBannersWithParams();
  }, [fetchBannersWithParams]);

  return {
    banners,
    pagination,
    loading,
    error,
    fetchBanners: fetchBannersWithParams,
    refreshBanners,
  };
};

// Banner detail hook
export const useBannerDetail = (id) => {
  const dispatch = useDispatch();
  const { currentBanner, loading, error } = useSelector((state) => ({
    currentBanner: state.banners.currentBanner,
    loading: state.banners.loading.fetch,
    error: state.banners.error.fetch,
  }));

  const fetchBanner = useCallback(() => {
    if (id) {
      return dispatch(fetchBannerById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchBanner();
    return () => {
      dispatch(clearCurrentBanner());
    };
  }, [fetchBanner, dispatch]);

  return {
    banner: currentBanner,
    loading,
    error,
    refetch: fetchBanner,
  };
};

// Banner update hook
export const useBannerUpdate = (onSuccess, onError) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => ({
    loading: state.banners.loading.update,
    error: state.banners.error.update,
    success: state.banners.success.update,
  }));

  const updateBannerWithCallback = useCallback(
    async (id, bannerData) => {
      try {
        const result = await dispatch(updateBanner({ id, bannerData })).unwrap();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        if (onError) onError(err);
        throw err;
      }
    },
    [dispatch, onSuccess, onError]
  );

  const clearUpdateState = useCallback(() => {
    dispatch(clearErrors());
    dispatch(clearSuccess());
  }, [dispatch]);

  return {
    updateBanner: updateBannerWithCallback,
    loading,
    error,
    success,
    clearUpdateState,
  };
};

// Banner delete hook
export const useBannerDelete = (onSuccess, onError) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => ({
    loading: state.banners.loading.delete,
    error: state.banners.error.delete,
    success: state.banners.success.delete,
  }));

  const deleteBannerWithCallback = useCallback(
    async (id) => {
      try {
        const result = await dispatch(deleteBanner(id)).unwrap();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        if (onError) onError(err);
        throw err;
      }
    },
    [dispatch, onSuccess, onError]
  );

  return {
    deleteBanner: deleteBannerWithCallback,
    loading,
    error,
    success,
  };
};

// Banner status toggle hook
export const useBannerToggle = (onSuccess, onError) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => ({
    loading: state.banners.loading.toggle,
    error: state.banners.error.toggle,
    success: state.banners.success.toggle,
  }));

  const toggleStatusWithCallback = useCallback(
    async (id) => {
      try {
        const result = await dispatch(toggleBannerStatus(id)).unwrap();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        if (onError) onError(err);
        throw err;
      }
    },
    [dispatch, onSuccess, onError]
  );

  return {
    toggleStatus: toggleStatusWithCallback,
    loading,
    error,
    success,
  };
};