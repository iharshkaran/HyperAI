import { createMemory, queryMemory } from "./vector.service.js";
import { generateVector } from "./ai.service.js";


// Get Memory

export async function getRelevantMemory(text, userId) {
    try {
        const searchText = typeof text === 'string' ? text : String(text || '');
        if (!searchText.trim()) return { vectors: [], memory: [] };

        const vectors = await generateVector(searchText);
        if (!vectors || vectors.length === 0) return { vectors: [], memory: [] };

        const memory = await queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: {
                user: { $eq: userId.toString() }   // 👈 yahan .toString() add karo
            }
        });

        return { vectors, memory }

    } catch (err) {
        console.error("Memory retrieval error:", err);
        return { vectors: [], memory: [] };
    }
}


// Save Memory

export async function saveMessageMemory({ vectors, messageId, chatId, userId, text }) {
    try {

        let textVector = vectors;
        if (!textVector || textVector.length === 0) {
            textVector = await generateVector(text);
        }

        await createMemory({
            vectors: textVector,
            messageId,
            metadata: {
                chat: chatId,
                user: userId,
                text
            }
        });
    } catch (err) {
        console.error("Save memory error:", err);
    }
}