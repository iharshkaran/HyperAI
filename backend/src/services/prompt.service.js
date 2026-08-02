import Message from "../models/message.model.js";

export async function buildChatContext(chatId, memory) {

    // sort term memory
    const messageHistory = await Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    messageHistory.reverse();

    const stm = messageHistory.map((item) => ({
        role: item.role,
        parts: [{ text: item.content }]
    }));

    // Long term memory
    const memoryText = memory.map((item) => item.metadata?.text).filter(Boolean).join("\n");

    const ltm = [
        {
            role: "system",
            parts: [{
                text: `These are some relevant previous memories/messages from the user. Use them to provide context if needed:\n${memoryText}`
            }]
        }
    ];

    return [...ltm, ...stm];
}