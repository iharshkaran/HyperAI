import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';
import { MessageEditInput } from './MessageEditInput';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface Message {
    id?: string;
    _id?: string;
    role: 'user' | 'model';
    content: string;
    editCount?: number;
}

interface MessageBubbleProps {
    msg: Message;
    onEditSubmit?: (messageId: string, newContent: string) => Promise<void>;
    isLastUserMessage?: boolean;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
    msg,
    onEditSubmit,
    isLastUserMessage = false
}) => {
    const isUser = msg.role === 'user';

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(msg.content);
    const [isSaving, setIsSaving] = useState(false);
    const [editCount, setEditCount] = useState(msg.editCount || 0);

    const messageId = msg._id || msg.id;

    const handleSaveEdit = async () => {
        if (!editText.trim() || !messageId || !onEditSubmit || editCount >= 3) return;

        try {
            setIsSaving(true);
            setIsEditing(false);
            setEditCount((prev) => prev + 1);

            await onEditSubmit(String(messageId), editText.trim());
        } catch (error) {
            console.error('Failed to submit edit:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditText(msg.content);
        setIsEditing(false);
    };

    return (
        <div
            className={`group flex items-start gap-3 max-w-3xl mx-auto w-full my-3 ${isUser ? 'flex-row-reverse' : ''
                }`}
        >
            <div
                className={`flex flex-col group w-full ${isUser ? 'items-end' : 'items-start'
                    }`}
            >
                <div
                    className={`relative transition-all duration-200 ${isEditing
                        ? 'w-full p-2 bg-(--card) border border-(--border) rounded-2xl shadow-sm'
                        : isUser
                            ? 'px-5 py-3 bg-(--card) text-(--text1) border border-(--border) rounded-3xl max-w-[85%] sm:max-w-[80%]'
                            : 'px-4 py-4 bg-transparent text-(--text1) w-full'
                        }`}
                >
                    {isEditing ? (
                        <MessageEditInput
                            editText={editText}
                            setEditText={setEditText}
                            isSaving={isSaving}
                            editCount={editCount}
                            onCancel={handleCancel}
                            onSave={handleSaveEdit}
                        />
                    ) : isUser ? (
                        <p className="whitespace-pre-wrap text-base wrap-break-word">{msg.content}</p>
                    ) : (
                        <MarkdownRenderer content={msg.content} />
                    )}
                </div>

                {!isEditing && (
                    <div
                        className={`h-6 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'mr-1' : 'ml-1'
                            }`}
                    >
                        <CopyButton text={msg.content} />

                        {isUser && isLastUserMessage && editCount < 3 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditText(msg.content);
                                    setIsEditing(true);
                                }}
                                title={`Edit Message (${3 - editCount} left)`}
                                className="p-1.5 hover:bg-(--box) rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                            >
                                <Pencil size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const MessageBubble = React.memo(
    MessageBubbleComponent,
    (prevProps, nextProps) => {
        return (
            prevProps.msg.content === nextProps.msg.content &&
            prevProps.isLastUserMessage === nextProps.isLastUserMessage &&
            (prevProps.msg.id || prevProps.msg._id) === (nextProps.msg.id || nextProps.msg._id)
        );
    }
);