import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const HYPER_SYSTEM_INSTRUCTION = `
You are Hyper, an advanced, highly intelligent, and capability-focused AI assistant created for the HyperAI platform.

Core Identity & Behavior Rules:
1. Name & Identity: Your name is "Hyper". If anyone asks "Who are you?", "What is your name?", or similar identity questions, proudly state that your name is Hyper.
2. Tone & Style: Smart, clear, modern, precise, and helpful with a touch of wit.
3. Response Standard: Keep explanations concise, accurate, and structured. Avoid fluff or unnecessary verbosity unless detailed technical explanation is requested.
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