# HyperAI

### A Production-Style AI Assistant with Real-Time Streaming & Semantic Memory

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3078C6?logo=typescript)
![NodeJS](https://img.shields.io/badge/Node.js-1E5128?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-191A19?logo=mongodb)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-blueviolet)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?logo=tailwindcss)

---

## 📖 About

HyperAI is a **full-stack AI assistant** designed to understand how modern conversational AI systems work behind the scenes.

Instead of focusing only on UI, this project explores the engineering concepts that power production AI assistants:

- Semantic Memory
- Vector Databases
- Embeddings
- Streaming Responses
- Context Engineering
- Real-Time Communication
- Modular Backend Architecture
- Resilient Cross-Browser Authentication

HyperAI combines **Short-Term Memory (STM)** and **Long-Term Memory (LTM)** to generate context-aware conversations, giving responses that remember both the recent conversation and relevant historical context.

**Live:** [hyperai-psi.vercel.app](https://hyperai-psi.vercel.app)

---

## ✨ Features

### 🤖 AI Features
- Real-time AI conversations
- Token-by-token streaming responses
- Google Gemini Flash integration
- Context-aware conversations
- Semantic memory retrieval
- Message editing with automatic conversation branching (re-generates response from the edited point)

### 🧠 Memory System
- Short-Term Memory (MongoDB — last 20 messages)
- Long-Term Memory (Pinecone — semantic vector search)
- Gemini Embeddings (768-dimensional)
- Context Builder (STM + LTM merge)

### 💬 Chat Features
- Multiple chats with auto-generated titles
- Chat history and search
- Markdown rendering with syntax highlighting
- Responsive design, dark / light mode

### 🔐 Authentication
- JWT authentication with HTTP-only cookies
- Google OAuth 2.0 (Passport.js)
- Email/password auth with OTP email verification
- bcrypt password hashing
- **Bearer-token fallback** — REST APIs and the Socket.IO handshake both accept a token via header/handshake auth in addition to cookies, so login still works in browsers that block third-party/cross-site cookies (Brave, Safari ITP)
- Protected socket connections

### 📧 Transactional Email
- OTP verification and password-reset emails sent via **Brevo's HTTP API** (not SMTP) — avoids outbound SMTP port restrictions common on free-tier cloud hosts like Render

---

## 🏗️ System Architecture

```
                       User
                        │
                        ▼
             React + TypeScript
                        │
                Socket.IO Client
                        │
──────────────────────────────────────────
          Express + Socket.IO Server
                        │
                 JWT Authentication
              (cookie OR Bearer token)
                        │
                Store User Message
                        │
                        ▼
             Gemini Embedding API
                        │
                        ▼
             768-Dimensional Vector
                        │
                        ▼
                Pinecone Vector DB
                        │
           Retrieve Relevant Memories
                        │
──────────────────────────────────────────
      Fetch Last 20 Messages (MongoDB)
──────────────────────────────────────────
         Combine STM + LTM Context
                        │
                        ▼
          Gemini Streaming Response
                        │
                        ▼
             Stream Tokens Live
                        │
                        ▼
               React Chat Window
```

---

## 🧠 Memory Architecture

HyperAI uses a **dual-memory architecture** inspired by modern conversational AI systems.

### Short-Term Memory (STM)
Stored inside **MongoDB**
- Latest 20 messages per chat
- Maintains conversation flow
- Provides immediate context

### Long-Term Memory (LTM)
Stored inside **Pinecone Vector Database**

Every user message is:
- Embedded using Gemini Embedding-2
- Converted into a 768-dimensional vector
- Stored in Pinecone with `user` / `chat` metadata

When a new message arrives:
1. Generate embedding for the incoming message
2. Perform semantic similarity search, filtered to the current user
3. Retrieve the most relevant past memories
4. Merge them with STM
5. Build the final prompt sent to Gemini

---

## ⚡ Streaming Responses

HyperAI streams responses token-by-token using:
- Gemini Streaming API
- Socket.IO
- React live rendering (throttled via `requestAnimationFrame` for smooth, non-blocking updates)

Instead of waiting for the complete response, users see the AI typing in real time, similar to ChatGPT.

---

## 🛠️ Tech Stack

**Frontend**
- React, TypeScript, Vite
- Tailwind CSS v4
- React Router
- Socket.IO Client
- React Markdown, Remark GFM, PrismJS

**Backend**
- Node.js, Express.js
- MongoDB, Mongoose
- Socket.IO
- JWT, bcrypt, Passport.js (Google OAuth)

**AI Stack**
- Google Gemini Flash (streaming)
- Gemini Embedding-2 (768-dim)
- Pinecone Vector Database

**Email**
- Brevo (HTTP API)

**Deployment**
- Vercel (Frontend) + Render (Backend)

---

## 📂 Folder Structure

```
HyperAI
├── frontend
│   └── src
│       ├── components
│       ├── context
│       ├── pages
│       ├── routes
│       ├── services
│       ├── hooks
│       └── types
│
└── backend
    └── src
        ├── controllers
        ├── services
        ├── sockets
        ├── routes
        ├── middlewares
        ├── models
        ├── validators
        ├── config
        └── db
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=3000
NODE_ENV=production          # set to "production" for deployed environments — controls secure cookie flags
FRONTEND_URL=https://your-frontend-url.vercel.app

# Database
MONGO_URL=your-mongodb-connection-string

# Auth
JWT_SECRET=your-jwt-secret

# Google OAuth (used for login AND for the app's identity — obtain from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# AI
GEMINI_API_KEY=your-gemini-api-key

# Vector DB
PINECONE_API_KEY=your-pinecone-api-key

# Transactional Email (Brevo — HTTP API, not SMTP)
BREVO_API_KEY=your-brevo-api-key
EMAIL_USER=your-verified-sender-email@example.com
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

> **Note:** `NODE_ENV=production` is required in deployed environments — without it, cookies are set with `secure: false`, which browsers silently reject over HTTPS on cross-site requests.

---

## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/iharshkaran/HyperAI.git
cd HyperAI
```

**Backend**

```bash
cd backend
npm install
# create backend/.env using the template above
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
# create frontend/.env using the template above
npm run dev
```

### Additional setup

- **Google OAuth:** Create an OAuth 2.0 Client (Web application) in [Google Cloud Console](https://console.cloud.google.com/), and add both your local (`http://localhost:3000/api/auth/google/callback`) and production callback URLs to *Authorized redirect URIs*, and your frontend origin(s) to *Authorized JavaScript origins*.
- **Pinecone:** Create an index with dimension `768` (to match Gemini Embedding-2 output) and cosine similarity metric.
- **Brevo:** Verify a sender email under *Senders, Domains & IPs*, then generate an API key under *SMTP & API → API keys*.

---

## 🎯 Why I Built HyperAI

Most beginner projects focus on CRUD operations.

With HyperAI, my goal was different. I wanted to understand how modern AI assistants maintain conversational context, retrieve relevant memories using vector databases, and stream responses in real time — and then take it all the way through real deployment: cross-origin cookies, browser privacy restrictions, and cloud-host networking quirks included.

---

## 📚 What I Learned

- AI application architecture (RAG, semantic search, embeddings)
- Vector databases and context engineering
- Streaming APIs and Socket.IO
- JWT authentication with cookie *and* Bearer-token strategies
- Debugging cross-origin auth failures across different browsers (Brave, Chrome, Safari)
- Working around cloud-host networking restrictions (SMTP port blocking, IPv6 connectivity)
- Full-stack TypeScript development
- Modular backend design

---

## 🚧 Future Improvements

- 📄 File upload + RAG over documents
- 🖼️ Image understanding
- 🎤 Voice conversations
- 🤖 Multiple AI model support
- 🛑 Stop generation mid-stream
- 🔄 Regenerate response
- 🌐 Web search integration
- 📤 Chat export

---

## 💼 Resume Highlights

- Designed a dual-memory architecture using **MongoDB (STM)** and **Pinecone (LTM)**.
- Implemented **real-time token streaming** using the Gemini Streaming API and Socket.IO.
- Built semantic retrieval using **Gemini Embedding-2 (768-dimensional embeddings)**.
- Hardened authentication with a **cookie + Bearer-token dual strategy** to support browsers that block cross-site cookies (Brave, Safari ITP), across both REST APIs and the Socket.IO handshake.
- Migrated transactional email from SMTP to a **Brevo HTTP API integration** to work around outbound SMTP restrictions on free-tier cloud hosts.
- Developed a modular full-stack AI application using React, TypeScript, Express, MongoDB, and Pinecone.

---

## 🙏 Acknowledgements

Special thanks to Google Gemini, Pinecone, MongoDB, React, Socket.IO, and Tailwind CSS for the tools that made this project possible.

---

## 📄 License

This project is licensed under the **MIT License**.

---

### ⭐ If you found HyperAI interesting, consider giving it a star!

Made with ❤️ while learning AI engineering.