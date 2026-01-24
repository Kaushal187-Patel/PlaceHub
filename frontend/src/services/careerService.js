import api, { mlApi } from './api';
import { handleApiError } from '../utils/errorHandler';

const getRecommendations = async (userData) => {
  try {
    const response = await api.post('/careers/suggestions', userData);
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Career Recommendations');
    throw new Error(errorMessage);
  }
};

const analyzeResume = async (data) => {
  try {
    const formData = new FormData();
    formData.append('resume', data.file);
    formData.append('job_role', data.job_role || 'Software Developer');
    
    const response = await api.post('/resume/analyze', formData);
    
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Resume Analysis');
    throw new Error(errorMessage);
  }
};

const getCareerHistory = async () => {
  try {
    const response = await api.get('/careers/history');
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Career History');
    throw new Error(errorMessage);
  }
};

const getResumeHistory = async () => {
  try {
    const response = await api.get('/resume/history');
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Resume History');
    throw new Error(errorMessage);
  }
};

const generateReport = async (reportData) => {
  try {
    const response = await api.post('/careers/report', reportData);
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Generate Report');
    throw new Error(errorMessage);
  }
};

const careerService = {
  getRecommendations,
  analyzeResume,
  getCareerHistory,
  getResumeHistory,
  generateReport,
};

export default careerService;