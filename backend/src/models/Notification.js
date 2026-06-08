const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'applications',
      key: 'id'
    },
    field: 'application_id'
  },
  type: {
    type: DataTypes.ENUM('sms', 'whatsapp', 'email'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicationStatus: {
    type: DataTypes.ENUM('pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'),
    allowNull: false
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  indexes: [
    // Listing a user's notifications, newest first, optionally filtered by status.
    { fields: ['user_id', 'status'] },
    { fields: ['application_id'] }
  ]
});

module.exports = Notification;
