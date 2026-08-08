import api from './api';
import { type Chat, type Message } from '../types/chat.types';

export const chatService = {
    
    // Fetch all chats for the sidebar
    getUserChats: async (): Promise<Chat[]> => {
        const res = await api.get('/chats');
        return res.data?.chats || [];
    },

    // Fetch messages for a specific active chat (/c/:chatId)
    getChatMessages: async (chatId: string): Promise<Message[]> => {
        if (!chatId) return [];
        const res = await api.get(`/chats/${chatId}/messages`);
        
        return (res.data?.messages || []).map((m: any) => ({
            _id: m._id,
            id: m._id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
            editCount: m.editCount || 0,
        }));
    },

    // Delete chat
    deleteChatApi: async (chatId: string): Promise<void> => {
        await api.delete(`/chats/${chatId}`);
    },

    // Edit message
    editMessageApi: async (chatId: string, messageId: string, content: string): Promise<void> => {
        await api.put(`/chats/${chatId}/messages/${messageId}`, { content });
    },
};