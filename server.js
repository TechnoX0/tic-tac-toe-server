const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let rooms = {}; // Store game rooms

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("createRoom", (room) => {
        if (!rooms[room]) {
            rooms[room] = {
                players: [socket.id],
                board: Array(9).fill(""),
                turn: "X",
            };
            socket.join(room);
            socket.emit("roomCreated", room);
        }
    });

    socket.on("joinRoom", (room) => {
        if (rooms[room] && rooms[room].players.length < 2) {
            rooms[room].players.push(socket.id);
            socket.join(room);
            io.to(room).emit("gameStart", rooms[room]);
        }
    });

    socket.on("makeMove", ({ room, index }) => {
        const game = rooms[room];
        if (game && game.board[index] === "") {
            game.board[index] = game.turn;
            game.turn = game.turn === "X" ? "O" : "X";
            io.to(room).emit("updateBoard", game);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (let room in rooms) {
            if (rooms[room].players.includes(socket.id)) {
                delete rooms[room];
                io.to(room).emit("playerLeft");
            }
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port 3000");
});
