const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Job title is required' },
      len: { args: [1, 100], msg: 'Job title cannot exceed 100 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Job description is required' },
      len: { args: [1, 5000], msg: 'Job description cannot exceed 5000 characters' }
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Job location is required' }
    }
  },
  type: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Internship'),
    defaultValue: 'Full-time',
    allowNull: false
  },
  salaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Minimum salary cannot be negative' }
    }
  },
  salaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Maximum salary cannot be negative' }
    }
  },
  experience: {
    type: DataTypes.ENUM('Entry Level', 'Mid Level', 'Senior Level', 'Executive'),
    defaultValue: 'Entry Level',
    allowNull: false
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 3000], msg: 'Requirements cannot exceed 3000 characters' }
    }
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 2000], msg: 'Benefits cannot exceed 2000 characters' }
    }
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public'
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'closed', 'draft'),
    defaultValue: 'active'
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
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  isExpired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  extensionRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  extensionRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'jobs',
  indexes: [
    {
      fields: ['location', 'type', 'status']
    },
    {
      fields: ['title'],
      using: 'gin',
      operator: 'gin_trgm_ops' // For full-text search (requires pg_trgm extension)
    },
    {
      fields: ['skills'],
      using: 'gin' // GIN index for array searches
    }
  ]
});

module.exports = Job;
