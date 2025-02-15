// Player.js
class Player {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 0;
    }

    startMoving(direction) {
        this.direction = direction;
    }

    stopMoving() {
        this.direction = 0;
    }

    update(canvasHeight) {
        const newY = this.y + this.direction * this.speed;
        if (newY >= 0 && newY + this.height <= canvasHeight) {
            this.y = newY;
        }
    }
}

export default Player;
