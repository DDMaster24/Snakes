// Food particles that snakes can eat

class Particle {
    constructor(x, y, worldSize) {
        this.position = new Vector2(x, y);
        this.radius = 5;
        this.color = randomColor();
        this.value = 1;
        this.worldSize = worldSize;
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }

    update(deltaTime) {
        // Pulsing glow effect
        this.glowIntensity += this.glowDirection * deltaTime * 2;
        if (this.glowIntensity > 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity < 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
    }

    draw(ctx, camera) {
        const screenPos = camera.worldToScreen(this.position);
        
        // Draw glow
        const glowSize = this.radius + 10 * this.glowIntensity;
        const gradient = ctx.createRadialGradient(
            screenPos.x, screenPos.y, this.radius,
            screenPos.x, screenPos.y, glowSize
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
