const express = require('express');
const {
  analyzeResume,
  getResumeHistory,
  deleteResumeHistory,
  getLatestResume,
  downloadResume
} = require('../controllers/resume');

const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All resume routes require authentication.
router.use(protect);

// Resume analysis (rate-limited file upload + ML call)
router.route('/analyze')
  .post(uploadLimiter, uploadResume.single('resume'), analyzeResume);

router.route('/latest')
  .get(getLatestResume);

router.route('/history')
  .get(getResumeHistory)
  .delete(deleteResumeHistory);

router.route('/:id')
  .get(downloadResume);

module.exports = router;