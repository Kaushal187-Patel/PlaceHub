import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import careerService from '../../services/careerService';

const initialState = {
  recommendations: [],
  insights: [],
  analysis: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get career recommendations
export const getCareerRecommendations = createAsyncThunk(
  'career/getRecommendations',
  async (userData, thunkAPI) => {
    try {
      const response = await careerService.getRecommendations(userData);
      console.log('Career recommendations response:', response);
      
      // Handle backend response format: { status: 'success', data: [...], insights: [...] }
      if (response.status === 'success' && response.data) {
        return {
          recommendations: response.data,
          insights: response.insights || []
        };
      }
      
      // Fallback for direct data
      return response;
    } catch (error) {
      console.error('Career recommendations error:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to get recommendations');
    }
  }
);

// Analyze resume
export const analyzeResume = createAsyncThunk(
  'career/analyzeResume',
  async (data, thunkAPI) => {
    try {
      const response = await careerService.analyzeResume(data);
      console.log('Resume analysis response:', response);
      
      // Handle backend response format: { status: 'success', data: {...} }
      if (response.status === 'success' && response.data) {
        return response.data;
      }
      
      // Fallback for direct data
      return response;
    } catch (error) {
      console.error('Resume analysis error:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to analyze resume');
    }
  }
);

export const careerSlice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.recommendations = [];
      state.insights = [];
      state.analysis = null;
    },
    clearAnalysis: (state) => {
      state.analysis = null;
      state.isError = false;
      state.message = '';
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
      state.insights = [];
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCareerRecommendations.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getCareerRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        if (action.payload.recommendations) {
          state.recommendations = action.payload.recommendations;
          state.insights = action.payload.insights || [];
        } else {
          state.recommendations = action.payload;
          state.insights = [];
        }
        console.log('Stored recommendations:', state.recommendations);
        console.log('Stored insights:', state.insights);
      })
      .addCase(getCareerRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.recommendations = [];
        state.insights = [];
        console.error('Recommendations error:', action.payload);
      })
      .addCase(analyzeResume.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(analyzeResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.analysis = action.payload;
        console.log('Stored analysis:', action.payload);
      })
      .addCase(analyzeResume.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.analysis = null;
        console.error('Analysis error:', action.payload);
      });
  },
});

export const { reset, clearAnalysis, clearRecommendations } = careerSlice.actions;
export default careerSlice.reducer;