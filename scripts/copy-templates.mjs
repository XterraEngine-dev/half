import { cp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'src', 'templates');
const dst = join(root, 'dist', 'templates');

await cp(src, dst, { recursive: true });
console.log('templates copied → dist/templates');
