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

  // Smooth Typer & Socket Streaming Setup
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

  // Fixed Scroll Logic (Stream waqt instant bottom alignment space jumps avoid karne ke liye)
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
    <div className="flex-1 flex flex-col h-screen  text-(--text1) overflow-hidden">
      {/* 1. Header */}
      <header className="flex flex-row-reverse items-center justify-between px-6 pt-3.5  bg-(--background) backdrop-blur-md transition-all duration-300 ease-in">
        <div className="flex  items-center gap-2 px-3 py-1.5 bg-(--card) rounded-full border border-(--border) text-xs text-(--text2)">
          <Sparkles size={14} className="text-blue-400" />
          <span>Vite + React</span>
        </div>
      </header>

      {/* 2. Chat Window */}
      <div id="chatWindow" className="flex-1 overflow-y-auto px-4 py-6 bg-(--background) transition-all duration-300 ease-in">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto px-4">
    {/* Heading */}
    <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-[var(--text)] text-center">
        How can HyperAI help you today?
    </h1>

    {/* Suggestion Cards Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        
        {/* Card 1 */}
        {/* Note: 'setInput' ko apne actual state updater function se replace karein (jaise setMessage ya setPrompt) */}
        <button 
            onClick={() => setInput("Explain code: How does this specific block work?")}
            className="flex flex-col justify-between text-left p-4 h-[140px] rounded-xl border border-[var(--border)] hover:bg-[var(--card)] transition-colors cursor-pointer group"
        >
            <span className="font-medium text-[var(--text)] text-sm">Explain code</span>
            <span className="text-xs text-gray-500">How does this specific block work?</span>
        </button>

        {/* Card 2 */}
        <button 
            onClick={() => setInput("Plan a trip for a 3-day weekend in Goa")}
            className="flex flex-col justify-between text-left p-4 h-[140px] rounded-xl border border-[var(--border)] hover:bg-[var(--card)] transition-colors cursor-pointer group"
        >
            <span className="font-medium text-[var(--text)] text-sm">Plan a trip</span>
            <span className="text-xs text-gray-500">For a 3-day weekend in Goa</span>
        </button>

        {/* Card 3 */}
        <button 
            onClick={() => setInput("Write an email to request a deadline extension")}
            className="flex flex-col justify-between text-left p-4 h-[140px] rounded-xl border border-[var(--border)] hover:bg-[var(--card)] transition-colors cursor-pointer group"
        >
            <span className="font-medium text-[var(--text)] text-sm">Write an email</span>
            <span className="text-xs text-gray-500">To request a deadline extension</span>
        </button>

        {/* Card 4 */}
        <button 
            onClick={() => setInput("Brainstorm names for my new tech startup")}
            className="flex flex-col justify-between text-left p-4 h-[140px] rounded-xl border border-[var(--border)] hover:bg-[var(--card)] transition-colors cursor-pointer group"
        >
            <span className="font-medium text-[var(--text)] text-sm">Brainstorm names</span>
            <span className="text-xs text-gray-500">For my new tech startup</span>
        </button>

    </div>
</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group flex items-start gap-3 max-w-3xl mx-auto w-full my-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
            >
              <div className={`flex flex-col group mb-2 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                {/* Message Bubble */}
                <div
                  className={`relative px-4 py-3 rounded-3xl leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-(--border) text-(--text1) max-w-[70%]'
                    : 'bg-transparent text-(--text2) w-full max-w-full'
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
                            <div className="relative group/code my-4 rounded-xl overflow-hidden border border-(--border) bg-(--background2)">
                              <div className="flex items-center justify-between px-4 py-1.5 bg-(--card) border-b border-(--border) text-xs text-(--text3) font-mono">
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
                            <code className="bg-(--card) text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
                        h1: ({ children }) => <h1 className="text-xl font-bold my-3 text-(--text1)">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold my-2 text-(--text1)">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold my-2 text-(--text1)">{children}</h3>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>

                {/* Message Box Copy Button */}
                <div className={`h-6 mt-1 flex ${msg.role === 'user' ? 'mr-2' : 'ml-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <CopyButton text={msg.content} />
                </div>

              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-3xl mx-auto w-full my-3">
            <div className="px-5 py-3 rounded-3xl bg-(--card) border border-(--border) flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* 3. Input Bar */}
      <div className="p-3 pb-5.5 bg-(--background) transition-all duration-300 ease-in">
        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto flex items-center  gap-2 bg-(--box) border border-(--border) rounded-full pl-5 pr-3 py-2 shadow-lg focus-within:border-blue-500 transition-colors"
        >
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize logic
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              // send Msg using Enter key And Shift+Enter for new line
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            disabled={isLoading}
            placeholder={isLoading ? 'HyperAI is thinking...' : 'Type your message to HyperAI...'}
            rows={1}
            className="flex-1 bg-transparent text-sm text-(--text1) placeholder-zinc-500 focus:outline-none py-2 disabled:opacity-50 resize-none max-h-[150px] overflow-y-auto"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-full transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <SendHorizonal size={16} />
          </button>
        </form>
        <p className='flex justify-center mt-3 text-xs text-[#55555]'>HyperAI can make mistakes. Check important info.</p>
      </div>
    </div>
  );
};

export default MainSection;