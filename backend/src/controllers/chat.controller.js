import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { deleteMemory } from "../services/vector.service.js";

// Create Chat
async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await Chat.create({
    user: user._id,
    title: title
  });

  res.status(201).json({
    message: "chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity
    }
  });
}

// Get Chats
async function getUserChats(req, res) {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });

    res.status(200).json({
      message: "Chats fetched successfully",
      chats
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
}

// Get Messages
async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params; // Chat Id

    const messages = await Message.find({ chat: chatId, user: req.user._id }).sort({ createdAt: 1 });
    
    res.status(200).json({
      message: "Messages fetched successfully",
      messages
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
}

// Delele Chat
async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;

    await Chat.findOneAndDelete({ _id: chatId, user: req.user._id });

    await Message.deleteMany({ chat: chatId, user: req.user._id });

    await deleteMemory(chatId);

    return res.status(200).json({ message: "Chat deleted successfully" });
    
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete chat" });
  }
}

export default {
  createChat,
  getUserChats,
  getChatMessages,
  deleteChat
};