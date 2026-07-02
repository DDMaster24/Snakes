// Wires lobby UI -> networking -> render loop.
(function () {
  const canvas = document.getElementById('gameCanvas');
  const menu = document.getElementById('menu');
  const instructions = document.getElementById('instructions');
  const gameOver = document.getElementById('gameOver');

  const nameInput = document.getElementById('playerName');
  const joinCode = document.getElementById('joinCode');
  const lobbyMsg = document.getElementById('lobbyMsg');
  const lobbyBanner = document.getElementById('lobbyBanner');

  let selectedControl = 'mouse';
  let selectedColor = '#00ff88';

  // Control + color pickers (reuse existing buttons if present)
  document.querySelectorAll('.color-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach((o) => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedColor = opt.getAttribute('data-color');
    });
  });
  const ctrlMap = { mouseBtn: 'mouse', arrowsBtn: 'arrows', joystickBtn: 'joystick' };
  Object.keys(ctrlMap).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => {
      selectedControl = ctrlMap[id];
      document.querySelectorAll('.control-btn').forEach((b) => b.classList.remove('active'));
      el.classList.add('active');
    });
  });

  const net = new NetClient();
  // Renderer and InputController are created only once to avoid stacking event listeners.
  // InputController binds listeners to document/canvas in its constructor with no cleanup,
  // so re-constructing on every respawn would leak listeners. We guard with null-checks here
  // and call renderer.setFollowId() each time startGame() is invoked instead.
  let renderer = null;
  let input = null;
  let running = false;
  let lastSnapAt = 0;

  function playerName() { return (nameInput && nameInput.value.trim()) || 'Player'; }

  net.onError = (m) => { lobbyMsg.textContent = m.message || 'Error'; };
  net.onCreated = (m) => {
    lobbyBanner.style.display = 'block';
    lobbyBanner.textContent = `Lobby code: ${m.code} — share it!`;
    startGame(m.playerId);
  };
  net.onJoined = (m) => { startGame(m.playerId); };
  net.onState = () => { lastSnapAt = performance.now(); updateHUD(); };
  net.onDead = (m) => showGameOver(m.by);

  async function ensureConnected() {
    if (net.ws && net.ws.readyState === WebSocket.OPEN) return;
    try { await net.connect(); }
    catch { lobbyMsg.textContent = 'Could not reach server'; throw new Error('no-conn'); }
  }

  document.getElementById('createLobbyBtn').addEventListener('click', async () => {
    lobbyMsg.textContent = '';
    try { await ensureConnected(); net.create(playerName(), selectedColor); } catch {}
  });
  document.getElementById('joinLobbyBtn').addEventListener('click', async () => {
    lobbyMsg.textContent = '';
    const code = joinCode.value.trim().toUpperCase();
    if (code.length !== 5) { lobbyMsg.textContent = 'Enter a 5-letter code'; return; }
    try { await ensureConnected(); net.join(code, playerName(), selectedColor); } catch {}
  });

  function startGame(playerId) {
    menu.classList.add('hidden');
    if (instructions) instructions.classList.add('hidden');
    if (gameOver) gameOver.style.display = 'none';
    canvas.classList.add('playing');

    // Guard: create Renderer and InputController only once to prevent listener leaks.
    if (!renderer) renderer = new Renderer(canvas);
    if (!input) input = new InputController(canvas, selectedControl);
    // Always update the follow target for the current session/respawn.
    renderer.setFollowId(playerId);

    running = true;
    requestAnimationFrame(loop);
  }

  function loop() {
    if (!running) return;
    const [prev, last] = net.latestTwo();
    if (last) {
      // 1-snapshot interpolation delay based on ~tick interval.
      const dtMs = 1000 / 30;
      const alpha = Math.min(1, (performance.now() - lastSnapAt) / dtMs);
      const me = last.snakes.find((s) => s.id === net.playerId);
      renderer.followHead = me ? me.segments[0] : renderer.followHead;
      renderer.render(prev, last, alpha);

      if (input) {
        const aim = input.getAim(renderer);
        net.sendInput(aim.x, aim.y, input.boost);
      }
    }
    requestAnimationFrame(loop);
  }

  function updateHUD() {
    const [, last] = net.latestTwo();
    if (!last) return;
    const me = last.snakes.find((s) => s.id === net.playerId);
    const score = document.getElementById('score');
    if (score && me) score.textContent = `Mass: ${Math.floor(me.mass)} | Length: ${me.segments.length}`;

    const list = document.getElementById('leaderboardList');
    if (list) {
      list.innerHTML = '';
      last.leaderboard.forEach((row, i) => {
        const el = document.createElement('div');
        el.className = 'leaderboard-entry' + (me && row.name === me.name ? ' player' : '');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${i + 1}. ${row.name}`;
        const massSpan = document.createElement('span');
        massSpan.textContent = String(row.mass);
        el.appendChild(nameSpan);
        el.appendChild(massSpan);
        list.appendChild(el);
      });
    }
  }

  function showGameOver(by) {
    running = false;
    canvas.classList.remove('playing');
    const fs = document.getElementById('finalScore');
    if (fs) fs.textContent = by === 'wall' ? 'You hit the wall!' : `You were eaten by ${by}!`;
    if (gameOver) gameOver.style.display = 'block';
  }

  // Respawn / back to menu from the existing game-over buttons.
  const restart = document.getElementById('restartBtn');
  if (restart) restart.addEventListener('click', () => {
    if (gameOver) gameOver.style.display = 'none';
    net.join(net.code, playerName(), selectedColor);
  });

  // Pause overlay. NOTE: this is multiplayer — the server keeps simulating while
  // the overlay is open, so your snake keeps moving. This is just a menu escape hatch.
  const pauseMenu = document.getElementById('pauseMenu');
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && running && pauseMenu) {
      pauseMenu.style.display = (pauseMenu.style.display === 'block') ? 'none' : 'block';
    }
  });
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) resumeBtn.addEventListener('click', () => {
    if (pauseMenu) pauseMenu.style.display = 'none';
  });

  const toMenu = document.getElementById('mainMenuBtn');
  if (toMenu) toMenu.addEventListener('click', () => {
    running = false; net.leave();
    if (gameOver) gameOver.style.display = 'none';
    if (pauseMenu) pauseMenu.style.display = 'none';
    menu.classList.remove('hidden');
  });
})();
