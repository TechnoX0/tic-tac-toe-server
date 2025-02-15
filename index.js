import express from "express";
import http from "http";
import { Server } from "socket.io";
import GameManager from "./GameManager.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
});

// Initialize GameManager
const gameManager = new GameManager(1000, 600);

// Game loop (60 FPS)
setInterval(() => {
    gameManager.updateGame();
    io.emit("gameState", gameManager.getGameState());
}, 16);

// Handle player connections
io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    if (gameManager.assignPlayer(socket.id)) {
        socket.emit("playerId", socket.id);
    } else {
        socket.emit("gameFull");
        return socket.disconnect();
    }

    socket.on("playerAction", (data) => {
        gameManager.handlePlayerAction(socket.id, data);
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        gameManager.removePlayer(socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
