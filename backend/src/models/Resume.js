const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String
  },
  analysis: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    strengths: [{
      type: String
    }],
    weaknesses: [{
      type: String
    }],
    suggestions: [{
      type: String
    }],
    keywordSuggestions: [{
      type: String
    }],
    sections: {
      contact: { score: Number, feedback: String },
      summary: { score: Number, feedback: String },
      experience: { score: Number, feedback: String },
      education: { score: Number, feedback: String },
      skills: { score: Number, feedback: String },
      projects: { score: Number, feedback: String }
    },
    skillsFound: [{
      type: String
    }],
    experienceYears: {
      type: Number,
      default: 0
    },
    educationLevel: {
      type: String
    },
    lastAnalyzed: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isLatest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
resumeSchema.index({ user: 1, isActive: 1 });
resumeSchema.index({ user: 1, isLatest: 1 });

// Ensure only one latest resume per user
resumeSchema.pre('save', async function(next) {
  if (this.isLatest) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isLatest: false }
    );
  }
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);