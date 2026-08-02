import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import { handleAiMessage } from "../controllers/socket.controller.js";

function socketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Authentication Middleware
    io.use(async (socket, next) => {

        const cookies = cookie.parseCookie(socket.handshake.headers.cookie || "");

        if (!cookies.token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (!user) return next(new Error("User not found"));

            socket.user = user;
            return next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    // Connection Events
    io.on("connection", (socket) => {

        socket.on("ai-message", (messagePayload) => {
            handleAiMessage(socket, messagePayload);
        });
    });
}

export default socketServer;