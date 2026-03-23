const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, fullName, token) => {
  const verifyURL = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Omnifood" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Verify your Omnifood account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #e67e22;">Welcome to Omnifood, ${fullName}! 🍽️</h2>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verifyURL}" 
           style="background:#e67e22; color:white; padding:12px 24px; 
                  border-radius:8px; text-decoration:none; display:inline-block;">
          Verify Email
        </a>
        <p style="color:#999; margin-top:20px;">Link expires in 24 hours.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };