const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  salaryMin: {
    type: Number,
    min: [0, 'Minimum salary cannot be negative']
  },
  salaryMax: {
    type: Number,
    min: [0, 'Maximum salary cannot be negative']
  },
  experience: {
    type: String,
    required: true,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    default: 'Entry Level'
  },
  skills: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    maxlength: [3000, 'Requirements cannot exceed 3000 characters']
  },
  benefits: {
    type: String,
    maxlength: [2000, 'Benefits cannot exceed 2000 characters']
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  views: {
    type: Number,
    default: 0
  },
  applicationDeadline: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  extensionRequested: {
    type: Boolean,
    default: false
  },
  extensionRequestedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1, type: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);