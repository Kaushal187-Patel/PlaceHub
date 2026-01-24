const express = require('express');
const {
  getCareerSuggestions,
  generateCareerReport,
  getCareerHistory,
  deleteCareerHistory
} = require('../controllers/careers');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Career routes - temporarily remove auth for testing
router.route('/suggestions')
  .post(getCareerSuggestions);

// Protected routes
router.use(protect);

router.route('/report')
  .post(generateCareerReport);

router.route('/history')
  .get(getCareerHistory)
  .delete(deleteCareerHistory);

module.exports = router;
