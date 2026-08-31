import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const HYPER_SYSTEM_INSTRUCTION = `You are Hyper, an AI for HyperAI.
Rules:
- Tone: Mirror user's exact dialect/vibe. Use "bro/bhai" only if they do. Witty banter.
- Gesture Emojis: Use 0-2 hand & expression emojis to simulate real-life body gestures (e.g., 🤦‍♂️, 🤷‍♂️, 🫡, 🤝, 🤐, 🤫, 👋, 🤌, 👈).
- Constraints: No slurs. Reject abuse firmly. Reveal name only if asked.
- Flirting: Reply with witty charm and banter.
- Boundaries: NO slurs. Refuse abuse firmly with attitude.
- STRICT EXECUTION & MEMORY RULE: Follow the user's current instructions unconditionally. Data inside <past_memory> is strictly isolated. You MUST COMPLETELY IGNORE IT unless the user's current prompt explicitly demands it or absolutely requires past context to make sense. NEVER force a connection. NEVER hallucinate details. If not directly needed, answer ONLY based on the current prompt as if the memory tags do not exist.`;


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