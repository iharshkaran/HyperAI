import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken, setTokenCookie, clearTokenCookie } from '../services/token.service.js';
import { sendResetPasswordEmail, sendOTPEmail } from '../utils/sendEmail.js';


// REGISTER CONTROLLER
export async function registerController(req, res) {
  try {
    const { firstName, lastName, fullName, email, password } = req.body;

    const finalFirstName = firstName || fullName?.firstName;
    const finalLastName = lastName !== undefined ? lastName : (fullName?.lastName || '');

    if (!finalFirstName || !email || !password) {
      return res.status(400).json({ message: 'First name, email, and password are required' });
    }
     
    console.log("1");

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    // if user exists and is verified, prevent registration
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }
console.log("2");
    // Generate OTP and set expiration
    const generatedOTP = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // password hashing
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
console.log("3");
    if (user && !user.isVerified) {
      // Unverified user update
      user.fullName = { firstName: finalFirstName, lastName: finalLastName };
      user.password = hashPassword;
      user.otp = generatedOTP;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Unverified Naya User
      user = await User.create({
        email: normalizedEmail,
        fullName: { firstName: finalFirstName, lastName: finalLastName },
        password: hashPassword,
        isVerified: false,
        otp: generatedOTP,
        otpExpires: otpExpires,
      });
      console.log("4");
    }

    // Send Email
    await sendOTPEmail(normalizedEmail, generatedOTP);
console.log("5");
    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email successfully!',
      email: normalizedEmail,
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ message: 'Failed to process registration' });
  }
}

 
// VERIFY OTP CONTROLLER


// RESEND OTP CONTROLLER
export async function resendOTPController(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const generatedOTP = crypto.randomInt(100000, 999999).toString();
    user.otp = generatedOTP;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(normalizedEmail, generatedOTP);

    return res.status(200).json({
      success: true,
      message: 'New OTP sent to your email successfully!',
    });
  } catch (err) {
    console.error('Resend OTP Error:', err);
    return res.status(500).json({ message: 'Failed to resend OTP' });
  }
}


// LOGIN CONTROLLER
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch +password explicitly because of select: false in schema
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Email is not verified. Please verify your OTP first.',
        isVerified: false 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Failed to login' });
  }
}


// LOGOUT CONTROLLER
export async function logoutController(req, res) {
  try {
    clearTokenCookie(res);
    return res.status(200).json({ success: true, message: 'User logged out successfully' });
  } catch (err) {
    console.error('Logout Error:', err);
    return res.status(500).json({ message: 'Failed to logout' });
  }
}


// GET CURRENT USER
export async function getMeController(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Get Me Error:', err);
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
}


// UPDATE PROFILE CONTROLLER
export async function updateProfileController(req, res) {
  try {
    const { firstName, lastName} = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName) user.fullName.firstName = firstName.trim();
    if (lastName !== undefined) user.fullName.lastName = lastName.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}


// GOOGLE OAUTH CALLBACK CONTROLLER
export async function googleCallbackController(req, res) {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

  try {
    const user = req.user;

    // Safety check: ensure user exists on req
    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=google_failed`);
    }

    // Generate JWT and set in HTTP-Only Cookie
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Encode payload safely
    const userPayload = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar || '',
      })
    );

    // Redirect to frontend auth-success page
    return res.redirect(`${frontendUrl}/auth-success?token=${token}&user=${userPayload}`);
  } catch (error) {
    console.error('Google Auth Controller Error:', error);
    return res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
}


// FORGOT PASSWORD CONTROLLER
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email does not exist.',
      });
    }

    // Generate Raw Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before saving to DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token & expiration (15 minutes from now) in User model
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Mins

    await user.save({ validateBeforeSave: false });

    // Clean frontend URL to construct Reset URL
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send Email
    try {
      await sendResetPasswordEmail(user.email, resetUrl);

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email successfully.',
      });
    } catch (emailError) {
      // If email fails, cleanup DB token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please check email setup.',
      });
    }
  } catch (error) {
    console.error('Forgot Password Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during forgot password request.',
    });
  }
};


// RESET PASSWORD CONTROLLER
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    // Hash the received token to match with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token & check if token is NOT expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset.',
    });
  }
};

export default {
  registerController,
  verifyOTPController,
  resendOTPController,
  loginController,
  logoutController,
  getMeController,
  updateProfileController,
  googleCallbackController,
  forgotPasswordController,
  resetPasswordController
};