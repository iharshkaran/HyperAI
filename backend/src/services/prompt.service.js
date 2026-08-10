import Message from "../models/message.model.js";

export async function buildChatContext(chatId, memory) {

    const messageHistory = await Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    messageHistory.reverse();

    const stm = messageHistory.map((item) => ({
        role: item.role,
        parts: [{ text: item.content }]
    }));

    const memoryText = memory.map((item) => item.metadata?.text).filter(Boolean).join("\n---\n");

    const ltm = memoryText
        ? [
            {
                role: "user",
                parts: [{
                    text: `[System note: The following are a few loosely-related snippets pulled from the user's other past conversations, based on keyword/semantic similarity. They may or may not be fully relevant or complete — treat them as hints, not confirmed facts. If they seem relevant to the current question, use them; if unsure or if they seem incomplete/contradictory, prioritize the current conversation and ask the user to clarify instead of guessing.]\n\n${memoryText}`
                }]
            }
        ]
        : [];

    return [...ltm, ...stm];
}