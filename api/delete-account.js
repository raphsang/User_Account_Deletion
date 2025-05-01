// Force Node.js runtime on Vercel
export const config = {
  runtime: 'nodejs',
};

import nodemailer from 'nodemailer';

// Timeout config
const EMAIL_TIMEOUT = 5000;

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: EMAIL_TIMEOUT,
    socketTimeout: EMAIL_TIMEOUT
  });
};

const sendEmailNonBlocking = (transporter, mailOptions) => {
  setTimeout(() => {
    transporter.sendMail(mailOptions)
      .then(info => console.log('Email sent successfully:', info.messageId))
      .catch(error => console.error('Failed to send email:', error));
  }, 100);
};

const validateInput = (email, username) => {
  const errors = [];
  if (!email) errors.push('Email is required');
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email is required');
  if (!username) errors.push('Username is required');
  return errors;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Only POST requests are supported' });
  }

  try {
    const { email, username, reason } = req.body;

    const validationErrors = validateInput(email, username);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
    }

    const requestId = `DEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transporter = createTransporter();

    const emailOptionsUser = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'We received your account deletion request',
      html: `
        <h2>Account Deletion Request Confirmation</h2>
        <p>Hello ${username},</p>
        <p>We’ve received your request to delete your account.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p>We’ll process this within 30 days.</p>
      `
    };

    const emailOptionsAdmin = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Account Deletion Request',
      html: `
        <h2>New Deletion Request</h2>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Reason:</strong> ${reason || 'Not provided'}</p>
      `
    };

    // Respond immediately
    res.status(200).json({
      success: true,
      message: 'Account deletion request submitted successfully',
      requestId
    });

    // Send emails after response
    sendEmailNonBlocking(transporter, emailOptionsUser);
    sendEmailNonBlocking(transporter, emailOptionsAdmin);

  } catch (error) {
    console.error('Unhandled error in deletion request:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
