const { User, Job, SavedJob, Application, Resume } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const where = {};
    
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      count: users.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user.id : req.params.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Only allow users to view their own profile or admin to view any
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this profile'
      });
    }
    
    // Get latest resume if user is viewing their own profile
    let latestResume = null;
    if (userId === req.user.id) {
      latestResume = await Resume.findOne({
        where: {
          userId: userId,
          isActive: true,
          isLatest: true
        },
        attributes: ['id', 'analysis', 'createdAt', 'originalName']
      });
    }
    
    const userData = user.toJSON();
    
    // Include traditional resume analysis if available
    if (latestResume && latestResume.analysis) {
      userData.resumeAnalysis = {
        score: latestResume.analysis.similarity_score ? Math.round(latestResume.analysis.similarity_score * 100) : 0,
        lastUpdated: latestResume.createdAt,
        filename: latestResume.originalName,
        analysis: latestResume.analysis,
        strengths: latestResume.analysis.suggestions?.dos || [],
        weaknesses: latestResume.analysis.suggestions?.improvements || latestResume.analysis.suggestions?.donts || [],
        suggestions: latestResume.analysis.recommendations || [],
        keywordSuggestions: latestResume.analysis.missing_required_skills || [],
        extractedSkills: latestResume.analysis.extracted_skills || []
      };
    }
    
    // Include Uploadcare resume data if available
    if (user.uploadcareResume) {
      userData.uploadcareResume = user.uploadcareResume;
    }
    
    res.status(200).json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Email cannot be updated through profile update for security
    const allowedFields = ['name', 'phone', 'location', 'bio', 'website', 'linkedin', 'github', 'skills', 'experience', 'education'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Prevent email updates
    if (req.body.email && req.body.email !== req.user.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email cannot be changed. Contact support if you need to update your email.'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await user.update(updateData);
    await user.reload({ attributes: { exclude: ['password'] } });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Upload resume
// @route   POST /api/users/upload-resume
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No resume file provided'
      });
    }

    const resume = await Resume.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      isLatest: true
    });

    res.status(201).json({
      status: 'success',
      message: 'Resume uploaded successfully',
      data: {
        id: resume.id,
        filename: resume.originalName,
        uploadedAt: resume.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload resume',
      error: error.message
    });
  }
};

// @desc    Analyze resume (redirect to resume controller)
// @route   POST /api/users/analyze-resume
// @access  Private
const analyzeResume = (req, res) => {
  res.status(200).json({ 
    status: 'info', 
    message: 'Use /api/resume/analyze endpoint for resume analysis' 
  });
};

// @desc    Get saved jobs
// @route   GET /api/users/saved-jobs
// @access  Private
const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Job,
        as: 'job'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      count: savedJobs.length,
      data: savedJobs.map(saved => saved.job)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch saved jobs',
      error: error.message
    });
  }
};

// @desc    Save job
// @route   POST /api/users/save-job/:jobId
// @access  Private
const saveJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    const existingSave = await SavedJob.findOne({
      where: {
        userId: req.user.id,
        jobId: req.params.jobId
      }
    });

    if (existingSave) {
      return res.status(400).json({
        status: 'error',
        message: 'Job already saved'
      });
    }

    await SavedJob.create({
      userId: req.user.id,
      jobId: req.params.jobId
    });

    res.status(201).json({
      status: 'success',
      message: 'Job saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to save job',
      error: error.message
    });
  }
};

// @desc    Unsave job
// @route   DELETE /api/users/save-job/:jobId
// @access  Private
const unsaveJob = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOne({
      where: {
        userId: req.user.id,
        jobId: req.params.jobId
      }
    });

    if (!savedJob) {
      return res.status(404).json({
        status: 'error',
        message: 'Saved job not found'
      });
    }

    await savedJob.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsave job',
      error: error.message
    });
  }
};

// @desc    Get applied jobs
// @route   GET /api/users/applied-jobs
// @access  Private
const getAppliedJobs = async (req, res) => {
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
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch applied jobs',
      error: error.message
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await user.update(req.body);
    await user.reload({ attributes: { exclude: ['password'] } });
    
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Delete related data
    await Promise.all([
      SavedJob.destroy({ where: { userId: req.params.id } }),
      Application.destroy({ where: { userId: req.params.id } }),
      Resume.destroy({ where: { userId: req.params.id } })
    ]);
    
    await user.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateProfile,
  uploadResume,
  analyzeResume,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getAppliedJobs,
  updateUser,
  deleteUser
};
