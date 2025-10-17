// Camera system for following the player

class Camera {
    constructor(canvas, worldSize) {
        this.canvas = canvas;
        this.worldSize = worldSize;
        this.position = new Vector2(0, 0);
        this.target = new Vector2(0, 0);
        this.smoothing = 0.1;
        this.zoom = 1;
    }

    update(targetPosition) {
        // Smoothly follow target
        const dx = targetPosition.x - this.target.x;
        const dy = targetPosition.y - this.target.y;
        
        this.target.x += dx * this.smoothing;
        this.target.y += dy * this.smoothing;

        // Center camera on target
        this.position.x = this.target.x - this.canvas.width / (2 * this.zoom);
        this.position.y = this.target.y - this.canvas.height / (2 * this.zoom);
    }

    worldToScreen(worldPos) {
        return new Vector2(
            (worldPos.x - this.position.x) * this.zoom,
            (worldPos.y - this.position.y) * this.zoom
        );
    }

    screenToWorld(screenPos) {
        return new Vector2(
            screenPos.x / this.zoom + this.position.x,
            screenPos.y / this.zoom + this.position.y
        );
    }

    isVisible(worldPos, margin = 100) {
        const screenPos = this.worldToScreen(worldPos);
        return screenPos.x > -margin && 
               screenPos.x < this.canvas.width + margin &&
               screenPos.y > -margin && 
               screenPos.y < this.canvas.height + margin;
    }
}
