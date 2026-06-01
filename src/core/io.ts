import { readFile, writeFile, mkdir, access, open } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function writeText(filePath: string, content: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function acquireLock(lockPath: string): Promise<() => Promise<void>> {
  await ensureDir(dirname(lockPath));
  let fh;
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      fh = await open(lockPath, 'wx');
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 50 * (i + 1)));
    }
  }
  if (!fh) throw new Error(`Cannot acquire lock: ${lockPath}`);
  await fh.close();
  return async () => {
    const { unlink } = await import('node:fs/promises');
    await unlink(lockPath).catch(() => {});
  };
}
