import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { generateText, generateVector } from "../services/ai.service.js";
import Message from "../models/message.model.js";
import { createMemory, queryMemory } from "../services/vector.service.js"
import { chat } from "@pinecone-database/pinecone/dist/assistant/data/chat.js";


function socketServer(httpServer) {

    const io = new Server(httpServer, { /* options */ });

    io.use(async (socket, next) => {
        const cookies = cookie.parseCookie(socket.handshake.headers.cookie || "");

        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"))
        }

        try {

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            socket.user = user;

            next()

        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }

    })

    io.on("connection", (socket) => {

        socket.on("ai-message", async (messagePayload) => {


            const message = await Message.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: messagePayload.content,
                role: "user"
            })

            const vectors = await generateVector(messagePayload.content)

            const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,
                metadata: {
                    user: { $eq: socket.user._id }
                }
            })


            await createMemory({
                vectors,
                messageId: 11322323,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            })

            const messageHistory = await Message.find({
                chat: messagePayload.chat
            })
                .sort({ createdAt: -1 })   // newest first
                .limit(20)                 // only 20
                .lean();                 // plain objects

            messageHistory.reverse();

            const stm = messageHistory.map((item) => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            const ltm = [
                {
                    role: "system",
                    parts: [{
                        text: `these are some previous messages from the chat, use them to generate a response. 
                        ${memory.map((item) => item.metadata.text).join("\n")}`
                    }]
                }
            ]

            const response = await generateText([...ltm, ...stm]);


            const responseMessage = await Message.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: response,
                role: "model"
            })

            const responseVectors = await generateVector(response);

            await createMemory({
                vectors: responseVectors,
                messageId: responseMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                }
            })


            socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chat
            })

        })
    });

}

export default socketServer;