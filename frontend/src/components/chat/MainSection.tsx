import React, { useState, useRef, useEffect } from 'react';
import { socket } from '../../services/socket.service';
import { useChat } from '../../hooks/useChat';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

import WelcomeScreen from './WelcomeScreen';
import { ChatHeader } from './ChatHeader';
import { MessageBubble, type Message } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';

const MainSection = () => {
  const { chatId: routeChatId } = useParams<{ chatId: string }>(); // 🟢 URL se seedha, race-free
  const [isFetchingHistory, setIsFetchingHistory] = useState(() => !!routeChatId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoadingRef = useRef(false);
  const navigate = useNavigate();

  const { activeChatId, setActiveChatId, fetchChats, moveChatToTop } = useChat() as any;
  const justCreatedChatIdRef = useRef<string | null>(null); // 🟢 boolean ki jagah actual ID store karo
  const skipSmoothScrollRef = useRef(false);

  const setLoadingState = (state: boolean) => {
    setIsLoading(state);
    isLoadingRef.current = state;
  };

  // 1. Optimized Throttle Socket Render Loop
  useEffect(() => {
    let queue = '';
    let activeMsgId = '';
    let animationFrameId: number;
    let checkCompletionInterval: ReturnType<typeof setInterval>;
    let lastUpdate = Date.now();

    const renderLoop = () => {
      const now = Date.now();

      if (queue.length > 0 && activeMsgId && now - lastUpdate > 40) {
        const takeCount = queue.length > 60 ? 10 : queue.length > 20 ? 4 : 2;
        const charsToAppend = queue.slice(0, takeCount);
        queue = queue.slice(takeCount);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === activeMsgId || m._id === activeMsgId
              ? { ...m, content: m.content + charsToAppend }
              : m
          )
        );

        lastUpdate = now;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    const handleChatCreated = (data: { chatId: string; title: string }) => {
      justCreatedChatIdRef.current = data.chatId; // 🟢 actual ID store karo
      if (setActiveChatId) setActiveChatId(data.chatId);
      if (fetchChats) fetchChats();
      navigate(`/c/${data.chatId}`, { replace: true });
    };

    const handleAiResponseChunk = (data: { chat: string; chunk: string }) => {
      setLoadingState(false);

      if (data.chat && moveChatToTop) {
        moveChatToTop(data.chat);
      }

      if (!activeMsgId) {
        const newMsgId = Date.now().toString();
        activeMsgId = newMsgId;
        queue += data.chunk;

        setMessages((prev) => [
          ...prev,
          {
            id: newMsgId,
            role: 'model',
            content: '',
          },
        ]);
      } else {
        queue += data.chunk;
      }
    };

    const handleAiResponseEnd = () => {
      if (fetchChats) fetchChats();

      checkCompletionInterval = setInterval(() => {
        if (queue.length === 0) {
          activeMsgId = '';
          clearInterval(checkCompletionInterval);
        }
      }, 50);
    };

    const handleAiError = (data: { message: string }) => {
      console.error('AI Error:', data.message);
      setLoadingState(false);
    };

    const handleUserMessageSaved = (data: { clientId: string; messageId: string; chatId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.clientId ? { ...m, id: data.messageId, _id: data.messageId } : m
        )
      );
    };

    const handleMessageUpdated = (data: { messageId: string; chatId: string; newContent?: string; editCount?: number }) => {
      setMessages((prev) => {
        const editIndex = prev.findIndex((m) => String(m._id || m.id) === String(data.messageId));
        if (editIndex === -1) return prev;

        const updatedList = prev.slice(0, editIndex + 1);
        updatedList[editIndex] = {
          ...updatedList[editIndex],
          content: data.newContent || updatedList[editIndex].content,
          editCount: data.editCount ?? updatedList[editIndex].editCount,
        };

        return updatedList;
      });
    };

    socket.on('chat-created', handleChatCreated);
    socket.on('ai-response-chunk', handleAiResponseChunk);
    socket.on('ai-response-end', handleAiResponseEnd);
    socket.on('ai-error', handleAiError);
    socket.on('user-message-saved', handleUserMessageSaved);
    socket.on('message-updated', handleMessageUpdated);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (checkCompletionInterval) clearInterval(checkCompletionInterval);

      socket.off('chat-created', handleChatCreated);
      socket.off('ai-response-chunk', handleAiResponseChunk);
      socket.off('ai-response-end', handleAiResponseEnd);
      socket.off('ai-error', handleAiError);
      socket.off('user-message-saved', handleUserMessageSaved);
      socket.off('message-updated', handleMessageUpdated);
    };
  }, [setActiveChatId, fetchChats, moveChatToTop, navigate]);

  useEffect(() => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [routeChatId]);

  // 2. Fetch Chat History — routeChatId (useParams) pe depend karta hai, koi race nahi
  useEffect(() => {
    if (!routeChatId) {
      setMessages([]);
      setIsFetchingHistory(false);
      return;
    }

    // Agar yeh chat abhi-abhi isi session mein create hua tha, fetch skip karo
    if (justCreatedChatIdRef.current === routeChatId) {
      justCreatedChatIdRef.current = null;
      setIsFetchingHistory(false);
      return;
    }

    const loadChatMessages = async () => {
      setIsFetchingHistory(true);
      try {
        const res = await api.get(`/chats/${routeChatId}/messages`);
        if (res.data?.messages) {
          const loadedMessages = res.data.messages.map((m: any) => ({
            id: m._id,
            _id: m._id,
            role: m.role,
            content: m.content,
            editCount: m.editCount || 0,
          }));
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error('Error loading chat messages:', err);
      } finally {
        setIsFetchingHistory(false);
      }
    };

    loadChatMessages();
  }, [routeChatId]);

  // 3. Smart Auto Scroll
  const isUserScrollingRef = useRef(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    isUserScrollingRef.current = !isAtBottom;
  };

  useEffect(() => {
    if (scrollRef.current && !isUserScrollingRef.current) {
      const behavior: ScrollBehavior = skipSmoothScrollRef.current ? 'auto' : 'smooth';
      scrollRef.current.scrollIntoView({ behavior });
      skipSmoothScrollRef.current = false;
    }
  }, [messages, isLoading]);

  // 4. Send Message Handler
  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();

    const textToSend = customText || input;
    if (!textToSend.trim() || isLoadingRef.current) return;

    if (messages.length === 0) {
      skipSmoothScrollRef.current = true;
    }

    const tempId = Date.now().toString();

    const userMessage: Message = {
      id: tempId,
      role: 'user',
      content: textToSend,
      editCount: 0,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoadingState(true);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (activeChatId && moveChatToTop) {
      moveChatToTop(activeChatId);
    }

    socket.emit('ai-message', {
      chat: routeChatId || null,
      content: textToSend,
      clientId: tempId,
    });
  };

  // 5. Edit Message Handler
  const handleEditMessageSubmit = async (messageId: string, newContent: string) => {
    if (isLoadingRef.current) return;

    setLoadingState(true);

    setMessages((prev) => {
      const editIndex = prev.findIndex((m) => m.id === messageId || m._id === messageId);
      if (editIndex === -1) return prev;

      const updated = prev.slice(0, editIndex + 1);
      updated[editIndex] = {
        ...updated[editIndex],
        content: newContent,
      };
      return updated;
    });

    if (activeChatId && moveChatToTop) {
      moveChatToTop(activeChatId);
    }

    socket.emit('ai-message', {
      chat: routeChatId || null,
      messageId,
      content: newContent,
    });
  };

  const lastUserIndex = messages.findLastIndex((m) => m.role === 'user');

  return (
    <div className="flex-1 flex flex-col h-dvh text-(--text1) overflow-hidden">
      <ChatHeader />

      <div id="chatWindow" onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pt-14 pb-6 bg-(--background) transition-all duration-300 ease-in">
        {isFetchingHistory ? (
          <div className="flex-1 h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 && !isLoading ? (
          <WelcomeScreen onSelectPrompt={(promptText) => handleSendMessage(undefined, promptText)} />
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || msg._id}
              msg={msg}
              isLastUserMessage={index === lastUserIndex}
              onEditSubmit={handleEditMessageSubmit}
            />
          ))
        )}

        {isLoading && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        textareaRef={textareaRef}
      />
    </div>
  );
};

export default MainSection;