import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, SendHorizonal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { socket } from '../services/socket';
import { useChat } from '../context/ChatContext';
import { CopyButton } from './common/CopyButton';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const MainSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeChatId } = useChat();

  // 🟢 Smooth Typer & Socket Streaming Setup
  useEffect(() => {
    let queue = '';
    let activeMsgId = '';
    let animationFrameId: number;

    // Smooth Renderer Loop: Chunks fast aane par bhi 1-3 chars smooth flow me render karega
    const renderLoop = () => {
      if (queue.length > 0 && activeMsgId) {
        const takeCount = queue.length > 60 ? 6 : queue.length > 20 ? 3 : 1;
        const charsToAppend = queue.slice(0, takeCount);
        queue = queue.slice(takeCount);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === activeMsgId
              ? { ...m, content: m.content + charsToAppend }
              : m
          )
        );
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    const handleAiResponseChunk = (data: { chat: string; chunk: string }) => {
      setIsLoading(false);

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
      const checkCompletion = setInterval(() => {
        if (queue.length === 0) {
          activeMsgId = '';
          clearInterval(checkCompletion);
        }
      }, 50);
    };

    socket.on('ai-response-chunk', handleAiResponseChunk);
    socket.on('ai-response-end', handleAiResponseEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      socket.off('ai-response-chunk', handleAiResponseChunk);
      socket.off('ai-response-end', handleAiResponseEnd);
    };
  }, []);

  // Fetch Chat History
  useEffect(() => {
    if (!activeChatId) return;

    setMessages([]);
    setIsLoading(false);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/chat/${activeChatId}/messages`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.messages) {
          const formattedMessages: Message[] = data.messages.map((m: any) => ({
            id: m._id,
            role: m.role,
            content: m.content,
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  // 🟢 Fixed Scroll Logic (Stream waqt instant bottom alignment space jumps avoid karne ke liye)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChatId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    socket.emit('ai-message', {
      chat: activeChatId,
      content: input,
    });

    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#101010] text-zinc-100 overflow-hidden">
      {/* 1. Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-[#101010] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">HyperAI Assistant</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online & Ready
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 rounded-full border border-zinc-700/50 text-xs text-zinc-300">
          <Sparkles size={14} className="text-blue-400" />
          <span>Vite + React</span>
        </div>
      </header>

      {/* 2. Chat Window */}
      <div id="chatWindow" className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3">
            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner text-blue-500">
              <Bot size={32} />
            </div>
            <p className="text-sm font-medium text-zinc-300">How can HyperAI help you today?</p>
            <span className="text-xs text-zinc-500">Type a message below to start the conversation.</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group flex items-start gap-3 max-w-3xl mx-auto w-full my-3 mb-4 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`relative px-5 py-3 rounded-3xl leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#1e1f20] text-white max-w-[70%]'
                    : 'bg-transparent text-zinc-200 w-full max-w-full'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const language = match ? match[1] : '';

                        return !inline && match ? (
                          <div className="relative group/code my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                            {/* Code Header Copy */}
                            <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                              <span>{language}</span>
                              <CopyButton text={codeString} />
                            </div>

                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language={language}
                              PreTag="div"
                              className="!my-0 !bg-transparent p-4 text-sm font-mono overflow-x-auto"
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-zinc-800 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
                      h1: ({ children }) => <h1 className="text-xl font-bold my-3 text-zinc-100">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold my-2 text-zinc-100">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold my-2 text-zinc-100">{children}</h3>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}

                {/* Message Box Copy Button */}
                <div
                  className={`mt-2 flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <CopyButton text={msg.content} />
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-3xl mx-auto w-full my-3">
            <div className="px-5 py-3 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* 3. Input Bar */}
      <div className="p-3 pb-5.5 bg-[#101010]">
        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto flex items-center gap-2 bg-[#1e1f20] border border-zinc-800 rounded-2xl px-4 py-2 shadow-lg focus-within:border-blue-500 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? 'HyperAI is thinking...' : 'Type your message to HyperAI...'}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none py-2 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <SendHorizonal size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainSection;