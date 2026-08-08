import React, { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface MessageEditInputProps {
    editText: string;
    setEditText: (value: string) => void;
    isSaving: boolean;
    editCount: number;
    onCancel: () => void;
    onSave: () => void;
}

export const MessageEditInput: React.FC<MessageEditInputProps> = ({
    editText,
    setEditText,
    isSaving,
    editCount,
    onCancel,
    onSave,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [editText]);

    return (
        <div className="flex flex-col gap-3 w-full">
            <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3.5 bg-(--box) text-(--text1) border border-(--border) rounded-xl text-base focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 resize-none min-h-22.5 leading-relaxed transition-all scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                rows={2}
                disabled={isSaving}
                placeholder="Edit your message..."
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Edits: {editCount}/3
                </span>

                <div className="flex items-center gap-2.5 ml-auto">
                    {/* Cancel Button*/}
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <X size={14} /> Cancel
                    </button>

                    {/* Save Button */}
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving || !editText.trim()}
                        className="px-4 py-1.5 text-xs bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-lg transition-all shadow-xs disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                        <Check size={14} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
};