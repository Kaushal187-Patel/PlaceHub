const express = require('express');
const {
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  getMyApplications,
  withdrawApplication,
  applyForJob,
  scheduleInterview
} = require('../controllers/applications');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes are protected

// Student routes  
router.route('/my')
  .get(authorize('student'), getMyApplications);

router.route('/apply/:jobId')
  .post(authorize('student', 'recruiter'), applyForJob);

router.route('/:id/withdraw')
  .put(authorize('student'), withdrawApplication);

// Recruiter/Admin routes
router.route('/')
  .get(authorize('recruiter', 'admin'), getApplications);

router.route('/:id')
  .get(authorize('recruiter', 'admin'), getApplication)
  .put(authorize('recruiter', 'admin'), updateApplication)
  .delete(authorize('admin'), deleteApplication);

router.route('/:id/status')
  .put(authorize('recruiter', 'admin'), updateApplication);

router.route('/:id/schedule-interview')
  .put(authorize('recruiter', 'admin'), scheduleInterview);

module.exports = router;
