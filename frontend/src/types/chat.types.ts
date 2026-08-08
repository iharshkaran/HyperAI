export interface Chat {
  _id: string;
  title: string;
  user?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Message {
  _id?: string;
  id?: string;
  role: 'user' | 'model';
  content: string;
  createdAt?: string;
}

export interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isChatsLoading: boolean;
  isMessagesLoading: boolean;
  setActiveChatId: (id: string | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  fetchChats: () => Promise<void>;
  startNewChat: () => void;
  deleteChat: (chatId: string) => Promise<boolean>;
  editMessage: (messageId: string, newContent: string) => Promise<boolean>;
  moveChatToTop: (chatId: string) => void;
}