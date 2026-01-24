const nodemailer = require('nodemailer');
const axios = require('axios');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    // Free Gmail SMTP
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendSMS(phone, message, applicationId, userId, status) {
    try {
      // Using Free SMS API (TextBelt - 1 free SMS per day per IP)
      const response = await axios.post('https://textbelt.com/text', {
        phone: phone,
        message: message,
        key: 'textbelt' // Free tier key
      });

      if (response.data.success) {
        await this.logNotification(userId, applicationId, 'sms', message, phone, status, 'sent');
        return { success: true, data: response.data };
      } else {
        await this.logNotification(userId, applicationId, 'sms', message, phone, status, 'failed', response.data.error);
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      await this.logNotification(userId, applicationId, 'sms', message, phone, status, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWhatsApp(phone, message, applicationId, userId, status) {
    try {
      // Using CallMeBot WhatsApp API (Free)
      // User needs to add the bot number first: +34 644 59 71 67
      const apiKey = process.env.CALLMEBOT_API_KEY || 'demo'; // User needs to get their API key
      const response = await axios.get(`https://api.callmebot.com/whatsapp.php`, {
        params: {
          phone: phone.replace('+', ''),
          text: message,
          apikey: apiKey
        }
      });

      await this.logNotification(userId, applicationId, 'whatsapp', message, phone, status, 'sent');
      return { success: true, data: response.data };
    } catch (error) {
      await this.logNotification(userId, applicationId, 'whatsapp', message, phone, status, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendEmail(email, subject, message, applicationId, userId, status) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Aspiro - Application Status Update</h2>
            <p>${message}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from Aspiro Career Platform.
            </p>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      await this.logNotification(userId, applicationId, 'email', message, email, status, 'sent');
      return { success: true };
    } catch (error) {
      await this.logNotification(userId, applicationId, 'email', message, email, status, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  async logNotification(userId, applicationId, type, message, recipient, applicationStatus, status, error = null) {
    try {
      const notification = new Notification({
        user: userId,
        application: applicationId,
        type,
        message,
        recipient,
        applicationStatus,
        status,
        sentAt: status === 'sent' ? new Date() : null,
        error
      });
      await notification.save();
    } catch (err) {
      console.error('Failed to log notification:', err);
    }
  }

  generateMessage(userName, jobTitle, company, status) {
    const statusMessages = {
      pending: `Hi ${userName}, your application for ${jobTitle} at ${company} has been received and is under review.`,
      reviewed: `Hi ${userName}, your application for ${jobTitle} at ${company} has been reviewed by our team.`,
      shortlisted: `Congratulations ${userName}! You've been shortlisted for ${jobTitle} at ${company}.`,
      interview: `Great news ${userName}! You've been selected for an interview for ${jobTitle} at ${company}.`,
      rejected: `Hi ${userName}, unfortunately your application for ${jobTitle} at ${company} was not successful this time.`,
      hired: `Congratulations ${userName}! You've been hired for ${jobTitle} at ${company}!`
    };
    return statusMessages[status] || `Your application status for ${jobTitle} at ${company} has been updated to ${status}.`;
  }

  async sendAllNotifications(user, job, application, newStatus) {
    const message = this.generateMessage(user.name, job.title, job.company, newStatus);
    const results = [];

    // Send SMS if phone number exists
    if (user.phone) {
      const smsResult = await this.sendSMS(user.phone, message, application._id, user._id, newStatus);
      results.push({ type: 'sms', ...smsResult });
    }

    // Send WhatsApp if phone number exists
    if (user.phone) {
      const whatsappResult = await this.sendWhatsApp(user.phone, message, application._id, user._id, newStatus);
      results.push({ type: 'whatsapp', ...whatsappResult });
    }

    // Send Email
    if (user.email) {
      const subject = `Application Status Update - ${job.title} at ${job.company}`;
      const emailResult = await this.sendEmail(user.email, subject, message, application._id, user._id, newStatus);
      results.push({ type: 'email', ...emailResult });
    }

    return results;
  }
}

module.exports = new NotificationService();