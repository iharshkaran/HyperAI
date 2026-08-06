import { createMemory, queryMemory } from "./vector.service.js";
import { generateVector } from "./ai.service.js";

// SMART FILTERING
function isWorthRemembering(text) {
  if (!text || typeof text !== "string") return false;

  const trimmed = text.trim();
  
  // If text is too short, ignore it
  if (trimmed.length < 8) return false;

  // Generic small-talk
  const noiseRegex = /^(hi|hello|hey|ok|okay|thanks|thank you|bye|good morning|good night|k|cool|nice|sahi hai|haa|ha)\b/i;
  if (noiseRegex.test(trimmed) && trimmed.length < 25) {
    return false;
  }

  return true;
}


// HELPER: It helps format memory items into a string suitable for prompt injection
export function formatMemoryForPrompt(memoryList) {
  if (!memoryList || !Array.isArray(memoryList) || memoryList.length === 0) {
    return "";
  }

  const uniqueTexts = [
    ...new Set(
      memoryList
        .map((item) => item.metadata?.text || item.text)
        .filter(Boolean)
    ),
  ];

  if (uniqueTexts.length === 0) return "";

  return `\n[RELEVANT USER HISTORY / LONG-TERM MEMORY]:\n${uniqueTexts
    .map((t) => `- ${t}`)
    .join("\n")}\n`;
}


// Get Relevant Memory (RAG)
export async function getRelevantMemory(text, userId) {
  try {
    const searchText = typeof text === "string" ? text : String(text || "");
    const trimmedQuery = searchText.trim();

    // Escape early if query is too short or meaningless
    if (!trimmedQuery || trimmedQuery.length < 3) {
      return { vectors: [], memory: [], formattedContext: "" };
    }

    const vectors = await generateVector(trimmedQuery);
    if (!vectors || vectors.length === 0) {
      return { vectors: [], memory: [], formattedContext: "" };
    }

    // Vector DB lookup
    const memory = await queryMemory({
      queryVector: vectors,
      limit: 3,
      metadata: {
        user: { $eq: userId.toString() }, // Safe Mongo ObjectId string conversion
      },
    });

    // Smart auto-formatting for Prompt
    const formattedContext = formatMemoryForPrompt(memory);

    return { vectors, memory, formattedContext };
  } catch (err) {
    console.error("Memory retrieval error:", err);
    return { vectors: [], memory: [], formattedContext: "" };
  }
}


// Save Message Memory
export async function saveMessageMemory({ vectors, messageId, chatId, userId, text }) {
  try {
    // Filtering: Only save meaningful messages to memory
    if (!isWorthRemembering(text)) {
      return;
    }

    let textVector = vectors;
    if (!textVector || textVector.length === 0) {
      textVector = await generateVector(text);
    }

    if (!textVector || textVector.length === 0) return;

    await createMemory({
      vectors: textVector,
      messageId: messageId.toString(),
      metadata: {
        chat: chatId.toString(),
        user: userId.toString(),
        text: text.trim(),
      },
    });
  } catch (err) {
    console.error("Save memory error:", err);
  }
}