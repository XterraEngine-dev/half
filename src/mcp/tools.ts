import {
  addTask, listTasks, getTask, updateTaskStatus,
  assignTask, pickTask, updateTaskProgress,
} from '../task/task-store.js';
import { appendEvent } from '../watch/event-log.js';
import type { TaskStatus, TaskPriority } from '../core/types.js';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const TOOL_DEFINITIONS: McpTool[] = [
  {
    name: 'task_list',
    description: 'List tasks. Optionally filter by status, assignee, tag, or priority.',
    inputSchema: {
      type: 'object',
      properties: {
        status:   { type: 'string', enum: ['pending', 'in_progress', 'done', 'blocked'] },
        assignee: { type: 'string', description: 'Filter by assignee name' },
        tag:      { type: 'string', description: 'Filter by tag' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
      },
    },
  },
  {
    name: 'task_pick',
    description: 'Pick the next highest-priority pending task and mark it in_progress. Returns the task or a no-tasks message.',
    inputSchema: {
      type: 'object',
      properties: {
        assignee: { type: 'string', description: 'Assign to this person when picking' },
        tag:      { type: 'string', description: 'Only pick tasks with this tag' },
      },
    },
  },
  {
    name: 'task_done',
    description: 'Mark a task as done.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Task ID (t_xxxxxx)' } },
      required: ['id'],
    },
  },
  {
    name: 'task_block',
    description: 'Mark a task as blocked.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Task ID (t_xxxxxx)' } },
      required: ['id'],
    },
  },
  {
    name: 'task_add',
    description: 'Add a new task to the project task list.',
    inputSchema: {
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Short task title' },
        description: { type: 'string', description: 'Full spec — write it so an agent can execute without ambiguity' },
        priority:    { type: 'string', enum: ['high', 'medium', 'low'] },
        assignee:    { type: 'string' },
        tags:        { type: 'array', items: { type: 'string' } },
      },
      required: ['title'],
    },
  },
  {
    name: 'task_show',
    description: 'Show full detail for a single task.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'task_assign',
    description: 'Assign a task to a person.',
    inputSchema: {
      type: 'object',
      properties: {
        id:       { type: 'string' },
        assignee: { type: 'string' },
      },
      required: ['id', 'assignee'],
    },
  },
  {
    name: 'task_progress',
    description: 'Update task progress (0–100). Setting 100 auto-marks done.',
    inputSchema: {
      type: 'object',
      properties: {
        id:       { type: 'string' },
        progress: { type: 'number', minimum: 0, maximum: 100 },
      },
      required: ['id', 'progress'],
    },
  },
  {
    name: 'log_event',
    description: 'Append an event to .half/events.jsonl. Use to signal agent activity.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        type: { type: 'string', enum: ['agent.start', 'agent.stop', 'agent.log'] },
      },
      required: ['message'],
    },
  },
];

export interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

function ok(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

export async function handleToolCall(
  cwd: string,
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  switch (name) {
    case 'task_list':
      return ok(await listTasks(cwd, {
        status:   args['status']   as TaskStatus   | undefined,
        assignee: args['assignee'] as string       | undefined,
        tag:      args['tag']      as string       | undefined,
        priority: args['priority'] as TaskPriority | undefined,
      }));

    case 'task_pick': {
      const task = await pickTask(cwd, {
        assignee: args['assignee'] as string | undefined,
        tag:      args['tag']      as string | undefined,
      });
      return ok(task ?? { message: 'No pending tasks.' });
    }

    case 'task_done':
      return ok(await updateTaskStatus(cwd, args['id'] as string, 'done'));

    case 'task_block':
      return ok(await updateTaskStatus(cwd, args['id'] as string, 'blocked'));

    case 'task_add':
      return ok(await addTask(cwd, {
        title:       args['title']       as string,
        description: args['description'] as string       | undefined,
        priority:    args['priority']    as TaskPriority | undefined,
        assignee:    args['assignee']    as string       | undefined,
        tags:        args['tags']        as string[]     | undefined,
      }));

    case 'task_show': {
      const task = await getTask(cwd, args['id'] as string);
      return ok(task ?? { message: `Task not found: ${args['id']}` });
    }

    case 'task_assign':
      return ok(await assignTask(cwd, args['id'] as string, args['assignee'] as string));

    case 'task_progress':
      return ok(await updateTaskProgress(cwd, args['id'] as string, args['progress'] as number));

    case 'log_event':
      await appendEvent(cwd, {
        type:    (args['type'] as 'agent.start' | 'agent.stop' | 'agent.log') ?? 'agent.log',
        message: args['message'] as string,
      });
      return ok({ logged: true });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
