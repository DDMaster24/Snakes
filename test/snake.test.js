const test = require('node:test');
const assert = require('node:assert/strict');
const { Snake } = require('../src/shared/snake.js');

function make() {
  return new Snake({ id: 'p1', x: 2000, y: 2000, name: 'You', color: '#00ff88', isBot: false });
}

test('new snake starts with 10 segments and default mass', () => {
  const s = make();
  assert.equal(s.body.length, 10);
  assert.equal(s.mass, 100);
  assert.equal(s.isDead, false);
});

test('radius grows with mass', () => {
  const s = make();
  const r0 = s.radius;
  s.eatParticleValue(50);
  assert.ok(s.radius > r0);
});

test('step moves the head toward the aim', () => {
  const s = make();
  s.currentAngle = 0; // ensure no turn lag masks movement
  s.setAim(3000, 2000); // aim to the right (+x)
  const x0 = s.head.x;
  for (let i = 0; i < 5; i++) s.step(1 / 30);
  assert.ok(s.head.x > x0, `head.x ${s.head.x} should exceed ${x0}`);
});

test('eating grows target length', () => {
  const s = make();
  s.eatParticleValue(20);
  for (let i = 0; i < 40; i++) s.step(1 / 30);
  assert.ok(s.body.length > 10);
});

test('boost increases distance travelled per tick', () => {
  const a = make(); a.currentAngle = 0; a.setAim(4000, 2000);
  const b = make(); b.currentAngle = 0; b.setAim(4000, 2000); b.setBoost(true);
  a.step(1 / 30); b.step(1 / 30);
  const da = a.head.x - 2000, db = b.head.x - 2000;
  assert.ok(db > da, `boosted ${db} should exceed normal ${da}`);
});

test('toState returns serialisable snapshot', () => {
  const s = make();
  const st = s.toState();
  assert.equal(st.id, 'p1');
  assert.equal(typeof st.radius, 'number');
  assert.ok(Array.isArray(st.segments));
  assert.equal(typeof st.segments[0].x, 'number');
});
