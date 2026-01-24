const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const User = require('../models/User');
const emailNotificationService = require('../services/emailNotificationService');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (Student only)
const applyForJob = async (req, res) => {
  try {
    console.log('Apply for job request:', {
      params: req.params,
      body: req.body,
      user: req.user?.id
    });

    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(400).json({
        status: 'error',
        message: 'Job ID is required'
      });
    }

    // Check if job exists
    console.log('Looking for job with ID:', jobId);
    const job = await Job.findById(jobId);
    console.log('Job found:', job ? 'Yes' : 'No');
    
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: userId,
      job: jobId
    });

    if (existingApplication) {
      // Send email notification for existing application
      const user = await User.findById(userId);
      if (user) {
        emailNotificationService.sendJobApplicationEmail(user, job).catch(console.error);
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Application already exists. Notifications sent.',
        data: {
          id: existingApplication._id,
          jobTitle: job.title,
          company: job.company,
          status: existingApplication.status,
          appliedAt: existingApplication.createdAt
        }
      });
    }

    // Get user's latest resume (optional)
    const latestResume = await Resume.findOne({
      user: userId,
      isLatest: true
    });
    console.log('Latest resume found:', latestResume ? 'Yes' : 'No');

    // Create application
    const applicationData = {
      user: userId,
      job: jobId,
      coverLetter: coverLetter || '',
      status: 'pending'
    };

    if (latestResume) {
      applicationData.resume = latestResume._id;
    }

    console.log('Creating application with data:', applicationData);
    const application = await Application.create(applicationData);
    console.log('Application created:', application._id);

    // Send email notification in background
    const user = await User.findById(userId);
    if (user) {
      emailNotificationService.sendJobApplicationEmail(user, job).catch(console.error);
    }

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: {
        id: application._id,
        jobTitle: job.title,
        company: job.company,
        status: application.status,
        appliedAt: application.createdAt
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications
// @access  Private (Student only)
const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('job')
      .populate('resume')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Placeholder functions for existing routes
// @desc    Get all applications (Recruiter only)
// @route   GET /api/applications/all
// @access  Private (Recruiter only)
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('user', 'name email phone')
      .populate('job', 'title company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

const getApplication = (req, res) => {
  res.json({ message: 'Get application - placeholder' });
};

// @desc    Update application status (Recruiter only)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }

    // Find and update application
    const application = await Application.findById(id)
      .populate('user')
      .populate('job');
    
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Update status
    application.status = status;
    application.lastUpdated = new Date();
    await application.save();

    // Send email notification for status update
    emailNotificationService.sendStatusUpdateEmail(
      application.user,
      application.job,
      status
    ).catch(console.error);

    res.status(200).json({
      status: 'success',
      message: 'Application status updated successfully',
      data: {
        id: application._id,
        status: application.status,
        lastUpdated: application.lastUpdated
      }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

const deleteApplication = (req, res) => {
  res.json({ message: 'Delete application - placeholder' });
};

const getMyApplications = async (req, res) => {
  try {
    console.log('Fetching applications for user:', req.user.id);
    
    const applications = await Application.find({ user: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location type salaryMin salaryMax description skills'
      })
      .populate({
        path: 'resume',
        select: 'originalName'
      })
      .sort({ createdAt: -1 });

    console.log('Found applications:', applications.length);
    console.log('Sample application:', applications[0]);

    res.status(200).json({
      status: 'success',
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

const withdrawApplication = (req, res) => {
  res.json({ message: 'Withdraw application - placeholder' });
};

module.exports = {
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  getMyApplications,
  withdrawApplication,
  applyForJob
};