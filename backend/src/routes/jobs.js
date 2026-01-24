const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createJob,
  getMyJobs,
  getAllJobs,
  updateJob,
  deleteJob,
  closeJob,
  toggleJobStatus,
  updateJobStatus,
  extendJobDeadline,
  rejectExtension,
  getJobsRequiringExtension
} = require('../controllers/jobs');

const router = express.Router();

// Validation middleware
const jobValidation = [
  body('title')
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 100 })
    .withMessage('Job title cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ max: 5000 })
    .withMessage('Job description cannot exceed 5000 characters'),
  body('location')
    .notEmpty()
    .withMessage('Job location is required'),
  body('type')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
    .withMessage('Invalid job type'),
  body('experience')
    .isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Executive'])
    .withMessage('Invalid experience level')
];

// Public routes
router.get('/', getAllJobs);

// Protected routes
router.use(protect);

// Recruiter only routes
router.post('/', authorize('recruiter'), jobValidation, createJob);
router.get('/my-jobs', authorize('recruiter'), getMyJobs);
router.put('/:id', authorize('recruiter'), updateJob);
router.put('/:id/close', authorize('recruiter'), closeJob);
router.put('/:id/toggle-status', authorize('recruiter'), toggleJobStatus);
router.put('/:id/status', authorize('recruiter'), updateJobStatus);
router.put('/:id/extend', authorize('recruiter'), extendJobDeadline);
router.put('/:id/reject-extension', authorize('recruiter'), rejectExtension);
router.get('/extension-required', authorize('recruiter'), getJobsRequiringExtension);
router.delete('/:id', authorize('recruiter'), deleteJob);

module.exports = router;