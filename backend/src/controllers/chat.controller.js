import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { deleteMemory } from "../services/vector.service.js";

// Create Chat
export async function createChat(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    // Fallback title logic
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

    // Verify Chat ownership first
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

    // Check if chat exists and belongs to user BEFORE deleting cascade data
    const deletedChat = await Chat.findOneAndDelete({
      _id: chatId,
      user: req.user._id,
    });

    if (!deletedChat) {
      return res.status(404).json({ message: "Chat not found or access denied" });
    }

    // Delete associated Messages in DB
    await Message.deleteMany({ chat: chatId, user: req.user._id });

    // Delete Vector Embeddings/Memory
    if (typeof deleteMemory === "function") {
      await deleteMemory(chatId);
    }

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Delete Chat Error:", err);
    return res.status(500).json({ message: "Failed to delete chat" });
  }
}


export default {
  createChat,
  getUserChats,
  getChatMessages,
  deleteChat,
};