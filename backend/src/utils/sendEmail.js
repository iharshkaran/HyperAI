import nodemailer from 'nodemailer';

// Create a transporter using Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP email
export const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"HyperAI Team" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #121212; color: #ffffff; border-radius: 12px; max-width: 450px; margin: 0 auto;">

        <h2 style="color: #6366f1; margin-bottom: 8px;">Verify Your Account</h2>
        
        <p style="color: #aaaaaa; font-size: 14px;">Use the verification code below to complete your registration:</p>
        
        <div style="background-color: #1e1e2e; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #818cf8; margin: 20px 0;">
          ${otp}
        </div>

        <p style="font-size: 12px; color: #777777;">This OTP will expire in 10 minutes. Do not share this code with anyone.</p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};