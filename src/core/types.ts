export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'high' | 'medium' | 'low';
export type BackendFlavor = 'go' | 'node' | 'python';
export type FrontendFlavor = 'nextjs' | 'react-vite' | 'vue' | 'html5';
export type DbFlavor = 'postgres' | 'mysql' | 'sqlite';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  tags: string[];
  progress: number;        // 0–100
  createdAt: string;
  updatedAt: string;
  doneAt: string | null;
}

export interface TaskStore {
  version: number;
  project: string;
  tasks: Task[];
}

export interface ParsedArgs {
  command: string;
  subcommand: string | null;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

export interface ScaffoldOptions {
  name: string;
  backend: BackendFlavor | null;
  frontend: FrontendFlavor | null;
  db: DbFlavor | null;
  docker: boolean;
  qa: boolean;
  dryRun: boolean;
  outputDir: string;
}

export interface TemplateToken {
  PROJECT_NAME: string;
  PROJECT_NAME_PASCAL: string;
  PROJECT_NAME_SNAKE: string;
  YEAR: string;
  DATE: string;
  BACKEND: string;
  FRONTEND: string;
  DB: string;
  GO_MODULE: string;
  DB_PORT: string;
  DB_IMAGE: string;
}

export interface TemplateFile {
  outPath: string;
  content: string;
  layer: string;
}
