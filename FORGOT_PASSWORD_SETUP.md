# Forgot Password Feature - Setup Guide

## Overview
Complete "Forgot Password" feature with email-based password reset functionality.

## Features Implemented

### Backend
- ✅ Password reset token generation (10-minute expiration)
- ✅ Secure token hashing with SHA-256
- ✅ HTML email templates with reset links
- ✅ Token validation and expiration checking
- ✅ Password validation (min 6 chars, uppercase, lowercase, number)
- ✅ Automatic token cleanup after use

### Frontend
- ✅ Forgot Password page with email input
- ✅ Reset Password page with new password form
- ✅ Password strength validation
- ✅ Show/hide password toggle
- ✅ Success/error messages with toast notifications
- ✅ Invalid/expired token handling
- ✅ Auto-redirect to login after successful reset

## Email Configuration

### Option 1: Gmail SMTP (Recommended for Production)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "PlaceHub App"
   - Copy the 16-character password

3. **Update `.env` file** in `backend/` folder:
```env
EMAIL_FROM_NAME=PlaceHub Career Platform
EMAIL_FROM=your-email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Option 2: Ethereal Email (For Testing Only)

1. Go to https://ethereal.email/create
2. Copy the credentials provided
3. Update `.env` file:
```env
EMAIL_FROM_NAME=PlaceHub Career Platform
EMAIL_FROM=noreply@placementhub.dev
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=<ethereal-username>
EMAIL_PASS=<ethereal-password>
```

**Note**: Ethereal emails are fake and only visible at https://ethereal.email/messages

### Option 3: Other SMTP Providers

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<your-sendgrid-api-key>
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=<your-mailgun-username>
EMAIL_PASS=<your-mailgun-password>
```

#### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=<your-ses-smtp-username>
EMAIL_PASS=<your-ses-smtp-password>
```

## User Flow

1. **User clicks "Forgot Password"** on login page
2. **User enters email** and submits
3. **System validates email** and generates reset token
4. **Email sent** with reset link (expires in 10 minutes)
5. **User clicks link** in email → redirected to Reset Password page
6. **User enters new password** (with confirmation)
7. **System validates**:
   - Token is valid and not expired
   - Password meets requirements
   - Passwords match
8. **Password updated** and user redirected to login
9. **User logs in** with new password

## API Endpoints

### Forgot Password
```
POST /api/auth/forgotpassword
Body: { "email": "user@example.com" }
Response: { "status": "success", "message": "Password reset link sent to your email" }
```

### Reset Password
```
PUT /api/auth/resetpassword/:resettoken
Body: { "password": "NewPassword123" }
Response: { "status": "success", "message": "Password reset successful", "data": { "token": "...", "user": {...} } }
```

## Security Features

1. **Token Expiration**: Reset tokens expire after 10 minutes
2. **Token Hashing**: Tokens are hashed with SHA-256 before storage
3. **One-Time Use**: Tokens are deleted after successful password reset
4. **Password Validation**: Enforces strong password requirements
5. **Rate Limiting**: Prevents brute force attacks (configured in backend)
6. **HTTPS**: Use HTTPS in production for secure transmission

## Testing the Feature

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Test Flow
1. Navigate to http://localhost:5173/login
2. Click "Forgot your password?"
3. Enter a registered email address
4. Check email inbox (or Ethereal if using test email)
5. Click the reset link in the email
6. Enter new password (must meet requirements)
7. Confirm password
8. Click "Reset Password"
9. You'll be redirected to login page
10. Login with new password

### 3. Test Error Cases
- Invalid email → "There is no user with that email"
- Expired token → "Invalid or expired token"
- Weak password → Validation error messages
- Mismatched passwords → "Passwords do not match"

## Troubleshooting

### Email Not Sending
1. Check `.env` configuration
2. Verify SMTP credentials are correct
3. Check if Gmail App Password is enabled (for Gmail)
4. Look at backend console for error messages
5. Test with Ethereal email first

### Token Expired Error
- Reset tokens expire after 10 minutes
- Request a new reset link if expired

### Password Validation Errors
Password must contain:
- At least 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Production Checklist

- [ ] Configure production SMTP provider (Gmail, SendGrid, etc.)
- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Enable HTTPS for secure token transmission
- [ ] Test email delivery in production environment
- [ ] Set up email monitoring/logging
- [ ] Configure rate limiting for forgot password endpoint
- [ ] Add CAPTCHA to prevent abuse (optional)

## Files Modified/Created

### Backend
- `backend/src/controllers/auth.js` - Updated forgotPassword with HTML email
- `backend/src/routes/auth.js` - Already had routes configured
- `backend/src/models/User.js` - Already had token fields and methods

### Frontend
- `frontend/src/pages/ForgotPassword.jsx` - Updated with API integration
- `frontend/src/pages/ResetPassword.jsx` - NEW: Password reset page
- `frontend/src/App.jsx` - Added reset password route

## Support

For issues or questions:
1. Check backend console logs for errors
2. Verify email configuration in `.env`
3. Test with Ethereal email first
4. Check browser console for frontend errors
