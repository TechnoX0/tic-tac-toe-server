const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 3001 });
const players = {};

server.on("connection", (ws) => {
    const playerId = Math.random().toString(36).substr(2, 9);
    players[playerId] = { x: 100, y: 100 }; // Default position
    console.log(`Player ${playerId} connected`);

    ws.send(JSON.stringify({ type: "init", id: playerId, players }));

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "move") {
            players[playerId].x += data.dx;
            players[playerId].y += data.dy;
            broadcast(
                JSON.stringify({
                    type: "update",
                    id: playerId,
                    x: players[playerId].x,
                    y: players[playerId].y,
                })
            );
        }
    });

    ws.on("close", () => {
        delete players[playerId];
        broadcast(JSON.stringify({ type: "remove", id: playerId }));
    });
});

function broadcast(message) {
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log("WebSocket server running on port 3001");
