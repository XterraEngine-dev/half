import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { initStore } from '../task/task-store.js';
import { handleToolCall, TOOL_DEFINITIONS } from './tools.js';

let root = '';

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'half-mcp-test-'));
  await initStore(root, 'mcp-test-project');
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

// ── TOOL_DEFINITIONS ──────────────────────────────────────────────────────

describe('TOOL_DEFINITIONS', () => {
  test('all required tools are present', () => {
    const names = TOOL_DEFINITIONS.map(t => t.name);
    for (const expected of [
      'task_list', 'task_pick', 'task_done', 'task_block',
      'task_add',  'task_show', 'task_assign', 'task_progress', 'log_event',
    ]) {
      assert.ok(names.includes(expected), `missing tool: ${expected}`);
    }
  });

  test('every tool has a description and inputSchema', () => {
    for (const tool of TOOL_DEFINITIONS) {
      assert.ok(tool.description.length > 0,       `${tool.name}: empty description`);
      assert.equal(tool.inputSchema.type, 'object', `${tool.name}: schema must be object`);
    }
  });
});

// ── handleToolCall ────────────────────────────────────────────────────────

describe('task_add', () => {
  test('creates task and returns it', async () => {
    const r = await handleToolCall(root, 'task_add', { title: 'Write tests' });
    assert.ok(!r.isError);
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.title, 'Write tests');
    assert.equal(task.status, 'pending');
    assert.ok(task.id.startsWith('t_'));
  });

  test('respects priority and tags', async () => {
    const r = await handleToolCall(root, 'task_add', {
      title: 'High pri', priority: 'high', tags: ['backend'],
    });
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.priority, 'high');
    assert.deepEqual(task.tags, ['backend']);
  });
});

describe('task_list', () => {
  test('returns empty array on fresh store', async () => {
    const r = await handleToolCall(root, 'task_list', {});
    const tasks = JSON.parse(r.content[0].text);
    assert.deepEqual(tasks, []);
  });

  test('returns added tasks', async () => {
    await handleToolCall(root, 'task_add', { title: 'A' });
    await handleToolCall(root, 'task_add', { title: 'B' });
    const r = await handleToolCall(root, 'task_list', {});
    const tasks = JSON.parse(r.content[0].text);
    assert.equal(tasks.length, 2);
  });

  test('filters by status', async () => {
    await handleToolCall(root, 'task_add', { title: 'X' });
    await handleToolCall(root, 'task_pick', {});
    const pending = JSON.parse((await handleToolCall(root, 'task_list', { status: 'pending' })).content[0].text);
    assert.equal(pending.length, 0);
    const inProg  = JSON.parse((await handleToolCall(root, 'task_list', { status: 'in_progress' })).content[0].text);
    assert.equal(inProg.length, 1);
  });
});

describe('task_pick', () => {
  test('returns no-tasks message when empty', async () => {
    const r    = await handleToolCall(root, 'task_pick', {});
    const body = JSON.parse(r.content[0].text);
    assert.ok('message' in body);
  });

  test('picks and marks in_progress', async () => {
    await handleToolCall(root, 'task_add', { title: 'Do work' });
    const r    = await handleToolCall(root, 'task_pick', {});
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.status, 'in_progress');
  });
});

describe('task_done / task_block', () => {
  test('task_done marks done', async () => {
    const add  = JSON.parse((await handleToolCall(root, 'task_add', { title: 'T' })).content[0].text);
    await handleToolCall(root, 'task_pick', {});
    const r    = await handleToolCall(root, 'task_done', { id: add.id });
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.status, 'done');
    assert.ok(task.doneAt);
  });

  test('task_block marks blocked', async () => {
    const add  = JSON.parse((await handleToolCall(root, 'task_add', { title: 'T' })).content[0].text);
    await handleToolCall(root, 'task_pick', {});
    const r    = await handleToolCall(root, 'task_block', { id: add.id });
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.status, 'blocked');
  });
});

describe('task_show', () => {
  test('returns task by id', async () => {
    const add  = JSON.parse((await handleToolCall(root, 'task_add', { title: 'Show me' })).content[0].text);
    const r    = await handleToolCall(root, 'task_show', { id: add.id });
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.title, 'Show me');
  });

  test('returns not-found message for unknown id', async () => {
    const r    = await handleToolCall(root, 'task_show', { id: 't_000000' });
    const body = JSON.parse(r.content[0].text);
    assert.ok('message' in body);
  });
});

describe('task_assign', () => {
  test('sets assignee', async () => {
    const add  = JSON.parse((await handleToolCall(root, 'task_add', { title: 'T' })).content[0].text);
    const r    = await handleToolCall(root, 'task_assign', { id: add.id, assignee: 'alice' });
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.assignee, 'alice');
  });
});

describe('task_progress', () => {
  test('updates progress', async () => {
    const add  = JSON.parse((await handleToolCall(root, 'task_add', { title: 'T' })).content[0].text);
    await handleToolCall(root, 'task_pick', {});
    const r    = await handleToolCall(root, 'task_progress', { id: add.id, progress: 50 });
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.progress, 50);
  });

  test('progress 100 auto-marks done', async () => {
    const add  = JSON.parse((await handleToolCall(root, 'task_add', { title: 'T' })).content[0].text);
    await handleToolCall(root, 'task_pick', {});
    const r    = await handleToolCall(root, 'task_progress', { id: add.id, progress: 100 });
    const task = JSON.parse(r.content[0].text);
    assert.equal(task.status, 'done');
  });
});

describe('log_event', () => {
  test('returns logged: true', async () => {
    const r    = await handleToolCall(root, 'log_event', { message: 'Agent started' });
    const body = JSON.parse(r.content[0].text);
    assert.equal(body.logged, true);
  });
});

describe('unknown tool', () => {
  test('throws on unknown tool name', async () => {
    await assert.rejects(
      () => handleToolCall(root, 'does_not_exist', {}),
      /Unknown tool/,
    );
  });
});
