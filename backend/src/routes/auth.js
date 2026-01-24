const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');
const passport = require('../config/passport');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['student', 'recruiter'])
    .withMessage('Role must be either student or recruiter')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const updateDetailsValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, updatePassword);
router.post('/forgotpassword', forgotPasswordValidation, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, resetPassword);

// OAuth routes with strategy availability check
router.get('/google', (req, res, next) => {
  if (!passport._strategy('google')) {
    return res.status(400).json({
      status: 'error',
      message: 'Google OAuth not configured. Please set up Google credentials.'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!passport._strategy('google')) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    const token = user.getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  })(req, res, next);
});

router.get('/microsoft', (req, res, next) => {
  if (!passport._strategy('microsoft')) {
    return res.status(400).json({
      status: 'error',
      message: 'Microsoft OAuth not configured. Please set up Microsoft credentials.'
    });
  }
  passport.authenticate('microsoft', { scope: ['user.read'] })(req, res, next);
});

router.get('/microsoft/callback', (req, res, next) => {
  if (!passport._strategy('microsoft')) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_not_configured`);
  }
  passport.authenticate('microsoft', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    const token = user.getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  })(req, res, next);
});

module.exports = router;
