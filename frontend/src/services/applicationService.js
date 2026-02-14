import api from './api';

const applyForJob = async (jobId, applicationData = {}) => {
  try {
    const id = jobId != null ? String(jobId).trim() : '';
    if (!id) throw new Error('Job ID is required');
    const response = await api.post(`/applications/apply/${id}`, applicationData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.error || error.message;
    const full = error.response?.data?.error
      ? `${error.response.data.message || 'Failed to apply'}: ${error.response.data.error}`
      : msg;
    throw new Error(full || (error.response ? 'Failed to apply for job' : 'Network error. Is the backend running?'));
  }
};

// Apply with experience, resume, current job (for modal)
const applyForJobWithDetails = async (jobId, { experience, currentJob, resumeId, coverLetter }) => {
  return applyForJob(jobId, { experience, currentJob, resumeId, coverLetter });
};

const getMyApplications = async () => {
  try {
    const response = await api.get('/applications/my');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

const getApplications = async () => {
  try {
    const response = await api.get('/applications');
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.error || error.message;
    const detail = error.response?.data?.error
      ? `${error.response.data.message || 'Failed to fetch applications'}: ${error.response.data.error}`
      : msg;
    throw new Error(detail || 'Failed to fetch applications. Is the backend running?');
  }
};

const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await api.put(`/applications/${applicationId}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update application status');
  }
};

const scheduleInterview = async (applicationId, { scheduledAt, notes }) => {
  try {
    const response = await api.put(`/applications/${applicationId}/schedule-interview`, {
      scheduledAt,
      notes: notes || undefined
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to schedule interview');
  }
};

const applicationService = {
  applyForJob,
  applyForJobWithDetails,
  getMyApplications,
  getApplications,
  updateApplicationStatus,
  scheduleInterview
};

export default applicationService;