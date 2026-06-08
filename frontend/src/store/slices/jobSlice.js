import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobService from '../../services/jobService';
import userService from '../../services/userService';
import applicationService from '../../services/applicationService';

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
      return await jobService.getAllJobs(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single job (no dedicated detail endpoint; resolve from the list)
export const getJob = createAsyncThunk(
  'jobs/getOne',
  async (id, thunkAPI) => {
    try {
      const result = await jobService.getAllJobs();
      const jobs = result.jobs || result.data || [];
      return jobs.find((j) => j.id === id || j._id === id) || null;
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
      return await applicationService.applyForJob(jobId, applicationData);
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
      return await userService.saveJob(jobId);
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