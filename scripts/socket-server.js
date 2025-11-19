// scripts/socket-server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config({ path: ".env.local" });


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join", (room) => {
    console.log("join", room);
    socket.join(room);
  });

  socket.on("leave", (room) => {
    socket.leave(room);
  });

  socket.on("score:event", (payload) => {
    // optionally re-broadcast to room
    const room = `match:${payload.matchId}`;
    io.to(room).emit("match:update", payload);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnect", socket.id);
  });
});

// Admin endpoint to broadcast requested events (used by server route)
app.post("/broadcast", (req, res) => {
  const { room, event, payload } = req.body || {};
  if (!room || !event) return res.status(400).json({ error: "room & event required" });
  io.to(room).emit(event, payload);
  return res.json({ ok: true });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
