import { resolve } from 'node:path';
import type { ParsedArgs, BackendFlavor, FrontendFlavor, DbFlavor } from '../core/types.js';
import { scaffold } from '../scaffold/scaffold.js';

const VALID_BACKENDS:  BackendFlavor[]  = ['go', 'node', 'python'];
const VALID_FRONTENDS: FrontendFlavor[] = ['nextjs', 'react-vite', 'vue', 'html5'];
const VALID_DBS:       DbFlavor[]       = ['postgres', 'mysql', 'sqlite'];

export async function runNewCommand(args: ParsedArgs): Promise<void> {
  const name = args.subcommand ?? args.positionals[0];
  if (!name) {
    console.error('Usage: half new <name> [--backend go|node|python] [--frontend nextjs|react-vite|vue|html5] [--db postgres|mysql|sqlite] [--docker] [--qa] [--dry-run]');
    process.exit(1);
  }

  if (!/^[a-z0-9][a-z0-9-_]*$/.test(name)) {
    console.error(`Invalid project name "${name}". Use lowercase letters, numbers, hyphens, underscores.`);
    process.exit(1);
  }

  const backendRaw  = args.flags['backend'];
  const frontendRaw = args.flags['frontend'];
  const dbRaw       = args.flags['db'];
  const docker      = args.flags['docker'] === true;
  const qa          = args.flags['qa'] === true;
  const dryRun      = args.flags['dry-run'] === true;

  const backend = typeof backendRaw === 'string'
    ? (VALID_BACKENDS.includes(backendRaw as BackendFlavor) ? backendRaw as BackendFlavor : null)
    : null;

  const frontend = typeof frontendRaw === 'string'
    ? (VALID_FRONTENDS.includes(frontendRaw as FrontendFlavor) ? frontendRaw as FrontendFlavor : null)
    : null;

  const db = typeof dbRaw === 'string'
    ? (VALID_DBS.includes(dbRaw as DbFlavor) ? dbRaw as DbFlavor : null)
    : null;

  if (backendRaw  && !backend)  { console.error(`Unknown backend "${backendRaw}". Valid: ${VALID_BACKENDS.join(', ')}`);   process.exit(1); }
  if (frontendRaw && !frontend) { console.error(`Unknown frontend "${frontendRaw}". Valid: ${VALID_FRONTENDS.join(', ')}`); process.exit(1); }
  if (dbRaw       && !db)       { console.error(`Unknown db "${dbRaw}". Valid: ${VALID_DBS.join(', ')}`);                   process.exit(1); }

  await scaffold({ name, backend, frontend, db, docker, qa, dryRun, outputDir: resolve(process.cwd()) });
}
