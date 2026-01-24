const { Job, Application } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const jobExpiryService = require('../services/jobExpiryService');

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      location,
      type,
      salaryMin,
      salaryMax,
      experience,
      skills,
      requirements,
      benefits,
      visibility
    } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      type,
      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      experience,
      skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()).filter(s => s),
      requirements,
      benefits,
      visibility,
      status: 'active',
      applicationDeadline: req.body.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      recruiterId: req.user.id,
      company: req.user.company || req.user.name
    });

    res.status(201).json({
      status: 'success',
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create job',
      error: error.message
    });
  }
};

// @desc    Get all jobs for recruiter (including all statuses)
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter only)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { recruiterId: req.user.id },
      include: [{
        model: Application,
        as: 'applications'
      }],
      order: [['createdAt', 'DESC']]
    });

    // Group jobs by status for better organization
    const jobsByStatus = {
      active: jobs.filter(job => job.status === 'active'),
      paused: jobs.filter(job => job.status === 'paused'),
      closed: jobs.filter(job => job.status === 'closed'),
      draft: jobs.filter(job => job.status === 'draft')
    };

    res.status(200).json({
      status: 'success',
      count: jobs.length,
      data: jobs,
      summary: {
        total: jobs.length,
        active: jobsByStatus.active.length,
        paused: jobsByStatus.paused.length,
        closed: jobsByStatus.closed.length,
        draft: jobsByStatus.draft.length
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// @desc    Get all public jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, location, type, experience, skills } = req.query;
    
    const where = { 
      status: 'active', 
      visibility: 'public',
      isExpired: false,
      applicationDeadline: { [Op.gt]: new Date() }
    };
    
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (type) where.type = type;
    if (experience) where.experience = experience;
    if (skills) {
      // PostgreSQL array overlap operator
      const skillArray = skills.split(',').map(s => s.trim());
      where.skills = { [Op.overlap]: skillArray };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      count: jobs.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: jobs
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this job'
      });
    }

    await job.update(req.body);
    await job.reload();

    res.status(200).json({
      status: 'success',
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update job',
      error: error.message
    });
  }
};

// @desc    Close job applications
// @route   PUT /api/jobs/:id/close
// @access  Private (Recruiter only)
const closeJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to close this job'
      });
    }

    job.status = 'closed';
    await job.save();

    res.status(200).json({
      status: 'success',
      message: 'Job closed successfully',
      data: job
    });
  } catch (error) {
    console.error('Close job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to close job',
      error: error.message
    });
  }
};

// @desc    Pause/Resume job
// @route   PUT /api/jobs/:id/toggle-status
// @access  Private (Recruiter only)
const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to modify this job'
      });
    }

    job.status = job.status === 'active' ? 'paused' : 'active';
    await job.save();

    res.status(200).json({
      status: 'success',
      message: `Job ${job.status === 'active' ? 'resumed' : 'paused'} successfully`,
      data: job
    });
  } catch (error) {
    console.error('Toggle job status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update job status',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this job'
      });
    }

    await job.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

// @desc    Update job status
// @route   PUT /api/jobs/:id/status
// @access  Private (Recruiter only)
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'paused', 'closed', 'draft'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be: active, paused, closed, or draft'
      });
    }

    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this job'
      });
    }

    job.status = status;
    await job.save();

    res.status(200).json({
      status: 'success',
      message: `Job status updated to ${status}`,
      data: job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update job status',
      error: error.message
    });
  }
};

// @desc    Extend job deadline
// @route   PUT /api/jobs/:id/extend
// @access  Private (Recruiter only)
const extendJobDeadline = async (req, res) => {
  try {
    const { newDeadline } = req.body;
    
    if (!newDeadline) {
      return res.status(400).json({
        status: 'error',
        message: 'New deadline is required'
      });
    }

    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to extend this job'
      });
    }

    job.applicationDeadline = new Date(newDeadline);
    job.extensionRequested = false;
    job.isExpired = false;
    job.status = 'active';
    await job.save();

    res.status(200).json({
      status: 'success',
      message: 'Job deadline extended successfully',
      data: job
    });
  } catch (error) {
    console.error('Extend job deadline error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to extend job deadline',
      error: error.message
    });
  }
};

// @desc    Reject extension and close job
// @route   PUT /api/jobs/:id/reject-extension
// @access  Private (Recruiter only)
const rejectExtension = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to modify this job'
      });
    }

    job.status = 'closed';
    job.isExpired = true;
    job.extensionRequested = false;
    await job.save();

    res.status(200).json({
      status: 'success',
      message: 'Job closed successfully',
      data: job
    });
  } catch (error) {
    console.error('Reject extension error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject extension',
      error: error.message
    });
  }
};

// @desc    Get jobs requiring extension decision
// @route   GET /api/jobs/extension-required
// @access  Private (Recruiter only)
const getJobsRequiringExtension = async (req, res) => {
  try {
    const jobs = await jobExpiryService.getJobsRequiringExtension(req.user.id);
    
    res.status(200).json({
      status: 'success',
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get extension jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get jobs requiring extension',
      error: error.message
    });
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getAllJobs,
  updateJob,
  deleteJob,
  closeJob,
  toggleJobStatus,
  updateJobStatus,
  extendJobDeadline,
  rejectExtension,
  getJobsRequiringExtension
};
