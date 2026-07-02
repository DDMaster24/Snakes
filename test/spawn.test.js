const test = require('node:test');
const assert = require('node:assert/strict');
const { GameRoom } = require('../server/GameRoom.js');

test('a newly added player spawns away from existing snakes', () => {
  const room = new GameRoom('ABCDE', { numBots: 6 });
  const p = room.addPlayer('p1', 'You', '#00ff88');
  let nearest = Infinity;
  for (const s of room.snakes.values()) {
    if (s === p || s.isDead) continue;
    nearest = Math.min(nearest, p.head.distance(s.head));
  }
  assert.ok(nearest >= 150, `nearest snake ${nearest} should be comfortably far`);
});
