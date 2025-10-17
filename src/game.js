// Main game logic

class Game {
    constructor(canvas, controlMethod = 'mouse', playerColor = '#00ff88') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldSize = 4000;
        this.isRunning = false;
        this.isPaused = false;
        this.controlMethod = controlMethod;
        this.playerColor = playerColor;
        
        // Game objects
        this.player = null;
        this.aiSnakes = [];
        this.particles = [];
        this.camera = null;

        // Input
        this.mousePosition = new Vector2(canvas.width / 2, canvas.height / 2);
        this.mouseWorldPosition = new Vector2(this.worldSize / 2, this.worldSize / 2);
        this.keys = {};
        this.arrowDirection = new Vector2(0, -1); // Default up

        // Joystick
        this.joystick = {
            active: false,
            centerX: 0,
            centerY: 0,
            currentX: 0,
            currentY: 0,
            radius: 60
        };

        // Timing
        this.lastTime = 0;

        // Game settings
        this.numAISnakes = 6;
        this.numParticles = 800;
        this.maxParticles = 1000;

        // Audio
        this.sounds = {
            eat: this.createSound(440, 0.1),
            death: this.createSound(220, 0.3),
            boost: this.createSound(600, 0.05)
        };

        this.setupCanvas();
        this.setupInput();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    createSound(frequency, duration) {
        return () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (e) {
                // Audio not supported
            }
        };
    }

    setupInput() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;

            if (this.camera) {
                this.mouseWorldPosition = this.camera.screenToWorld(this.mousePosition);
            }
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Arrow key controls
            if (this.controlMethod === 'arrows') {
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    this.arrowDirection = new Vector2(0, -1);
                    e.preventDefault();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    this.arrowDirection = new Vector2(0, 1);
                    e.preventDefault();
                } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                    this.arrowDirection = new Vector2(-1, 0);
                    e.preventDefault();
                } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                    this.arrowDirection = new Vector2(1, 0);
                    e.preventDefault();
                }
            }
            
            if (e.code === 'Space' && this.player && !this.player.isDead) {
                this.player.setBoost(true);
                e.preventDefault();
            }
            
            if (e.code === 'Escape' && this.isRunning && !this.isPaused) {
                this.showPauseMenu();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            if (e.code === 'Space' && this.player) {
                this.player.setBoost(false);
            }
        });

        // Joystick (touch/mouse)
        if (this.controlMethod === 'joystick') {
            this.canvas.addEventListener('mousedown', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.joystick.active = true;
                this.joystick.centerX = e.clientX - rect.left;
                this.joystick.centerY = e.clientY - rect.top;
                this.joystick.currentX = this.joystick.centerX;
                this.joystick.currentY = this.joystick.centerY;
            });

            this.canvas.addEventListener('mousemove', (e) => {
                if (this.joystick.active) {
                    const rect = this.canvas.getBoundingClientRect();
                    this.joystick.currentX = e.clientX - rect.left;
                    this.joystick.currentY = e.clientY - rect.top;
                }
            });

            this.canvas.addEventListener('mouseup', () => {
                this.joystick.active = false;
            });

            // Touch support
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.joystick.active = true;
                this.joystick.centerX = touch.clientX - rect.left;
                this.joystick.centerY = touch.clientY - rect.top;
                this.joystick.currentX = this.joystick.centerX;
                this.joystick.currentY = this.joystick.centerY;
            });

            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (this.joystick.active) {
                    const rect = this.canvas.getBoundingClientRect();
                    const touch = e.touches[0];
                    this.joystick.currentX = touch.clientX - rect.left;
                    this.joystick.currentY = touch.clientY - rect.top;
                }
            });

            this.canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.joystick.active = false;
            });
        }
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.initGame();
        this.lastTime = performance.now();
        
        // Hide cursor during gameplay
        this.canvas.classList.add('playing');
        
        this.gameLoop();
    }

    initGame() {
        // Create camera
        this.camera = new Camera(this.canvas, this.worldSize);

        // Create player
        const playerX = this.worldSize / 2;
        const playerY = this.worldSize / 2;
        this.player = new Snake(playerX, playerY, true, 'You', this.worldSize, this.playerColor);

        // Create AI snakes with varying sizes
        this.aiSnakes = [];
        for (let i = 0; i < this.numAISnakes; i++) {
            const x = randomRange(200, this.worldSize - 200);
            const y = randomRange(200, this.worldSize - 200);
            const name = randomName();
            const snake = new Snake(x, y, false, name, this.worldSize);
            
            // Give some snakes more starting mass
            if (i === 0) {
                snake.mass = 300; // Big snake
            } else if (i === 1) {
                snake.mass = 200; // Medium-large snake
            } else if (i < 4) {
                snake.mass = 150; // Medium snakes
            }
            // Rest start at default 100
            
            this.aiSnakes.push(snake);
        }

        // Create particles
        this.particles = [];
        this.spawnParticles(this.numParticles);
    }

    spawnParticles(count) {
        for (let i = 0; i < count; i++) {
            const x = randomRange(50, this.worldSize - 50);
            const y = randomRange(50, this.worldSize - 50);
            this.particles.push(new Particle(x, y, this.worldSize));
        }
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // Update player
        if (!this.player.isDead) {
            let targetPos;
            
            if (this.controlMethod === 'arrows') {
                // Use arrow keys - continue in current direction
                targetPos = new Vector2(
                    this.player.head.x + this.arrowDirection.x * 1000,
                    this.player.head.y + this.arrowDirection.y * 1000
                );
            } else if (this.controlMethod === 'joystick' && this.joystick.active) {
                // Use joystick direction
                const dx = this.joystick.currentX - this.joystick.centerX;
                const dy = this.joystick.currentY - this.joystick.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 10) {
                    targetPos = new Vector2(
                        this.player.head.x + dx * 5,
                        this.player.head.y + dy * 5
                    );
                } else {
                    targetPos = this.player.head;
                }
            } else {
                // Use mouse position
                targetPos = this.mouseWorldPosition;
            }
            
            this.player.updatePlayer(targetPos, deltaTime);
            
            // Check self collision (only after a certain length)
            if (this.player.length > 20 && this.player.checkSelfCollision()) {
                this.gameOver();
                return;
            }
            
            // Check boundary collision (with some tolerance)
            const headX = this.player.head.x;
            const headY = this.player.head.y;
            const radius = this.player.radius;
            
            if (headX - radius <= 30 || headX + radius >= this.worldSize - 30 ||
                headY - radius <= 30 || headY + radius >= this.worldSize - 30) {
                this.gameOver();
                return;
            }
        }

        // Update AI snakes
        const allSnakes = [this.player, ...this.aiSnakes];
        for (const snake of this.aiSnakes) {
            if (!snake.isDead) {
                snake.updateAI(this.particles, allSnakes, deltaTime);
                
                // Check self collision
                if (snake.checkSelfCollision()) {
                    this.killSnake(snake);
                }
            }
        }

        // Update particles
        for (const particle of this.particles) {
            particle.update(deltaTime);
        }

        // Check collisions
        this.checkCollisions();

        // Track dead snakes for respawn
        this.aiSnakes.forEach((snake, i) => {
            if (snake.isDead && !snake.respawnScheduled) {
                snake.respawnScheduled = true;
                setTimeout(() => {
                    const x = randomRange(200, this.worldSize - 200);
                    const y = randomRange(200, this.worldSize - 200);
                    const name = randomName();
                    const newSnake = new Snake(x, y, false, name, this.worldSize);
                    
                    // Give varying starting sizes
                    if (i === 0) {
                        newSnake.mass = 300;
                    } else if (i === 1) {
                        newSnake.mass = 200;
                    } else if (i < 4) {
                        newSnake.mass = 150;
                    }
                    
                    this.aiSnakes[i] = newSnake;
                }, 3000);
            }
        });

        // Maintain particle count
        if (this.particles.length < this.maxParticles) {
            this.spawnParticles(10);
        }

        // Update camera
        if (!this.player.isDead) {
            this.camera.update(this.player.head);
        }

        // Update UI
        this.updateUI();
    }

    checkCollisions() {
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => !s.isDead);

        // Check particle collisions
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            for (const snake of allSnakes) {
                const head = snake.head;
                const distance = head.distance(particle.position);
                
                if (distance < snake.radius + particle.radius) {
                    snake.eatParticle(particle.value);
                    this.particles.splice(i, 1);
                    
                    // Play eat sound
                    if (snake.isPlayer) {
                        this.sounds.eat();
                    }
                    break;
                }
            }
        }

        // Check snake-to-snake collisions
        for (let i = 0; i < allSnakes.length; i++) {
            for (let j = i + 1; j < allSnakes.length; j++) {
                const snake1 = allSnakes[i];
                const snake2 = allSnakes[j];

                // Head-to-head collision
                const distance = snake1.head.distance(snake2.head);
                const collisionRadius = snake1.radius + snake2.radius;

                if (distance < collisionRadius) {
                    // Smaller snake dies
                    if (snake1.mass > snake2.mass) {
                        snake1.eatSnake(snake2);
                        this.killSnake(snake2);
                        
                        // Play eat sound for player
                        if (snake1.isPlayer) {
                            this.sounds.eat();
                        }
                    } else {
                        snake2.eatSnake(snake1);
                        this.killSnake(snake1);
                        
                        // Play eat sound for player
                        if (snake2.isPlayer) {
                            this.sounds.eat();
                        }
                    }
                }
                
                // Check if snake1's head hits snake2's body
                if (snake1.checkBodyCollision(snake2)) {
                    this.killSnake(snake1);
                    
                    // Snake2 gets bonus mass
                    snake2.mass += snake1.mass * 0.3;
                }
                
                // Check if snake2's head hits snake1's body
                if (snake2.checkBodyCollision(snake1)) {
                    this.killSnake(snake2);
                    
                    // Snake1 gets bonus mass
                    snake1.mass += snake2.mass * 0.3;
                }
            }
        }
    }

    killSnake(snake) {
        if (snake.isDead) return; // Prevent double-killing
        
        snake.isDead = true;

        // Create particles from dead snake (one particle per mass unit)
        const particlesToSpawn = Math.min(Math.floor(snake.mass * 0.8), 200);
        const bodyLength = snake.body.length;
        
        for (let i = 0; i < particlesToSpawn; i++) {
            const segment = snake.body[Math.floor(Math.random() * bodyLength)];
            const offsetX = randomRange(-30, 30);
            const offsetY = randomRange(-30, 30);
            this.particles.push(new Particle(segment.x + offsetX, segment.y + offsetY, this.worldSize));
        }

        if (snake.isPlayer) {
            this.sounds.death();
            this.gameOver();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw particles
        for (const particle of this.particles) {
            if (this.camera.isVisible(particle.position, 50)) {
                particle.draw(this.ctx, this.camera);
            }
        }

        // Draw snakes
        const allSnakes = [this.player, ...this.aiSnakes];
        for (const snake of allSnakes) {
            if (!snake.isDead) {
                snake.draw(this.ctx, this.camera);
            }
        }

        // Draw world borders
        this.drawBorders();

        // Draw joystick
        if (this.controlMethod === 'joystick' && this.joystick.active) {
            this.drawJoystick();
        }

        // Draw boost indicator
        if (this.player && !this.player.isDead && this.player.isBoosting) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawBorders() {
        const corners = [
            new Vector2(0, 0),
            new Vector2(this.worldSize, 0),
            new Vector2(this.worldSize, this.worldSize),
            new Vector2(0, this.worldSize)
        ];

        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 10;
        this.ctx.setLineDash([20, 10]);

        for (let i = 0; i < corners.length; i++) {
            const start = this.camera.worldToScreen(corners[i]);
            const end = this.camera.worldToScreen(corners[(i + 1) % corners.length]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    drawJoystick() {
        const ctx = this.ctx;
        
        // Base circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(this.joystick.centerX, this.joystick.centerY, this.joystick.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Direction indicator
        const dx = this.joystick.currentX - this.joystick.centerX;
        const dy = this.joystick.currentY - this.joystick.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = this.joystick.radius * 0.6;
        
        let indicatorX = this.joystick.centerX + dx;
        let indicatorY = this.joystick.centerY + dy;
        
        if (distance > maxDistance) {
            const ratio = maxDistance / distance;
            indicatorX = this.joystick.centerX + dx * ratio;
            indicatorY = this.joystick.centerY + dy * ratio;
        }

        ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawGrid() {
        const gridSize = 100;
        const startX = Math.floor(this.camera.position.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.position.y / gridSize) * gridSize;
        const endX = this.camera.position.x + this.canvas.width / this.camera.zoom;
        const endY = this.camera.position.y + this.canvas.height / this.camera.zoom;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;

        for (let x = startX; x < endX; x += gridSize) {
            const screenPos = this.camera.worldToScreen(new Vector2(x, 0));
            this.ctx.beginPath();
            this.ctx.moveTo(screenPos.x, 0);
            this.ctx.lineTo(screenPos.x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = startY; y < endY; y += gridSize) {
            const screenPos = this.camera.worldToScreen(new Vector2(0, y));
            this.ctx.beginPath();
            this.ctx.moveTo(0, screenPos.y);
            this.ctx.lineTo(this.canvas.width, screenPos.y);
            this.ctx.stroke();
        }
    }

    updateUI() {
        // Update score
        const scoreEl = document.getElementById('score');
        scoreEl.textContent = `Length: ${this.player.length} | Mass: ${Math.floor(this.player.mass)}`;

        // Update leaderboard
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => !s.isDead);
        allSnakes.sort((a, b) => b.mass - a.mass);

        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';

        for (let i = 0; i < Math.min(10, allSnakes.length); i++) {
            const snake = allSnakes[i];
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry' + (snake.isPlayer ? ' player' : '');
            entry.innerHTML = `
                <span>${i + 1}. ${snake.name}</span>
                <span>${Math.floor(snake.mass)}</span>
            `;
            leaderboardList.appendChild(entry);
        }
    }

    gameOver() {
        this.isPaused = true;
        this.canvas.classList.remove('playing');
        
        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = `Your final length: ${this.player.length} | Mass: ${Math.floor(this.player.mass)}`;
        
        document.getElementById('gameOver').style.display = 'block';
    }

    showPauseMenu() {
        this.isPaused = true;
        this.canvas.classList.remove('playing');
        document.getElementById('pauseMenu').style.display = 'block';
    }

    resume() {
        this.isPaused = false;
        this.canvas.classList.add('playing');
        document.getElementById('pauseMenu').style.display = 'none';
    }

    stop() {
        this.isRunning = false;
        this.canvas.classList.remove('playing');
    }
}
