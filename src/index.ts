export { scaffold } from './scaffold/scaffold.js';
export { addTask, listTasks, getTask, updateTaskStatus, assignTask, pickTask, initStore } from './task/task-store.js';
export type { Task, TaskStore, TaskStatus, TaskPriority, ScaffoldOptions, BackendFlavor, FrontendFlavor } from './core/types.js';
