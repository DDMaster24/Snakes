const test = require('node:test');
const assert = require('node:assert/strict');
const { Vector2 } = require('../src/shared/vector2.js');

test('add returns component sum', () => {
  const r = new Vector2(1, 2).add(new Vector2(3, 4));
  assert.deepEqual({ x: r.x, y: r.y }, { x: 4, y: 6 });
});

test('distance is euclidean', () => {
  assert.equal(new Vector2(0, 0).distance(new Vector2(3, 4)), 5);
});

test('normalize of zero vector is zero', () => {
  const r = new Vector2(0, 0).normalize();
  assert.deepEqual({ x: r.x, y: r.y }, { x: 0, y: 0 });
});

test('normalize yields unit length', () => {
  const r = new Vector2(0, 5).normalize();
  assert.deepEqual({ x: r.x, y: r.y }, { x: 0, y: 1 });
});
