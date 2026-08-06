import Message from "../models/message.model.js";

export async function buildChatContext(chatId, memory = []) {
    try {
        // Short-Term Memory (STM)
        let stm = [];
        if (chatId) {
            const messageHistory = await Message.find({ chat: chatId })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            // Oldest first chronological order
            messageHistory.reverse();

            stm = messageHistory.map((item) => ({
                role: item.role === "model" ? "model" : "user", // Strict role check
                parts: [{ text: item.content }],
            }));
        }

        // Long-Term Memory (LTM)
        const memoryText = memory
            .map((item) => item.metadata?.text || item.text)
            .filter(Boolean)
            .join("\n- ");

        const ltm = [];


        if (memoryText.trim().length > 0) {
            ltm.push({
                role: "user",
                parts: [
                    {
                        text: `[SYSTEM CONTEXT - RELEVANT LONG-TERM MEMORIES]:\n- ${memoryText}\n\n(Use these facts about the user if relevant to the conversation)`,
                    },
                ],
            });

            // Model acknowledgement to prime conversation flow
            ltm.push({
                role: "model",
                parts: [{ text: "Understood. I have loaded the relevant user memory context." }],
            });
        }

        return [...ltm, ...stm];

    } catch (error) {
        console.error("Error in buildChatContext:", error);
        return [];
    }
}