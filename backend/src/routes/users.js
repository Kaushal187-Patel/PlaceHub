const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume: uploadMiddleware } = require('../middleware/upload');
const {
  getUsers,
  getUser,
  updateProfile,
  uploadResume,
  analyzeResume,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getAppliedJobs,
  updateUser,
  deleteUser
} = require('../controllers/users');

const router = express.Router();

// Validation middleware
const profileValidation = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('website').optional().custom((value) => {
    if (value && value.trim() !== '' && !value.match(/^https?:\/\/.+/)) {
      throw new Error('Website must be a valid URL starting with http:// or https://');
    }
    return true;
  }),
  body('linkedin').optional().custom((value) => {
    if (value && value.trim() !== '' && !value.match(/^https?:\/\/.+/)) {
      throw new Error('LinkedIn must be a valid URL starting with http:// or https://');
    }
    return true;
  }),
  body('github').optional().custom((value) => {
    if (value && value.trim() !== '' && !value.match(/^https?:\/\/.+/)) {
      throw new Error('GitHub must be a valid URL starting with http:// or https://');
    }
    return true;
  }),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience').optional().isArray().withMessage('Experience must be an array'),
  body('education').optional().isArray().withMessage('Education must be an array')
];

// All routes require authentication
router.use(protect);

// User profile routes (must come before /:id routes)
router.put('/profile', profileValidation, updateProfile);
router.post('/upload-resume', uploadMiddleware.single('resume'), uploadResume);
router.post('/analyze-resume', analyzeResume);
router.get('/saved-jobs', getSavedJobs);
router.post('/save-job/:jobId', saveJob);
router.delete('/save-job/:jobId', unsaveJob);
router.get('/applied-jobs', getAppliedJobs);

// Admin only routes
router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;