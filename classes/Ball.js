// Ball.js
class Ball {
    constructor(x, y, vx, vy, radius) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    checkBoundaryCollision(width, height) {
        if (this.y - this.radius <= 0 || this.y + this.radius >= height) {
            this.vy *= -1; // Bounce off top & bottom walls
        }

        if (this.x - this.radius <= 0) {
            return "right";
        } else if (this.x + this.radius >= width) {
            return "left";
        } else {
            return "none";
        }
    }

    checkPaddleCollision(player1, player2) {
        // Check collision with Player 1
        if (
            this.x - this.radius <= player1.x + player1.width &&
            this.y >= player1.y &&
            this.y <= player1.y + player1.height
        ) {
            this.vx *= -1; // Reverse X direction
            this.x = player1.x + player1.width + this.radius; // Avoid sticking
        }

        // Check collision with Player 2
        if (
            this.x + this.radius >= player2.x &&
            this.y >= player2.y &&
            this.y <= player2.y + player2.height
        ) {
            this.vx *= -1;
            this.x = player2.x - this.radius; // Avoid sticking
        }
    }
}

export default Ball;
