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
