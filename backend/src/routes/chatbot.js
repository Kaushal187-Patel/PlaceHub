const express = require('express');
const { sendMessage, clearSession } = require('../controllers/chatbot');

const router = express.Router();

// Chatbot routes (no auth required so it always works)
router.post('/message', sendMessage);
router.post('/clear-session', clearSession);

module.exports = router;