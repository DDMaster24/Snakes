const test = require('node:test');
const assert = require('node:assert/strict');
const { Particle } = require('../src/shared/particle.js');

test('particle stores position and default value', () => {
  const p = new Particle(100, 200);
  assert.equal(p.position.x, 100);
  assert.equal(p.position.y, 200);
  assert.equal(p.value, 1);
});

test('toState is serialisable', () => {
  const st = new Particle(1, 2).toState();
  assert.deepEqual(
    { x: st.x, y: st.y, r: st.r, hasColor: typeof st.color === 'string' },
    { x: 1, y: 2, r: 5, hasColor: true }
  );
});
