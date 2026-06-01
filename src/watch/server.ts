import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { watch } from 'node:fs';
import { resolve, relative, extname } from 'node:path';
import { loadStore } from '../task/task-store.js';
import { readEvents, eventsPath, appendEvent } from './event-log.js';
import { buildUI } from './ui.js';

type SseClient = ServerResponse;

const clients = new Set<SseClient>();

function broadcast(data: string): void {
  for (const c of clients) {
    try { c.write(`data: ${data}\n\n`); } catch { clients.delete(c); }
  }
}

function json(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

const IGNORE_DIRS  = new Set(['.git', 'node_modules', 'vendor', 'dist', '.next', '__pycache__', '.half']);
const IGNORE_EXTS  = new Set(['.log', '.lock', '.tmp', '.DS_Store']);
const CODE_EXTS    = new Set(['.go', '.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.java', '.c', '.cpp', '.h', '.sql', '.html', '.css', '.json', '.yaml', '.yml', '.md', '.sh', '.env.example']);

function shouldTrack(rel: string): boolean {
  const parts = rel.split('/');
  if (parts.some(p => IGNORE_DIRS.has(p))) return false;
  const ext = extname(rel);
  if (IGNORE_EXTS.has(ext)) return false;
  return true;
}

export async function startWatchServer(root: string, port: number): Promise<void> {
  const projectName = resolve(root).split('/').pop() ?? root;
  const html = buildUI(projectName);

  // debounce file events — batch rapid saves into one event
  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  function onFileChange(filename: string | null) {
    if (!filename) return;
    const rel = relative(root, resolve(root, filename));
    if (!shouldTrack(rel)) return;

    if (pending.has(rel)) clearTimeout(pending.get(rel)!);
    pending.set(rel, setTimeout(async () => {
      pending.delete(rel);
      await appendEvent(root, { type: 'file.changed', message: rel });
      broadcast('update');
    }, 120));
  }

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '/';

    if (url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write('data: connected\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    if (url === '/api/tasks') {
      try {
        const store = await loadStore(root);
        json(res, 200, store.tasks);
      } catch {
        json(res, 200, []);
      }
      return;
    }

    if (url === '/api/events') {
      const events = await readEvents(root, 300);
      json(res, 200, events);
      return;
    }

    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    res.writeHead(404);
    res.end('not found');
  });

  // watch tasks.json directly — most reliable on macOS
  const tasksFile  = resolve(root, '.half', 'tasks.json');
  const eventsFile = eventsPath(root);

  function watchFile(path: string, cb: () => void) {
    const attempt = () => {
      try {
        watch(path, {}, cb);
      } catch {
        // file doesn't exist yet — retry once it appears via dir watch
      }
    };
    attempt();
  }

  watchFile(tasksFile,  () => broadcast('update'));
  watchFile(eventsFile, () => broadcast('update'));

  // also watch .half/ dir to catch file creation
  try {
    watch(resolve(root, '.half'), { recursive: false }, () => broadcast('update'));
  } catch { /* dir may not exist yet */ }

  // watch project root for source file changes (skip .half/)
  try {
    watch(root, { recursive: true }, (_, f) => onFileChange(f));
  } catch { /* fallback: client polls every 5s */ }

  setInterval(() => broadcast('ping'), 25_000);

  const { exec } = await import('node:child_process');

  async function freePort(p: number): Promise<void> {
    return new Promise((done) => {
      exec(`lsof -ti:${p}`, (_, stdout) => {
        const pids = stdout.trim().split('\n').filter(Boolean);
        if (!pids.length) { done(); return; }
        exec(`lsof -ti:${p} | xargs kill -9`, () => {
          setTimeout(done, 300);
        });
      });
    });
  }

  await freePort(port);

  await new Promise<void>((res, rej) => {
    server.listen(port, '127.0.0.1', () => res());
    server.on('error', rej);
  });

  const url = `http://localhost:${port}`;
  console.log(`\nhalf watch → ${url}  (project: ${projectName})\n`);

  exec(`open "${url}"`);
}
