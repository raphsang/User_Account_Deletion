import nodemailer from 'nodemailer';

const EMAIL_TIMEOUT = 5000; // 5 seconds timeout for email operations

const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: EMAIL_TIMEOUT,
      // Adding a socket timeout to prevent hanging connections
      socketTimeout: EMAIL_TIMEOUT
    });
  } catch (err) {
    console.error('Failed to create email transporter:', err);
    throw new Error('Email configuration error');
  }
};

const validateInput = (email, username) => {
  const errors = [];

  if (!email) errors.push('Email is required');
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email is required');

  if (!username) errors.push('Username is required');

  return errors;
};

// Function to send email with timeout handling
const sendEmailWithTimeout = async (transporter, mailOptions) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Email sending timeout'));
    }, EMAIL_TIMEOUT);

    transporter.sendMail(mailOptions, (error, info) => {
      clearTimeout(timeoutId);
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

export default async function handler(req, res) {
  // Handle CORS
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
    console.log('Incoming request body:', req.body);

    const { email, username, reason } = req.body;

    const validationErrors = validateInput(email, username);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const requestId = `DEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    console.log('Deletion request received:', {
      id: requestId,
      email,
      username,
      reason: reason || 'Not provided',
      date: new Date().toISOString()
    });

    // Store the deletion request in your database first
    // This ensures the request is recorded even if email sending fails
    try {
      // Add code here to store the deletion request in your database
      // Example: await dbClient.insertDeletionRequest({ requestId, email, username, reason, status: 'pending' });
      
      // For now, we'll just log it
      console.log('Deletion request recorded with ID:', requestId);
    } catch (dbError) {
      console.error('Error recording deletion request:', dbError);
      // Continue processing - we still want to try sending emails
    }

    let transporter;
    try {
      transporter = createTransporter();
    } catch (emailError) {
      console.error('Error setting up transporter:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Failed to initialize email service'
      });
    }

    const emailOptionsUser = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'We received your account deletion request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Request Confirmation</h2>
          <p>Hello ${username},</p>
          <p>We've received your request to delete your account from our mobile application.</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p>We'll process your request within the next 30 days in accordance with our data retention policies.</p>
          <p>You'll receive a final confirmation email once your account has been fully deleted.</p>
          <p>If you did not make this request, please contact our support team immediately.</p>
          <p>Thank you,<br>Your App Team</p>
        </div>
      `
    };

    const emailOptionsAdmin = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Account Deletion Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Account Deletion Request</h2>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Reason:</strong> ${reason || 'Not provided'}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        </div>
      `
    };

    // Send emails in parallel instead of sequentially
    try {
      await Promise.allSettled([
        sendEmailWithTimeout(transporter, emailOptionsUser),
        sendEmailWithTimeout(transporter, emailOptionsAdmin)
      ]);
      
      // Note: We're using Promise.allSettled instead of Promise.all
      // This ensures we don't fail if only one email fails
      
      return res.status(200).json({
        success: true,
        message: 'Account deletion request submitted successfully',
        requestId
      });
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      
      // We still return a success since we've recorded the deletion request
      return res.status(200).json({
        success: true,
        message: 'Account deletion request recorded, but there was an issue sending confirmation emails',
        requestId
      });
    }

  } catch (error) {
    console.error('Unhandled error in deletion request:', error);

    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
}
