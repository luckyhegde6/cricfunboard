// lib/socket-client.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (socket && socket.connected) return socket;

  const url =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";
  socket = io(url, { transports: ["websocket"], autoConnect: true });

  socket.on("connect", () => {
    console.debug("[socket] connected", socket?.id);
  });
  socket.on("disconnect", () => {
    console.debug("[socket] disconnected");
  });
  return socket;
}
