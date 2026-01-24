const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Resume = sequelize.define('Resume', {
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
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  extractedText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  analysis: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isLatest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_latest'
  }
}, {
  tableName: 'resumes',
  indexes: [
    {
      fields: ['user_id', 'is_active']
    },
    {
      fields: ['user_id', 'is_latest']
    }
  ],
  hooks: {
    beforeSave: async (resume) => {
      if (resume.isLatest) {
        // Ensure only one latest resume per user
        await Resume.update(
          { isLatest: false },
          {
            where:             {
              userId: resume.userId,
              id: { [Op.ne]: resume.id }
            }
          }
        );
      }
    }
  }
});

module.exports = Resume;
