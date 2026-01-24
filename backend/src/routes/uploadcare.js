const express = require('express');
const { protect } = require('../middleware/auth');
const {
  storeUploadcareResume,
  getUploadcareResume
} = require('../controllers/uploadcare');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Store Uploadcare resume data
router.post('/resume', storeUploadcareResume);

// Get user's Uploadcare resume
router.get('/resume', getUploadcareResume);

module.exports = router;