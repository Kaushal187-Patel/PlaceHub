const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
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
      // Mark all previous resumes as not latest
      await Resume.updateMany(
        { user: req.user.id },
        { isLatest: false }
      );
      
      savedResume = await Resume.create({
        user: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        analysis: response.data,
        isLatest: true,
        isActive: true
      });
      
      // Update user profile with resume analysis
      await User.findByIdAndUpdate(req.user.id, {
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
      });
    }
    
    // Clean up uploaded file after saving to database
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Ensure resume is saved before responding
    if (savedResume) {
      await savedResume.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        ...response.data,
        resumeId: savedResume?._id,
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
      user: req.user.id,
      isActive: true,
      isLatest: true
    }).sort({ createdAt: -1 });

    if (!latestResume) {
      return res.status(404).json({
        status: 'error',
        message: 'No resume found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: latestResume._id,
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

const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 }).limit(10);

    const history = resumes.map(resume => ({
      id: resume._id,
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
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { resumeAnalyses: 1 }
    });
    
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
  deleteResumeHistory
};