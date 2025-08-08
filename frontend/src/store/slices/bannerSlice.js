// store/slices/bannerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApiClient } from "../../services/api/client";

// Async thunks
export const uploadBanner = createAsyncThunk(
  "banners/upload",
  async (bannerData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append form fields
      Object.keys(bannerData).forEach((key) => {
        if (key !== "image") {
          formData.append(key, bannerData[key]);
        }
      });

      // Append image file
      if (bannerData.image) {
        formData.append("image", bannerData.image);
      }

      const response = await userApiClient.post("/banners/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload banner"
      );
    }
  }
);

export const fetchBanners = createAsyncThunk(
  "banners/fetchAll",
  async ({ status, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await userApiClient.get(`/banners?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banners"
      );
    }
  }
);

export const fetchBannerById = createAsyncThunk(
  "banners/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApiClient.get(`/banners/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banner"
      );
    }
  }
);

export const updateBanner = createAsyncThunk(
  "banners/update",
  async ({ id, bannerData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append form fields
      Object.keys(bannerData).forEach((key) => {
        if (key !== "image") {
          formData.append(key, bannerData[key]);
        }
      });

      // Append image file if provided
      if (bannerData.image && bannerData.image instanceof File) {
        formData.append("image", bannerData.image);
      }

      const response = await userApiClient.put(`/banners/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update banner"
      );
    }
  }
);

export const deleteBanner = createAsyncThunk(
  "banners/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApiClient.delete(`/banners/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete banner"
      );
    }
  }
);

export const toggleBannerStatus = createAsyncThunk(
  "banners/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApiClient.patch(
        `/banners/${id}/toggle-status`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle banner status"
      );
    }
  }
);

// Initial state
const initialState = {
  banners: [],
  currentBanner: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: {
    fetch: false,
    upload: false,
    update: false,
    delete: false,
    toggle: false,
  },
  error: {
    fetch: null,
    upload: null,
    update: null,
    delete: null,
    toggle: null,
  },
  success: {
    upload: false,
    update: false,
    delete: false,
    toggle: false,
  },
};

// Banner slice
const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        fetch: null,
        upload: null,
        update: null,
        delete: null,
        toggle: null,
      };
    },
    clearSuccess: (state) => {
      state.success = {
        upload: false,
        update: false,
        delete: false,
        toggle: false,
      };
    },
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
    resetBannerState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.banners = action.payload.data || action.payload.banners || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload;
      })

      // Fetch banner by ID
      .addCase(fetchBannerById.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.currentBanner = action.payload.data || action.payload.banner;
      })
      .addCase(fetchBannerById.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload;
      })

      // Upload banner
      .addCase(uploadBanner.pending, (state) => {
        state.loading.upload = true;
        state.error.upload = null;
        state.success.upload = false;
      })
      .addCase(uploadBanner.fulfilled, (state, action) => {
        state.loading.upload = false;
        state.success.upload = true;
        const newBanner = action.payload.data || action.payload.banner;
        if (newBanner) {
          state.banners.unshift(newBanner);
        }
      })
      .addCase(uploadBanner.rejected, (state, action) => {
        state.loading.upload = false;
        state.error.upload = action.payload;
        state.success.upload = false;
      })

      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
        state.success.update = false;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading.update = false;
        state.success.update = true;
        const updatedBanner = action.payload.data || action.payload.banner;
        if (updatedBanner) {
          const index = state.banners.findIndex(
            (b) => b.id === updatedBanner.id
          );
          if (index !== -1) {
            state.banners[index] = updatedBanner;
          }
          if (state.currentBanner?.id === updatedBanner.id) {
            state.currentBanner = updatedBanner;
          }
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
        state.success.update = false;
      })

      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
        state.success.delete = false;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.success.delete = true;
        state.banners = state.banners.filter((b) => b.id !== action.payload.id);
        if (state.currentBanner?.id === action.payload.id) {
          state.currentBanner = null;
        }
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload;
        state.success.delete = false;
      })

      // Toggle banner status
      .addCase(toggleBannerStatus.pending, (state) => {
        state.loading.toggle = true;
        state.error.toggle = null;
        state.success.toggle = false;
      })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        state.loading.toggle = false;
        state.success.toggle = true;
        const updatedBanner = action.payload.data || action.payload.banner;
        if (updatedBanner) {
          const index = state.banners.findIndex(
            (b) => b.id === updatedBanner.id
          );
          if (index !== -1) {
            state.banners[index] = updatedBanner;
          }
          if (state.currentBanner?.id === updatedBanner.id) {
            state.currentBanner = updatedBanner;
          }
        }
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.loading.toggle = false;
        state.error.toggle = action.payload;
        state.success.toggle = false;
      });
  },
});

export const {
  clearErrors,
  clearSuccess,
  clearCurrentBanner,
  resetBannerState,
} = bannerSlice.actions;

export default bannerSlice.reducer;
