// Snake class for player and AI

class Snake {
    constructor(x, y, isPlayer = false, name = 'Player', worldSize, color = null) {
        this.body = [];
        this.isPlayer = isPlayer;
        this.name = name;
        this.worldSize = worldSize;
        this.color = color || (isPlayer ? '#00ff88' : randomColor());
        this.isDead = false;
        this.mass = 100;
        
        // Initialize body
        const segmentSpacing = 8;
        for (let i = 0; i < 10; i++) {
            this.body.push(new Vector2(x - i * segmentSpacing, y));
        }

        // Movement
        this.targetAngle = 0;
        this.currentAngle = 0;
        this.baseSpeed = 120;
        this.speed = this.baseSpeed;
        this.turnSpeed = 3;
        this.isBoosting = false;

        // AI properties
        this.targetPosition = null;
        this.aiChangeTargetTimer = 0;
        this.aiChangeTargetInterval = 2;
        
        // Respawn tracking
        this.respawnScheduled = false;
    }

    get head() {
        return this.body[0];
    }

    get length() {
        return this.body.length;
    }

    get radius() {
        return 5 + Math.sqrt(this.mass) * 0.5;
    }

    setBoost(boosting) {
        this.isBoosting = boosting;
        this.speed = boosting ? this.baseSpeed * 1.8 : this.baseSpeed;
    }

    updatePlayer(mousePos, deltaTime) {
        if (this.isDead) return;

        // Calculate angle to mouse
        const headPos = this.head;
        const dx = mousePos.x - headPos.x;
        const dy = mousePos.y - headPos.y;
        this.targetAngle = Math.atan2(dy, dx);

        this.updateMovement(deltaTime);
    }

    updateAI(particles, otherSnakes, deltaTime) {
        if (this.isDead) return;

        // AI decision making
        this.aiChangeTargetTimer += deltaTime;
        if (this.aiChangeTargetTimer > this.aiChangeTargetInterval || !this.targetPosition) {
            this.aiChangeTargetTimer = 0;
            this.findNewTarget(particles, otherSnakes);
        }

        // Move towards target
        if (this.targetPosition) {
            const dx = this.targetPosition.x - this.head.x;
            const dy = this.targetPosition.y - this.head.y;
            let desiredAngle = Math.atan2(dy, dx);
            
            // Check if moving in this direction will hit own body
            if (this.willHitSelf(desiredAngle)) {
                // Turn away from danger
                desiredAngle += Math.PI / 2; // Turn 90 degrees
            }
            
            this.targetAngle = desiredAngle;
        }

        this.updateMovement(deltaTime);
    }

    willHitSelf(angle) {
        // Check if moving in this direction will collide with own body
        const checkDistance = 50;
        const futureX = this.head.x + Math.cos(angle) * checkDistance;
        const futureY = this.head.y + Math.sin(angle) * checkDistance;
        const futurePos = new Vector2(futureX, futureY);
        
        // Check against body segments (skip first 15 segments)
        for (let i = 15; i < this.body.length; i++) {
            const segment = this.body[i];
            if (futurePos.distance(segment) < this.radius * 3) {
                return true;
            }
        }
        
        return false;
    }

    findNewTarget(particles, otherSnakes) {
        // FIRST PRIORITY: Avoid own body
        const safeDistance = this.radius * 4;
        for (let i = 15; i < this.body.length; i++) {
            const segment = this.body[i];
            if (this.head.distance(segment) < safeDistance * 2) {
                // Too close to own body, move away immediately
                const dx = this.head.x - segment.x;
                const dy = this.head.y - segment.y;
                const angle = Math.atan2(dy, dx);
                this.targetPosition = new Vector2(
                    this.head.x + Math.cos(angle) * 400,
                    this.head.y + Math.sin(angle) * 400
                );
                return;
            }
        }

        // Check for danger (bigger snakes nearby)
        for (const snake of otherSnakes) {
            if (snake !== this && !snake.isDead && snake.mass > this.mass * 1.2) {
                const distance = this.head.distance(snake.head);
                if (distance < 200) {
                    // Run away from bigger snakes
                    const dx = this.head.x - snake.head.x;
                    const dy = this.head.y - snake.head.y;
                    const angle = Math.atan2(dy, dx);
                    this.targetPosition = new Vector2(
                        this.head.x + Math.cos(angle) * 300,
                        this.head.y + Math.sin(angle) * 300
                    );
                    return;
                }
            }
        }

        // Hunt smaller snakes aggressively
        if (Math.random() > 0.5) {
            for (const snake of otherSnakes) {
                if (snake !== this && !snake.isDead && snake.mass < this.mass * 0.7) {
                    const distance = this.head.distance(snake.head);
                    if (distance < 400) {
                        this.targetPosition = snake.head;
                        return;
                    }
                }
            }
        }

        // Find closest food particle cluster
        let closestParticle = null;
        let closestDistance = Infinity;

        for (const particle of particles) {
            const distance = this.head.distance(particle.position);
            if (distance < closestDistance && distance < 600) {
                closestDistance = distance;
                closestParticle = particle;
            }
        }

        if (closestParticle) {
            this.targetPosition = closestParticle.position;
        } else {
            // Move in a safe direction away from boundaries
            const centerX = this.worldSize / 2;
            const centerY = this.worldSize / 2;
            this.targetPosition = new Vector2(
                randomRange(centerX - 500, centerX + 500),
                randomRange(centerY - 500, centerY + 500)
            );
        }
    }

    updateMovement(deltaTime) {
        // Smooth rotation
        let angleDiff = this.targetAngle - this.currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        this.currentAngle += angleDiff * this.turnSpeed * deltaTime;

        // Move head
        const velocity = new Vector2(
            Math.cos(this.currentAngle) * this.speed * deltaTime,
            Math.sin(this.currentAngle) * this.speed * deltaTime
        );

        const newHead = this.head.add(velocity);
        
        // Clamp to world boundaries (with proper padding)
        const padding = 40;
        newHead.x = Math.max(padding, Math.min(this.worldSize - padding, newHead.x));
        newHead.y = Math.max(padding, Math.min(this.worldSize - padding, newHead.y));

        // Add new head
        this.body.unshift(newHead);

        // Remove tail segments to maintain length based on mass
        // Each mass point = 1 segment for dramatic visual growth
        const targetLength = Math.floor(10 + this.mass);
        while (this.body.length > targetLength) {
            this.body.pop();
        }

        // Maintain consistent spacing between segments for smooth appearance
        const segmentSpacing = 7; // Fixed spacing for visual consistency
        for (let i = 1; i < this.body.length; i++) {
            const segment = this.body[i];
            const prevSegment = this.body[i - 1];
            const distance = segment.distance(prevSegment);
            
            if (distance > segmentSpacing) {
                const direction = segment.subtract(prevSegment).normalize();
                this.body[i] = prevSegment.add(direction.multiply(segmentSpacing));
            }
        }
    }

    checkSelfCollision() {
        if (this.body.length < 10) return false;

        const head = this.head;
        const headRadius = this.radius;

        // Check collision with body segments (skip the first few near the head)
        for (let i = 10; i < this.body.length; i++) {
            const segment = this.body[i];
            if (head.distance(segment) < headRadius * 1.5) {
                return true;
            }
        }

        return false;
    }

    checkBodyCollision(otherSnake) {
        // Check if this snake's head collides with other snake's body
        const head = this.head;
        const headRadius = this.radius;
        
        // Skip first few segments near other snake's head
        for (let i = 5; i < otherSnake.body.length; i++) {
            const segment = otherSnake.body[i];
            const distance = head.distance(segment);
            if (distance < headRadius + otherSnake.radius * 0.8) {
                return true;
            }
        }
        
        return false;
    }

    eatParticle(value) {
        this.mass += value;
    }

    eatSnake(otherSnake) {
        // Gain most of the eaten snake's mass
        this.mass += otherSnake.mass * 0.9;
    }

    draw(ctx, camera) {
        if (this.isDead) return;

        const radius = this.radius;

        // Draw body segments from tail to head
        for (let i = this.body.length - 1; i >= 0; i--) {
            const segment = this.body[i];
            const screenPos = camera.worldToScreen(segment);
            
            // Glow effect
            const gradient = ctx.createRadialGradient(
                screenPos.x, screenPos.y, radius * 0.5,
                screenPos.x, screenPos.y, radius * 2
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Solid body
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Inner highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(screenPos.x - radius * 0.3, screenPos.y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw eyes on head
        const headScreen = camera.worldToScreen(this.head);
        const eyeAngle = this.currentAngle;
        const eyeDistance = radius * 0.5;
        const eyeSize = radius * 0.3;

        for (let side of [-1, 1]) {
            const eyeX = headScreen.x + Math.cos(eyeAngle + side * 0.5) * eyeDistance;
            const eyeY = headScreen.y + Math.sin(eyeAngle + side * 0.5) * eyeDistance;
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw name above snake
        if (!this.isPlayer) {
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, headScreen.x, headScreen.y - radius - 15);
        }
    }
}
