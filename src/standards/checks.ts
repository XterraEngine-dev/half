import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

export interface CheckResult {
  id: string;
  label: string;
  pillar: 'quality' | 'qa' | 'arch' | 'security';
  required: boolean;
  pass: boolean;
  hint: string;
}

async function exists(p: string): Promise<boolean> {
  try { await stat(p); return true; } catch { return false; }
}

async function anyExists(root: string, names: string[]): Promise<boolean> {
  for (const n of names) if (await exists(join(root, n))) return true;
  return false;
}

async function readSafe(p: string): Promise<string> {
  try { return await readFile(p, 'utf-8'); } catch { return ''; }
}

// Concatenate all workflow files so content checks are location-agnostic.
async function workflowText(root: string): Promise<string> {
  const dir = join(root, '.github', 'workflows');
  if (!(await exists(dir))) return '';
  let out = '';
  for (const e of await readdir(dir)) {
    if (e.endsWith('.yml') || e.endsWith('.yaml')) out += '\n' + (await readSafe(join(dir, e)));
  }
  return out;
}

// Intermediate-tier gate. Each check is a presence/content probe over the repo.
export async function runChecks(root: string): Promise<CheckResult[]> {
  const wf = (await workflowText(root)).toLowerCase();
  const gitignore = (await readSafe(join(root, '.gitignore'))).toLowerCase();

  const def: Array<Omit<CheckResult, 'pass'> & { test: () => Promise<boolean> | boolean }> = [
    {
      id: 'ci', label: 'CI workflow runs tests', pillar: 'qa', required: true,
      hint: 'Add .github/workflows/ci.yml that runs lint + tests.',
      test: () => wf.includes('test'),
    },
    {
      id: 'sca', label: 'CI dependency scan (SCA)', pillar: 'security', required: true,
      hint: 'Add govulncheck / npm audit / pip-audit to the security workflow.',
      test: () => /govulncheck|npm audit|pip-audit|dependabot|snyk/.test(wf),
    },
    {
      id: 'sast', label: 'CI static analysis (SAST)', pillar: 'security', required: true,
      hint: 'Add semgrep (or gosec/eslint-security) to the security workflow.',
      test: () => /semgrep|gosec|codeql|bandit|eslint-plugin-security/.test(wf),
    },
    {
      id: 'secret-scan', label: 'Secret scanning', pillar: 'security', required: true,
      hint: 'Add gitleaks to pre-commit and CI.',
      test: async () => /gitleaks|trufflehog|detect-secrets/.test(wf)
        || (await readSafe(join(root, '.pre-commit-config.yaml'))).includes('gitleaks'),
    },
    {
      id: 'sbom', label: 'SBOM generated per build', pillar: 'security', required: true,
      hint: 'Add syft (anchore/sbom-action) to the security workflow.',
      test: () => /syft|sbom|cyclonedx|spdx/.test(wf),
    },
    {
      id: 'precommit', label: 'Pre-commit hooks', pillar: 'quality', required: true,
      hint: 'Add .pre-commit-config.yaml (format + lint + secret scan).',
      test: () => exists(join(root, '.pre-commit-config.yaml')),
    },
    {
      id: 'commitlint', label: 'Conventional Commits enforced', pillar: 'quality', required: true,
      hint: 'Add commitlint.config.cjs + conventional-pre-commit hook.',
      test: () => anyExists(root, ['commitlint.config.cjs', 'commitlint.config.js', '.commitlintrc.json']),
    },
    {
      id: 'lockfile', label: 'Lockfile committed', pillar: 'quality', required: true,
      hint: 'Commit a lockfile (package-lock.json / go.sum / poetry.lock).',
      test: () => anyExists(root, ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'go.sum', 'poetry.lock', 'requirements.txt', 'Cargo.lock']),
    },
    {
      id: 'gitignore-env', label: '.env is gitignored', pillar: 'security', required: true,
      hint: 'Add .env to .gitignore so secrets never get committed.',
      test: () => gitignore.includes('.env'),
    },
    {
      id: 'security-md', label: 'SECURITY.md present', pillar: 'arch', required: true,
      hint: 'Add SECURITY.md with a vulnerability-reporting policy.',
      test: () => anyExists(root, ['SECURITY.md', '.github/SECURITY.md']),
    },
    {
      id: 'codeowners', label: 'CODEOWNERS present', pillar: 'arch', required: true,
      hint: 'Add CODEOWNERS so PRs require an owner review.',
      test: () => anyExists(root, ['CODEOWNERS', '.github/CODEOWNERS', 'docs/CODEOWNERS']),
    },
    {
      id: 'branch-protection', label: 'Branch-protection documented', pillar: 'arch', required: true,
      hint: 'Add .github/BRANCH_PROTECTION.md and apply the settings.',
      test: () => exists(join(root, '.github', 'BRANCH_PROTECTION.md')),
    },
    {
      id: 'threat-model', label: 'Threat model present', pillar: 'arch', required: true,
      hint: 'Add docs/THREAT_MODEL.md (STRIDE per trust boundary).',
      test: () => anyExists(root, ['docs/THREAT_MODEL.md', 'THREAT_MODEL.md']),
    },
    {
      id: 'asvs', label: 'ASVS L2 checklist present', pillar: 'arch', required: true,
      hint: 'Add docs/ASVS-L2.md and verify each item.',
      test: () => anyExists(root, ['docs/ASVS-L2.md', 'docs/ASVS.md']),
    },
    {
      id: 'audit-script', label: 'Local audit gate (audit.sh)', pillar: 'security', required: true,
      hint: 'Add audit.sh mirroring the CI security gate.',
      test: () => exists(join(root, 'audit.sh')),
    },
    {
      id: 'standards-doc', label: 'STANDARDS.md present', pillar: 'quality', required: false,
      hint: 'Add STANDARDS.md documenting the gate.',
      test: () => exists(join(root, 'STANDARDS.md')),
    },
  ];

  const results: CheckResult[] = [];
  for (const d of def) {
    let pass = false;
    try { pass = await d.test(); } catch { pass = false; }
    results.push({ id: d.id, label: d.label, pillar: d.pillar, required: d.required, pass, hint: d.hint });
  }
  return results;
}
