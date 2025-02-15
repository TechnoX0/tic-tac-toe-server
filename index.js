import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let players = {};

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    players[socket.id] = { x: 100, y: 100 };

    socket.emit("currentPlayers", players);
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

    socket.on("pingCheck", (sentTime) => {
        socket.emit("pongResponse", sentTime);
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit("removePlayer", socket.id);
    });

    console.log("New connection:", socket.id);
});

server.listen(3001, () => {
    console.log("Server running on port 3001");
});
