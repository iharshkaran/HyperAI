import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { deleteMemory } from "../services/vector.service.js";
import { getRelevantMemory, saveMessageMemory } from "../services/memory.service.js";
import { buildChatContext } from "../services/prompt.service.js";
import { generateTextStream } from "../services/ai.service.js";



// Helper: Stream Chunk Extraction
function extractChunkText(chunk) {
    if (typeof chunk.text === "function") return chunk.text();
    if (typeof chunk.text === "string") return chunk.text;
    return "";
}


// Create Chat
export async function createChat(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    const chatTitle = title?.trim() || "New Chat";

    const chat = await Chat.create({
      user: userId,
      title: chatTitle,
    });

    return res.status(201).json({
      message: "Chat created successfully",
      chat: {
        _id: chat._id,
        title: chat.title,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (err) {
    console.error("Create Chat Error:", err);
    return res.status(500).json({ message: "Failed to create chat" });
  }
}


// Get User Chats (Sidebar)
export async function getUserChats(req, res) {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt createdAt");

    return res.status(200).json({
      message: "Chats fetched successfully",
      chats,
    });
  } catch (err) {
    console.error("Get User Chats Error:", err);
    return res.status(500).json({ message: "Failed to fetch chats" });
  }
}


// Get Chat Messages
export async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found or access denied" });
    }

    const messages = await Message.find({ chat: chatId, user: req.user._id }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      message: "Messages fetched successfully",
      messages,
    });
  } catch (err) {
    console.error("Get Chat Messages Error:", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
}


// Delete Chat
export async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;

    const deletedChat = await Chat.findOneAndDelete({
      _id: chatId,
      user: req.user._id,
    });

    if (!deletedChat) {
      return res.status(404).json({ message: "Chat not found or access denied" });
    }

    await Message.deleteMany({ chat: chatId, user: req.user._id });

    if (typeof deleteMemory === "function") {
      await deleteMemory(chatId);
    }

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Delete Chat Error:", err);
    return res.status(500).json({ message: "Failed to delete chat" });
  }
}


// Edit Message & Stream AI Response
export async function editAndStreamResponse(req, res) {
    try {
        const { messageId, newContent } = req.body;
        const userId = req.user._id;

        if (!messageId || !newContent || !newContent.trim()) {
            return res.status(400).json({ message: "Message ID and content are required." });
        }

        const trimmedContent = newContent.trim();

        // 1. Target Message Verification
        const targetMessage = await Message.findById(messageId);
        if (!targetMessage || targetMessage.role !== "user") {
            return res.status(404).json({ message: "User message not found." });
        }

        const chatId = targetMessage.chat;

        // 2. Ownership Check
        const chatExists = await Chat.findOne({ _id: chatId, user: userId });
        if (!chatExists) {
            return res.status(403).json({ message: "Access denied." });
        }

        // 3. RULE 1 CHECK: Ensure this is the LAST USER MESSAGE in the chat
        const lastUserMessage = await Message.findOne({ chat: chatId, role: "user" })
            .sort({ createdAt: -1 });

        if (!lastUserMessage || lastUserMessage._id.toString() !== targetMessage._id.toString()) {
            return res.status(400).json({ message: "Only the latest user message can be edited." });
        }

        // 4. RULE 2 CHECK: Max 3 Edits Limit
        const currentEditCount = targetMessage.editCount || 0;
        if (currentEditCount >= 3) {
            return res.status(400).json({ message: "Maximum edit limit reached for this message (3/3)." });
        }

        // 5. Update User Message & Increment Edit Count in DB
        targetMessage.content = trimmedContent;
        targetMessage.editCount = currentEditCount + 1;
        await targetMessage.save();

        // 6. Delete subsequent AI messages created after this message
        await Message.deleteMany({
            chat: chatId,
            createdAt: { $gt: targetMessage.createdAt },
        });

        // 7. Memory Pipeline
        const { vectors, memory } = await getRelevantMemory(userId, trimmedContent);
        await saveMessageMemory({
            vectors,
            messageId: targetMessage._id,
            chatId,
            userId,
            text: trimmedContent,
        });

        // 8. Set HTTP Headers for Streaming Response
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");

        // 9. Context & Gemini AI Stream
        const fullPrompt = await buildChatContext(chatId, memory);
        const streamResult = await generateTextStream(fullPrompt);
        let fullResponse = "";

        for await (const chunk of streamResult) {
            const chunkText = extractChunkText(chunk);
            if (!chunkText) continue;

            fullResponse += chunkText;
            res.write(chunkText);
        }

        // 10. Save AI Response to Database
        const aiMsg = await Message.create({
            chat: chatId,
            user: userId,
            content: fullResponse,
            role: "model",
        });

        await saveMessageMemory({
            vectors: null,
            messageId: aiMsg._id,
            chatId,
            userId,
            text: fullResponse,
        });

        await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });

        res.end();

    } catch (error) {
        console.error("Error in editAndStreamResponse:", error);
        if (!res.headersSent) {
            return res.status(500).json({ message: "Failed to process edit request." });
        }
        res.end();
    }
}


export default {
  createChat,
  getUserChats,
  getChatMessages,
  deleteChat,
  editAndStreamResponse
};