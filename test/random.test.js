const test = require('node:test');
const assert = require('node:assert/strict');
const { makeRoomCode, randomInt, randomColor, randomName } = require('../src/shared/random.js');

test('makeRoomCode is 5 uppercase letters', () => {
  for (let i = 0; i < 50; i++) {
    assert.match(makeRoomCode(), /^[A-Z]{5}$/);
  }
});

test('randomInt stays within inclusive bounds', () => {
  for (let i = 0; i < 100; i++) {
    const n = randomInt(2, 5);
    assert.ok(n >= 2 && n <= 5, `got ${n}`);
  }
});

test('randomColor returns a hex string', () => {
  assert.match(randomColor(), /^#[0-9a-f]{6}$/i);
});

test('randomName has two words', () => {
  assert.equal(randomName().split(' ').length, 2);
});
