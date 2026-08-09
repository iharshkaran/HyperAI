import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { handleAiMessage } from "../controllers/socket.controller.js";


function socketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });


    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            // 1. try to get token from cookies first
            const rawCookies = socket.handshake.headers.cookie || "";
            const cookies = cookie.parseCookie(rawCookies);
            let token = cookies.token;

            // 2. if not found in cookie then check handshake auth
            if (!token) {
                token = socket.handshake.auth?.token;
            }

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded._id || decoded.id || decoded.userId;
            const user = await User.findById(userId);
            if (!user) return next(new Error("User not found"));

            socket.user = user;
            return next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });


    // Connection Events
    io.on("connection", (socket) => {
        console.log(`Connected: ${socket.id} | User: ${socket.user._id}`);

        socket.on("ai-message", (messagePayload) => {
            handleAiMessage(socket, messagePayload);
        });

        socket.on("disconnect", () => {
            console.log(`Disconnected: ${socket.id}`);
        });
    });
}

export default socketServer;