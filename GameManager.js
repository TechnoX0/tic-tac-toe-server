// GameManager.js
import Player from "./classes/Player.js";
import Ball from "./classes/Ball.js";

class GameManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.paddleWidth = 10;
        this.paddleHeight = 100;
        this.paddleSpeed = 5;
        this.gameStart = false;
        this.scores = { left: 0, right: 0 };

        this.players = {};
        this.ball = new Ball(canvasWidth / 2, canvasHeight / 2, 4, 4, 8);
    }

    assignPlayer(socketId) {
        const playerCount = Object.keys(this.players).length;
        if (playerCount >= 2) return false;
        if (playerCount == 1) this.gameStart = true;

        const xPos =
            playerCount === 0 ? 20 : this.canvasWidth - this.paddleWidth - 20;
        this.players[socketId] = new Player(
            xPos,
            this.canvasHeight / 2 - this.paddleHeight / 2,
            this.paddleWidth,
            this.paddleHeight,
            this.paddleSpeed
        );
        return true;
    }

    handlePlayerAction(socketId, data) {
        if (data.action === "move")
            this.updatePlayerMovement(socketId, data.direction);
        if (data.action === "stop") this.stopPlayerMovement(socketId);
    }

    removePlayer(socketId) {
        delete this.players[socketId];

        if (Object.keys(this.players).length < 2) {
            this.gameStart = false;
            this.scores = { left: 0, right: 0 };
        }
    }

    updatePlayerMovement(socketId, direction) {
        if (this.players[socketId]) {
            this.players[socketId].startMoving(direction);
        }
    }

    stopPlayerMovement(socketId) {
        if (this.players[socketId]) {
            this.players[socketId].stopMoving();
        }
    }

    updateGame() {
        if (!this.gameStart) return;

        // Update player positions
        Object.values(this.players).forEach((player) =>
            player.update(this.canvasHeight)
        );

        // Update ball and check collisions
        this.ball.update();
        const hasScored = this.ball.checkBoundaryCollision(
            this.canvasWidth,
            this.canvasHeight
        );

        if (hasScored != "none") {
            this.scores[hasScored]++;

            switch (hasScored) {
                case "left":
                    this.ball = new Ball(
                        this.canvasWidth / 2,
                        this.canvasHeight / 2,
                        -4,
                        4,
                        8
                    );
                    break;
                case "left":
                    this.ball = new Ball(
                        this.canvasWidth / 2,
                        this.canvasHeight / 2,
                        4,
                        4,
                        8
                    );
                    break;
            }
        }

        const playerArray = Object.values(this.players);
        if (playerArray.length === 2) {
            this.ball.checkPaddleCollision(playerArray[0], playerArray[1]);
        }
    }

    getGameState() {
        return {
            players: this.players,
            ball: this.ball,
            scores: this.scores,
        };
    }
}

export default GameManager;
