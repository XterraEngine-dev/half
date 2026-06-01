import { resolve } from 'node:path';
import type { ParsedArgs, TaskStatus, TaskPriority } from '../core/types.js';
import {
  addTask,
  listTasks,
  getTask,
  updateTaskStatus,
  updateTaskProgress,
  assignTask,
  pickTask,
} from '../task/task-store.js';
import { formatTaskList, formatTaskDetail } from '../task/task-display.js';

export async function runTaskCommand(args: ParsedArgs): Promise<void> {
  const root = resolve(process.cwd());
  const sub = args.subcommand;

  if (sub === 'add') {
    const title = args.positionals[0] ?? args.flags['title'];
    if (!title || typeof title !== 'string') {
      console.error('Usage: half task add "<title>" [--description <text>] [--priority high|medium|low] [--assignee <name>] [--tags tag1,tag2]');
      process.exit(1);
    }
    const description = typeof args.flags['description'] === 'string' ? args.flags['description'] : '';
    const priority = (args.flags['priority'] as TaskPriority) ?? 'medium';
    const assignee = typeof args.flags['assignee'] === 'string' ? args.flags['assignee'] : undefined;
    const tagsRaw = typeof args.flags['tags'] === 'string' ? args.flags['tags'] : '';
    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()) : [];

    const task = await addTask(root, { title, description, priority, assignee, tags });
    console.log(`added → ${task.id}  [${task.priority}]  ${task.title}`);
    return;
  }

  if (sub === 'list') {
    const status = args.flags['status'] as TaskStatus | undefined;
    const assignee = typeof args.flags['assignee'] === 'string' ? args.flags['assignee'] : undefined;
    const tag = typeof args.flags['tag'] === 'string' ? args.flags['tag'] : undefined;
    const priority = args.flags['priority'] as TaskPriority | undefined;

    const tasks = await listTasks(root, { status, assignee, tag, priority });
    console.log(formatTaskList(tasks));
    return;
  }

  if (sub === 'show') {
    const id = args.positionals[0];
    if (!id) {
      console.error('Usage: half task show <id>');
      process.exit(1);
    }
    const task = await getTask(root, id);
    if (!task) {
      console.error(`Task not found: ${id}`);
      process.exit(1);
    }
    console.log(formatTaskDetail(task));
    return;
  }

  if (sub === 'done') {
    const id = args.positionals[0];
    if (!id) {
      console.error('Usage: half task done <id>');
      process.exit(1);
    }
    const task = await updateTaskStatus(root, id, 'done');
    console.log(`done → ${task.id}  ${task.title}`);
    return;
  }

  if (sub === 'block' || sub === 'blocked') {
    const id = args.positionals[0];
    if (!id) {
      console.error('Usage: half task block <id>');
      process.exit(1);
    }
    const task = await updateTaskStatus(root, id, 'blocked');
    console.log(`blocked → ${task.id}  ${task.title}`);
    return;
  }

  if (sub === 'assign') {
    const id = args.positionals[0];
    const assignee = args.positionals[1];
    if (!id || !assignee) {
      console.error('Usage: half task assign <id> <assignee>');
      process.exit(1);
    }
    const task = await assignTask(root, id, assignee);
    console.log(`assigned → ${task.id}  @${task.assignee}  ${task.title}`);
    return;
  }

  if (sub === 'pick') {
    const assignee = typeof args.flags['assignee'] === 'string' ? args.flags['assignee'] : undefined;
    const tag = typeof args.flags['tag'] === 'string' ? args.flags['tag'] : undefined;

    const task = await pickTask(root, { assignee, tag });
    if (!task) {
      console.log('No pending tasks.');
      return;
    }
    console.log(formatTaskDetail(task));
    return;
  }

  if (sub === 'progress') {
    const id  = args.positionals[0];
    const pct = Number(args.positionals[1] ?? args.flags['pct'] ?? args.flags['percent']);
    if (!id || isNaN(pct)) {
      console.error('Usage: half task progress <id> <0-100>');
      process.exit(1);
    }
    const task = await updateTaskProgress(root, id, pct);
    const bar  = progressBar(task.progress);
    console.log(`progress → ${task.id}  ${bar}  ${task.progress}%  ${task.title}`);
    if (task.status === 'done') console.log(`auto-done → ${task.id}`);
    return;
  }

  console.error(`Unknown task subcommand: ${sub ?? '(none)'}`);
  console.error('Available: add, list, show, done, block, assign, pick, progress');
  process.exit(1);
}

function progressBar(pct: number, width = 16): string {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
