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
    let { chat: chatId, content, messageId, clientId } = messagePayload || {};
    const userId = socket.user?._id;

    try {
        if (!content || !content.trim()) {
            return socket.emit("ai-error", { message: "Message content cannot be empty." });
        }

        const trimmedContent = content.trim();
        let isNewChatCreated = false;
        let userMsg;

        if (messageId) {
            // ---- EDIT FLOW ----
            const existingMsg = await Message.findOne({ _id: messageId, chat: chatId, user: userId });

            if (!existingMsg) {
                return socket.emit("ai-error", { message: "Message not found or access denied." });
            }

            existingMsg.content = trimmedContent;
            existingMsg.editCount = (existingMsg.editCount || 0) + 1;
            await existingMsg.save();
            userMsg = existingMsg;

            await Message.deleteMany({
                chat: chatId,
                createdAt: { $gt: existingMsg.createdAt },
            });

            socket.emit("message-updated", {
                messageId: existingMsg._id,
                chatId,
                newContent: trimmedContent,
                editCount: existingMsg.editCount,
            });

        } else {
            // ---- NEW MESSAGE FLOW ----
            if (!chatId) {
                const autoTitle = trimmedContent.length > 30
                    ? trimmedContent.substring(0, 30) + '...'
                    : trimmedContent;
                const newChat = await Chat.create({ user: userId, title: autoTitle });
                chatId = newChat._id;
                isNewChatCreated = true;
                socket.emit("chat-created", { chatId: newChat._id, title: newChat.title, chat: newChat });
            } else {
                const existingChat = await Chat.findOne({ _id: chatId, user: userId });
                if (!existingChat) {
                    return socket.emit("ai-error", { message: "Chat not found or access denied." });
                }
            }

            userMsg = await Message.create({
                chat: chatId,
                user: userId,
                content: trimmedContent,
                role: "user"
            });

            socket.emit("user-message-saved", {
                clientId,
                messageId: userMsg._id,
                chatId,
            });

            if (!isNewChatCreated) {
                const userMessageCount = await Message.countDocuments({ chat: chatId, role: "user" });
                if (userMessageCount === 1) {
                    const newTitle = trimmedContent.length > 30
                        ? trimmedContent.substring(0, 30) + '...'
                        : trimmedContent;
                    await Chat.findByIdAndUpdate(chatId, { title: newTitle });
                    socket.emit("chat-updated", { chatId, title: newTitle });
                }
            }
        }

        // 🟢 FIX: parameter order (text, userId) — pehle userId, trimmedContent ulta tha
        const { vectors, memory } = await getRelevantMemory(trimmedContent, userId);
        await saveMessageMemory({ vectors, messageId: userMsg._id, chatId, userId, text: trimmedContent });

        const fullPrompt = await buildChatContext(chatId, memory);
        const streamResult = await generateTextStream(fullPrompt);
        let fullResponse = "";

        for await (const chunk of streamResult) {
            const chunkText = extractChunkText(chunk);
            if (!chunkText) continue;
            fullResponse += chunkText;
            socket.emit("ai-response-chunk", { chat: chatId, chunk: chunkText });
        }

        const aiMsg = await Message.create({ chat: chatId, user: userId, content: fullResponse, role: "model" });
        await saveMessageMemory({ vectors: null, messageId: aiMsg._id, chatId, userId, text: fullResponse });

        socket.emit("ai-response-end", { chat: chatId });

    } catch (err) {
        console.error("Error in handleAiMessage:", err);
        socket.emit("ai-error", { message: "Failed to generate AI response." });
    }
}