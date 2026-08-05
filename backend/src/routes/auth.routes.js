import express from "express";
import passport from "passport";
import authController from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post('/register', registerValidator, validate, authController.registerController);
router.post('/login', loginValidator, validate, authController.loginController);
router.post('/logout', authController.logoutController);

// Google Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport Auth Error:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }
      if (!user) {
        console.error("No user returned from Google strategy:", info);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }
      req.user = user;
      return authController.googleCallbackController(req, res);
    })(req, res, next);
  }
);

export default router;