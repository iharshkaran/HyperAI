import { io, Socket } from "socket.io-client";


const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

export const socket: Socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
});

// Indicator for connection status
socket.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED! ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 SOCKET CONNECTION ERROR:", err.message);
});

socket.on("ai-error", (err) => {
  console.error("⚠️ AI ERROR FROM BACKEND:", err);
});