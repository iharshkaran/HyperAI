import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../services/socket';

interface Message {
  _id?: string;
  role: 'user' | 'model';
  content: string;
}

interface Chat {
  _id: string;
  title: string;
}

interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setActiveChatId: (id: string | null) => void;
  createNewChat: () => Promise<void>;
  fetchChats: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch all user chats
  const fetchChats = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.chats) {
        setChats(data.chats);
        if (data.chats.length > 0 && !activeChatId) {
          setActiveChatId(data.chats[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  // Fetch messages
  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat/${chatId}/messages`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId]);

  // Create New Chat
  const createNewChat = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const data = await res.json();
      if (res.ok && data.chat) {
        setChats((prev) => [data.chat, ...prev]);
        setActiveChatId(data.chat._id);
        setMessages([]); // Clear previous messages for new chat
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setChats((prev) => {
          const updatedChats = prev.filter((c) => c._id !== chatId);
          
          if (activeChatId === chatId) {
            setActiveChatId(updatedChats.length > 0 ? updatedChats[0]._id : null);
          }
          
          return updatedChats;
        });
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  useEffect(() => {
    fetchChats();

    const handleChatUpdated = ({ chatId, title }: { chatId: string; title: string }) => {
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, title } : c))
      );
    };

    const handleAiResponseChunk = ({ chat, content }: { chat: string; content: string }) => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];

        if (lastMsg && lastMsg.role === 'model') {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + content }
          ];
        } else {
          return [
            ...prev,
            { role: 'model', content }
          ];
        }
      });
    };

    // Socket Event Listeners
    socket.on('chat-updated', handleChatUpdated);
    socket.on('ai-response-chunk', handleAiResponseChunk);

    return () => {
      socket.off('chat-updated', handleChatUpdated);
      socket.off('ai-response-chunk', handleAiResponseChunk);
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        messages,
        setMessages,
        setActiveChatId,
        createNewChat,
        fetchChats,
        deleteChat,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }
  return context;
};