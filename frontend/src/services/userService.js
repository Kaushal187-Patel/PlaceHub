import api from './api';

const getProfile = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data.data; // Extract user data from response
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data.data; // Extract user data from response
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/users/upload-resume', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload resume');
  }
};

const getSavedJobs = async () => {
  try {
    const response = await api.get('/users/saved-jobs');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch saved jobs');
  }
};

const saveJob = async (jobId) => {
  try {
    const response = await api.post(`/users/save-job/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to save job');
  }
};

const unsaveJob = async (jobId) => {
  try {
    const response = await api.delete(`/users/save-job/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unsave job');
  }
};

const getAppliedJobs = async () => {
  try {
    const response = await api.get('/users/applied-jobs');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applied jobs');
  }
};

const userService = {
  getProfile,
  updateProfile,
  uploadResume,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getAppliedJobs
};

export default userService;