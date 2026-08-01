
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, SendHorizonal } from 'lucide-react';
import { io, Socket } from "socket.io-client";


const socket: Socket = io('http://localhost:3000', {
  withCredentials: true
}); // Backend connection

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const MainSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

// Initialize Socket Connection
  useEffect(() => {
    socket.on('ai-response',(data: { content: string }) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: data.content,
      };
      setMessages((prev) => [...prev, aiMessage]);
    });

    return () => {
      socket.off('ai-response');
    };

  }, []);



  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    socket.emit('ai-message', {
      chat: "6a6d2ea52a2e98cf11b84098", 
      content: input
    });

    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#101010] text-zinc-100 overflow-hidden">
      
      {/* 1. Header / Navbar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-[#101010] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
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

      {/* 2. Chat Window (Messages Area) */}
      <div id='chatWindow' className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
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
              className={`flex items-start gap-3 max-w-3xl mx-auto w-full my-3 mb-4 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`px-5 py-3 rounded-3xl  max-w-[70%] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#1e1f20] text-white'
                    : 'max-w-full'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* 3. Input Bar */}
      <div className="p-3 pb-5.5 bg-[#101010]">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-2 bg-[#1e1f20] border border-zinc-800 rounded-2xl px-4 py-2 shadow-lg focus-within:border-blue-500 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to HyperAI..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none py-2"
          />
          <button
            type="submit"
            disabled={!input.trim()}
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