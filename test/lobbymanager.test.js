const test = require('node:test');
const assert = require('node:assert/strict');
const { LobbyManager } = require('../server/LobbyManager.js');

test('createRoom returns a unique 5-letter code and a room', () => {
  const lm = new LobbyManager();
  const { code, room } = lm.createRoom({ numBots: 2 });
  assert.match(code, /^[A-Z]{5}$/);
  assert.equal(lm.getRoom(code), room);
});

test('getRoom is case-insensitive', () => {
  const lm = new LobbyManager();
  const { code, room } = lm.createRoom({ numBots: 1 });
  assert.equal(lm.getRoom(code.toLowerCase()), room);
});

test('getRoom returns null for unknown code', () => {
  const lm = new LobbyManager();
  assert.equal(lm.getRoom('ZZZZZ'), null);
});

test('gcEmptyRooms removes rooms with no humans', () => {
  const lm = new LobbyManager();
  const { code } = lm.createRoom({ numBots: 1 });
  lm.gcEmptyRooms();
  assert.equal(lm.getRoom(code), null);
});

test('gcEmptyRooms keeps rooms with a human', () => {
  const lm = new LobbyManager();
  const { code, room } = lm.createRoom({ numBots: 1 });
  room.addPlayer('p1', 'You', '#00ff88');
  lm.gcEmptyRooms();
  assert.equal(lm.getRoom(code), room);
});

test('room with only a dead human is collected after the grace period', () => {
  const lm = new LobbyManager();
  const { code, room } = lm.createRoom({ numBots: 0 });
  const p = room.addPlayer('p1', 'You', '#00ff88');
  p.isDead = true;
  for (let i = 0; i < 30 * 30 + 5; i++) room.step(1 / 30);
  lm.gcEmptyRooms();
  assert.equal(lm.getRoom(code), null);
});

test('room with a live human is NOT collected', () => {
  const lm = new LobbyManager();
  const { code, room } = lm.createRoom({ numBots: 0 });
  room.addPlayer('p1', 'You', '#00ff88'); // alive
  for (let i = 0; i < 30 * 30 + 5; i++) room.step(1 / 30);
  lm.gcEmptyRooms();
  assert.equal(lm.getRoom(code), room);
});
