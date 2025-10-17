# 🐍 Snakes IO Game

A modern, Snake.io-inspired game built with Electron and JavaScript. Control your snake with your mouse, eat particles to grow, and compete against AI opponents!

## ✨ Features

- **Smooth Mouse Controls**: Your snake follows your mouse cursor for precise control
- **Large Playing Field**: Explore a massive 4000x4000 world with dynamic camera
- **AI Opponents**: 6 AI snakes with intelligent behavior competing for food
- **Glowing Visual Effects**: Beautiful particle effects and glowing snakes
- **Leaderboard**: Real-time ranking of all players
- **Eat to Grow**: Consume particles and smaller snakes to increase your mass
- **Snake.io Gameplay**: Classic mechanics with modern polish

## 🎮 How to Play

1. **Move**: Control your snake by moving your mouse
2. **Eat Particles**: Collect glowing particles scattered across the map
3. **Grow Bigger**: Each particle increases your mass and length
4. **Hunt Others**: Eat smaller snakes by colliding with their head
5. **Avoid Yourself**: Don't run into your own body or you'll die!

## 🚀 Quick Start

### Play in Browser (Easiest)
```bash
npm install
npm run web
```
Then open http://localhost:3000 in your browser

### Run as Desktop App
```bash
npm install
npm start
```

### Build Executable
```bash
npm install
npm run build
```
The installer will be in the `dist` folder.

## 🛠️ Technology Stack

- **Electron**: Cross-platform desktop app framework
- **HTML5 Canvas**: High-performance 2D rendering
- **JavaScript**: Pure vanilla JS, no frameworks needed
- **Express**: Simple web server for browser version

## 📁 Project Structure

```
snakes-io-game/
├── src/
│   ├── main.js          # Entry point
│   ├── game.js          # Main game loop and logic
│   ├── snake.js         # Snake class (player & AI)
│   ├── particle.js      # Food particle system
│   ├── camera.js        # Camera following system
│   └── utils.js         # Helper functions
├── index.html           # Game UI
├── electron.js          # Electron wrapper
├── server.js            # Web server
└── package.json         # Dependencies
```

## 🎯 Game Mechanics

- **Starting Mass**: 100
- **Starting Length**: 10 segments
- **World Size**: 4000x4000 units
- **Particle Value**: 1 mass per particle
- **Snake Eating**: Gain 50% of eaten snake's mass
- **Death Penalty**: Drop particles worth 50% of your mass

## 🏆 Tips & Tricks

- Smaller snakes are faster and more agile
- Circle around bigger snakes to trap them
- Use boost (coming soon!) to escape danger
- Stay near food clusters to grow quickly
- Watch the leaderboard to track your competition

## 📦 Distribution Options

### Option 1: GitHub Releases
1. Build the installer: `npm run build`
2. Upload `dist/Snakes IO Game Setup.exe` to GitHub Releases
3. Users download and install

### Option 2: Web Version
1. Deploy to Vercel/Netlify (static hosting)
2. Users play directly in browser
3. No installation needed

### Option 3: Itch.io
1. Create account on itch.io
2. Upload build as HTML5 or Windows game
3. Built-in download/play system

## 🔮 Future Features

- [ ] Boost ability (double speed temporarily)
- [ ] On-screen joystick for touch devices
- [ ] Power-ups (invincibility, magnet, etc.)
- [ ] Different game modes (team, battle royale)
- [ ] Skins and customization
- [ ] Sound effects and music
- [ ] Multiplayer support

## 🐛 Known Issues

- None yet! Report issues on GitHub

## 📝 License

MIT License - Feel free to use and modify!

## 👨‍💻 Credits

Created with ❤️ using AI-assisted development.

---

**Enjoy the game!** 🎮🐍
