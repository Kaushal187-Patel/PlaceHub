import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobService from '../../services/jobService';

const initialState = {
  jobs: [],
  job: null,
  savedJobs: [],
  appliedJobs: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  totalPages: 0,
  currentPage: 1,
};

// Get all jobs
export const getJobs = createAsyncThunk(
  'jobs/getAll',
  async (params, thunkAPI) => {
    try {
      return await jobService.getJobs(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single job
export const getJob = createAsyncThunk(
  'jobs/getOne',
  async (id, thunkAPI) => {
    try {
      return await jobService.getJob(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Apply for job
export const applyForJob = createAsyncThunk(
  'jobs/apply',
  async ({ jobId, applicationData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await jobService.applyForJob(jobId, applicationData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Save job
export const saveJob = createAsyncThunk(
  'jobs/save',
  async (jobId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await jobService.saveJob(jobId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearJob: (state) => {
      state.job = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJobs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.jobs = action.payload.jobs;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getJob.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.job = action.payload;
      })
      .addCase(getJob.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(applyForJob.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.appliedJobs.push(action.payload);
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        state.savedJobs.push(action.payload);
      });
  },
});

export const { reset, clearJob } = jobSlice.actions;
export default jobSlice.reducer;