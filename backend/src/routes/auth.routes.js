import express from 'express';
import passport from 'passport';
import authController from '../controllers/auth.controller.js';
import {
    registerValidator,
    loginValidator,
    verifyOTPValidator,
    resendOTPValidator,
    updateProfileValidator,
} from '../validators/auth.validator.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter.middleware.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

//--- PUBLIC AUTH ROUTES ---
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

// Logout User
router.post('/logout', authController.logoutController);


// Google OAuth Routes
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Passport Auth Error:', err);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
        if (!user) {
            console.error('No user returned from Google strategy:', info);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
        }
        req.user = user;
        return authController.googleCallbackController(req, res);
    })(req, res, next);
});

//--- PROTECTED USER ROUTES ---

// Get Current User Info
router.get('/me', authUser, authController.getMeController);

// Update Profile
router.put('/update-profile', authUser, updateProfileValidator, validate, authController.updateProfileController);


export default router;