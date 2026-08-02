import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { getRelevantMemory, saveMessageMemory } from "../services/memory.service.js";
import { buildChatContext } from "../services/prompt.service.js";
import { generateTextStream } from "../services/ai.service.js";


export async function handleAiMessage(socket, messagePayload) {
    const { chat: chatId, content } = messagePayload;
    const userId = socket.user._id

    try {

        // Save User Message
        const userMsg = await Message.create({
            chat: chatId,
            user: userId,
            content: content,
            role: "user"
        });


        // Auto-title Check (Only on First User Message)
        const userMessageCount = await Message.countDocuments({
            chat: chatId,
            role: "user"
        });

        if (userMessageCount === 1) {
            const newTitle = content.length > 30
                ? content.substring(0, 30) + '...'
                : content;

            await Chat.findByIdAndUpdate(chatId, { title: newTitle });

            socket.emit("chat-updated", {
                chatId: chatId,
                title: newTitle
            });
        }


        // Vectors & Memory Lookup
        const { vectors, memory } = await getRelevantMemory(userId, content);
        await saveMessageMemory({ vectors, messageId: userMsg._id, chatId, userId, text: content });


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
        })

        // Notify stream end
        socket.emit("ai-response-end", { chat: chatId });

    } catch (err) {
        console.error("Error in handleAiMessage:", err);
        socket.emit("ai-error", { message: "Failed to generate AI response." });
    }
}