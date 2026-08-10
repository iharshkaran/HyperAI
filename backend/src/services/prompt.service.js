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
    console.log("🧠 RETRIEVED MEMORY FOR THIS CHAT:\n", memoryText);

    // LTM ko alag se banane ke bajaye, seedha STM ke latest user message mein inject karo
    if (memoryText && stm.length > 0) {
        for (let i = stm.length - 1; i >= 0; i--) {
            if (stm[i].role === 'user') {
                stm[i].parts[0].text = `<past_memory>\n${memoryText}\n</past_memory>\n\n${stm[i].parts[0].text}`;
                break; // Ek baar latest user message mein add ho gaya, toh loop break kar do
            }
        }
    }

    // Sirf stm return karo, Gemini API khush rahega
    return stm;
}