import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, setTokenCookie, clearTokenCookie } from "../services/token.service.js";
import crypto from 'crypto';
import { sendOTPEmail } from '../utils/sendEmail.js';

// 1. REGISTER CONTROLLER (Generates OTP)
export async function registerController(req, res) {
  try {
    const { firstName, lastName, fullName, email, password } = req.body;

    const finalFirstName = firstName || fullName?.firstName;
    const finalLastName = lastName !== undefined ? lastName : (fullName?.lastName || '');

    if (!finalFirstName || !email || !password) {
      return res.status(400).json({ message: 'First name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    // Agar user pehle se exist karta hai aur ALREADY VERIFIED hai
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    // 6-Digit Random OTP Generate Karo
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    const hashPassword = await bcrypt.hash(password, 10);

    if (user && !user.isVerified) {
      // Agar user ne signup kiya tha par verify nahi hua, toh OTP & password update kar do
      user.fullName = { firstName: finalFirstName, lastName: finalLastName };
      user.password = hashPassword;
      user.otp = generatedOTP;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Unverified Naya User Banao
      user = await User.create({
        email: normalizedEmail,
        fullName: { firstName: finalFirstName, lastName: finalLastName },
        password: hashPassword,
        isVerified: false,
        otp: generatedOTP,
        otpExpires: otpExpires,
      });
    }

    // OTP Email Bhejo
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

// 2. VERIFY OTP CONTROLLER
export async function verifyOTPController(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

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

    // 1. Mark User as Verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 2. 🚀 AUTO-LOGIN: Token & Cookie setup
    const token = generateToken(user._id);
    setTokenCookie(res, token); // Agar cookies use kar rahe ho

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token, // Direct token pass for frontend state
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

// Login 
async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const token = generateToken(user._id);

        setTokenCookie(res, token);

        res.status(200).json({
            message: "User Logged in successfully",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
            }
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to Login" });
    }
}


// Logout
async function logoutController(req, res) {
    try {
        clearTokenCookie(res);
        res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to logout" });
    }
}


// Google OAuth Callback
async function googleCallbackController(req, res) {
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

        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}&user=${userPayload}`);
    } catch (error) {
        console.error("Google Auth Controller Error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
}

export default {
    registerController,
    loginController,
    logoutController,
    googleCallbackController,
    verifyOTPController
};
