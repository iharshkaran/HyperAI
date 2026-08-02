import { io, Socket } from "socket.io-client";

export const socket: Socket = io("http://localhost:3000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED! ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 SOCKET CONNECTION ERROR:", err.message);
});

socket.on("ai-error", (err) => {
  console.error("⚠️ AI ERROR FROM BACKEND:", err);
});