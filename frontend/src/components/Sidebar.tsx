import { PanelLeft, PanelLeftOpen, PanelLeftClose, SquarePen, User, Settings, Trash2, LogOut } from 'lucide-react';
import { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Context se exact exported names destructure kar rahe hain
    const { chats, activeChatId, setActiveChatId, createNewChat, fetchChats, deleteChat } = useChat();
    const { user, logout } = useAuth();

    // App load hone par chats fetch karo
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
        return (<PanelLeft size={19} />)
    }

    const userName = user?.fullName?.firstName 
        ? `${user.fullName.firstName} ${user.fullName.lastName || ''}`.trim() 
        : user?.email || "User";

    return (
        <aside className={`flex flex-col justify-between bg-[#101010] border-r border-zinc-800 transition-all duration-300 ease-in-out ${isOpen ? 'w-65 p-3' : 'w-16 p-3 items-center'}`}>

            <div className='flex flex-col gap-5 mb-4.5'>
                <div className='flex justify-between items-center'>
                    {isOpen && <span className="font-medium cursor-pointer">HyperAI</span>}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="text-gray-300 hover:bg-gray-700/50 cursor-pointer rounded-full transition-colors p-2"
                        title="Toggle Sidebar"
                    >
                        {getToggleIcon()}
                    </button>
                </div>

                <button 
                    onClick={handleNewChat}
                    className={`flex gap-3 items-center w-full rounded-lg bg-black cursor-pointer ${isOpen ? 'px-3 py-2' : 'p-2'}`}
                >
                    <SquarePen size={18} />
                    {isOpen && <span className="text-sm font-medium">New chat</span>}
                </button>
            </div>

            <div id='recentChat' className="w-full space-y-2 h-full rounded-lg overflow-auto">
                {isOpen && (
                    <div className="mt-2 space-y-3">
                        <p className="px-3 text-sm font-semibold text-white">Recent</p>
                        <div className="space-y-1">
                            {chats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => handleSelectChat(chat._id)}
                                    className={`group flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg truncate cursor-pointer transition-colors ${
                                        activeChatId === chat._id 
                                            ? 'bg-gray-800 text-white font-medium' 
                                            : 'text-gray-300 hover:bg-gray-700/40'
                                    }`}
                                >
                                    <span className="truncate">{chat.title || "Untitled Chat"}</span>
                                    <button
                                        onClick={(e) => handleDeleteChat(e, chat._id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1 transition-opacity cursor-pointer"
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

            <div className='flex items-center justify-between w-full mt-3 transition-all duration-300 ease-in-out'>
                <div className={`flex items-center gap-3 ${isOpen ? '' : 'w-full justify-center'}`}>
                    <button
                        className={`flex items-center bg-blue-500 text-white rounded-full p-1.5 cursor-pointer ${isOpen ? '' : 'p-2'}`}
                    >
                        <User size={16} />
                    </button>

                    {isOpen && <span className='text-sm cursor-pointer truncate max-w-[120px]'>{userName}</span>}
                </div>

                {isOpen && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={logout}
                            title="Logout"
                            className="flex items-center text-gray-300 hover:bg-gray-700/40 hover:text-red-400 rounded-full p-1.5 transition-colors cursor-pointer"
                        >
                            <LogOut size={16} />
                        </button>
                        <button
                            className="flex items-center text-gray-300 hover:bg-gray-700/40 hover:text-white rounded-full p-1.5 transition-colors cursor-pointer"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                )}
            </div>

        </aside>
    );
};

export default Sidebar;