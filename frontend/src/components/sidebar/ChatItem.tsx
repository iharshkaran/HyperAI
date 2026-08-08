import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface Chat {
    _id: string;
    title?: string;
}

interface ChatItemProps {
    chat: Chat;
    isActive: boolean;
    onSelect: (chatId: string) => void;
    onDelete: (e: React.MouseEvent, chatId: string) => Promise<void> | void;
}

const ChatItemComponent: React.FC<ChatItemProps> = ({
    chat,
    isActive,
    onSelect,
    onDelete,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDeleting) return;

        try {
            setIsDeleting(true);
            await onDelete(e, chat._id);
        } catch (error) {
            console.error("Delete failed:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div
            onClick={() => !isDeleting && onSelect(chat._id)}

            /* Smooth transition-all*/
            className={`group flex items-center justify-between w-full px-3 py-1 text-sm rounded-lg cursor-pointer transition-all duration-200 ${isActive
                ? 'bg-(--border) text-(--text) font-medium'
                : 'text-(--text) hover:bg-(--card)'
                } ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
        >
            <span className="truncate flex-1 pr-2">
                {chat.title || "Untitled Chat"}
            </span>

            {/* Delete Button */}
            <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-1 rounded transition-opacity duration-200 cursor-pointer ${isDeleting
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 hover:bg-(--box)'
                    }`}
                title="Delete Chat"
            >
                {isDeleting ? (
                    <Loader2 size={14} className="animate-spin text-red-500" />
                ) : (
                    <Trash2 size={14} />
                )}
            </button>
        </div>
    );
};


// Custom Memo for ChatItem to prevent unnecessary re-renders
export const ChatItem = React.memo(ChatItemComponent, (prevProps, nextProps) => {
    return (
        prevProps.isActive === nextProps.isActive &&
        prevProps.chat._id === nextProps.chat._id &&
        prevProps.chat.title === nextProps.chat.title
    );
});

export default ChatItem;