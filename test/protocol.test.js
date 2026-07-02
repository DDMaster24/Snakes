const test = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { createServer } = require('../server.js');

function once(ws, predicate) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 3000);
    ws.on('message', (buf) => {
      const msg = JSON.parse(buf.toString());
      if (predicate(msg)) { clearTimeout(t); resolve(msg); }
    });
  });
}

test('create then join with the code connects two players', async () => {
  const { server, close } = createServer(0);
  await new Promise((r) => server.on('listening', r));
  const port = server.address().port;

  const host = new WebSocket(`ws://127.0.0.1:${port}`);
  await new Promise((r) => host.on('open', r));
  host.send(JSON.stringify({ type: 'create', name: 'Host', color: '#00ff88' }));
  const created = await once(host, (m) => m.type === 'created');
  assert.match(created.code, /^[A-Z]{5}$/);

  const guest = new WebSocket(`ws://127.0.0.1:${port}`);
  await new Promise((r) => guest.on('open', r));
  guest.send(JSON.stringify({ type: 'join', code: created.code, name: 'Guest', color: '#ff6b6b' }));
  const joined = await once(guest, (m) => m.type === 'joined');
  assert.equal(joined.code, created.code);

  // Both should receive state broadcasts.
  const state = await once(host, (m) => m.type === 'state');
  assert.ok(state.snakes.length >= 2);

  host.close(); guest.close();
  await close();
});

test('joining an unknown code returns an error', async () => {
  const { server, close } = createServer(0);
  await new Promise((r) => server.on('listening', r));
  const port = server.address().port;
  const ws = new WebSocket(`ws://127.0.0.1:${port}`);
  await new Promise((r) => ws.on('open', r));
  ws.send(JSON.stringify({ type: 'join', code: 'ZZZZZ', name: 'X', color: '#fff' }));
  const err = await once(ws, (m) => m.type === 'error');
  assert.match(err.message, /not found/i);
  ws.close();
  await close();
});
