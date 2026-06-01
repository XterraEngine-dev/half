import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, '../../bin/half.js');

// ── Wire helpers ──────────────────────────────────────────────────────────

function frame(msg: object): Buffer {
  const body = JSON.stringify(msg);
  return Buffer.from(`Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n${body}`);
}

function sendMsg(proc: ChildProcess, msg: object): void {
  proc.stdin!.write(frame(msg));
}

async function recvMsg(proc: ChildProcess, timeoutMs = 3000): Promise<unknown> {
  return new Promise((res, rej) => {
    let buf = Buffer.alloc(0);
    const timer = setTimeout(() => rej(new Error('MCP response timeout')), timeoutMs);

    const onData = (chunk: Buffer | string) => {
      buf = Buffer.concat([buf, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)]);
      const sep = buf.indexOf('\r\n\r\n');
      if (sep === -1) return;
      const header = buf.slice(0, sep).toString();
      const m = header.match(/Content-Length:\s*(\d+)/i);
      if (!m) return;
      const len = parseInt(m[1], 10);
      const bodyStart = sep + 4;
      if (buf.length < bodyStart + len) return;
      clearTimeout(timer);
      proc.stdout!.off('data', onData);
      try { res(JSON.parse(buf.slice(bodyStart, bodyStart + len).toString())); }
      catch (e) { rej(e); }
    };

    proc.stdout!.on('data', onData);
  });
}

async function exchange(proc: ChildProcess, msg: object): Promise<Record<string, unknown>> {
  sendMsg(proc, msg);
  return recvMsg(proc) as Promise<Record<string, unknown>>;
}

// ── Fixtures ──────────────────────────────────────────────────────────────

function half(args: string[], cwd = process.cwd()) {
  return spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf-8' });
}

function spawnMcp(cwd: string): ChildProcess {
  return spawn(process.execPath, [BIN, 'mcp'], {
    cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

let root = '';
let proj = '';

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'half-mcp-e2e-'));
  half(['new', 'proj', '--backend', 'node'], root);
  proj = join(root, 'proj');
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

// ── Tests ─────────────────────────────────────────────────────────────────

test('initialize handshake', async () => {
  const srv = spawnMcp(proj);
  try {
    const resp = await exchange(srv, {
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0' } },
    });
    assert.equal(resp['jsonrpc'], '2.0');
    assert.equal(resp['id'], 1);
    const result = resp['result'] as Record<string, unknown>;
    assert.equal(result['protocolVersion'], '2024-11-05');
    assert.equal((result['serverInfo'] as Record<string, unknown>)['name'], 'half');
  } finally {
    srv.kill();
  }
});

test('tools/list returns all expected tools', async () => {
  const srv = spawnMcp(proj);
  try {
    await exchange(srv, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    sendMsg(srv, { jsonrpc: '2.0', method: 'notifications/initialized' });
    const resp   = await exchange(srv, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const result = resp['result'] as Record<string, unknown>;
    const tools  = (result['tools'] as Array<{ name: string }>).map(t => t.name);
    for (const name of ['task_list', 'task_pick', 'task_done', 'task_block', 'task_add', 'log_event']) {
      assert.ok(tools.includes(name), `missing tool: ${name}`);
    }
  } finally {
    srv.kill();
  }
});

test('task_add → task_list → task_pick → task_done lifecycle', async () => {
  const srv = spawnMcp(proj);
  try {
    await exchange(srv, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });

    // add
    const addResp = await exchange(srv, {
      jsonrpc: '2.0', id: 2, method: 'tools/call',
      params: { name: 'task_add', arguments: { title: 'E2E task', priority: 'high' } },
    });
    const task = JSON.parse(((addResp['result'] as Record<string, unknown>)['content'] as Array<{ text: string }>)[0].text);
    assert.equal(task.title, 'E2E task');
    assert.equal(task.status, 'pending');
    const id: string = task.id;

    // list
    const listResp = await exchange(srv, {
      jsonrpc: '2.0', id: 3, method: 'tools/call',
      params: { name: 'task_list', arguments: { status: 'pending' } },
    });
    const tasks = JSON.parse(((listResp['result'] as Record<string, unknown>)['content'] as Array<{ text: string }>)[0].text);
    assert.equal(tasks.length, 1);

    // pick
    const pickResp = await exchange(srv, {
      jsonrpc: '2.0', id: 4, method: 'tools/call',
      params: { name: 'task_pick', arguments: {} },
    });
    const picked = JSON.parse(((pickResp['result'] as Record<string, unknown>)['content'] as Array<{ text: string }>)[0].text);
    assert.equal(picked.status, 'in_progress');

    // done
    const doneResp = await exchange(srv, {
      jsonrpc: '2.0', id: 5, method: 'tools/call',
      params: { name: 'task_done', arguments: { id } },
    });
    const done = JSON.parse(((doneResp['result'] as Record<string, unknown>)['content'] as Array<{ text: string }>)[0].text);
    assert.equal(done.status, 'done');
    assert.ok(done.doneAt);
  } finally {
    srv.kill();
  }
});

test('unknown tool returns isError result', async () => {
  const srv = spawnMcp(proj);
  try {
    await exchange(srv, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    const resp   = await exchange(srv, {
      jsonrpc: '2.0', id: 2, method: 'tools/call',
      params: { name: 'does_not_exist', arguments: {} },
    });
    const result = resp['result'] as Record<string, unknown>;
    assert.equal(result['isError'], true);
  } finally {
    srv.kill();
  }
});

test('unknown JSON-RPC method returns error', async () => {
  const srv = spawnMcp(proj);
  try {
    await exchange(srv, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    const resp = await exchange(srv, { jsonrpc: '2.0', id: 2, method: 'no_such_method' });
    assert.ok(resp['error']);
    assert.equal((resp['error'] as Record<string, unknown>)['code'], -32601);
  } finally {
    srv.kill();
  }
});

test('log_event writes to event log', async () => {
  const srv = spawnMcp(proj);
  try {
    await exchange(srv, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    const resp   = await exchange(srv, {
      jsonrpc: '2.0', id: 2, method: 'tools/call',
      params: { name: 'log_event', arguments: { message: 'Agent started via MCP', type: 'agent.start' } },
    });
    const body = JSON.parse(((resp['result'] as Record<string, unknown>)['content'] as Array<{ text: string }>)[0].text);
    assert.equal(body.logged, true);
  } finally {
    srv.kill();
  }
});
