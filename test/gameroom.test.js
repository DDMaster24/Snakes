const test = require('node:test');
const assert = require('node:assert/strict');
const { GameRoom } = require('../server/GameRoom.js');

test('room starts with bots and particles', () => {
  const room = new GameRoom('ABCDE', { numBots: 6 });
  const snap = room.snapshot();
  assert.equal(snap.snakes.length, 6);
  assert.ok(snap.particles.length > 100);
});

test('adding a player increases snake count and human count', () => {
  const room = new GameRoom('ABCDE', { numBots: 2 });
  room.addPlayer('p1', 'You', '#00ff88');
  assert.equal(room.humanCount(), 1);
  assert.equal(room.snapshot().snakes.length, 3);
});

test('step advances without throwing and returns kills array', () => {
  const room = new GameRoom('ABCDE', { numBots: 3 });
  room.addPlayer('p1', 'You', '#00ff88');
  room.setInput('p1', 3000, 2000, false);
  let res;
  for (let i = 0; i < 30; i++) res = room.step(1 / 30);
  assert.ok(Array.isArray(res.kills));
});

test('removing the player drops human count to zero', () => {
  const room = new GameRoom('ABCDE', { numBots: 1 });
  room.addPlayer('p1', 'You', '#00ff88');
  room.removePlayer('p1');
  assert.equal(room.humanCount(), 0);
});

test('snapshot leaderboard is sorted by mass desc, max 10', () => {
  const room = new GameRoom('ABCDE', { numBots: 6 });
  const lb = room.snapshot().leaderboard;
  assert.ok(lb.length <= 10);
  for (let i = 1; i < lb.length; i++) assert.ok(lb[i - 1].mass >= lb[i].mass);
});
