import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApiClient } from '../../services/api/client'; // Adjust path

// API base
const BASE_URL = '/rewards';

// Async Thunks
export const fetchRewardPrograms = createAsyncThunk(
  'rewardPrograms/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.get(BASE_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchRewardProgramById = createAsyncThunk(
  'rewardPrograms/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.get(`${BASE_URL}/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchRewardProgramsByType = createAsyncThunk(
  'rewardPrograms/fetchByType',
  async (type, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.get(`${BASE_URL}/type/${type}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createRewardProgram = createAsyncThunk(
  'rewardPrograms/create',
  async (programData, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.post(BASE_URL, programData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateRewardProgram = createAsyncThunk(
  'rewardPrograms/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.put(`${BASE_URL}/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteRewardProgram = createAsyncThunk(
  'rewardPrograms/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminApiClient.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const activateRewardProgram = createAsyncThunk(
  'rewardPrograms/activate',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.patch(`${BASE_URL}/${id}/activate`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deactivateRewardProgram = createAsyncThunk(
  'rewardPrograms/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.patch(`${BASE_URL}/${id}/deactivate`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchRewardProgramStats = createAsyncThunk(
  'rewardPrograms/stats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.get(`${BASE_URL}/stats`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Initial State
const initialState = {
  programs: [],
  selectedProgram: null,
  stats: null,
  loading: false,
  error: null,
  success: null,
};

// Slice
const rewardProgramsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearRewardProgramError: (state) => {
      state.error = null;
    },
    clearRewardProgramSuccess: (state) => {
      state.success = null;
    },
    clearSelectedRewardProgram: (state) => {
      state.selectedProgram = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewardPrograms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewardPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload.data;
      })
      .addCase(fetchRewardPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchRewardProgramById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewardProgramById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProgram = action.payload;
      })
      .addCase(fetchRewardProgramById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchRewardProgramsByType.fulfilled, (state, action) => {
        state.programs = action.payload;
      })

      .addCase(createRewardProgram.fulfilled, (state, action) => {
        state.programs.push(action.payload);
        state.success = 'Reward program created successfully';
      })
      .addCase(updateRewardProgram.fulfilled, (state, action) => {
        const index = state.programs.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.programs[index] = action.payload;
        state.success = 'Reward program updated successfully';
      })
      .addCase(deleteRewardProgram.fulfilled, (state, action) => {
        state.programs = state.programs.filter(p => p.id !== action.payload);
        state.success = 'Reward program deleted successfully';
      })

      .addCase(activateRewardProgram.fulfilled, (state, action) => {
        const index = state.programs.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.programs[index].active = true;
        state.success = 'Reward program activated';
      })

      .addCase(deactivateRewardProgram.fulfilled, (state, action) => {
        const index = state.programs.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.programs[index].active = false;
        state.success = 'Reward program deactivated';
      })

      .addCase(fetchRewardProgramStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      );
  }
});

// Export actions
export const {
  clearRewardProgramError,
  clearRewardProgramSuccess,
  clearSelectedRewardProgram
} = rewardProgramsSlice.actions;

// Selectors
export const selectRewardPrograms = (state) => state.rewards.programs;
export const selectSelectedRewardProgram = (state) => state.rewards.selectedProgram;
export const selectRewardProgramStats = (state) => state.rewards.stats;
export const selectRewardProgramsLoading = (state) => state.rewards.loading;
export const selectRewardProgramsError = (state) => state.rewards.error;
export const selectRewardProgramsSuccess = (state) => state.rewards.success;

// Export reducer
export default rewardProgramsSlice.reducer;
