import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

export const socket: Socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false, // IMPORTANT: Now we'll manually connect after login or Google auth
  auth: {
    token: null, // Empty initially; will be set after login or Google auth
  },
});

// Connection status logs
socket.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED! ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 SOCKET CONNECTION ERROR:", err.message);
});

socket.on("ai-error", (err) => {
  console.error("⚠️ AI ERROR FROM BACKEND:", err);
});

// function to connect the socket with a token after login or Google auth
export const connectSocket = (token: string) => {
  socket.auth = { token };
  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
};

// function to disconnect the socket
export const disconnectSocket = () => {
  socket.disconnect();
};