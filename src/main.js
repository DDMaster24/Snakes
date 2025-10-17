// Main entry point

let game = null;
let selectedControl = 'mouse';
let selectedColor = '#00ff88';

function init() {
    const canvas = document.getElementById('gameCanvas');

    // Control method selection
    const controlButtons = [
        { id: 'mouseBtn', value: 'mouse' },
        { id: 'arrowsBtn', value: 'arrows' },
        { id: 'joystickBtn', value: 'joystick' }
    ];

    controlButtons.forEach(btn => {
        document.getElementById(btn.id).addEventListener('click', () => {
            selectedControl = btn.value;
            
            // Update button styles
            controlButtons.forEach(b => {
                const element = document.getElementById(b.id);
                if (b.value === btn.value) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            });
        });
    });

    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = option.getAttribute('data-color');
        });
    });

    // Start game button
    document.getElementById('startGameBtn').addEventListener('click', () => {
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
        
        // Update instruction text
        let controlText = 'Move your mouse to control';
        if (selectedControl === 'arrows') {
            controlText = 'Use Arrow Keys or WASD';
        } else if (selectedControl === 'joystick') {
            controlText = 'Click and drag to control';
        }
        document.getElementById('controlText').textContent = controlText;
        
        game = new Game(canvas, selectedControl, selectedColor);
        game.start();
    });

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        document.getElementById('gameOver').style.display = 'none';
        game.stop();
        game = new Game(canvas, selectedControl, selectedColor);
        game.start();
    });

    // Pause menu buttons
    document.getElementById('resumeBtn').addEventListener('click', () => {
        if (game) game.resume();
    });

    document.getElementById('mainMenuBtn').addEventListener('click', () => {
        if (game) {
            game.stop();
            game = null;
        }
        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        
        // Reset selections to defaults
        selectedControl = 'mouse';
        selectedColor = '#00ff88';
        
        document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('mouseBtn').classList.add('active');
        
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector('.color-option[data-color="#00ff88"]').classList.add('selected');
    });
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
