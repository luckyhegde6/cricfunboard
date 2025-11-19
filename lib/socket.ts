// lib/socket.ts (for single server setup)
import { Server } from "socket.io";

let io: Server | null = null;
export function initSocket(server: any) {
  io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", socket => {
    socket.on("join", ({ matchId }) => socket.join(`match:${matchId}`));
  });
  return io;
}

export function emitMatchUpdate(matchId: string, payload: any) {
  if (!io) return;
  io.to(`match:${matchId}`).emit("match:update", payload);
}
