const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Resume = require('../models/Resume');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No resume file provided'
      });
    }

    const jobRole = req.body.job_role || 'Software Developer';
    
    // Prepare form data for ML service
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('job_role', jobRole);

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/resume/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000 // 60 second timeout for better processing
    });

    // Save resume and analysis to database (file is retained for authenticated download)
    let savedResume = null;
    if (req.user) {
      // Mark all previous resumes as not latest (Sequelize)
      await Resume.update(
        { isLatest: false },
        { where: { userId: req.user.id } }
      );
      
      // Create new resume record (Sequelize)
      savedResume = await Resume.create({
        userId: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        analysis: response.data,
        isLatest: true,
        isActive: true
      });
      
      // Update user profile with resume analysis (Sequelize)
      await User.update({
        resumeAnalysis: {
          score: response.data.similarity_score ? Math.round(response.data.similarity_score * 100) : 0,
          filename: req.file.originalname,
          uploadDate: new Date(),
          analysis: response.data,
          strengths: response.data.suggestions?.dos || [],
          weaknesses: response.data.suggestions?.improvements || response.data.suggestions?.donts || [],
          suggestions: response.data.recommendations || [],
          keywordSuggestions: response.data.missing_required_skills || [],
          extractedSkills: response.data.extracted_skills || []
        }
      }, { where: { id: req.user.id } });
    }

    // Note: the uploaded file is intentionally retained so the owner can
    // download it later via the authenticated downloadResume endpoint.

    res.status(200).json({
      status: 'success',
      data: {
        ...response.data,
        resumeId: savedResume?.id,
        uploadedAt: savedResume?.createdAt
      },
      message: 'Resume analysis completed successfully'
    });

  } catch (error) {
    // Clean up uploaded file on error (it was never persisted to a Resume row)
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) { /* best effort */ }
    }

    if (error.response || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        status: 'error',
        message: 'Resume analysis service is currently unavailable. Please try again later.'
      });
    }
    next(error);
  }
};

const getLatestResume = async (req, res) => {
  try {
    const latestResume = await Resume.findOne({
      where: {
        userId: req.user.id,
        isActive: true,
        isLatest: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!latestResume) {
      return res.status(404).json({
        status: 'error',
        message: 'No resume found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: latestResume.id,
        filename: latestResume.originalName,
        uploadDate: latestResume.createdAt,
        analysis: latestResume.analysis
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch resume',
      error: error.message
    });
  }
};

const downloadResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Object-level authorization: only the owner (or an admin) may download.
    const where = { id };
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }
    const resume = await Resume.findOne({ where });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Check if file exists
    if (!resume.filePath || !fs.existsSync(resume.filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume file not found on server'
      });
    }

    // Sanitize the filename to prevent header/response-splitting injection.
    const safeName = String(resume.originalName || 'resume')
      .replace(/[\r\n"]/g, '')
      .replace(/[^\w.\- ]/g, '_')
      .slice(0, 200);

    res.setHeader('Content-Type', resume.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

    const fileStream = fs.createReadStream(resume.filePath);
    fileStream.on('error', next);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const history = resumes.map(resume => ({
      id: resume.id,
      filename: resume.originalName,
      uploadDate: resume.createdAt,
      score: resume.analysis?.similarity_score ? Math.round(resume.analysis.similarity_score * 100) : 0,
      status: resume.analysis ? 'analyzed' : 'pending'
    }));

    res.status(200).json({
      status: 'success',
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get resume history',
      error: error.message
    });
  }
};

const deleteResumeHistory = async (req, res) => {
  try {
    // Clear resumeAnalysis from user (Sequelize)
    await User.update(
      { resumeAnalysis: null },
      { where: { id: req.user.id } }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Resume history deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete resume history',
      error: error.message
    });
  }
};

module.exports = {
  analyzeResume,
  getLatestResume,
  getResumeHistory,
  deleteResumeHistory,
  downloadResume
};
