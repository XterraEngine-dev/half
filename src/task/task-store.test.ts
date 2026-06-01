import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  initStore,
  addTask,
  listTasks,
  getTask,
  updateTaskStatus,
  updateTaskProgress,
  assignTask,
  pickTask,
} from './task-store.js';

let root = '';

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'half-test-'));
  await initStore(root, 'test-project');
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

test('addTask creates task with defaults', async () => {
  const t = await addTask(root, { title: 'My task' });
  assert.equal(t.title, 'My task');
  assert.equal(t.status, 'pending');
  assert.equal(t.priority, 'medium');
  assert.equal(t.progress, 0);
  assert.equal(t.assignee, null);
  assert.deepEqual(t.tags, []);
  assert.match(t.id, /^t_[a-f0-9]{6}$/);
});

test('addTask stores all fields', async () => {
  const t = await addTask(root, {
    title: 'Auth',
    description: 'Add JWT',
    priority: 'high',
    assignee: 'claude',
    tags: ['backend', 'auth'],
  });
  assert.equal(t.priority, 'high');
  assert.equal(t.assignee, 'claude');
  assert.deepEqual(t.tags, ['backend', 'auth']);
  assert.equal(t.description, 'Add JWT');
});

test('listTasks returns all tasks', async () => {
  await addTask(root, { title: 'A' });
  await addTask(root, { title: 'B' });
  const tasks = await listTasks(root);
  assert.equal(tasks.length, 2);
});

test('listTasks filters by status', async () => {
  const t = await addTask(root, { title: 'A' });
  await updateTaskStatus(root, t.id, 'done');
  await addTask(root, { title: 'B' });

  const done    = await listTasks(root, { status: 'done' });
  const pending = await listTasks(root, { status: 'pending' });
  assert.equal(done.length, 1);
  assert.equal(pending.length, 1);
});

test('listTasks filters by tag', async () => {
  await addTask(root, { title: 'A', tags: ['backend'] });
  await addTask(root, { title: 'B', tags: ['frontend'] });
  const result = await listTasks(root, { tag: 'backend' });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'A');
});

test('getTask returns null for unknown id', async () => {
  const t = await getTask(root, 't_notexist');
  assert.equal(t, null);
});

test('updateTaskStatus pending → done sets doneAt', async () => {
  const t = await addTask(root, { title: 'X' });
  const updated = await updateTaskStatus(root, t.id, 'done');
  assert.equal(updated.status, 'done');
  assert.notEqual(updated.doneAt, null);
});

test('updateTaskStatus → blocked', async () => {
  const t = await addTask(root, { title: 'X' });
  const updated = await updateTaskStatus(root, t.id, 'blocked');
  assert.equal(updated.status, 'blocked');
});

test('updateTaskStatus unknown id throws', async () => {
  await assert.rejects(() => updateTaskStatus(root, 't_bad', 'done'), /not found/i);
});

test('updateTaskProgress sets progress', async () => {
  const t = await addTask(root, { title: 'X' });
  const updated = await updateTaskProgress(root, t.id, 50);
  assert.equal(updated.progress, 50);
});

test('updateTaskProgress clamps to 0–100', async () => {
  const t = await addTask(root, { title: 'X' });
  const a = await updateTaskProgress(root, t.id, -10);
  assert.equal(a.progress, 0);
  const b = await updateTaskProgress(root, t.id, 999);
  assert.equal(b.progress, 100);
});

test('updateTaskProgress 100 auto-marks done', async () => {
  const t = await addTask(root, { title: 'X' });
  await updateTaskStatus(root, t.id, 'in_progress');
  const updated = await updateTaskProgress(root, t.id, 100);
  assert.equal(updated.status, 'done');
  assert.notEqual(updated.doneAt, null);
});

test('assignTask sets assignee', async () => {
  const t = await addTask(root, { title: 'X' });
  const updated = await assignTask(root, t.id, 'luis');
  assert.equal(updated.assignee, 'luis');
});

test('pickTask marks pending → in_progress', async () => {
  await addTask(root, { title: 'First', priority: 'low' });
  await addTask(root, { title: 'Second', priority: 'high' });

  const picked = await pickTask(root);
  assert.notEqual(picked, null);
  assert.equal(picked!.status, 'in_progress');
});

test('pickTask returns null when no pending', async () => {
  const t = await addTask(root, { title: 'X' });
  await updateTaskStatus(root, t.id, 'done');
  const picked = await pickTask(root);
  assert.equal(picked, null);
});

test('pickTask assigns if flag given', async () => {
  await addTask(root, { title: 'X' });
  const picked = await pickTask(root, { assignee: 'claude' });
  assert.equal(picked!.assignee, 'claude');
});

test('tasks sorted by priority', async () => {
  await addTask(root, { title: 'Low',  priority: 'low' });
  await addTask(root, { title: 'High', priority: 'high' });
  await addTask(root, { title: 'Med',  priority: 'medium' });
  const tasks = await listTasks(root);
  assert.equal(tasks[0].priority, 'high');
  assert.equal(tasks[1].priority, 'medium');
  assert.equal(tasks[2].priority, 'low');
});
