import express from 'express';
import chatController from '../controllers/chat.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware.authUser, chatController.createChat);
router.get('/', authMiddleware.authUser, chatController.getUserChats);
router.get('/:chatId/messages', authMiddleware.authUser, chatController.getChatMessages);
router.delete('/:chatId', authMiddleware.authUser, chatController.deleteChat);

export default router;