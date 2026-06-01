import { join } from 'node:path';
import { readJson, writeJson, exists, acquireLock } from '../core/io.js';
import { generateTaskId } from './task-id.js';
import { appendEvent } from '../watch/event-log.js';
import type { Task, TaskStore, TaskStatus, TaskPriority } from '../core/types.js';

const HALF_DIR = '.half';
const TASKS_FILE = 'tasks.json';
const LOCK_FILE = 'tasks.lock';

function tasksPath(root: string): string {
  return join(root, HALF_DIR, TASKS_FILE);
}

function lockPath(root: string): string {
  return join(root, HALF_DIR, LOCK_FILE);
}

export async function loadStore(root: string): Promise<TaskStore> {
  const path = tasksPath(root);
  if (!(await exists(path))) {
    throw new Error(`No task store found. Run 'half new' to initialize a project, or create .half/tasks.json manually.`);
  }
  return readJson<TaskStore>(path);
}

async function saveStore(root: string, store: TaskStore): Promise<void> {
  store.tasks.sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2 };
    return prio[a.priority] - prio[b.priority];
  });
  await writeJson(tasksPath(root), store);
}

export async function addTask(
  root: string,
  opts: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assignee?: string;
    tags?: string[];
  }
): Promise<Task> {
  const release = await acquireLock(lockPath(root));
  try {
    const store = await loadStore(root);
    const now = new Date().toISOString();
    const task: Task = {
      id: generateTaskId(),
      title: opts.title,
      description: opts.description ?? '',
      status: 'pending',
      priority: opts.priority ?? 'medium',
      assignee: opts.assignee ?? null,
      tags: opts.tags ?? [],
      progress: 0,
      createdAt: now,
      updatedAt: now,
      doneAt: null,
    };
    store.tasks.push(task);
    await saveStore(root, store);
    await appendEvent(root, { type: 'task.added', taskId: task.id, taskTitle: task.title, assignee: task.assignee ?? undefined });
    return task;
  } finally {
    await release();
  }
}

export async function listTasks(
  root: string,
  filters: {
    status?: TaskStatus;
    assignee?: string;
    tag?: string;
    priority?: TaskPriority;
  } = {}
): Promise<Task[]> {
  const store = await loadStore(root);
  return store.tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.assignee && t.assignee !== filters.assignee) return false;
    if (filters.tag && !t.tags.includes(filters.tag)) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });
}

export async function getTask(root: string, id: string): Promise<Task | null> {
  const store = await loadStore(root);
  return store.tasks.find((t) => t.id === id) ?? null;
}

export async function updateTaskStatus(
  root: string,
  id: string,
  status: TaskStatus
): Promise<Task> {
  const release = await acquireLock(lockPath(root));
  try {
    const store = await loadStore(root);
    const task = store.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task not found: ${id}`);
    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (status === 'done') task.doneAt = task.updatedAt;
    await saveStore(root, store);
    const evType = status === 'done' ? 'task.done' : status === 'blocked' ? 'task.blocked' : 'task.picked';
    await appendEvent(root, { type: evType, taskId: task.id, taskTitle: task.title });
    return task;
  } finally {
    await release();
  }
}

export async function assignTask(root: string, id: string, assignee: string): Promise<Task> {
  const release = await acquireLock(lockPath(root));
  try {
    const store = await loadStore(root);
    const task = store.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task not found: ${id}`);
    task.assignee = assignee;
    task.updatedAt = new Date().toISOString();
    await saveStore(root, store);
    await appendEvent(root, { type: 'task.assigned', taskId: task.id, taskTitle: task.title, assignee });
    return task;
  } finally {
    await release();
  }
}

export async function pickTask(
  root: string,
  filters: { assignee?: string; tag?: string } = {}
): Promise<Task | null> {
  const release = await acquireLock(lockPath(root));
  try {
    const store = await loadStore(root);
    const task = store.tasks.find((t) => {
      if (t.status !== 'pending') return false;
      if (filters.assignee && t.assignee !== null && t.assignee !== filters.assignee) return false;
      if (filters.tag && !t.tags.includes(filters.tag)) return false;
      return true;
    });
    if (!task) return null;
    task.status = 'in_progress';
    task.updatedAt = new Date().toISOString();
    if (filters.assignee) task.assignee = filters.assignee;
    await saveStore(root, store);
    await appendEvent(root, { type: 'task.picked', taskId: task.id, taskTitle: task.title, assignee: task.assignee ?? undefined });
    return task;
  } finally {
    await release();
  }
}

export async function updateTaskProgress(root: string, id: string, pct: number): Promise<Task> {
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  const release = await acquireLock(lockPath(root));
  try {
    const store = await loadStore(root);
    const task = store.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task not found: ${id}`);
    task.progress = p;
    task.updatedAt = new Date().toISOString();
    if (p === 100 && task.status === 'in_progress') {
      task.status = 'done';
      task.doneAt = task.updatedAt;
    }
    await saveStore(root, store);
    await appendEvent(root, { type: 'task.progress', taskId: task.id, taskTitle: task.title, progress: p });
    return task;
  } finally {
    await release();
  }
}

export async function initStore(root: string, projectName: string): Promise<void> {
  const path = tasksPath(root);
  if (await exists(path)) return;
  const store: TaskStore = {
    version: 1,
    project: projectName,
    tasks: [],
  };
  await writeJson(path, store);
}
