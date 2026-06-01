import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { encodeMessage, decodeMessages } from './server.js';

// ── encodeMessage ─────────────────────────────────────────────────────────

describe('encodeMessage', () => {
  test('produces correct Content-Length header', () => {
    const msg = { jsonrpc: '2.0', id: 1, method: 'ping' };
    const buf  = encodeMessage(msg);
    const raw  = buf.toString('utf-8');
    const body = JSON.stringify(msg);
    assert.ok(raw.startsWith(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n`));
    assert.ok(raw.endsWith(body));
  });

  test('handles unicode bodies (byte length ≠ char length)', () => {
    const msg = { text: '中文テスト' };
    const buf  = encodeMessage(msg);
    const raw  = buf.toString('utf-8');
    const body = JSON.stringify(msg);
    const expectedLen = Buffer.byteLength(body, 'utf-8');
    assert.ok(raw.includes(`Content-Length: ${expectedLen}`));
  });

  test('returns a Buffer', () => {
    assert.ok(Buffer.isBuffer(encodeMessage({})));
  });
});

// ── decodeMessages ────────────────────────────────────────────────────────

async function collect(frames: Buffer[]): Promise<unknown[]> {
  const readable = Readable.from(
    (async function* () { for (const f of frames) yield f; })()
  );
  const results: unknown[] = [];
  for await (const msg of decodeMessages(readable)) results.push(msg);
  return results;
}

describe('decodeMessages', () => {
  test('decodes a single message', async () => {
    const msg  = { jsonrpc: '2.0', id: 1, method: 'initialize' };
    const msgs = await collect([encodeMessage(msg)]);
    assert.equal(msgs.length, 1);
    assert.deepEqual(msgs[0], msg);
  });

  test('decodes multiple messages in one chunk', async () => {
    const a = encodeMessage({ id: 1, method: 'a' });
    const b = encodeMessage({ id: 2, method: 'b' });
    const msgs = await collect([Buffer.concat([a, b])]);
    assert.equal(msgs.length, 2);
    assert.deepEqual((msgs[0] as { method: string }).method, 'a');
    assert.deepEqual((msgs[1] as { method: string }).method, 'b');
  });

  test('decodes message split across two chunks', async () => {
    const msg = encodeMessage({ id: 99, method: 'split-test' });
    const mid = Math.floor(msg.length / 2);
    const msgs = await collect([msg.slice(0, mid), msg.slice(mid)]);
    assert.equal(msgs.length, 1);
    assert.deepEqual((msgs[0] as { id: number }).id, 99);
  });

  test('skips malformed JSON silently', async () => {
    const bad  = Buffer.from('Content-Length: 5\r\n\r\n{bad!');
    const good = encodeMessage({ id: 1 });
    const msgs = await collect([bad, good]);
    assert.equal(msgs.length, 1);
  });

  test('round-trips arbitrary objects', async () => {
    const obj = { a: [1, 2, 3], b: { c: true }, d: null };
    const msgs = await collect([encodeMessage(obj)]);
    assert.deepEqual(msgs[0], obj);
  });
});
