import express from "express"
import authController from "../controllers/auth.controller.js"
import { registerValidator, loginValidator } from "../validators/auth.validator.js"
import { validate } from "../middlewares/validation.middleware.js"


const router = express.Router();

router.post('/register', registerValidator, validate, authController.registerController);
router.post('/login', loginValidator, validate, authController.loginController);

export default router;