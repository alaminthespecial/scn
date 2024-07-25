// config/nodemailer.js
// config/nodemailer.js
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config();

// Create a transporter object using Outlook SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use false for TLS/STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

// Verify the transporter setup
transporter.verify((error, success) => {
  if (error) {
    console.error('Error setting up Nodemailer transporter:', error);
  } else {
    console.log('Nodemailer transporter is ready to send emails');
  }
});

module.exports = transporter;
