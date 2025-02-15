const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
});

let players = {};
let ball = { x: 300, y: 200, vx: 3, vy: 2 }; // Ball starts at (300,200) and moves right/down

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    players[socket.id] = { x: 100, y: 100 };

    socket.emit("currentPlayers", players);
    socket.emit("ballUpdate", ball);
    socket.broadcast.emit("newPlayer", { id: socket.id, x: 100, y: 100 });

    socket.on("playerMove", (data) => {
        if (players[socket.id]) {
            players[socket.id] = data;
            socket.broadcast.emit("updatePlayer", {
                id: socket.id,
                x: data.x,
                y: data.y,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit("removePlayer", socket.id);
    });
});

// Game loop runs every 16ms (~60FPS)
setInterval(() => {
    // Update ball position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Check for collisions with top and bottom walls
    if (ball.y <= 0 || ball.y >= 400) {
        ball.vy *= -1; // Reverse direction
    }

    // Broadcast updated ball position to all players
    io.emit("ballUpdate", ball);
}, 16);

const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
