const User = require('../models/User');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
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
    
    const user = await User.findById(userId).select('-password');
    
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
        user: userId,
        isActive: true,
        isLatest: true
      }).select('analysis createdAt originalName');
      

    }
    
    const userData = user.toObject();
    
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

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

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
      user: req.user.id,
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
        id: resume._id,
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
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

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
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    const existingSave = await SavedJob.findOne({
      user: req.user.id,
      job: req.params.jobId
    });

    if (existingSave) {
      return res.status(400).json({
        status: 'error',
        message: 'Job already saved'
      });
    }

    await SavedJob.create({
      user: req.user.id,
      job: req.params.jobId
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
    const savedJob = await SavedJob.findOneAndDelete({
      user: req.user.id,
      job: req.params.jobId
    });

    if (!savedJob) {
      return res.status(404).json({
        status: 'error',
        message: 'Saved job not found'
      });
    }

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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
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
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Delete related data
    await Promise.all([
      SavedJob.deleteMany({ user: req.params.id }),
      Application.deleteMany({ user: req.params.id }),
      Resume.deleteMany({ user: req.params.id })
    ]);
    
    await user.deleteOne();
    
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