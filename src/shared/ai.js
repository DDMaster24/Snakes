// Bot decision logic. Produces an aim point for a bot snake each tick.
(function (root) {
  const V = (typeof module !== 'undefined' && module.exports)
    ? require('./vector2.js') : root;
  const R = (typeof module !== 'undefined' && module.exports)
    ? require('./random.js') : root;
  const C = (typeof module !== 'undefined' && module.exports)
    ? require('./constants.js') : root;
  const Vector2 = V.Vector2;
  const randomRange = R.randomRange;
  const CONSTANTS = C.CONSTANTS;

  function pickTarget(bot, particles, others) {
    const head = bot.head;

    // 1. Avoid own body: if a mid/far segment is too close, steer directly away.
    const safe = bot.radius * 4;
    for (let i = 15; i < bot.body.length; i++) {
      const seg = bot.body[i];
      if (head.distance(seg) < safe * 2) {
        const ang = Math.atan2(head.y - seg.y, head.x - seg.x);
        return new Vector2(head.x + Math.cos(ang) * 400, head.y + Math.sin(ang) * 400);
      }
    }

    // 2. Flee bigger snakes within 220.
    for (const s of others) {
      if (s === bot || s.isDead) continue;
      if (s.mass > bot.mass * 1.2 && head.distance(s.head) < 220) {
        const ang = Math.atan2(head.y - s.head.y, head.x - s.head.x);
        return new Vector2(head.x + Math.cos(ang) * 300, head.y + Math.sin(ang) * 300);
      }
    }

    // 3. Hunt smaller snakes within 450.
    let prey = null, preyDist = Infinity;
    for (const s of others) {
      if (s === bot || s.isDead) continue;
      if (s.mass < bot.mass * 0.7) {
        const d = head.distance(s.head);
        if (d < 450 && d < preyDist) { prey = s; preyDist = d; }
      }
    }
    if (prey) return new Vector2(prey.head.x, prey.head.y);

    // 4. Nearest food within 700.
    let food = null, foodDist = Infinity;
    for (const p of particles) {
      const d = head.distance(p.position);
      if (d < 700 && d < foodDist) { foodDist = d; food = p; }
    }
    if (food) return new Vector2(food.position.x, food.position.y);

    // 5. Wander near center.
    const c = CONSTANTS.WORLD_SIZE / 2;
    return new Vector2(randomRange(c - 500, c + 500), randomRange(c - 500, c + 500));
  }

  function computeAiAim(bot, particles, allSnakes, dt) {
    bot.aiChangeTargetTimer += dt;
    if (!bot.targetPosition || bot.aiChangeTargetTimer > bot.aiChangeTargetInterval) {
      bot.aiChangeTargetTimer = 0;
      bot.targetPosition = pickTarget(bot, particles, allSnakes);
    }
    return { x: bot.targetPosition.x, y: bot.targetPosition.y };
  }

  const api = { computeAiAim };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof self !== 'undefined' ? self : this);
