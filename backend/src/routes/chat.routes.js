import express from 'express';
import chatController from '../controllers/chat.controller.js';
import { authUser } from '../middlewares/auth.middleware.js';
import { param } from 'express-validator';
import { validate } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Global Auth Protection
router.use(authUser);


// GET and POST routes for chats
router.post('/', chatController.createChat);
router.get('/', chatController.getUserChats);


// Edit Message Route
router.post('/edit-message', chatController.editAndStreamResponse);


// Dynamic Routes for Chat Messages and Deletion
router.get(
    '/:chatId/messages',
    [param('chatId').isMongoId().withMessage('Invalid Chat ID format'), validate],
    chatController.getChatMessages
);

router.delete(
    '/:chatId',
    [param('chatId').isMongoId().withMessage('Invalid Chat ID format'), validate],
    chatController.deleteChat
);


export default router;