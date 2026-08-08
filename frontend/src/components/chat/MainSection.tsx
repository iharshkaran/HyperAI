import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../services/socket.service';
import { useChat } from '../../hooks/useChat';
import api from '../../services/api';

import WelcomeScreen from './WelcomeScreen';
import { ChatHeader } from './ChatHeader';
import { MessageBubble, type Message } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';

const MainSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const { activeChatId, setActiveChatId, fetchChats, moveChatToTop } = useChat() as any;

  // 1. Optimized Throttle Socket Render Loop
  useEffect(() => {
    let queue = '';
    let activeMsgId = '';
    let animationFrameId: number;
    let lastUpdate = Date.now();

    const renderLoop = () => {
      const now = Date.now();

      // 🟢 Fix: Har 40ms (~25fps) mein sirf 1 baar React State Update hogi
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
      if (setActiveChatId) setActiveChatId(data.chatId);
      if (fetchChats) fetchChats();
      navigate(`/c/${data.chatId}`, { replace: true });
    };

    const handleAiResponseChunk = (data: { chat: string; chunk: string }) => {
      setIsLoading(false);

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

      const checkCompletion = setInterval(() => {
        if (queue.length === 0) {
          activeMsgId = '';
          clearInterval(checkCompletion);
        }
      }, 50);
    };

    const handleAiError = (data: { message: string }) => {
      console.error('AI Error:', data.message);
      setIsLoading(false);
    };

    socket.on('chat-created', handleChatCreated);
    socket.on('ai-response-chunk', handleAiResponseChunk);
    socket.on('ai-response-end', handleAiResponseEnd);
    socket.on('ai-error', handleAiError);

    return () => {
      cancelAnimationFrame(animationFrameId);
      socket.off('chat-created', handleChatCreated);
      socket.off('ai-response-chunk', handleAiResponseChunk);
      socket.off('ai-response-end', handleAiResponseEnd);
      socket.off('ai-error', handleAiError);
    };
  }, [setActiveChatId, fetchChats, moveChatToTop, navigate]);

  // 2. Fetch Chat History
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const loadChatMessages = async () => {
      try {
        const res = await api.get(`/chats/${activeChatId}/messages`);
        if (res.data?.messages) {
          const loadedMessages = res.data.messages.map((m: any) => ({
            id: m._id,
            _id: m._id,
            role: m.role,
            content: m.content,
          }));
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error('Error loading chat messages:', err);
      }
    };

    loadChatMessages();
  }, [activeChatId]);

  // 3. Smart Auto Scroll (User scroll detect karega)
  const isUserScrollingRef = useRef(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Bottom se distance check karein (agar > 100px hai, matlab user upar padh raha hai)
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    isUserScrollingRef.current = !isAtBottom;
  };

  // 3. Auto Scroll
  useEffect(() => {
    if (scrollRef.current && !isUserScrollingRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // 4. Send Message Handler
  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();

    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (activeChatId && moveChatToTop) {
      moveChatToTop(activeChatId);
    }

    socket.emit('ai-message', {
      chat: activeChatId || null,
      content: textToSend,
    });
  };

  // 5. Edit Message Handler
  const handleEditMessageSubmit = async (messageId: string, newContent: string) => {
    if (isLoading) return;

    setIsLoading(true);

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
      chat: activeChatId || null,
      messageId,
      content: newContent,
    });
  };

  const lastUserIndex = messages.findLastIndex((m) => m.role === 'user');

  return (
    <div className="flex-1 flex flex-col h-screen text-(--text1) overflow-hidden">
      <ChatHeader />

      <div id="chatWindow" onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6 bg-(--background) transition-all duration-300 ease-in">
        {messages.length === 0 && !isLoading ? (
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