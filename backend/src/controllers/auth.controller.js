import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken, setTokenCookie, clearTokenCookie } from '../services/token.service.js';
import { sendOTPEmail } from '../utils/sendEmail.js';


// REGISTER CONTROLLER
export async function registerController(req, res) {
  try {
    const { firstName, lastName, fullName, email, password } = req.body;

    const finalFirstName = firstName || fullName?.firstName;
    const finalLastName = lastName !== undefined ? lastName : (fullName?.lastName || '');

    if (!finalFirstName || !email || !password) {
      return res.status(400).json({ message: 'First name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    // if user exists and is verified, prevent registration
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    // Generate OTP and set expiration
    const generatedOTP = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // password hashing
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

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
    }

    // Send Email
    await sendOTPEmail(normalizedEmail, generatedOTP);

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
export async function verifyOTPController(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // CRITICAL FIX: Fetch +otp +otpExpires explicitly because of select: false in schema
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (!user.otp || !user.otpExpires || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Mark User as Verified & Clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // AUTO-LOGIN
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
}


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

    // CRITICAL FIX: Fetch +password explicitly because of select: false in schema
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
  try {
    const user = req.user;

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    const userPayload = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar || '',
      })
    );

    return res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}&user=${userPayload}`);
  } catch (error) {
    console.error('Google Auth Controller Error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
  }
}

export default {
  registerController,
  verifyOTPController,
  resendOTPController,
  loginController,
  logoutController,
  getMeController,
  updateProfileController,
  googleCallbackController,
};