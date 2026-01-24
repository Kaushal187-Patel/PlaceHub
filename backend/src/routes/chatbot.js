const express = require('express');
const { sendMessage, clearSession } = require('../controllers/chatbot');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Chatbot routes
router.post('/message', protect, sendMessage);
router.post('/clear-session', protect, clearSession);

module.exports = router;