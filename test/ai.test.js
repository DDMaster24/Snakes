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

test('bot steers toward center when hugging a wall', () => {
  const b = new Snake({ id: 'bot', x: 120, y: 2000, name: 'B', isBot: true });
  b.skill = 1; b.aiChangeTargetTimer = 999;
  const aim = computeAiAim(b, [], [b], 1 / 30);
  // Wall avoidance returns the world centre deterministically; old ai.js had no such branch.
  assert.equal(aim.x, 2000);
  assert.equal(aim.y, 2000);
});

test('bot leads a moving prey (aims ahead of it)', () => {
  const b = new Snake({ id: 'bot', x: 2000, y: 2000, name: 'B', isBot: true }); b.mass = 300; b.skill = 1;
  b.aiChangeTargetTimer = 999;
  const prey = new Snake({ id: 'prey', x: 2300, y: 2000, name: 'P', isBot: true }); prey.mass = 50;
  prey.currentAngle = 0; // heading +x
  const aim = computeAiAim(b, [], [b, prey], 1 / 30);
  // New code leads ~+300 ahead (aim.x ~2600); old code aimed at prey.head.x = 2300 exactly.
  assert.ok(aim.x >= 2500, `aim.x ${aim.x} should lead well ahead of prey at 2300`);
});

test('bot boosts when closing on nearby prey', () => {
  const b = new Snake({ id: 'bot', x: 2000, y: 2000, name: 'B', isBot: true }); b.mass = 300; b.skill = 1;
  b.aiChangeTargetTimer = 999;
  const prey = new Snake({ id: 'prey', x: 2100, y: 2000, name: 'P', isBot: true }); prey.mass = 50;
  prey.currentAngle = 0;
  const aim = computeAiAim(b, [], [b, prey], 1 / 30);
  assert.equal(aim.boost, true);
});
