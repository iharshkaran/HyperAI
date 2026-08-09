import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, SquarePen } from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import MainSection from '../components/chat/MainSection';
import { useChat } from '../hooks/useChat';

const ChatPage: React.FC = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();

    const { activeChatId, setActiveChatId, startNewChat } = useChat();

    // Sync activeChatId with URL chatId
    useEffect(() => {
        if (chatId) {
            // 1. Agar URL me chatId hai, toh set karo
            if (chatId !== activeChatId) {
                setActiveChatId(chatId);
            }
        } else {
            // 2. Agar URL me chatId NAHI hai (Root Path "/"), toh current chat reset/clear karo
            setActiveChatId(null);
            if (startNewChat) {
                startNewChat();
            }
        }
    }, [chatId]); // trigger only when chatId changes

    // Close mobile sidebar on window resize (>= md breakpoint)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNewChatClick = () => {
        if (startNewChat) startNewChat();
        setActiveChatId(null); // Explicit Reset
        navigate('/');
    };

    return (
        <div className="flex h-dvh w-screen overflow-hidden bg-(--background) text-(--text1) font-sans relative">

            {/* 1. SINGLE FLOATING ACTION PILL (Mobile Only) */}
            <div className="md:hidden fixed top-3 left-3 z-30 flex items-center gap-1 p-1 py-0 rounded-full bg-(--card)/80 backdrop-blur-md border border-(--border) shadow-md">
                <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-(--text) hover:bg-(--border) active:scale-95 transition-all cursor-pointer"
                    aria-label="Open Sidebar"
                >
                    <Menu size={18} />
                </button>

                <div className="w-px h-4 bg-(--border) opacity-60" />

                <button
                    onClick={handleNewChatClick}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-(--text) hover:bg-(--border) active:scale-95 transition-all cursor-pointer"
                    aria-label="New Chat"
                >
                    <SquarePen size={18} />
                </button>
            </div>

            {/* 2. BACKDROP DIMMER (Mobile Only) */}
            <div
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ease-in-out ${
                    isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* 3. SIDEBAR CONTAINER */}
            <div
                className={`
          fixed inset-y-0 left-0 z-50 h-full shrink-0
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <Sidebar
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={() => setIsMobileSidebarOpen(false)}
                />
            </div>

            {/* 4. MAIN WORKSPACE */}
            <div className="flex-1 h-full overflow-hidden min-w-0">
                <MainSection />
            </div>

        </div>
    );
};

export default ChatPage;