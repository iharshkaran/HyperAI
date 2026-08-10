import { createMemory, queryMemory } from "./vector.service.js";
import { generateVector } from "./ai.service.js";


export async function getRelevantMemory(text, userId) {
    try {
        const searchText = typeof text === 'string' ? text : String(text || '');
        if (!searchText.trim()) return { vectors: [], memory: [] };

        if (searchText.trim().length < 15) {
            const vectors = await generateVector(searchText);
            return { vectors, memory: [] };
        }

        const vectors = await generateVector(searchText);
        if (!vectors || vectors.length === 0) return { vectors: [], memory: [] };

        const rawMemory = await queryMemory({
            queryVector: vectors,
            limit: 5,
            metadata: {
                user: { $eq: userId }
            }
        });

        const RELEVANCE_THRESHOLD = 0.55; // 👈 calibrated Hinglish embeddings ke hisaab se
        const memory = (rawMemory || []).filter((item) => (item.score ?? 0) >= RELEVANCE_THRESHOLD);

        return { vectors, memory }

    } catch (err) {
        console.error("Memory retrieval error:", err);
        return { vectors: [], memory: [] };
    }
}


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