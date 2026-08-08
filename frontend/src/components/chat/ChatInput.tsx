import React, { useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    onSendMessage: (e?: React.FormEvent) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    input,
    setInput,
    isLoading,
    onSendMessage,
    textareaRef,
}) => {

    useEffect(() => {
        if (!input && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [input, textareaRef]);

    return (

        <div className="p-2 pb-3 sm:p-3 sm:pb-5 bg-(--background) transition-all duration-300 ease-in">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSendMessage(e);
                }}
                // Form Textarea Container
                className="max-w-3xl mx-auto flex items-center gap-2 bg-(--box) border border-(--border) rounded-full sm:rounded-4xl pl-3.5 pr-2 py-2 sm:pl-5 sm:pr-2.5 sm:py-2.5 shadow-md focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all duration-200"
            >
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSendMessage(e);
                        }
                    }}
                    disabled={isLoading}
                    placeholder={isLoading ? 'HyperAI is thinking...' : 'Type a message...'}
                    rows={1}
                    /* line-height */
                    className="flex-1 bg-transparent text-sm sm:text-base text-(--text1) placeholder-zinc-500 focus:outline-none py-0.5 my-auto disabled:opacity-50 resize-none max-h-40 overflow-y-auto leading-snug break-all wrap-break-word scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                />

                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 sm:p-2.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-30 text-black rounded-full transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95 shadow-xs"
                >
                    {isLoading ? (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-black/80 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send size={14} className="sm:w-4 sm:h-4 translate-x-[0.5px]" />
                    )}
                </button>
            </form>
            <p className="hidden sm:flex justify-center mt-2.5 text-xs text-zinc-500 select-none">
                HyperAI can make mistakes. Check important info.
            </p>
        </div>
    );
};