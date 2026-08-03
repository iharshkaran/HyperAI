<div align="center">

# HyperAI

### A Production-Style AI Assistant with Real-Time Streaming & Semantic Memory

<p>
HyperAI is a modern conversational AI assistant inspired by ChatGPT, built from scratch to explore real-world AI application architecture including semantic memory retrieval, vector databases, streaming responses, and scalable backend design.
</p>

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-03001C?logo=typescript)
![NodeJS](https://img.shields.io/badge/Node.js-1E5128?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-191A19?logo=mongodb)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-blueviolet)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?logo=tailwindcss)

</div>

---

# 📖 About

HyperAI is a **full-stack AI assistant** designed to understand how modern conversational AI systems work behind the scenes.

Instead of focusing only on UI, this project explores the engineering concepts that power production AI assistants:

- Semantic Memory
- Vector Databases
- Embeddings
- Streaming Responses
- Context Engineering
- Real-Time Communication
- Modular Backend Architecture

HyperAI combines **Short-Term Memory (STM)** and **Long-Term Memory (LTM)** to generate context-aware conversations, giving responses that remember both the recent conversation and relevant historical context.

---

# ✨ Features

## 🤖 AI Features

- Real-time AI conversations
- Token-by-token streaming responses
- Google Gemini Flash integration
- Context-aware conversations
- Semantic memory retrieval

---

## 🧠 Memory System

- Short-Term Memory (MongoDB)
- Long-Term Memory (Pinecone)
- Semantic Vector Search
- Gemini Embeddings
- Context Builder (STM + LTM)

---

## 💬 Chat Features

- Multiple Chats
- Chat History
- Markdown Rendering
- Syntax Highlighting
- Code Blocks
- Chat Search
- Responsive Design
- Dark Mode
- Light Mode

---

## 🔐 Authentication

- JWT Authentication
- HTTP Only Cookies
- bcrypt Password Hashing
- Protected Socket Connection

---

# 🏗️ System Architecture

```text
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

# 🧠 Memory Architecture

HyperAI uses a **dual-memory architecture** inspired by modern conversational AI systems.

## Short-Term Memory (STM)

Stored inside **MongoDB**

- Latest 20 Messages
- Maintains conversation flow
- Provides immediate context

---

## Long-Term Memory (LTM)

Stored inside **Pinecone Vector Database**

Every user message is

- Embedded using Gemini Embedding-2
- Converted into a 768-dimensional vector
- Stored in Pinecone

When a new message arrives:

- Generate embedding
- Perform semantic similarity search
- Retrieve the most relevant memories
- Merge them with STM
- Build the final prompt

---

# ⚡ Streaming Responses

HyperAI streams responses token-by-token using:

- Gemini Streaming API
- Socket.IO
- React Live Rendering

Instead of waiting for the complete response, users see the AI typing in real time similar to ChatGPT.

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Socket.IO Client
- React Markdown
- Remark GFM
- PrismJS
- VS Code Dark Plus Theme

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcrypt

---

## AI Stack

- Google Gemini Flash
- Gemini Embedding-2
- Pinecone Vector Database

---

# 📂 Folder Structure

```text
HyperAI

├── frontend
│
│   ├── src
│   │
│   ├── components
│   ├── context
│   ├── pages
│   ├── routes
│   ├── assets
│   └── socket.ts
│
└── backend
    │
    ├── controllers
    ├── services
    ├── sockets
    ├── routes
    ├── middlewares
    ├── models
    ├── db
    └── server.js
```

---

# 🔄 Request Lifecycle

```text
User Message

      │

      ▼

Socket.IO

      │

      ▼

Store Message (MongoDB)

      │

      ▼

Generate Embedding

      │

      ▼

Search Pinecone

      │

      ▼

Retrieve Semantic Memories

      │

      ▼

Fetch Recent Messages

      │

      ▼

Build Prompt

(STM + LTM)

      │

      ▼

Gemini Flash

(Stream)

      │

      ▼

Emit Token

      │

      ▼

React UI

      │

      ▼

Store AI Response

      │

      ▼

Store Response Embedding
```

---

# 🌙 UI Features

- ChatGPT Inspired Interface
- Responsive Sidebar
- Search Chats
- Suggestion Cards
- Markdown Rendering
- Syntax Highlighting
- Dark / Light Theme
- Streaming Typing Effect

---

# 🔐 Authentication Flow

```text
Register

↓

Hash Password (bcrypt)

↓

Login

↓

Generate JWT

↓

Store HTTP Only Cookie

↓

Protected Routes

↓

Protected Socket Connection
```

---

# ⚙️ Environment Variables

```env
PORT=

MONGODB_URI=

JWT_SECRET=

GEMINI_API_KEY=

PINECONE_API_KEY=

PINECONE_INDEX=
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/hyperAI.git
```

Backend

```bash
cd backend
npm install
npm run dev
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🎯 Why I Built HyperAI

Most beginner projects focus on CRUD operations.

With HyperAI, my goal was different.

I wanted to understand how modern AI assistants maintain conversational context, retrieve relevant memories using vector databases, and stream responses in real time.

This project helped me explore concepts like semantic search, embeddings, prompt engineering, memory management, and scalable AI backend architecture.

---

# 📚 What I Learned

Building HyperAI taught me:

- AI Application Architecture
- Semantic Search
- Vector Databases
- Embeddings
- Context Engineering
- Prompt Construction
- Streaming APIs
- Socket.IO
- JWT Authentication
- Full Stack TypeScript Development
- Modular Backend Design

---

# 🚧 Future Improvements

- 📄 File Upload + RAG
- 🖼️ Image Understanding
- 🎤 Voice Conversations
- 🤖 Multiple AI Models
- 🛑 Stop Generation
- 🔄 Regenerate Response
- 🌐 Web Search
- 📤 Chat Export
- 📎 Attach Files

---

# 💼 Resume Highlights

- Designed a dual-memory architecture using **MongoDB (STM)** and **Pinecone (LTM)**.
- Implemented **real-time token streaming** using Gemini Streaming API and Socket.IO.
- Built semantic retrieval using **Gemini Embedding-2 (768-dimensional embeddings)**.
- Developed a modular full-stack AI application using React, TypeScript, Express, MongoDB, and Pinecone.
- Engineered contextual conversations by combining semantic memory retrieval with recent chat history.
- Implemented secure authentication using JWT, HTTP-only cookies, and bcrypt.

---

# 🙏 Acknowledgements

Special thanks to

- Google Gemini
- Pinecone
- MongoDB
- React
- Socket.IO
- Tailwind CSS

for providing the tools and technologies that made this project possible.

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

### ⭐ If you found HyperAI interesting, consider giving it a Star!

Made with ❤️ while learning AI Engineering.

</div>