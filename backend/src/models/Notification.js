const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  type: {
    type: String,
    enum: ['sms', 'whatsapp', 'email'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'],
    required: true
  },
  sentAt: {
    type: Date
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);