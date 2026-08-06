import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { getRelevantMemory, saveMessageMemory } from "../services/memory.service.js";
import { buildChatContext } from "../services/prompt.service.js";
import { generateTextStream } from "../services/ai.service.js";

export async function handleAiMessage(socket, messagePayload) {
    let { chat: chatId, content } = messagePayload || {};
    const userId = socket.user?._id;

    try {
        // Payload Validation
        if (!content || !content.trim()) {
            return socket.emit("ai-error", { message: "Message content cannot be empty." });
        }

        const trimmedContent = content.trim();
        let isNewChatCreated = false;

        // ---- LAZY CHAT CREATION LOGIC ----
        if (!chatId) {
            // Auto-generate title from first user message
            const autoTitle = trimmedContent.length > 30
                ? trimmedContent.substring(0, 30) + '...'
                : trimmedContent;

            const newChat = await Chat.create({
                user: userId,
                title: autoTitle
            });

            chatId = newChat._id;
            isNewChatCreated = true;

            // Notify client about new chat creation
            socket.emit("chat-created", {
                chatId: newChat._id,
                title: newChat.title,
                chat: newChat
            });
        } else {
            // Agar existing chatId bheja hai toh Ownership Check karo
            const existingChat = await Chat.findOne({ _id: chatId, user: userId });
            if (!existingChat) {
                return socket.emit("ai-error", { message: "Chat not found or access denied." });
            }
        }

        // Save User Message
        const userMsg = await Message.create({
            chat: chatId,
            user: userId,
            content: trimmedContent,
            role: "user"
        });

        // Update Title for Existing Chats (Only on First User Message if not lazy created)
        if (!isNewChatCreated) {
            const userMessageCount = await Message.countDocuments({
                chat: chatId,
                role: "user"
            });

            if (userMessageCount === 1) {
                const newTitle = trimmedContent.length > 30
                    ? trimmedContent.substring(0, 30) + '...'
                    : trimmedContent;

                await Chat.findByIdAndUpdate(chatId, { title: newTitle });

                socket.emit("chat-updated", {
                    chatId: chatId,
                    title: newTitle
                });
            }
        }

        // Memory & Context Pipeline
        const { vectors, memory } = await getRelevantMemory(userId, trimmedContent);
        await saveMessageMemory({
            vectors,
            messageId: userMsg._id,
            chatId,
            userId,
            text: trimmedContent
        });

        // Build Prompt Context (LTM + STM)
        const fullPrompt = await buildChatContext(chatId, memory);

        // Generate AI Response Stream
        const streamResult = await generateTextStream(fullPrompt);
        let fullResponse = "";

        for await (const chunk of streamResult) {
            let chunkText = "";

            if (typeof chunk.text === "function") {
                chunkText = chunk.text();
            } else if (typeof chunk.text === "string") {
                chunkText = chunk.text;
            }

            if (!chunkText) continue;

            fullResponse += chunkText;

            socket.emit("ai-response-chunk", {
                chat: chatId,
                chunk: chunkText
            });
        }

        // Save AI Response to Database & Memory
        const aiMsg = await Message.create({
            chat: chatId,
            user: userId,
            content: fullResponse,
            role: "model"
        });

        await saveMessageMemory({
            vectors: null,
            messageId: aiMsg._id,
            chatId,
            userId,
            text: fullResponse
        });

        // Notify Stream End
        socket.emit("ai-response-end", { chat: chatId });

    } catch (err) {
        console.error("Error in handleAiMessage:", err);
        socket.emit("ai-error", { message: "Failed to generate AI response." });
    }
}