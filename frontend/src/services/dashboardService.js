import api from './api';

const getDashboardData = async () => {
  try {
    const [profileRes, applicationsRes, savedJobsRes] = await Promise.all([
      api.get('/users/me'),
      api.get('/users/applied-jobs'),
      api.get('/users/saved-jobs')
    ]);

    return {
      profile: profileRes.data.data,
      applications: applicationsRes.data.data || [],
      savedJobs: savedJobsRes.data.data || [],
      resumeAnalysis: profileRes.data.data.resumeAnalysis || null
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

const getCareerStats = async () => {
  try {
    // This would be a real API call to get career statistics
    return {
      totalApplications: 0,
      interviewCalls: 0,
      jobOffers: 0,
      profileViews: 0,
      resumeScore: 0,
      skillsCount: 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch career stats');
  }
};

const dashboardService = {
  getDashboardData,
  getCareerStats
};

export default dashboardService;