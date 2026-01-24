# FREE Notification Module Setup Guide

## 🆓 Free Services Used

### 1. SMS Notifications - TextBelt (FREE)
- **Service**: TextBelt API
- **Limit**: 1 free SMS per day per IP address
- **Setup**: No registration required
- **API**: `https://textbelt.com/text`

### 2. WhatsApp Notifications - CallMeBot (FREE)
- **Service**: CallMeBot WhatsApp API
- **Limit**: Unlimited (with setup)
- **Setup Required**: Add bot to WhatsApp first
- **Bot Number**: +34 644 59 71 67

### 3. Email Notifications - Gmail SMTP (FREE)
- **Service**: Gmail SMTP
- **Limit**: 500 emails per day
- **Setup**: Gmail App Password required

## 🚀 Quick Setup

### Step 1: Email Setup (Gmail)
1. Enable 2-factor authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Update `.env` with your Gmail credentials

### Step 2: WhatsApp Setup (CallMeBot)
1. Add this number to WhatsApp: **+34 644 59 71 67**
2. Send message: "I allow callmebot to send me messages"
3. You'll receive your API key
4. Update `.env` with your API key

### Step 3: SMS Setup (TextBelt)
- No setup required! Uses free tier automatically
- Limitation: 1 SMS per day per IP address

## 📱 Current Configuration

```env
# FREE Notification Services
CALLMEBOT_API_KEY=your_api_key_from_whatsapp_bot
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## 🔧 How It Works

### When Student Applies:
```
✅ Email: Instant confirmation (Gmail SMTP)
📱 SMS: Daily limit of 1 per IP (TextBelt)
💬 WhatsApp: Unlimited after setup (CallMeBot)
```

### When Status Updates:
```
✅ All three notifications sent automatically
📊 All attempts logged in database
🔄 Retry logic for failed attempts
```

## 🎯 Testing

1. **Start your server**: `npm run dev`
2. **Apply for a job** as student
3. **Check notifications** sent
4. **Update status** as recruiter
5. **Verify notifications** received

## 💡 Upgrade Options

### For Higher Volume:
- **SMS**: Upgrade to TextBelt paid plan ($0.01/SMS)
- **WhatsApp**: Use Twilio WhatsApp API
- **Email**: Use SendGrid free tier (100 emails/day)

### Alternative Free Services:
- **SMS**: Fast2SMS (India), SMS77 (Europe)
- **WhatsApp**: Ultramsg, Chat-API
- **Email**: Ethereal (testing), Mailtrap (testing)

## 🔒 Security Notes

- All APIs use HTTPS
- No sensitive data in notifications
- Rate limiting implemented
- Error logging without exposing credentials

## 📊 Limitations

| Service | Daily Limit | Setup Required |
|---------|-------------|----------------|
| TextBelt SMS | 1 per IP | None |
| CallMeBot WhatsApp | Unlimited | Add bot number |
| Gmail Email | 500 | App password |

## 🚨 Troubleshooting

### SMS Not Working:
- Check phone number format (+1234567890)
- Verify daily limit not exceeded
- Try different IP address

### WhatsApp Not Working:
- Ensure bot number added to WhatsApp
- Verify API key is correct
- Check phone number format

### Email Not Working:
- Verify Gmail app password
- Check 2FA is enabled
- Ensure "Less secure apps" is disabled

Your FREE notification system is now ready! 🎉