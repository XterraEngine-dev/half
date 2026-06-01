import type { Task, TaskStatus, TaskPriority } from '../core/types.js';

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending:     '\x1b[33m',
  in_progress: '\x1b[34m',
  done:        '\x1b[32m',
  blocked:     '\x1b[31m',
};

const PRIORITY_ICON: Record<TaskPriority, string> = {
  high:   '!!!',
  medium: '!! ',
  low:    '!  ',
};

const RESET = '\x1b[0m';
const DIM   = '\x1b[2m';
const BOLD  = '\x1b[1m';
const ORG   = '\x1b[38;5;173m';

function bar(pct: number, width = 12): string {
  const p = Math.max(0, Math.min(100, pct ?? 0));
  const f = Math.round((p / 100) * width);
  const color = p === 100 ? '\x1b[32m' : p > 0 ? ORG : DIM;
  return `${color}${'█'.repeat(f)}${DIM}${'░'.repeat(width - f)}${RESET} ${p}%`;
}

export function formatTaskList(tasks: Task[]): string {
  if (tasks.length === 0) return `${DIM}No tasks found.${RESET}`;

  const lines: string[] = [];
  for (const t of tasks) {
    const color    = STATUS_COLOR[t.status];
    const prio     = PRIORITY_ICON[t.priority];
    const assignee = t.assignee ? ` @${t.assignee}` : '';
    const tags     = t.tags.length ? ` [${t.tags.join(',')}]` : '';
    const progress = t.status === 'in_progress' ? `  ${bar(t.progress ?? 0)}` : '';
    lines.push(
      `${BOLD}${t.id}${RESET}  ${prio}  ${color}${t.status.padEnd(11)}${RESET}  ${t.title}${DIM}${assignee}${tags}${RESET}${progress}`
    );
  }
  return lines.join('\n');
}

export function formatTaskDetail(t: Task): string {
  const color = STATUS_COLOR[t.status];
  const lines = [
    `${BOLD}${t.id}${RESET}  ${color}${t.status}${RESET}  [${t.priority}]`,
    `${BOLD}Title:${RESET}       ${t.title}`,
    `${BOLD}Progress:${RESET}    ${bar(t.progress ?? 0, 20)}`,
    `${BOLD}Description:${RESET} ${t.description || DIM + '(none)' + RESET}`,
    `${BOLD}Assignee:${RESET}    ${t.assignee ?? DIM + '(unassigned)' + RESET}`,
    `${BOLD}Tags:${RESET}        ${t.tags.length ? t.tags.join(', ') : DIM + '(none)' + RESET}`,
    `${BOLD}Created:${RESET}     ${t.createdAt}`,
    `${BOLD}Updated:${RESET}     ${t.updatedAt}`,
  ];
  if (t.doneAt) lines.push(`${BOLD}Done:${RESET}        ${t.doneAt}`);
  return lines.join('\n');
}
