const test = require('node:test');
const assert = require('node:assert/strict');
const { Snake } = require('../src/shared/snake.js');
const { Particle } = require('../src/shared/particle.js');
const { computeAiAim } = require('../src/shared/ai.js');

function bot(x, y, mass) {
  const s = new Snake({ id: 'bot', x, y, name: 'Bot', isBot: true });
  s.mass = mass;
  return s;
}

test('returns a point with numeric coords', () => {
  const b = bot(2000, 2000, 100);
  const aim = computeAiAim(b, [new Particle(2100, 2000)], [b], 1 / 30);
  assert.equal(typeof aim.x, 'number');
  assert.equal(typeof aim.y, 'number');
});

test('seeks nearby food when no threats', () => {
  const b = bot(2000, 2000, 100);
  b.aiChangeTargetTimer = 999; // force retarget
  const food = new Particle(2200, 2000);
  const aim = computeAiAim(b, [food], [b], 1 / 30);
  // Should aim roughly toward the food (to the +x side)
  assert.ok(aim.x > 2000, `aim.x ${aim.x} should be toward food`);
});

test('flees a much bigger nearby snake', () => {
  const b = bot(2000, 2000, 100);
  b.aiChangeTargetTimer = 999;
  const threat = new Snake({ id: 'big', x: 2100, y: 2000, name: 'Big', isBot: true });
  threat.mass = 500;
  const aim = computeAiAim(b, [], [b, threat], 1 / 30);
  // Threat is to +x, so bot should aim to -x (away)
  assert.ok(aim.x < 2000, `aim.x ${aim.x} should flee to -x`);
});
