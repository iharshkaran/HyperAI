import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { getRelevantMemory, saveMessageMemory } from "../services/memory.service.js";
import { buildChatContext } from "../services/prompt.service.js";
import { generateTextStream } from "../services/ai.service.js";



// Helper Function: Streaming Chunk Extract
function extractChunkText(chunk) {
    if (typeof chunk.text === "function") return chunk.text();
    if (typeof chunk.text === "string") return chunk.text;
    return "";
}


// ---- HANDLE NEW AI MESSAGE ----
export async function handleAiMessage(socket, messagePayload) {
    let { chat: chatId, content } = messagePayload || {};
    const userId = socket.user?._id;

    try {
        // 1. Payload Validation
        if (!content || !content.trim()) {
            return socket.emit("ai-error", { message: "Message content cannot be empty." });
        }

        const trimmedContent = content.trim();
        let isNewChatCreated = false;

        // 2. Lazy Chat Creation
        if (!chatId) {
            const autoTitle = trimmedContent.length > 30
                ? trimmedContent.substring(0, 30) + '...'
                : trimmedContent;

            const newChat = await Chat.create({
                user: userId,
                title: autoTitle
            });

            chatId = newChat._id;
            isNewChatCreated = true;

            socket.emit("chat-created", {
                chatId: newChat._id,
                title: newChat.title,
                chat: newChat
            });
        } else {
            const existingChat = await Chat.findOne({ _id: chatId, user: userId });
            if (!existingChat) {
                return socket.emit("ai-error", { message: "Chat not found or access denied." });
            }
        }

        // 3. Save User Message
        const userMsg = await Message.create({
            chat: chatId,
            user: userId,
            content: trimmedContent,
            role: "user"
        });

        // 4. Title Update for Existing Chats
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

        // 5. Memory & Context Pipeline
        const { vectors, memory } = await getRelevantMemory(userId, trimmedContent);
        await saveMessageMemory({
            vectors,
            messageId: userMsg._id,
            chatId,
            userId,
            text: trimmedContent
        });

        const fullPrompt = await buildChatContext(chatId, memory);

        // 6. Generate AI Response Stream
        const streamResult = await generateTextStream(fullPrompt);
        let fullResponse = "";

        for await (const chunk of streamResult) {
            const chunkText = extractChunkText(chunk);
            if (!chunkText) continue;

            fullResponse += chunkText;

            socket.emit("ai-response-chunk", {
                chat: chatId,
                chunk: chunkText
            });
        }

        // 7. Save AI Response & Notify End
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

        socket.emit("ai-response-end", { chat: chatId });

    } catch (err) {
        console.error("Error in handleAiMessage:", err);
        socket.emit("ai-error", { message: "Failed to generate AI response." });
    }
}