import { body } from 'express-validator';


export const registerValidator = [
    body("email")
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("Please enter a valid email"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^\S+$/)
        .withMessage("Password cannot contain spaces"),

    body("fullName.firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("fullName.lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),
];


export const loginValidator = [
    body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Please enter a valid email"),

    body("password")
    .notEmpty()
    .withMessage("Password is required"),
];