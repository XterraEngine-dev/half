import { resolve } from 'node:path';
import type { ParsedArgs } from '../core/types.js';
import { startWatchServer } from '../watch/server.js';

export async function runWatchCommand(args: ParsedArgs): Promise<void> {
  const root = resolve(process.cwd());
  const portRaw = args.flags['port'];
  const port = typeof portRaw === 'string' ? parseInt(portRaw, 10) : 4747;

  await startWatchServer(root, port);

  // keep process alive
  process.stdin.resume();
  process.on('SIGINT', () => {
    console.log('\nhalf watch stopped');
    process.exit(0);
  });
}
