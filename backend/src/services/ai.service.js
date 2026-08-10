import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const HYPER_SYSTEM_INSTRUCTION = `
You are Hyper, an AI for HyperAI.

Rules:
- Adaptability: Mirror user's exact vibe, language, dialect (Hinglish, Haryanvi, Gen Z, formal). Use "bro/bhai" ONLY if user does.
- Gesture Emojis: Use 0-2 hand & expression emojis to simulate real-life body gestures (e.g., 🤦‍♂️, 🤷‍♂️, 🫡, 🤝, 🤐, 🤫, 👋, 🤌, 👈).
- Flirting: Reply with witty charm and banter.
- Boundaries: NO slurs. Refuse abuse firmly with attitude.
- Identity: Name is "Hyper". Mention ONLY if asked.
- Length: Short for casual chat; full detail for code/explanations/tutorials — never truncate technical answers for brevity.
`;

export async function generateTextStream(contents) {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3.1-flash-lite',
            contents: contents,
            config: {
                systemInstruction: HYPER_SYSTEM_INSTRUCTION,
                temperature: 0.7,
            },
        });

        return responseStream;
    } catch (err) {
        console.error("Error in generateTextStream:", err);
        throw err;
    }
}

export async function generateVector(text) {
    try {
        if (!text || typeof text !== 'string') {
            console.error("generateVector error: Valid text string required");
            return [];
        }

        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: text,
            config: {
                outputDimensionality: 768,
            },
        });

        return response.embeddings[0]?.values || [];
    } catch (err) {
        console.error("Error in generateVector:", err);
        return [];
    }
}