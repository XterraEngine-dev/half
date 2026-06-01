import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, '../../bin/half.js');

function half(args: string[], cwd = process.cwd()): { out: string; err: string; code: number } {
  const r = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf-8' });
  return {
    out:  r.stdout ?? '',
    err:  r.stderr ?? '',
    code: r.status ?? 1,
  };
}

let root = '';

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'half-e2e-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

// ── CLI basics ────────────────────────────────────────────────

test('half help exits 0 and shows commands', () => {
  const r = half(['help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /half new/);
  assert.match(r.out, /half task/);
  assert.match(r.out, /half watch/);
});

test('unknown command exits 1', () => {
  const r = half(['notacommand']);
  assert.equal(r.code, 1);
});

// ── half new ──────────────────────────────────────────────────

test('half new --dry-run prints file list', () => {
  const r = half(['new', 'myapp', '--backend', 'go', '--dry-run'], root);
  assert.equal(r.code, 0);
  assert.match(r.out, /main\.go/);
  assert.match(r.out, /go\.mod/);
  assert.match(r.out, /CLAUDE\.md/);
  assert.match(r.out, /tasks\.json/);
});

test('half new --frontend vue --dry-run includes vue files', () => {
  const r = half(['new', 'app', '--frontend', 'vue', '--dry-run'], root);
  assert.equal(r.code, 0);
  assert.match(r.out, /App\.vue/);
});

test('half new --db postgres --docker --dry-run includes docker', () => {
  const r = half(['new', 'app', '--backend', 'go', '--db', 'postgres', '--docker', '--dry-run'], root);
  assert.equal(r.code, 0);
  assert.match(r.out, /docker-compose\.yml/);
  assert.match(r.out, /Makefile/);
  assert.match(r.out, /001_init\.sql/);
});

test('half new --qa --dry-run includes playwright', () => {
  const r = half(['new', 'app', '--qa', '--dry-run'], root);
  assert.equal(r.code, 0);
  assert.match(r.out, /playwright\.config\.ts/);
});

test('half new invalid name exits 1', () => {
  const r = half(['new', 'My App'], root);
  assert.equal(r.code, 1);
});

test('half new unknown backend exits 1', () => {
  const r = half(['new', 'app', '--backend', 'ruby'], root);
  assert.equal(r.code, 1);
});

test('half new scaffolds real files', () => {
  const r = half(['new', 'realapp', '--backend', 'go'], root);
  assert.equal(r.code, 0);
  assert.match(r.out, /Scaffolded/);
});

// ── half task ─────────────────────────────────────────────────

test('task add + list lifecycle', () => {
  half(['new', 'proj', '--backend', 'go'], root);
  const projRoot = join(root, 'proj');

  const add = half(['task', 'add', 'Fix login bug', '--priority', 'high', '--tags', 'backend'], projRoot);
  assert.equal(add.code, 0);
  assert.match(add.out, /added → t_/);

  const list = half(['task', 'list'], projRoot);
  assert.equal(list.code, 0);
  assert.match(list.out, /Fix login bug/);
  assert.match(list.out, /pending/);
});

test('task pick marks in_progress', () => {
  half(['new', 'proj'], root);
  const p = join(root, 'proj');
  half(['task', 'add', 'Do work', '--priority', 'high'], p);

  const pick = half(['task', 'pick'], p);
  assert.equal(pick.code, 0);
  assert.match(pick.out, /in_progress/);
});

test('task done marks done', () => {
  half(['new', 'proj'], root);
  const p = join(root, 'proj');
  half(['task', 'add', 'Work'], p);
  const pick = half(['task', 'pick'], p);
  const id   = pick.out.match(/t_[a-f0-9]{6}/)?.[0] ?? '';
  assert.ok(id, 'no id found in pick output');

  const done = half(['task', 'done', id], p);
  assert.equal(done.code, 0);
  assert.match(done.out, /done →/);
});

test('task progress updates percentage', () => {
  half(['new', 'proj'], root);
  const p = join(root, 'proj');
  half(['task', 'add', 'Work'], p);
  const pick = half(['task', 'pick'], p);
  const id   = pick.out.match(/t_[a-f0-9]{6}/)?.[0] ?? '';

  const prog = half(['task', 'progress', id, '50'], p);
  assert.equal(prog.code, 0);
  assert.match(prog.out, /50%/);
});

test('task progress 100 auto-marks done', () => {
  half(['new', 'proj'], root);
  const p = join(root, 'proj');
  half(['task', 'add', 'Work'], p);
  const pick = half(['task', 'pick'], p);
  const id   = pick.out.match(/t_[a-f0-9]{6}/)?.[0] ?? '';

  const prog = half(['task', 'progress', id, '100'], p);
  assert.equal(prog.code, 0);
  assert.match(prog.out, /auto-done/);
});

test('task assign sets assignee', () => {
  half(['new', 'proj'], root);
  const p = join(root, 'proj');
  half(['task', 'add', 'Work'], p);
  const add = half(['task', 'list'], p);
  const id  = add.out.match(/t_[a-f0-9]{6}/)?.[0] ?? '';

  const res = half(['task', 'assign', id, 'luis'], p);
  assert.equal(res.code, 0);
  assert.match(res.out, /@luis/);
});

test('task list --status filters', () => {
  half(['new', 'proj'], root);
  const p = join(root, 'proj');
  half(['task', 'add', 'A'], p);
  half(['task', 'add', 'B'], p);
  const pick = half(['task', 'pick'], p);
  const id   = pick.out.match(/t_[a-f0-9]{6}/)?.[0] ?? '';
  half(['task', 'done', id], p);

  const done = half(['task', 'list', '--status', 'done'], p);
  assert.match(done.out, /done/);
  const pending = half(['task', 'list', '--status', 'pending'], p);
  // 1 should still be pending
  assert.match(pending.out, /pending/);
});

// ── half prompt ───────────────────────────────────────────────

test('half prompt raw outputs non-empty text', () => {
  half(['new', 'proj'], root);
  const r = half(['prompt', 'raw'], join(root, 'proj'));
  assert.equal(r.code, 0);
  assert.match(r.out, /single-task/);
  assert.match(r.out, /half task progress/);
});
