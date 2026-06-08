const express = require('express');
const {
  getCareerSuggestions,
  generateCareerReport,
  getCareerHistory,
  deleteCareerHistory
} = require('../controllers/careers');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All career routes require authentication.
router.use(protect);

router.route('/suggestions')
  .post(getCareerSuggestions);

router.route('/report')
  .post(generateCareerReport);

router.route('/history')
  .get(getCareerHistory)
  .delete(deleteCareerHistory);

module.exports = router;
