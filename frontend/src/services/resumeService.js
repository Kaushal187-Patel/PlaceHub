import api from './api';

const analyzeResume = async (file, jobRole = 'Software Developer') => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_role', jobRole);

    const response = await api.post('/resume/analyze', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to analyze resume');
  }
};

const getLatestResume = async () => {
  try {
    const response = await api.get('/resume/latest');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch resume');
  }
};

const getResumeHistory = async () => {
  try {
    const response = await api.get('/resume/history');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch resume history');
  }
};

const resumeService = {
  analyzeResume,
  getLatestResume,
  getResumeHistory
};

export default resumeService;