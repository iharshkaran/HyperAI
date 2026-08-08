import express from 'express';
import passport from 'passport';
import authController from '../controllers/auth.controller.js';
import {
    registerValidator,
    loginValidator,
    verifyOTPValidator,
    resendOTPValidator,
    updateProfileValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} from '../validators/auth.validator.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter.middleware.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Helper to sanitize FRONTEND_URL and prevent trailing-slash issues
const getFrontendUrl = () => {
    return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
};

// ==========================================
//           PUBLIC AUTH ROUTES
// ==========================================

// Register User
router.post(
    '/register',
    authLimiter,
    registerValidator,
    validate,
    authController.registerController
);

// Verify OTP
router.post(
    '/verify-otp',
    otpLimiter,
    verifyOTPValidator,
    validate,
    authController.verifyOTPController
);

// Resend OTP
router.post(
    '/resend-otp',
    otpLimiter,
    resendOTPValidator,
    validate,
    authController.resendOTPController
);

// Login User
router.post(
    '/login',
    authLimiter,
    loginValidator,
    validate,
    authController.loginController
);

// Forgot Password
router.post(
    '/forgot-password',
    authLimiter,
    forgotPasswordValidator,
    validate,
    authController.forgotPasswordController
);

// Reset Password
router.post(
    '/reset-password/:token',
    authLimiter,
    resetPasswordValidator,
    validate,
    authController.resetPasswordController
);

// Logout User
router.post('/logout', authController.logoutController);

// Google OAuth Routes
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        // Fallback domain safely handled
        const frontendUrl = process.env.FRONTEND_URL || 'https://hyperai-psi.vercel.app';

        if (err) {
            console.error('Passport Auth Error:', err);
            return res.redirect(`${frontendUrl}/login?error=auth_failed`);
        }
        if (!user) {
            console.error('No user returned from Google strategy:', info);
            return res.redirect(`${frontendUrl}/login?error=no_user`);
        }

        req.user = user;
        return authController.googleCallbackController(req, res, next);
    })(req, res, next);
});

// ==========================================
//         PROTECTED USER ROUTES
// ==========================================

// Get Current User Info
router.get('/me', authUser, authController.getMeController);

// Update Profile
router.put(
    '/update-profile',
    authUser,
    updateProfileValidator,
    validate,
    authController.updateProfileController
);

export default router;