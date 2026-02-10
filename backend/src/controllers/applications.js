const { Application, Job, Resume, User } = require('../models');
const { Op } = require('sequelize');
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
    const { coverLetter, experience, currentJob, resumeId } = req.body;
    const userId = req.user.id;

    if (!jobId || jobId === 'undefined') {
      return res.status(400).json({
        status: 'error',
        message: 'Job ID is required'
      });
    }

    // Validate UUID format to avoid DB errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid job ID format'
      });
    }

    // Check if job exists
    console.log('Looking for job with ID:', jobId);
    const job = await Job.findByPk(jobId);
    console.log('Job found:', job ? 'Yes' : 'No');
    
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: {
        userId: userId,
        jobId: jobId
      }
    });

    if (existingApplication) {
      // Send email notification for existing application
      const user = await User.findByPk(userId);
      if (user) {
        emailNotificationService.sendJobApplicationEmail(user, job).catch(console.error);
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Application already exists. Notifications sent.',
        data: {
          id: existingApplication.id,
          jobTitle: job.title,
          company: job.company,
          status: existingApplication.status,
          appliedAt: existingApplication.createdAt
        }
      });
    }

    // Use provided resumeId or user's latest resume
    let resumeToUse = null;
    if (resumeId) {
      resumeToUse = await Resume.findOne({
        where: { id: resumeId, userId }
      });
    }
    if (!resumeToUse) {
      resumeToUse = await Resume.findOne({
        where: { userId, isLatest: true }
      });
    }
    console.log('Resume for application:', resumeToUse ? 'Yes' : 'No');

    // Create application
    const applicationData = {
      userId: userId,
      jobId: jobId,
      coverLetter: coverLetter || '',
      experience: experience || null,
      currentJob: currentJob || null,
      status: 'pending'
    };

    if (resumeToUse) {
      applicationData.resumeId = resumeToUse.id;
    }

    console.log('Creating application with data:', applicationData);
    const application = await Application.create(applicationData);
    console.log('Application created:', application.id);

    // Send email notification in background
    const user = await User.findByPk(userId);
    if (user) {
      emailNotificationService.sendJobApplicationEmail(user, job).catch(console.error);
    }

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: {
        id: application.id,
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
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job'
        },
        {
          model: Resume,
          as: 'resume'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

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

// @desc    Get all applications for recruiter's jobs
// @route   GET /api/applications
// @access  Private (Recruiter/Admin only)
const getApplications = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized',
        error: 'User not found'
      });
    }

    const recruiterId = req.user.id;
    let applications = await Application.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company', 'location', 'skills'],
          where: { recruiterId },
          required: true
        }
      ],
      order: [['createdAt', 'DESC']]
    }).catch((err) => {
      console.warn('Get applications with includes failed:', err.message);
      return null;
    });

    if (applications === null) {
      applications = await Application.findAll({
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'company'],
            where: { recruiterId },
            required: true
          }
        ],
        order: [['createdAt', 'DESC']]
      }).catch(() => []);
      const userIds = [...new Set(applications.map((a) => a.userId))];
      const users = userIds.length
        ? await User.findAll({
            where: { id: { [Op.in]: userIds } },
            attributes: ['id', 'name', 'email', 'phone']
          })
        : [];
      const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
      applications = applications.map((app) => {
        const u = userMap[app.userId];
        return { ...app.toJSON(), user: u || null };
      });
    }

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
    const application = await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Job,
          as: 'job'
        }
      ]
    });
    
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
        id: application.id,
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
    
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company', 'location', 'type', 'salaryMin', 'salaryMax', 'description', 'skills']
        },
        {
          model: Resume,
          as: 'resume',
          attributes: ['id', 'originalName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

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
