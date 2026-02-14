const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');
const Resume = require('./Resume');
const SavedJob = require('./SavedJob');
const Notification = require('./Notification');
const Conversation = require('./Conversation');
const Message = require('./Message');

// Define associations
// User associations
User.hasMany(Job, { foreignKey: 'recruiterId', as: 'postedJobs' });
User.hasMany(Application, { foreignKey: 'userId', as: 'applications' });
User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes' });
User.hasMany(SavedJob, { foreignKey: 'userId', as: 'savedJobs' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Job associations
Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Job.hasMany(SavedJob, { foreignKey: 'jobId', as: 'savedBy' });

// Application associations
Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Application.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });
Application.hasMany(Notification, { foreignKey: 'applicationId', as: 'notifications' });

// Resume associations
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Resume.hasMany(Application, { foreignKey: 'resumeId', as: 'applications' });

// SavedJob associations
SavedJob.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

// Conversation associations (recruiter <-> candidate, optionally linked to application)
Conversation.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });
Conversation.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });
Conversation.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
User.hasMany(Conversation, { foreignKey: 'recruiterId', as: 'recruiterConversations' });
User.hasMany(Conversation, { foreignKey: 'candidateId', as: 'candidateConversations' });
Application.hasOne(Conversation, { foreignKey: 'applicationId', as: 'conversation' });

// Message associations
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

module.exports = {
  User,
  Job,
  Application,
  Resume,
  SavedJob,
  Notification,
  Conversation,
  Message
};
