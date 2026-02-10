const nodemailer = require('nodemailer');

class EmailNotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendJobApplicationEmail(user, job) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Application Confirmation - ${job.title} at ${job.company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">Application Submitted Successfully!</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Hi ${user.name},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your application for <strong>${job.title}</strong> at <strong>${job.company}</strong> has been successfully submitted.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #333; margin-top: 0;">Job Details:</h3>
                <p><strong>Position:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Type:</strong> ${job.type}</p>
                <p><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                We'll notify you as soon as there are updates on your application status.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View My Applications
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message from PlaceHub Career Platform.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Application confirmation email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to send application email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendStatusUpdateEmail(user, job, newStatus) {
    try {
      const statusMessages = {
        pending: 'Your application is under review',
        reviewed: 'Your application has been reviewed',
        shortlisted: 'Congratulations! You have been shortlisted',
        interview: 'Great news! You have been selected for an interview',
        rejected: 'Unfortunately, your application was not successful',
        hired: 'Congratulations! You have been hired'
      };

      const statusColors = {
        pending: '#fbbf24',
        reviewed: '#3b82f6',
        shortlisted: '#10b981',
        interview: '#8b5cf6',
        rejected: '#ef4444',
        hired: '#059669'
      };

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Application Update - ${job.title} at ${job.company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${statusColors[newStatus]}; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">Application Status Update</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Hi ${user.name},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                ${statusMessages[newStatus]} for <strong>${job.title}</strong> at <strong>${job.company}</strong>.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColors[newStatus]};">
                <h3 style="color: #333; margin-top: 0;">Application Status:</h3>
                <p style="font-size: 18px; font-weight: bold; color: ${statusColors[newStatus]}; text-transform: uppercase;">
                  ${newStatus}
                </p>
                <p><strong>Position:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Updated on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background: ${statusColors[newStatus]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Application Details
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message from PlaceHub Career Platform.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${user.email} for status: ${newStatus}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to send status update email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailNotificationService();