const test = require('node:test');
const assert = require('node:assert/strict');
const { Snake } = require('../src/shared/snake.js');
const { Particle } = require('../src/shared/particle.js');
const { eatParticles, resolveSnakeCollisions, hitsWorldEdge, hitsSelf } = require('../src/shared/collisions.js');

function snakeAt(id, x, y, mass) {
  const s = new Snake({ id, x, y, name: id, isBot: false });
  s.mass = mass;
  return s;
}

test('snake eats an overlapping particle and grows', () => {
  const s = snakeAt('a', 100, 100, 100);
  const particles = [new Particle(100, 100)];
  const m0 = s.mass;
  const eaten = eatParticles([s], particles);
  assert.equal(eaten, 1);
  assert.equal(particles.length, 0);
  assert.ok(s.mass > m0);
});

test('distant particle is not eaten', () => {
  const s = snakeAt('a', 100, 100, 100);
  const particles = [new Particle(3000, 3000)];
  assert.equal(eatParticles([s], particles), 0);
  assert.equal(particles.length, 1);
});

test('head-to-head: bigger eats smaller', () => {
  const big = snakeAt('big', 500, 500, 300);
  const small = snakeAt('small', 500, 500, 100);
  const kills = resolveSnakeCollisions([big, small]);
  assert.equal(small.isDead, true);
  assert.equal(big.isDead, false);
  assert.ok(kills.some((k) => k.deadId === 'small'));
});

test('head into body kills the intruder', () => {
  const victimBody = snakeAt('body', 500, 500, 300);
  // Put intruder head onto a mid-body segment of victimBody
  const target = victimBody.body[8];
  const intruder = snakeAt('intruder', target.x, target.y, 100);
  const kills = resolveSnakeCollisions([victimBody, intruder]);
  assert.equal(intruder.isDead, true);
  assert.ok(kills.some((k) => k.deadId === 'intruder'));
});

test('hitsWorldEdge true near the wall', () => {
  const s = snakeAt('a', 5, 2000, 100);
  assert.equal(hitsWorldEdge(s), true);
});

test('hitsWorldEdge false in open space', () => {
  const s = snakeAt('a', 2000, 2000, 100);
  assert.equal(hitsWorldEdge(s), false);
});

test('hitsSelf false for short snake', () => {
  const s = snakeAt('a', 2000, 2000, 100);
  assert.equal(hitsSelf(s), false);
});
