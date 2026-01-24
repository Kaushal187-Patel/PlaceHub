const express = require('express');
const {
  analyzeResume,
  getResumeHistory,
  deleteResumeHistory,
  getLatestResume
} = require('../controllers/resume');

const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

const router = express.Router();

// Resume routes - temporarily remove auth for testing
router.route('/analyze')
  .post(uploadResume.single('resume'), analyzeResume);

// Protected routes
router.use(protect);

router.route('/latest')
  .get(getLatestResume);

router.route('/history')
  .get(getResumeHistory)
  .delete(deleteResumeHistory);

module.exports = router;