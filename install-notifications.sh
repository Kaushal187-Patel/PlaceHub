#!/bin/bash

echo "Installing notification dependencies..."

# Install backend dependencies
cd backend
npm install twilio
echo "✅ Twilio installed for SMS and WhatsApp notifications"

echo "🎉 Notification module installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with Twilio credentials:"
echo "   - TWILIO_ACCOUNT_SID=your_account_sid"
echo "   - TWILIO_AUTH_TOKEN=your_auth_token"
echo "   - TWILIO_PHONE_NUMBER=your_twilio_phone"
echo "   - TWILIO_WHATSAPP_NUMBER=your_whatsapp_number"
echo ""
echo "2. Update email credentials:"
echo "   - EMAIL_USER=your_gmail@gmail.com"
echo "   - EMAIL_PASS=your_app_password"
echo ""
echo "3. Restart your backend server"
echo ""
echo "🚀 Your notification system is ready!"