import { useEffect } from 'react';
import { socket } from '../services/socket.service';
import { type Chat, type Message } from '../types/chat.types';

interface UseChatSocketsProps {
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const useChatSockets = ({
    setChats,
    setActiveChatId,
    setMessages,
}: UseChatSocketsProps) => {
    useEffect(() => {

        // 1. Chat Created (With Duplicate Prevention)
        const handleChatCreated = (data: { chatId: string; title: string; chat?: Chat }) => {
            const createdChat: Chat = data.chat || {
                _id: data.chatId,
                title: data.title,
                updatedAt: new Date().toISOString(),
            };

            setChats((prev) => {
                const exists = prev.some((c) => c._id === createdChat._id);
                if (exists) return prev; // Avoid duplicate chat entry
                return [createdChat, ...prev];
            });

            setActiveChatId(createdChat._id);
        };

        // 2. Dynamic Title Update
        const handleChatUpdated = (data: { chatId: string; title: string }) => {
            setChats((prev) =>
                prev.map((c) => (c._id === data.chatId ? { ...c, title: data.title } : c))
            );
        };

        // 3. EDIT MESSAGE HANDLER
        const handleMessageUpdated = (data: {
            messageId: string;
            chatId: string;
            newContent?: string;
            content?: string;
        }) => {
            const updatedText = data.newContent || data.content;

            setMessages((prev) => {
                const editIndex = prev.findIndex(
                    (m) => String(m._id || m.id) === String(data.messageId)
                );

                console.log("✏️ Socket 'message-updated' received for index:", editIndex);

                if (editIndex === -1) return prev;

                // Truncate list up to the edited user prompt
                const updatedList = prev.slice(0, editIndex + 1);

                // Update User prompt content
                updatedList[editIndex] = {
                    ...updatedList[editIndex],
                    content: updatedText || updatedList[editIndex].content,
                };

                // Push temporary empty AI message placeholder to capture streaming chunks
                updatedList.push({
                    id: `ai-temp-${Date.now()}`,
                    role: 'model',
                    content: '',
                });

                return updatedList;
            });
        };

        // 4. AI STREAM RESPONSE CHUNK HANDLER
        const handleChunk = (data: { chat: string; chunk: string }) => {
            setMessages((prev) => {
                if (prev.length === 0) return prev;

                const updated = [...prev];
                const lastIndex = updated.length - 1;

                // Append chunk only if the last message is from the model
                if (updated[lastIndex].role === 'model') {
                    updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: updated[lastIndex].content + data.chunk,
                    };
                }
                return updated;
            });
        };

        // Register listeners
        socket.on('chat-created', handleChatCreated);
        socket.on('chat-updated', handleChatUpdated);
        socket.on('message-updated', handleMessageUpdated);
        socket.on('ai-response-chunk', handleChunk);

        return () => {
            socket.off('chat-created', handleChatCreated);
            socket.off('chat-updated', handleChatUpdated);
            socket.off('message-updated', handleMessageUpdated);
            socket.off('ai-response-chunk', handleChunk);
        };
    }, [setChats, setActiveChatId, setMessages]);
};