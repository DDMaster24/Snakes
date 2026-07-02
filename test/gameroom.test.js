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

test('snapshot exposes an events array', () => {
  const room = new GameRoom('ABCDE', { numBots: 2 });
  assert.ok(Array.isArray(room.snapshot().events));
});

test('a kill produces a kill event delivered once', () => {
  const room = new GameRoom('ABCDE', { numBots: 0 });
  const a = room.addPlayer('a', 'Big', '#fff'); a.mass = 300;
  const b = room.addPlayer('b', 'Small', '#000'); b.mass = 50;
  // Force them onto the same point so they collide head-to-head next step.
  for (let i = 0; i < b.body.length; i++) { b.body[i].x = a.head.x; b.body[i].y = a.head.y; }
  room.step(1 / 30);
  const snap1 = room.snapshot();
  const killEvents = snap1.events.filter((e) => e.type === 'kill');
  assert.ok(killEvents.length >= 1, 'expected at least one kill event');
  // delivered once: next snapshot (no new kills) has none
  const snap2 = room.snapshot();
  assert.equal(snap2.events.filter((e) => e.type === 'kill').length, 0);
});

test('particle count stays bounded under heavy scatter + boost', () => {
  const room = new GameRoom('ABCDE', { numBots: 6 });
  const a = room.addPlayer('a', 'A', '#fff'); a.mass = 200;
  for (let t = 0; t < 2000; t++) {
    room.setInput('a', 2000, 2000, true);
    room.step(1 / 30);
  }
  assert.ok(room.particles.length <= 1000, `particles ${room.particles.length} should stay <= MAX_PARTICLES`);
});
