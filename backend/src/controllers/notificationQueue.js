const notificationService = require('../services/freeNotificationService');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Simple queue to process notifications separately
const notificationQueue = [];
let isProcessing = false;

const addToQueue = (userId, jobId, applicationId, status) => {
  notificationQueue.push({ userId, jobId, applicationId, status });
  processQueue();
};

const processQueue = async () => {
  if (isProcessing || notificationQueue.length === 0) return;
  
  isProcessing = true;
  
  while (notificationQueue.length > 0) {
    const { userId, jobId, applicationId, status } = notificationQueue.shift();
    
    try {
      const user = await User.findById(userId);
      const job = await Job.findById(jobId);
      const application = await Application.findById(applicationId);
      
      if (user && job && application) {
        await notificationService.sendAllNotifications(user, job, application, status);
      }
    } catch (error) {
      console.error('Notification queue error:', error);
    }
  }
  
  isProcessing = false;
};

module.exports = { addToQueue };