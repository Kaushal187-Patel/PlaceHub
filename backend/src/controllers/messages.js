const { Conversation, Message, User, Application, Job } = require('../models');
const { Op } = require('sequelize');

// @desc    Get or create a conversation for an application (recruiter messaging candidate)
// @route   POST /api/messages/conversation
// @access  Private (recruiter)
const getOrCreateConversation = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({
        status: 'error',
        message: 'applicationId is required'
      });
    }

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title', 'recruiterId'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    const job = application.job;
    if (!job || job.recruiterId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to message for this application'
      });
    }

    let conversation = await Conversation.findOne({
      where: {
        recruiterId: req.user.id,
        candidateId: application.userId,
        applicationId: application.id
      },
      include: [
        { model: User, as: 'recruiter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'candidate', attributes: ['id', 'name', 'email'] },
        { model: Application, as: 'application', include: [{ model: Job, as: 'job', attributes: ['id', 'title'] }] }
      ]
    });

    if (!conversation) {
      conversation = await Conversation.create({
        recruiterId: req.user.id,
        candidateId: application.userId,
        applicationId: application.id
      });
      conversation = await Conversation.findByPk(conversation.id, {
        include: [
          { model: User, as: 'recruiter', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'candidate', attributes: ['id', 'name', 'email'] },
          { model: Application, as: 'application', include: [{ model: Job, as: 'job', attributes: ['id', 'title'] }] }
        ]
      });
    }

    res.status(200).json({
      status: 'success',
      data: conversation
    });
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get or create conversation',
      error: error.message
    });
  }
};

// @desc    List conversations for current user (recruiter or candidate)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const isRecruiter = req.user.role === 'recruiter' || req.user.role === 'admin';

    const where = isRecruiter
      ? { recruiterId: userId }
      : { candidateId: userId };

    const conversations = await Conversation.findAll({
      where,
      order: [['updatedAt', 'DESC']],
      include: [
        { model: User, as: 'recruiter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'candidate', attributes: ['id', 'name', 'email'] },
        {
          model: Application,
          as: 'application',
          required: false,
          include: [{ model: Job, as: 'job', attributes: ['id', 'title'] }]
        }
      ]
    });

    // Get last message for each conversation
    const withLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          where: { conversationId: conv.id },
          order: [['createdAt', 'DESC']],
          include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
        });
        const unreadCount = await Message.count({
          where: {
            conversationId: conv.id,
            senderId: { [Op.ne]: userId },
            readAt: null
          }
        });
        return {
          ...conv.toJSON(),
          lastMessage: lastMessage ? lastMessage.toJSON() : null,
          unreadCount
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: withLastMessage
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// @desc    Get one conversation with messages
// @route   GET /api/messages/conversations/:id
// @access  Private (participant only)
const getConversationWithMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(id, {
      include: [
        { model: User, as: 'recruiter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'candidate', attributes: ['id', 'name', 'email'] },
        {
          model: Application,
          as: 'application',
          required: false,
          include: [{ model: Job, as: 'job', attributes: ['id', 'title'] }]
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found'
      });
    }

    if (conversation.recruiterId !== userId && conversation.candidateId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this conversation'
      });
    }

    const messages = await Message.findAll({
      where: { conversationId: id },
      order: [['createdAt', 'ASC']],
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }]
    });

    // Mark messages from the other party as read
    await Message.update(
      { readAt: new Date() },
      {
        where: {
          conversationId: id,
          senderId: { [Op.ne]: userId },
          readAt: null
        }
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        ...conversation.toJSON(),
        messages
      }
    });
  } catch (error) {
    console.error('getConversationWithMessages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/messages/conversations/:id/messages
// @access  Private (participant only)
const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { body } = req.body;
    const userId = req.user.id;

    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Message body is required'
      });
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found'
      });
    }

    if (conversation.recruiterId !== userId && conversation.candidateId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to send messages in this conversation'
      });
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      body: body.trim()
    });

    const messageWithSender = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json({
      status: 'success',
      data: messageWithSender
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message',
      error: error.message
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getConversationWithMessages,
  sendMessage
};
