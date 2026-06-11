import { resolve, basename, join } from 'node:path';
import { writeln, A } from '../wizard/ansi.js';
import { writeText, exists } from '../core/io.js';
import { loadLayer } from '../scaffold/template-loader.js';
import { buildTokens } from '../scaffold/token-replacer.js';
import { runChecks } from '../standards/checks.js';
import { STANDARDS_TASKS } from '../standards/tasks.js';
import { loadStore, addTask } from '../task/task-store.js';
import type { ParsedArgs } from '../core/types.js';

const PILLAR_LABEL = { quality: 'Quality', qa: 'QA', arch: 'Architecture', security: 'Security' } as const;

const HELP = `
half standards — enforce engineering standards (tier: intermediate)

  half standards check          run the deterministic gate against this repo
  half standards seed           seed the atomic hardening backlog into .half/tasks.json
  half standards init           add standards files to an existing project (no overwrite)
  half standards show           print the four pillars
`.trim();

export async function runStandardsCommand(args: ParsedArgs): Promise<void> {
  const root = resolve(process.cwd());
  const sub = args.subcommand ?? 'check';

  if (sub === 'check')  return checkCmd(root, args);
  if (sub === 'seed')   return seedCmd(root);
  if (sub === 'init')   return initCmd(root);
  if (sub === 'show')   return showCmd();
  if (sub === 'help')   { console.log(HELP); return; }

  console.error(`Unknown subcommand: standards ${sub}`);
  console.log(HELP);
  process.exit(1);
}

async function checkCmd(root: string, args: ParsedArgs): Promise<void> {
  const results = await runChecks(root);
  writeln(`\n  ${A.bold}${A.white}standards check${A.reset}  ${A.muted}${root}${A.reset}\n`);

  for (const r of results) {
    const mark = r.pass ? `${A.green}✓${A.reset}` : (r.required ? `${A.red}✗${A.reset}` : `${A.muted}–${A.reset}`);
    const tag = `${A.muted}[${PILLAR_LABEL[r.pillar].toLowerCase()}]${A.reset}`;
    writeln(`  ${mark} ${r.label.padEnd(34)} ${tag}`);
    if (!r.pass && r.required) writeln(`      ${A.muted}→ ${r.hint}${A.reset}`);
  }

  const required = results.filter((r) => r.required);
  const passed = required.filter((r) => r.pass).length;
  const failed = required.length - passed;
  writeln(`\n  ${A.muted}${'─'.repeat(40)}${A.reset}`);
  const color = failed === 0 ? A.green : A.red;
  writeln(`  ${color}${A.bold}${passed}/${required.length} required checks pass${A.reset}\n`);

  // The gate: nonzero exit when required checks fail (unless --soft).
  if (failed > 0 && args.flags['soft'] !== true) process.exit(1);
}

async function seedCmd(root: string): Promise<void> {
  let existingTitles: Set<string>;
  try {
    const store = await loadStore(root);
    existingTitles = new Set(store.tasks.map((t) => t.title));
  } catch (err) {
    writeln(`  ${A.red}✗ ${err instanceof Error ? err.message : String(err)}${A.reset}`);
    process.exit(1);
  }

  let added = 0, skipped = 0;
  for (const t of STANDARDS_TASKS) {
    if (existingTitles.has(t.title)) { skipped++; continue; }
    await addTask(root, { title: t.title, description: t.description, priority: t.priority, tags: t.tags });
    added++;
    writeln(`  ${A.green}+${A.reset} ${t.title}  ${A.muted}[${t.tags[0]}]${A.reset}`);
  }
  writeln(`\n  ${A.bold}seeded ${added} task(s)${A.reset}${skipped ? `, skipped ${skipped} existing` : ''}.`);
  writeln(`  ${A.muted}run${A.reset} ${A.orange}half watch${A.reset} ${A.muted}to track them.${A.reset}\n`);
}

async function initCmd(root: string): Promise<void> {
  const name = basename(root);
  const tokens = buildTokens(name, '', '', '');
  // projectName '' → outPath is the file's path relative to the layer root.
  const files = await loadLayer('standards', '', tokens);

  let wrote = 0, kept = 0;
  for (const f of files) {
    const dest = join(root, f.outPath);
    if (await exists(dest)) { kept++; writeln(`  ${A.muted}· kept   ${f.outPath} (exists)${A.reset}`); continue; }
    await writeText(dest, f.content);
    wrote++;
    writeln(`  ${A.green}+ wrote  ${f.outPath}${A.reset}`);
  }
  writeln(`\n  ${A.bold}wrote ${wrote} file(s)${A.reset}${kept ? `, kept ${kept} existing` : ''}.`);
  writeln(`  ${A.muted}next:${A.reset} ${A.orange}half standards check${A.reset}  ${A.muted}·  edit CODEOWNERS, then apply .github/BRANCH_PROTECTION.md${A.reset}\n`);
}

function showCmd(): void {
  writeln(`\n  ${A.bold}${A.white}half standards${A.reset} ${A.muted}— tier intermediate${A.reset}\n`);
  const pillars: Array<[string, string[]]> = [
    ['Quality', ['pinned deps + lockfile', 'pre-commit: format + lint + secret scan', 'Conventional Commits', 'lint + typecheck in CI']],
    ['QA', ['tests required in CI', 'coverage threshold gate', 'staging before prod', 'security E2E tests']],
    ['Architecture', ['required review + branch protection', 'ticket-traceable changes', 'threat model', 'OWASP ASVS L2', 'central audit logging']],
    ['Security', ['secret scan + vault', 'SCA blocking gate', 'SAST in CI', 'SBOM + image scan', 'signed commits', 'prod approval gate']],
  ];
  for (const [title, items] of pillars) {
    writeln(`  ${A.orange}${A.bold}${title}${A.reset}`);
    for (const it of items) writeln(`    ${A.muted}·${A.reset} ${it}`);
    writeln();
  }
  writeln(`  ${A.muted}gate:${A.reset} ${A.orange}half standards check${A.reset}  ${A.muted}·  backlog:${A.reset} ${A.orange}half standards seed${A.reset}\n`);
}
