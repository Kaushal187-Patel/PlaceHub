import api from './api';

const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create job');
  }
};

const getMyJobs = async () => {
  try {
    const response = await api.get('/jobs/my-jobs');
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.error || error.message;
    const detail = error.response?.data?.error ? `${error.response.data.message || 'Failed to fetch jobs'}: ${error.response.data.error}` : msg;
    throw new Error(detail || 'Failed to fetch jobs. Is the backend running? (default port 5001)');
  }
};

const getAllJobs = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/jobs?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
  }
};

const updateJob = async (jobId, jobData) => {
  try {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update job');
  }
};

const deleteJob = async (jobId) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete job');
  }
};

const closeJob = async (jobId) => {
  try {
    const response = await api.put(`/jobs/${jobId}/close`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to close job');
  }
};

const toggleJobStatus = async (jobId) => {
  try {
    const response = await api.put(`/jobs/${jobId}/toggle-status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle job status');
  }
};

const jobService = {
  createJob,
  getMyJobs,
  getAllJobs,
  updateJob,
  deleteJob,
  closeJob,
  toggleJobStatus
};

export default jobService;