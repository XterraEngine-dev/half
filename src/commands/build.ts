import { resolve } from 'node:path';
import { writeln, A } from '../wizard/ansi.js';
import { askText, selectMenu, confirm } from '../wizard/prompt.js';
import { scaffold } from '../scaffold/scaffold.js';
import type { BackendFlavor, FrontendFlavor, DbFlavor } from '../core/types.js';

/* ── layout helpers ── */
function header() {
  writeln(`\n  ${A.orange}${A.bold}½ half build${A.reset}  ${A.muted}— project wizard${A.reset}\n`);
  writeln(`  ${A.muted}${'─'.repeat(38)}${A.reset}\n`);
}

function stepLabel(n: number, total: number, title: string) {
  writeln(`  ${A.muted}step ${n}/${total}${A.reset}  ${A.bold}${A.white}${title}${A.reset}\n`);
}

function summaryLine(label: string, value: string | boolean | null, color = A.orange) {
  if (value === null || value === false) {
    writeln(`  ${A.muted}${label.padEnd(12)}  —${A.reset}`);
  } else if (value === true) {
    writeln(`  ${A.muted}${label.padEnd(12)}${A.reset}  ${color}yes${A.reset}`);
  } else {
    writeln(`  ${A.muted}${label.padEnd(12)}${A.reset}  ${color}${value}${A.reset}`);
  }
}

/* ── wizard ── */
export async function runBuildCommand(): Promise<void> {
  process.stdout.write(A.clearScreen);
  header();

  // ── Step 1: name ────────────────────────────
  stepLabel(1, 6, 'Project name');
  const name = await askText('Name your project', 'my-app');

  if (!/^[a-z0-9][a-z0-9-_]*$/.test(name)) {
    writeln(`\n  ${A.red}✗ Invalid name. Use lowercase letters, numbers, hyphens.${A.reset}\n`);
    process.exit(1);
  }

  // ── Step 2: backend ─────────────────────────
  writeln();
  stepLabel(2, 6, 'Backend');
  const backend = await selectMenu<BackendFlavor | null>('Choose a backend', [
    { value: 'go',     label: 'Go',     hint: 'Chi router · pgx · zero deps' },
    { value: 'node',   label: 'Node',   hint: 'TypeScript · ESM · lightweight' },
    { value: 'python', label: 'Python', hint: 'FastAPI · Uvicorn' },
    { value: null,     label: 'None',   hint: 'frontend only' },
  ]);

  // ── Step 3: frontend ────────────────────────
  writeln();
  stepLabel(3, 6, 'Frontend');
  const frontend = await selectMenu<FrontendFlavor | null>('Choose a frontend', [
    { value: 'nextjs',     label: 'Next.js',     hint: 'React 19 · App Router' },
    { value: 'react-vite', label: 'React + Vite', hint: 'React 19 · Vite 6' },
    { value: 'vue',        label: 'Vue 3',        hint: 'Vite · Composition API' },
    { value: 'html5',      label: 'HTML5',        hint: 'Vanilla JS · no build step' },
    { value: null,         label: 'None',          hint: 'API only' },
  ]);

  // ── Step 4: database ────────────────────────
  writeln();
  stepLabel(4, 6, 'Database');
  const db = await selectMenu<DbFlavor | null>('Choose a database', [
    { value: 'postgres', label: 'PostgreSQL', hint: 'pgx v5 · migrations included' },
    { value: 'mysql',    label: 'MySQL',      hint: 'mysql driver · migrations' },
    { value: 'sqlite',   label: 'SQLite',     hint: 'file-based · no server' },
    { value: null,       label: 'None',        hint: 'no database layer' },
  ]);

  // ── Step 5: docker + qa ─────────────────────
  writeln();
  stepLabel(5, 6, 'Extras');
  const docker = db !== null
    ? await confirm('Add Docker Compose + Makefile?', true)
    : false;
  const qa = await confirm('Add Playwright E2E test suite?', false);

  // ── Step 6: confirm ─────────────────────────
  writeln();
  writeln(`\n  ${A.muted}${'─'.repeat(38)}${A.reset}`);
  writeln(`  ${A.bold}${A.white}Summary${A.reset}\n`);
  summaryLine('project',  name,    A.cream);
  summaryLine('backend',  backend);
  summaryLine('frontend', frontend);
  summaryLine('database', db);
  summaryLine('docker',   docker);
  summaryLine('qa',       qa);
  writeln(`  ${A.muted}${'─'.repeat(38)}${A.reset}\n`);

  const go = await confirm(`Scaffold "${name}" now?`, true);

  if (!go) {
    writeln(`\n  ${A.muted}Cancelled.${A.reset}\n`);
    process.exit(0);
  }

  // ── Scaffold ─────────────────────────────────
  process.stdout.write(A.clearScreen);
  header();
  writeln(`  ${A.orange}Building ${A.bold}${name}${A.reset}${A.orange}...${A.reset}\n`);

  await scaffold({
    name,
    backend,
    frontend,
    db,
    docker,
    qa,
    dryRun: false,
    outputDir: resolve(process.cwd()),
  });

  writeln(`\n  ${A.green}${A.bold}✓ Done!${A.reset}  ${A.muted}${name}/ is ready.${A.reset}\n`);
  writeln(`  ${A.muted}Next:${A.reset}`);
  writeln(`  ${A.orange}cd ${name}${A.reset}`);
  if (docker) writeln(`  ${A.orange}make up${A.reset}  ${A.muted}# start services${A.reset}`);
  if (backend === 'go') writeln(`  ${A.orange}go run .${A.reset}  ${A.muted}# run api${A.reset}`);
  if (frontend && frontend !== 'html5') writeln(`  ${A.orange}npm run dev${A.reset}  ${A.muted}# run frontend${A.reset}`);
  writeln(`  ${A.orange}half watch${A.reset}  ${A.muted}# open harness viewer${A.reset}`);
  writeln();
}
