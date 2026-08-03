import { PanelLeft, PanelLeftOpen, PanelLeftClose, SquarePen, User, Settings, Trash2, LogOut, Sun, Moon, Search } from 'lucide-react';
import { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from '../context/AppContext';
import SettingsModal from './SettingsModal';

const Sidebar = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const { theme, toggleTheme } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { chats, activeChatId, setActiveChatId, createNewChat, fetchChats, deleteChat } = useChat();
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchChats();
    }, []);

    const handleNewChat = async () => {
        await createNewChat();
    };

    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        await deleteChat(chatId);
    };

    const getToggleIcon = () => {
        if (isHovered) { return isOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} /> }
        return !isOpen ? <img src="/HyperAILogo.jpg" alt="Logo" className="w-[19px] object-contain rounded-xl" /> : <PanelLeft size={19} />;
    }

    const userName = user?.fullName?.firstName
        ? user.fullName.firstName
        : user?.email || "User";

    // Search Filter
    const filteredChats = chats.filter((chat) =>
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside className={`flex flex-col justify-between border-r border-(--border) bg-(--sidebar) transition-all duration-300 ease-in-out ${isOpen ? 'w-65 p-3' : 'w-16 p-3 items-center'}`}>

            {/* Top Section */}
            <div className='flex flex-col gap-5 mb-4.5'>
                <div className='flex justify-between items-center'>
                    {isOpen && <span className="font-medium cursor-pointer text-(--text)">HyperAI</span>}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="text-(--text) hover:bg-(--border) cursor-pointer rounded-full transition-colors p-2"
                        title="Toggle Sidebar"
                    >
                        {getToggleIcon()}
                    </button>
                </div>

                <button
                    onClick={handleNewChat}
                    className={`flex gap-3 items-center w-full rounded-lg cursor-pointer text-(--text) transition-colors ${isOpen ? 'px-3 py-2 bg-[var(--card)] hover:bg-[var(--border)]' : 'p-2 hover:bg-[var(--card)]'}`}
                >
                    <SquarePen size={18} />
                    {isOpen && <span className="text-sm font-medium">New chat</span>}
                </button>
            </div>

            {/* Search Input - Hidden when closed */}
            {isOpen && (
                <div className="relative mb-3">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                    />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-1.5 rounded-lg text-sm bg-[var(--card)]  text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition"
                    />
                </div>
            )}

            {/* Chat List */}
            <div id='recentChat' className="w-full space-y-2 h-full rounded-lg overflow-auto">
                {isOpen && (
                    <div className="mt-2 space-y-3">
                        <p className="px-3 text-sm font-semibold text-gray-500">Recent</p>
                        <div className="space-y-1">
                            {/* 2. Filtered Chats Mapped Here */}
                            {filteredChats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => handleSelectChat(chat._id)}
                                    className={`group flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg truncate cursor-pointer transition-colors ${activeChatId === chat._id
                                        ? 'bg-(--border) text-(--text) font-medium'
                                        : 'text-(--text) hover:bg-(--card)'
                                        }`}
                                >
                                    <span className="truncate">{chat.title || "Untitled Chat"}</span>
                                    <button
                                        onClick={(e) => handleDeleteChat(e, chat._id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity cursor-pointer"
                                        title="Delete Chat"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Section: User Profile & Styled Buttons */}
            <div className='flex flex-col gap-2 mt-3 mb-1 transition-all duration-300 ease-in-out'>
                <div className={`flex items-center justify-between w-full ${!isOpen && 'flex-col gap-3'}`}>

                    {/* User Profile */}
                    <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
                        <button className="flex items-center bg-blue-500 text-white rounded-full p-1.5 cursor-pointer">
                            <User size={16} />
                        </button>
                        {isOpen && <span className='text-sm cursor-pointer truncate max-w-[120px] text-[var(--text)]'>
                            {userName}
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Online
                            </p>
                        </span>}

                    </div>

                    {/* Styled Action Buttons */}
                    <div className={`flex items-center ${isOpen ? 'gap-1' : 'flex-col gap-2'}`}>

                        <button
                            onClick={toggleTheme}
                            title="Toggle Theme"
                            className="flex items-center text-[var(--text)] hover:bg-[var(--border)] rounded-full p-1.5 transition-colors cursor-pointer"
                        >
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        {isOpen && (
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                title="Settings"
                                className={`flex items-center text-[var(--text)] hover:bg-[var(--border)] rounded-full p-1.5 transition-colors cursor-pointer ${!isOpen && 'hidden'}`}
                            >
                                <Settings size={16} />
                            </button>
                        )}

                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            title="Logout"
                            className="flex items-center text-[var(--text)] hover:bg-[var(--border)] hover:text-red-500 rounded-full p-1.5 transition-colors cursor-pointer"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
            />

            {/* Custom Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
                    <div className="bg-[var(--background)] text-[var(--text)] border border-[var(--border)] rounded-xl w-full max-w-sm p-6 relative shadow-2xl">
                        <h2 className="text-xl font-semibold mb-2">Confirm Logout</h2>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="px-4 py-2 rounded-md hover:bg-[var(--sidebar)] transition-colors text-sm font-medium cursor-pointer border border-[var(--border)] text-[var(--text)]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsLogoutModalOpen(false);
                                    logout();
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </aside>
    );
};

export default Sidebar;                               