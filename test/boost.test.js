const test = require('node:test');
const assert = require('node:assert/strict');
const { GameRoom } = require('../server/GameRoom.js');

test('a boosting snake loses mass over time', () => {
  const room = new GameRoom('ABCDE', { numBots: 0 });
  const p = room.addPlayer('p1', 'You', '#00ff88');
  p.mass = 100;
  for (let i = 0; i < 60; i++) { room.setInput('p1', 3000, 2000, true); room.step(1 / 30); }
  assert.ok(p.mass < 100, `boosting mass ${p.mass} should drop below 100`);
});

test('a non-boosting snake does not lose mass to boost', () => {
  const room = new GameRoom('ABCDE', { numBots: 0 });
  const p = room.addPlayer('p1', 'You', '#00ff88');
  p.mass = 100;
  for (let i = 0; i < 60; i++) { room.setInput('p1', 3000, 2000, false); room.step(1 / 30); }
  assert.ok(p.mass >= 100, `idle mass ${p.mass} should not drop`);
});

test('a tiny snake cannot boost', () => {
  const room = new GameRoom('ABCDE', { numBots: 0 });
  const p = room.addPlayer('p1', 'You', '#00ff88');
  p.mass = 12;
  room.setInput('p1', 3000, 2000, true);
  room.step(1 / 30);
  assert.equal(p.isBoosting, false);
});
