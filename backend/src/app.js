import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

// Configurations & Routes
import './config/passport.config.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

// Cross-Origin Resource Sharing (CORS) Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// Request Parsers & Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'HyperAI Backend is running' });
});

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on server' });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;