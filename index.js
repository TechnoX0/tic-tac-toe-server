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
let ball = { x: 400, y: 300, vx: 4, vy: 3 }; // Ball moves at a reasonable speed

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    // Assign player a paddle position
    const playerCount = Object.keys(players).length;
    players[socket.id] = {
        x: playerCount === 0 ? 30 : 760, // Left or right side of screen
        y: 260,
    };

    socket.emit("currentPlayers", players);
    socket.emit("ballUpdate", ball);
    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        ...players[socket.id],
    });

    socket.on("playerMove", (data) => {
        if (players[socket.id]) {
            players[socket.id].y = Math.max(0, Math.min(data.y, 520)); // Keep paddle in bounds
            socket.broadcast.emit("updatePlayer", { id: socket.id, y: data.y });
        }
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit("removePlayer", socket.id);
    });
});

// Game loop to update ball
setInterval(() => {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top and bottom walls
    if (ball.y <= 0 || ball.y >= 600) {
        ball.vy *= -1; // Reverse vertical direction
    }

    // Check paddle collision
    Object.values(players).forEach((paddle) => {
        if (
            ball.x >= paddle.x &&
            ball.x <= paddle.x + 10 && // Paddle width
            ball.y >= paddle.y &&
            ball.y <= paddle.y + 80 // Paddle height
        ) {
            ball.vx *= -1; // Reverse horizontal direction
        }
    });

    // Reset ball if it goes off the screen
    if (ball.x < 0 || ball.x > 800) {
        ball = {
            x: 400,
            y: 300,
            vx: 4 * (Math.random() > 0.5 ? 1 : -1),
            vy: 3,
        };
    }

    io.emit("ballUpdate", ball);
}, 16);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
