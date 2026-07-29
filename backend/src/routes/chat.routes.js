import express from 'express';
import chatController from '../controllers/chat.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware.authUser, chatController.createChat);

export default router;