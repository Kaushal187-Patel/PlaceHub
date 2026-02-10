const nodemailer = require('nodemailer');
const axios = require('axios');
const Notification = require('../models/Notification');

class FreeNotificationService {
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
      // Method 1: TextBelt (1 free SMS per day per IP)
      const textbeltResponse = await this.sendTextBeltSMS(phone, message);
      if (textbeltResponse.success) {
        await this.logNotification(userId, applicationId, 'sms', message, phone, status, 'sent');
        return textbeltResponse;
      }

      // Method 2: Fallback to Fast2SMS (India numbers)
      if (phone.startsWith('+91')) {
        const fast2smsResponse = await this.sendFast2SMS(phone, message);
        await this.logNotification(userId, applicationId, 'sms', message, phone, status, fast2smsResponse.success ? 'sent' : 'failed');
        return fast2smsResponse;
      }

      await this.logNotification(userId, applicationId, 'sms', message, phone, status, 'failed', 'No free SMS service available');
      return { success: false, error: 'Daily SMS limit exceeded or unsupported region' };
    } catch (error) {
      await this.logNotification(userId, applicationId, 'sms', message, phone, status, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendTextBeltSMS(phone, message) {
    try {
      const response = await axios.post('https://textbelt.com/text', {
        phone: phone,
        message: message,
        key: 'textbelt'
      });
      return { success: response.data.success, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendFast2SMS(phone, message) {
    try {
      // Free Fast2SMS API (India only)
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        authorization: process.env.FAST2SMS_API_KEY || 'demo',
        sender_id: 'ASPIRO',
        message: message,
        numbers: phone.replace('+91', '')
      });
      return { success: response.data.return, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendWhatsApp(phone, message, applicationId, userId, status) {
    try {
      // Method 1: CallMeBot (Free after setup)
      const callmebotResponse = await this.sendCallMeBotWhatsApp(phone, message);
      if (callmebotResponse.success) {
        await this.logNotification(userId, applicationId, 'whatsapp', message, phone, status, 'sent');
        return callmebotResponse;
      }

      // Method 2: Ultramsg (Free tier)
      const ultramsgResponse = await this.sendUltramsgWhatsApp(phone, message);
      await this.logNotification(userId, applicationId, 'whatsapp', message, phone, status, ultramsgResponse.success ? 'sent' : 'failed');
      return ultramsgResponse;
    } catch (error) {
      await this.logNotification(userId, applicationId, 'whatsapp', message, phone, status, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendCallMeBotWhatsApp(phone, message) {
    try {
      const apiKey = process.env.CALLMEBOT_API_KEY;
      if (!apiKey || apiKey === 'your_callmebot_api_key') {
        return { success: false, error: 'CallMeBot API key not configured' };
      }

      const response = await axios.get('https://api.callmebot.com/whatsapp.php', {
        params: {
          phone: phone.replace('+', ''),
          text: message,
          apikey: apiKey
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendUltramsgWhatsApp(phone, message) {
    try {
      const token = process.env.ULTRAMSG_TOKEN;
      const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
      
      if (!token || !instanceId) {
        return { success: false, error: 'Ultramsg credentials not configured' };
      }

      const response = await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        token: token,
        to: phone,
        body: message
      });
      return { success: response.data.sent, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendEmail(email, subject, message, applicationId, userId, status) {
    try {
      const mailOptions = {
        from: `"PlaceHub Career Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">PlaceHub Career Platform</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Application Status Update</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">${message}</p>
              <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #333; font-weight: 500;">Stay connected with us for more opportunities!</p>
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
      pending: `🔔 Hi ${userName}! Your application for "${jobTitle}" at ${company} has been received and is under review. We'll keep you updated!`,
      reviewed: `📋 Hi ${userName}! Your application for "${jobTitle}" at ${company} has been reviewed by our team.`,
      shortlisted: `🎉 Congratulations ${userName}! You've been shortlisted for "${jobTitle}" at ${company}. Great job!`,
      interview: `📞 Exciting news ${userName}! You've been selected for an interview for "${jobTitle}" at ${company}. Best of luck!`,
      rejected: `😔 Hi ${userName}, unfortunately your application for "${jobTitle}" at ${company} was not successful this time. Keep applying!`,
      hired: `🎊 CONGRATULATIONS ${userName}! You've been hired for "${jobTitle}" at ${company}! Welcome to the team!`
    };
    return statusMessages[status] || `Your application status for "${jobTitle}" at ${company} has been updated to ${status}.`;
  }

  async sendAllNotifications(user, job, application, newStatus) {
    const message = this.generateMessage(user.name, job.title, job.company, newStatus);
    const results = [];

    // Send Email (Always works with Gmail)
    if (user.email) {
      const subject = `🔔 Application Update - ${job.title} at ${job.company}`;
      const emailResult = await this.sendEmail(user.email, subject, message, application._id, user._id, newStatus);
      results.push({ type: 'email', ...emailResult });
    }

    // Send SMS (Free tier limitations)
    if (user.phone) {
      const smsResult = await this.sendSMS(user.phone, message, application._id, user._id, newStatus);
      results.push({ type: 'sms', ...smsResult });
    }

    // Send WhatsApp (After setup)
    if (user.whatsappNumber || user.phone) {
      const whatsappNumber = user.whatsappNumber || user.phone;
      const whatsappResult = await this.sendWhatsApp(whatsappNumber, message, application._id, user._id, newStatus);
      results.push({ type: 'whatsapp', ...whatsappResult });
    }

    return results;
  }
}

module.exports = new FreeNotificationService();