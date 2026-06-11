import type { TaskPriority } from '../core/types.js';

export interface SeedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  tags: string[];
}

// Atomic hardening backlog — each task is one-PR-sized and stack-agnostic.
// Seeded by `half standards seed`. Derived from the intermediate-tier standard
// (Quality / QA / Architecture / Security) plus common SaaS hardening gaps.
export const STANDARDS_TASKS: SeedTask[] = [
  // ── Security ─────────────────────────────────
  {
    title: 'Add account lockout after N failed logins',
    description: 'IP rate-limiting alone does not stop distributed brute-force. Lock an account after 5 consecutive failed logins for a cooldown window; log a security event on lockout and on unlock.',
    priority: 'high', tags: ['security', 'auth'],
  },
  {
    title: 'Run containers as non-root with read-only filesystem',
    description: 'Add a non-root USER to every app Dockerfile, set read_only: true + tmpfs for writable paths in compose, drop Linux capabilities and apply a seccomp profile.',
    priority: 'high', tags: ['security', 'infra'],
  },
  {
    title: 'Wire SAST (semgrep) into CI as a blocking gate',
    description: 'Add semgrep with p/default p/security-audit p/secrets to the security workflow. Fail the build on HIGH severity. Language-native SAST (gosec/eslint-security) where applicable.',
    priority: 'high', tags: ['security', 'ci'],
  },
  {
    title: 'Add secret scanning (gitleaks) pre-commit + CI',
    description: 'Install gitleaks as a pre-commit hook and a CI job with fetch-depth 0 so history is scanned. Ensure .env and key files are gitignored.',
    priority: 'high', tags: ['security', 'ci'],
  },
  {
    title: 'Generate SBOM + scan image per build',
    description: 'Add syft SBOM generation (spdx-json) and a trivy filesystem/image scan that fails on HIGH/CRITICAL (ignore-unfixed). Upload the SBOM as a build artifact.',
    priority: 'medium', tags: ['security', 'supply-chain'],
  },
  {
    title: 'Enforce signed commits + branch protection',
    description: 'Configure default-branch protection: required review (author != approver), required status checks, signed commits, no admin bypass, blocked force-push. See .github/BRANCH_PROTECTION.md.',
    priority: 'medium', tags: ['security', 'arch'],
  },
  {
    title: 'Document + implement secret rotation',
    description: 'Replace long-lived shared secrets with rotatable, per-scope tokens. Document the rotation procedure and cadence. Move secrets to a vault where available.',
    priority: 'medium', tags: ['security'],
  },
  {
    title: 'Add manual approval gate before production deploy',
    description: 'Create a GitHub Environment "production" with a required reviewer so prod deploys pause for human approval.',
    priority: 'medium', tags: ['security', 'arch'],
  },
  // ── Architecture ─────────────────────────────
  {
    title: 'Write and review the threat model',
    description: 'Fill docs/THREAT_MODEL.md using STRIDE per trust boundary. Capture assets, mitigations, and accepted risks. Schedule a per-release review.',
    priority: 'medium', tags: ['arch', 'security'],
  },
  {
    title: 'Verify the codebase against OWASP ASVS L2',
    description: 'Walk docs/ASVS-L2.md, tick each verified item, and link evidence (test or PR) per requirement. File atomic tasks for any gaps found.',
    priority: 'medium', tags: ['arch', 'security'],
  },
  {
    title: 'Centralize structured logging + alerting',
    description: 'Emit JSON logs to a central sink (Loki/ELK). Add threshold alerts on auth failures, RBAC denials, and error rate.',
    priority: 'medium', tags: ['arch', 'observability'],
  },
  // ── QA ───────────────────────────────────────
  {
    title: 'Add a CI coverage threshold gate',
    description: 'Compute coverage in CI and fail when it drops below the agreed threshold. Start where you are and ratchet upward.',
    priority: 'medium', tags: ['qa', 'ci'],
  },
  {
    title: 'Add security-focused E2E tests',
    description: 'Cover CSRF rejection, authz denial (cross-tenant access blocked), and upload-type rejection as automated regression tests.',
    priority: 'medium', tags: ['qa', 'security'],
  },
  // ── Quality ──────────────────────────────────
  {
    title: 'Pin dependencies + commit lockfile',
    description: 'Ensure a lockfile is committed and dependency versions are pinned for reproducible builds. Enable dependency-confusion mitigation for internal packages.',
    priority: 'medium', tags: ['quality', 'supply-chain'],
  },
  {
    title: 'Wire pre-commit (format + lint + secret scan)',
    description: 'Adopt .pre-commit-config.yaml; run formatter, linter, and gitleaks on every commit. Document the one-line install in the README.',
    priority: 'low', tags: ['quality'],
  },
  {
    title: 'Enforce Conventional Commits',
    description: 'Add commitlint + the conventional-pre-commit hook so commit messages are parseable for changelogs and SOC 2 change tracking.',
    priority: 'low', tags: ['quality'],
  },
  // ── Data / compliance ────────────────────────
  {
    title: 'Define data retention + GDPR erasure path',
    description: 'Document retention windows (incl. audit logs) with auto-archival/purge. Implement user data export and a right-to-erasure path; reconcile with soft-delete.',
    priority: 'medium', tags: ['compliance', 'data'],
  },
];
