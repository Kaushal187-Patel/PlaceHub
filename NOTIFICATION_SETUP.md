# Notification Module Setup Guide

## Overview
The notification module sends SMS, WhatsApp, and email notifications to users when:
- They apply for a job (confirmation notification)
- Recruiters update their application status

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
chmod +x install-notifications.sh
./install-notifications.sh
```

### 2. Configure Environment Variables

Update `backend/.env` with your service credentials:

```env
# Twilio (SMS & WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+14155238886

# Gmail (Email)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Service Setup

#### Twilio Setup (SMS & WhatsApp)
1. Create account at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token from Console
3. Purchase a phone number for SMS
4. Enable WhatsApp sandbox for testing

#### Gmail Setup (Email)
1. Enable 2-factor authentication on Gmail
2. Generate App Password in Google Account settings
3. Use App Password in EMAIL_PASS

## 📱 Features

### Automatic Notifications
- **Job Application**: Sent when user applies for job
- **Status Updates**: Sent when recruiter changes application status

### Notification Types
- **SMS**: Text messages to user's phone
- **WhatsApp**: Messages via WhatsApp Business API
- **Email**: HTML formatted emails

### Status Tracking
- All notifications are logged in database
- Success/failure status tracked
- Notification history available via API

## 🔧 API Endpoints

### Get User Notifications
```
GET /api/notifications
Authorization: Bearer <token>
```

### Get Notification Stats
```
GET /api/notifications/stats
Authorization: Bearer <token>
```

### Update Application Status (Recruiter)
```
PUT /api/applications/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shortlisted"
}
```

## 🎨 Frontend Components

### NotificationCenter
- View notification history
- See delivery statistics
- Track success/failure rates

### ApplicationStatusUpdate
- Recruiter interface to update status
- Automatic notification sending
- Real-time feedback

## 📊 Database Schema

### Notification Model
```javascript
{
  user: ObjectId,           // User receiving notification
  application: ObjectId,    // Related job application
  type: String,            // 'sms', 'whatsapp', 'email'
  status: String,          // 'pending', 'sent', 'failed'
  message: String,         // Notification content
  recipient: String,       // Phone/email address
  applicationStatus: String, // Job application status
  sentAt: Date,           // When notification was sent
  error: String           // Error message if failed
}
```

## 🔒 Security Features

- All notifications require authentication
- Rate limiting on notification endpoints
- Input validation and sanitization
- Error logging without exposing sensitive data

## 🧪 Testing

### Test Notification Flow
1. Create test user account
2. Apply for a job
3. Check notification delivery
4. Update application status as recruiter
5. Verify status change notifications

### Environment Variables for Testing
```env
# Use Twilio test credentials for development
TWILIO_ACCOUNT_SID=test_account_sid
TWILIO_AUTH_TOKEN=test_auth_token
```

## 🚨 Troubleshooting

### Common Issues
1. **Twilio Authentication Failed**
   - Verify Account SID and Auth Token
   - Check phone number format (+1234567890)

2. **Email Not Sending**
   - Verify Gmail App Password
   - Check 2FA is enabled on Gmail account

3. **WhatsApp Not Working**
   - Ensure WhatsApp sandbox is configured
   - Verify recipient number is whitelisted

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📈 Monitoring

### Notification Metrics
- Delivery success rates
- Failed notification reasons
- Response times
- User engagement

### Logs Location
- Application logs: `backend/logs/`
- Notification logs: Database `notifications` collection

## 🔄 Future Enhancements

- Push notifications for mobile app
- Notification preferences per user
- Scheduled notifications
- Bulk notification sending
- Advanced analytics dashboard