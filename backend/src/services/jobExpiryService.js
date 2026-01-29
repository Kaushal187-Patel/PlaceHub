const { Job, User } = require('../models');
const { Op } = require('sequelize');
const emailNotificationService = require('./emailNotificationService');

class JobExpiryService {
  // Check for jobs expiring in 3 days and send extension emails
  async checkExpiringJobs() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const expiringJobs = await Job.findAll({
        where: {
          applicationDeadline: { [Op.lte]: threeDaysFromNow },
          status: 'active',
          extensionRequested: false,
          isExpired: false
        },
        include: [{
          model: User,
          as: 'recruiter'
        }]
      });

      for (const job of expiringJobs) {
        await this.sendExtensionEmail(job);
        job.extensionRequested = true;
        job.extensionRequestedAt = new Date();
        await job.save();
      }

      return expiringJobs.length;
    } catch (error) {
      console.error('Error checking expiring jobs:', error);
      return 0;
    }
  }

  // Mark expired jobs
  async markExpiredJobs() {
    try {
      const now = new Date();
      const [affectedRows] = await Job.update(
        {
          isExpired: true,
          status: 'closed'
        },
        {
          where: {
            applicationDeadline: { [Op.lt]: now },
            status: 'active',
            isExpired: false
          }
        }
      );

      return affectedRows;
    } catch (error) {
      console.error('Error marking expired jobs:', error);
      return 0;
    }
  }

  // Send extension email to recruiter
  async sendExtensionEmail(job) {
    try {
      const recruiter = job.recruiter;
      const daysLeft = Math.ceil((job.applicationDeadline - new Date()) / (1000 * 60 * 60 * 24));
      
      const mailOptions = {
        from: `"placeHub Career Platform" <${process.env.EMAIL_USER}>`,
        to: recruiter.email,
        subject: `Job Application Deadline Reminder - ${job.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f59e0b; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">⏰ Job Deadline Reminder</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Hi ${recruiter.name},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your job posting "<strong>${job.title}</strong>" at <strong>${job.company}</strong> 
                will expire in <strong>${daysLeft} day(s)</strong>.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #333; margin-top: 0;">Job Details:</h3>
                <p><strong>Position:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Current Deadline:</strong> ${job.applicationDeadline.toLocaleDateString()}</p>
                <p><strong>Applications Received:</strong> ${job.applications?.length || 0}</p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Would you like to extend the application deadline for this job?
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/recruiter-dashboard?extend=${job.id}" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  Extend Deadline
                </a>
                <a href="${process.env.FRONTEND_URL}/recruiter-dashboard?close=${job.id}" 
                   style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Close Job
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                This is an automated reminder from placeHub Career Platform.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      await emailNotificationService.emailTransporter.sendMail(mailOptions);
      console.log(`Extension email sent to ${recruiter.email} for job: ${job.title}`);
    } catch (error) {
      console.error('Failed to send extension email:', error);
    }
  }

  // Get jobs requiring extension decision
  async getJobsRequiringExtension(recruiterId) {
    try {
      const jobs = await Job.findAll({
        where: {
          recruiterId: recruiterId,
          extensionRequested: true,
          isExpired: false,
          status: 'active'
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error getting jobs requiring extension:', error);
      return [];
    }
  }
}

module.exports = new JobExpiryService();
