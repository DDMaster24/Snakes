// Utility functions for the game

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return new Vector2(this.x / len, this.y / len);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor() {
    const colors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
        '#6c5ce7', '#fd79a8', '#fdcb6e', '#00b894',
        '#ff7675', '#74b9ff', '#a29bfe', '#ffeaa7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
}

function wrapPosition(pos, worldSize) {
    if (pos.x < 0) pos.x += worldSize;
    if (pos.x > worldSize) pos.x -= worldSize;
    if (pos.y < 0) pos.y += worldSize;
    if (pos.y > worldSize) pos.y -= worldSize;
    return pos;
}

// Generate a random name for AI snakes
function randomName() {
    const adjectives = ['Speedy', 'Mighty', 'Sneaky', 'Giant', 'Tiny', 'Angry', 'Happy', 'Crazy'];
    const nouns = ['Snake', 'Serpent', 'Viper', 'Python', 'Cobra', 'Rattler', 'Noodle', 'Worm'];
    return `${adjectives[randomInt(0, adjectives.length - 1)]} ${nouns[randomInt(0, nouns.length - 1)]}`;
}
