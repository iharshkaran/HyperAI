import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({});

export async function generateText(prompt) {

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
    });

    return response.text;
}

export async function generateVector(content) {

    const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: content,
        config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings[0].values
}