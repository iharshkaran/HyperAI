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

    // Handle flat 'firstName' as well as nested 'fullName.firstName'
    body(['firstName', 'fullName.firstName'])
        .optional()
        .trim()
        .notEmpty()
        .withMessage('First name is required'),

    // Custom check to ensure at least one first name exists
    body().custom((_, { req }) => {
        const firstName = req.body.firstName || req.body.fullName?.firstName;
        if (!firstName || !firstName.trim()) {
            throw new Error('First name is required');
        }
        return true;
    }),

    body(['lastName', 'fullName.lastName'])
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
        .isNumeric()
        .withMessage('OTP must contain numbers only')
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


// FORGOT PASSWORD VALIDATION
export const forgotPasswordValidator = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Please enter a valid email address'),
];


// RESET PASSWORD VALIDATION
export const resetPasswordValidator = [
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^\S+$/)
        .withMessage('Password cannot contain spaces'),
];