const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.AUTH_EMAIL_HOST || process.env.EMAIL_HOST,
    port: parseInt(process.env.AUTH_EMAIL_PORT || process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.AUTH_EMAIL_USER || process.env.EMAIL_USER,
      pass: process.env.AUTH_EMAIL_PASS || process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'PlaceHub'}" <${process.env.AUTH_EMAIL_USER || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message.replace(/\n/g, '<br>')
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  return info;
};

module.exports = sendEmail;