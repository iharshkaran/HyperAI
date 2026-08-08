import React, { useState } from 'react';
import { PanelLeft, PanelLeftOpen, PanelLeftClose, SquarePen, Loader2, X } from 'lucide-react';

interface SidebarHeaderProps {
    isOpen: boolean;
    onToggle: () => void;
    onNewChat: () => void;
    isCreating?: boolean;
    onMobileClose?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    isOpen,
    onToggle,
    onNewChat,
    isCreating = false,
    onMobileClose,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // 🟢 Fix: New Chat handle karne ke sath-sath mobile sidebar close karna
    const handleNewChatClick = () => {
        onNewChat();
        if (onMobileClose) {
            onMobileClose(); // Mobile par click hone par sidebar automatic close ho jayega
        }
    };

    const getToggleIcon = () => {
        if (isHovered) {
            return isOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />;
        }
        return !isOpen ? (
            <>
                <img
                    src="/HyperAILight.png"
                    alt="Logo"
                    className="w-4.5 object-contain hidden dark:block"
                    onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                    }}
                />
                <img
                    src="/HyperAIDark.png"
                    alt="Logo"
                    className="w-4.5 object-contain block dark:hidden"
                    onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                    }}
                />
            </>
        ) : (
            <PanelLeft size={19} />
        );
    };

    return (
        <div className="flex flex-col gap-4 mb-2">
            {/* Brand Title & Close/Toggle Control */}
            <div className="flex justify-between items-center h-8 w-full">
                {isOpen && (
                    <span className="font-semibold text-base tracking-tight text-(--text) mt-2">
                        HyperAI
                    </span>
                )}

                {/* Mobile Close Button (Only on Mobile) */}
                {onMobileClose && (
                    <button
                        onClick={onMobileClose}
                        className="md:hidden text-(--text) hover:bg-(--border) cursor-pointer rounded-lg p-1.5 transition-colors"
                        title="Close Menu"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Desktop Toggle Button (Only on Desktop) */}
                <button
                    onClick={onToggle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="hidden md:block text-(--text) hover:bg-(--border) cursor-pointer rounded-full transition-colors p-2"
                    title="Toggle Sidebar"
                >
                    {getToggleIcon()}
                </button>
            </div>

            {/* New Chat Button */}
            <button
                onClick={handleNewChatClick}
                disabled={isCreating}
                className={`flex gap-3 items-center w-full rounded-lg cursor-pointer text-(--text) transition-colors ${isCreating ? 'opacity-50 cursor-not-allowed' : ''
                    } ${isOpen
                        ? 'px-3 py-2 bg-(--card) hover:bg-(--border)'
                        : 'p-2 hover:bg-(--card) justify-center'
                    }`}
            >
                {isCreating ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <SquarePen size={18} />
                )}
                {isOpen && (
                    <span className="text-sm font-medium">
                        {isCreating ? "Creating..." : "New chat"}
                    </span>
                )}
            </button>
        </div>
    );
};

export default SidebarHeader;