const express = require('express');
const {
  getOrCreateConversation,
  getConversations,
  getConversationWithMessages,
  sendMessage
} = require('../controllers/messages');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Get or create conversation for an application (recruiter only)
router.post('/conversation', authorize('recruiter', 'admin'), getOrCreateConversation);

// List my conversations (recruiter or candidate)
router.get('/conversations', getConversations);

// Get one conversation with messages
router.get('/conversations/:id', getConversationWithMessages);

// Send a message
router.post('/conversations/:id/messages', sendMessage);

module.exports = router;
