const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
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
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    },
    field: 'job_id'
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'),
    defaultValue: 'pending'
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'experience'
  },
  currentJob: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'current_job'
  },
  resumeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'resumes',
      key: 'id'
    },
    field: 'resume_id'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'applications',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'job_id']
    }
  ],
  hooks: {
    beforeUpdate: (application) => {
      application.lastUpdated = new Date();
    }
  }
});

module.exports = Application;
