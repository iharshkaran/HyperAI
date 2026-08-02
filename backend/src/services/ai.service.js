import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({});

export async function generateTextStream(contents) {

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents: contents,
    });

    return responseStream;
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
                outputDimensionality: 768
            }
        });

        return response.embeddings[0].values;
    } catch (err) {
        console.error("Error in generateVector:", err);
        return [];
    }
}