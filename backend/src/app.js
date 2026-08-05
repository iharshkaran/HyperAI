import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cors from "cors";
import passport from 'passport';
import './config/passport.config.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes)

export default app;