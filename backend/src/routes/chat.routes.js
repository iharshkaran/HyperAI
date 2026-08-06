import express from 'express';
import chatController from '../controllers/chat.controller.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authUser, chatController.createChat);
router.get('/', authUser, chatController.getUserChats);
router.get('/:chatId/messages', authUser, chatController.getChatMessages);
router.delete('/:chatId', authUser, chatController.deleteChat);

export default router;