const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recruiterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'recruiter_id'
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'candidate_id'
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'applications',
      key: 'id'
    },
    field: 'application_id'
  }
}, {
  tableName: 'conversations',
  indexes: [
    { unique: true, fields: ['recruiter_id', 'candidate_id', 'application_id'] }
  ]
});

module.exports = Conversation;
