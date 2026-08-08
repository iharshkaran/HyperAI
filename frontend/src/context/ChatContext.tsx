import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { type Chat, type Message, type ChatContextType } from '../types/chat.types';
import { chatService } from '../services/chat.service';
import { useChatSockets } from '../hooks/useChatSockets';

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isChatsLoading, setIsChatsLoading] = useState<boolean>(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);

  // Attach Sockets Hook
  useChatSockets({ setChats, setActiveChatId, setMessages });

  // 1. Fetch Chats
  const fetchChats = useCallback(async () => {
    setIsChatsLoading(true);
    try {
      const data = await chatService.getUserChats();
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setIsChatsLoading(false);
    }
  }, []);

  // 2. Fetch Messages
  const fetchMessages = useCallback(async (chatId: string) => {
    setIsMessagesLoading(true);
    try {
      const data = await chatService.getChatMessages(chatId);
      setMessages(data);
    } catch (err) {
      console.error(`Failed to load messages:`, err);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  // 3. Lazy New Chat (Local Action)
  const startNewChat = () => {
    if (activeChatId === null && messages.length === 0) return;
    setActiveChatId(null);
    setMessages([]);
  };

  // 4. Delete Chat
  const deleteChat = async (chatId: string): Promise<boolean> => {
    try {
      await chatService.deleteChatApi(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) startNewChat();
      return true;
    } catch (err) {
      return false;
    }
  };

  // 5. Edit Message
  const editMessage = async (messageId: string, newContent: string): Promise<boolean> => {
    if (!activeChatId) return false;
    try {
      await chatService.editMessageApi(activeChatId, messageId, newContent);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId || m.id === messageId ? { ...m, content: newContent } : m))
      );
      return true;
    } catch (err) {
      return false;
    }
  };

  //   Move Chat to Top (Wrapped with useCallback for performance)
  const moveChatToTop = useCallback((chatId: string) => {
    setChats((prevChats) => {
      const existingChatIndex = prevChats.findIndex((c) => c._id === chatId);

      if (existingChatIndex === -1) return prevChats;

      const targetChat = prevChats[existingChatIndex];
      const updatedChats = prevChats.filter((c) => c._id !== chatId);

      return [targetChat, ...updatedChats];
    });
  }, []);

  // Active Chat Trigger
  useEffect(() => {
    if (activeChatId) fetchMessages(activeChatId);
    else setMessages([]);
  }, [activeChatId, fetchMessages]);

  // Initial Load
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        messages,
        isChatsLoading,
        isMessagesLoading,
        setActiveChatId,
        setMessages,
        fetchChats,
        startNewChat,
        deleteChat,
        editMessage,
        moveChatToTop,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};