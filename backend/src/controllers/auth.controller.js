import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, setTokenCookie, clearTokenCookie } from "../services/token.service.js";


// Register
async function registerController(req, res) {
    try {
        const { fullName: { firstName, lastName }, email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const isUserAlreadyExists = await User.findOne({ email: normalizedEmail });

        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: normalizedEmail,
            fullName: {
                firstName, lastName
            },
            password: hashPassword
        })

        const token = generateToken(user._id);

        setTokenCookie(res, token);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to Register" });
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
    googleCallbackController
};
