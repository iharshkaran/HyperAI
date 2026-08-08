import { Resend } from 'resend';

// Initialize Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Function to send OTP Email
export const sendOTPEmail = async (toEmail, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HyperAI <onboarding@resend.dev>', // Resend's free default sender address
      to: [toEmail],
      subject: `${otp} is your HyperAI verification code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 30px 10px;">
            <tr>
              <td align="left">
                <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; padding: 0;">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <span style="font-size: 22px; font-weight: 800; color: #09090b; letter-spacing: -0.5px;">HyperAI</span>
                    </td>
                  </tr>

                  <!-- Heading -->
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #09090b;">Verify your email</h2>
                    </td>
                  </tr>

                  <!-- Description -->
                  <tr>
                    <td style="padding-bottom: 24px; font-size: 15px; line-height: 24px; color: #52525b;">
                      Use the verification code below to complete your authentication process. This code will expire in 10 minutes.
                    </td>
                  </tr>

                  <!-- OTP Box -->
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <div style="background-color: #ff8c00; border-radius: 8px; padding: 16px; font-size: 32px; font-weight: 700; letter-spacing: 12px; color: #ffffff; text-align: center;">
                        ${otp}
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 24px; border-top: 1px solid #f4f4f5; font-size: 13px; color: #a1a1aa; line-height: 20px;">
                      If you didn't request this code, you can safely ignore this email.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send verification email");
  }
};

// 2. Function to send Reset Password Email
export const sendResetPasswordEmail = async (toEmail, resetUrl) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HyperAI <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Reset your HyperAI password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 30px 10px;">
            <tr>
              <td align="left">
                <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; padding: 0;">
                  
                  <!-- Brand Header-->
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <span style="font-size: 22px; font-weight: 800; color: #09090b; letter-spacing: -0.5px;">HyperAI</span>
                    </td>
                  </tr>

                  <!-- Content Header -->
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #09090b;">Reset your password</h2>
                    </td>
                  </tr>

                  <!-- Text -->
                  <tr>
                    <td style="padding-bottom: 24px; font-size: 15px; line-height: 24px; color: #52525b;">
                      We received a request to reset your password. Click the button below to set a new password. This link will expire in 15 minutes.
                    </td>
                  </tr>

                  <!-- Reset Password Button -->
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #ff8c00; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center;">
                        Reset Password
                      </a>
                    </td>
                  </tr>

                  <!-- Fallback Link -->
                  <tr>
                    <td style="padding-bottom: 28px; font-size: 13px; color: #71717a; word-break: break-all; line-height: 20px;">
                      If the button doesn't work, copy and paste this link into your browser:<br>
                      <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 24px; border-top: 1px solid #f4f4f5; font-size: 13px; color: #a1a1aa; line-height: 20px;">
                      If you didn't request a password reset, you can safely ignore this email.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error sending Reset Password email:", error);
    throw new Error("Failed to send password reset email");
  }
};