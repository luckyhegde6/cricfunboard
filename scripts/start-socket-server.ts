import dotenv from "dotenv";
// Load environment variables from .env.local BEFORE other imports
dotenv.config({ path: ".env.local" });

import http from "http";
import express from "express";
import { Server } from "socket.io";
import logger from "../lib/logger";
import dbConnect from "../lib/db";


const PORT = Number(process.env.PORT_WS || process.env.PORT || 4000);

async function main() {
  await dbConnect().catch((err) => {
    logger.error({ err }, "Failed to connect DB before starting socket server");
    process.exit(1);
  });

  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*", // lock this down in prod
      methods: ["GET", "POST"],
    },
    // pingInterval/pingTimeout can be tuned for scale.
  });

  io.on("connection", (socket) => {
    logger.info({ id: socket.id }, "Socket connected");

    socket.on("join", (payload: { matchId: string }) => {
      const room = `match:${payload.matchId}`;
      socket.join(room);
      logger.debug({ socket: socket.id, room }, "joined room");
      // Optionally: emit current match summary from DB here
    });

    socket.on("leave", (payload: { matchId: string }) => {
      const room = `match:${payload.matchId}`;
      socket.leave(room);
      logger.debug({ socket: socket.id, room }, "left room");
    });

    socket.on("disconnect", (reason) => {
      logger.info({ id: socket.id, reason }, "Socket disconnected");
    });
  });

  // Example helper route to broadcast a test update
  app.use(express.json());
  app.post("/emit/test", (req, res) => {
    const { matchId, payload } = req.body;
    if (!matchId) return res.status(400).json({ error: "matchId required" });
    io.to(`match:${matchId}`).emit("match:update", payload || { note: "test" });
    return res.json({ ok: true });
  });

  server.listen(PORT, () => {
    logger.info(`Socket server listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    logger.info("SIGINT received: closing socket server");
    io.close();
    server.close(() => process.exit(0));
  });
}

main().catch((err) => {
  logger.error({ err }, "Socket server crashed");
  process.exit(1);
});
