import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useChat } from "../../hooks/useChat";

import SidebarHeader from './SidebarHeader';
import SidebarSearch from './SidebarSearch';
import ChatItem from './ChatItem';
import SidebarFooter from './SidebarFooter';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const navigate = useNavigate();

    const {
        chats = [],
        activeChatId,
        setActiveChatId,
        startNewChat,
        fetchChats,
        deleteChat
    } = useChat();

    // Unified Chat Selection with Route Navigation
    const handleSelectChat = (chatId: string) => {
        if (setActiveChatId) setActiveChatId(chatId);
        navigate(`/c/${chatId}`);
        if (onMobileClose) onMobileClose();
    };

    useEffect(() => {
        const loadChats = async () => {
            try {
                setIsFetching(true);
                if (fetchChats) await fetchChats();
            } catch (error) {
                console.error("Failed to fetch chats:", error);
            } finally {
                setIsFetching(false);
            }
        };

        loadChats();
    }, []);

    // Reset activeChatId + Navigate to '/'
    const handleNewChat = async () => {
        if (isCreatingChat) return;
        try {
            setIsCreatingChat(true);

            // 1. Active Chat ID ko null reset karein (Sabse zaroori fix)
            if (setActiveChatId) {
                setActiveChatId(null);
            }

            // 2. Clear new chat session (agar hook backend call karta ho)
            if (startNewChat) {
                await startNewChat();
            }

            // 3. Home Route (blank chat window) par navigate karein
            navigate('/');

            if (onMobileClose) onMobileClose();
        } catch (error) {
            console.error("Failed to create new chat:", error);
        } finally {
            setIsCreatingChat(false);
        }
    };

    //  Handle active chat redirection if active chat is deleted
    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        try {
            if (deleteChat) {
                await deleteChat(chatId);
                if (activeChatId === chatId) {
                    if (setActiveChatId) setActiveChatId(null);
                    navigate('/');
                }
            }
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    };

    const safeChatsList = Array.isArray(chats) ? chats : [];
    const filteredChats = safeChatsList.filter((chat) =>
        chat?.title?.toLowerCase().includes((searchQuery || "").toLowerCase())
    );

    return (
        <>
            {/* Simple Backdrop without blur */}
            {isMobileOpen && (
                <div
                    onClick={onMobileClose}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                />
            )}

            {/* Sidebar Shell */}
            <aside className={`
                flex flex-col justify-between border-r border-(--border) bg-(--background)
                transition-all duration-300 ease-in-out z-50 h-full
                
                ${isMobileOpen ? 'fixed inset-y-0 left-0 w-72 p-3 flex shadow-2xl z-50' : ''}
                ${!isMobileOpen && (isOpen ? 'w-65 p-3' : 'w-16 p-3 items-center')}
            `}>

                {/* Top Section */}
                <SidebarHeader
                    isOpen={isOpen || isMobileOpen}
                    onToggle={() => setIsOpen(!isOpen)}
                    onNewChat={handleNewChat}
                    isCreating={isCreatingChat}
                    onMobileClose={onMobileClose}
                />

                {/* Search Input */}
                <SidebarSearch
                    isOpen={isOpen || isMobileOpen}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Chat List */}
                <div id="recentChat" className="w-full flex-1 my-3 rounded-lg overflow-y-auto">
                    {(isOpen || isMobileOpen) && (
                        <div className="space-y-2">
                            <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent</p>

                            {isFetching ? (
                                <div className="flex items-center justify-center py-6 text-zinc-400 gap-2 text-xs">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Loading chats...</span>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredChats.length === 0 ? (
                                        <p className="px-2 text-xs text-zinc-500 italic py-2">
                                            {searchQuery ? "No matching chats" : "No recent chats"}
                                        </p>
                                    ) : (
                                        filteredChats.map((chat) => (
                                            <ChatItem
                                                key={chat._id}
                                                chat={chat}
                                                isActive={activeChatId === chat._id}
                                                onSelect={handleSelectChat}
                                                onDelete={handleDeleteChat}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Section */}
                <SidebarFooter isOpen={isOpen || isMobileOpen} />

            </aside>
        </>
    );
};

export default Sidebar;