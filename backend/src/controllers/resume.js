const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Resume = require('../models/Resume');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const analyzeResume = async (req, res) => {
  try {
    console.log('Request received:', {
      file: req.file ? req.file.originalname : 'No file',
      body: req.body,
      headers: req.headers['content-type']
    });
    
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
    
    console.log('Calling ML service at:', `${ML_SERVICE_URL}/api/resume/analyze`);
    
    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/resume/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000 // 60 second timeout for better processing
    });
    
    console.log('ML service response received:', response.status);
    
    // Save resume and analysis to database BEFORE cleaning up file
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
    
    // Clean up uploaded file after saving to database
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
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
    console.error('Resume analysis error:', error.message);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Resume analysis failed. Please ensure ML service is running and try again.',
      error: error.message
    });
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

const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findByPk(id);
    
    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume file not found on server'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', resume.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(resume.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download resume',
      error: error.message
    });
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
