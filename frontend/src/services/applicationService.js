import api from './api';

const applyForJob = async (jobId, applicationData = {}) => {
  try {
    const response = await api.post(`/applications/apply/${jobId}`, applicationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to apply for job');
  }
};

const getMyApplications = async () => {
  try {
    const response = await api.get('/applications/my');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

const applicationService = {
  applyForJob,
  getMyApplications
};

export default applicationService;