import { body } from 'express-validator';

// REGISTER VALIDATION
export const registerValidator = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Please enter a valid email address'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^\S+$/)
        .withMessage('Password cannot contain spaces'),

    // Custom check for firstName (handles both flat 'firstName' and nested 'fullName.firstName')
    body().custom((_, { req }) => {
        const firstName = req.body.firstName || req.body.fullName?.firstName;
        if (!firstName || !firstName.trim()) {
            throw new Error('First name is required');
        }
        return true;
    }),

    // Last name is optional
    body('fullName.lastName')
        .optional()
        .trim()
];


// LOGIN VALIDATION
export const loginValidator = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Please enter a valid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];


// VERIFY OTP VALIDATION
export const verifyOTPValidator = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Please enter a valid email address'),

    body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be exactly 6 digits')
];


// RESEND OTP VALIDATION
export const resendOTPValidator = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Please enter a valid email address')
];


// UPDATE PROFILE VALIDATION
export const updateProfileValidator = [
    body('firstName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('First name cannot be empty'),

    body('lastName')
        .optional()
        .trim()
];