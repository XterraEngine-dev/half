import { join } from 'node:path';
import { appendFile, readFile } from 'node:fs/promises';
import { exists, ensureDir } from '../core/io.js';

export type EventType =
  | 'task.added'
  | 'task.picked'
  | 'task.done'
  | 'task.blocked'
  | 'task.assigned'
  | 'agent.start'
  | 'agent.stop'
  | 'agent.log'
  | 'file.changed'
  | 'file.created'
  | 'task.progress';

export interface HalfEvent {
  ts: string;
  type: EventType;
  taskId?: string;
  taskTitle?: string;
  assignee?: string;
  message?: string;
  progress?: number;
}

export function eventsPath(root: string): string {
  return join(root, '.half', 'events.jsonl');
}

export async function appendEvent(root: string, event: Omit<HalfEvent, 'ts'>): Promise<void> {
  const path = eventsPath(root);
  await ensureDir(join(root, '.half'));
  const line = JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n';
  await appendFile(path, line, 'utf-8');
}

export async function readEvents(root: string, limit = 100): Promise<HalfEvent[]> {
  const path = eventsPath(root);
  if (!(await exists(path))) return [];
  const raw = await readFile(path, 'utf-8');
  const lines = raw.trim().split('\n').filter(Boolean);
  return lines
    .slice(-limit)
    .map((l) => {
      try { return JSON.parse(l) as HalfEvent; } catch { return null; }
    })
    .filter((e): e is HalfEvent => e !== null);
}
