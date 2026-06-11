# half — engineering standards (the patrón)

This is the canonical standard `half` scaffolds into every new project and
enforces via `half standards check`. It is the source of truth; the per-project
`STANDARDS.md` is a generated copy.

Guiding principle, shared by Anthropic's agent guidance and OWASP/SLSA/SOC 2:
**make correctness a deterministic runnable gate, not advisory documentation.**
"Give the agent a verifier" and "hooks over docs" are the agent-side mirror of
"security gate blocks deploy" and "no-bypass branch protection."

## Tiers
A project picks a tier; `half` scaffolds the matching gate. Default: **intermediate**.

- **baseline** — lockfile + pinning, pre-commit secret scan, basic SCA, branch
  protection + required review, CI tests.
- **intermediate** (default) — baseline **+** SAST + IaC scan, coverage gate,
  signed commits, SBOM, OWASP ASVS L2, centralized logging.
- **advanced** — intermediate **+** policy-as-code gates, SLSA L2→L3, artifact
  signing + attestation, threat modeling in design, DAST.

## Four pillars (intermediate)

### Quality
- Lockfile committed; dependencies pinned; dependency-confusion mitigated.
- Pre-commit: format + lint + secret scan.
- Conventional Commits (parseable history → changelogs + SOC 2 change tracking).
- Linter + formatter + type-check in CI.

### QA
- Test suite required; runs in CI on every PR.
- Coverage threshold as a CI gate (ratchet upward).
- Non-prod environment before production.
- Incremental scans on commit, full scans on build; security E2E tests.

### Architecture
- Required review + branch protection, **no bypass**.
- Separation of duties; changes traceable to a ticket (author ≠ approver).
- Threat model kept current (STRIDE).
- OWASP ASVS Level 2 baseline.
- Centralized structured audit logging; RBAC + least privilege + MFA.

### Security
- Secret scanning (pre-commit + CI); secrets in env/vault, never in git.
- SCA dependency scan — blocking on HIGH/CRITICAL.
- SAST (semgrep + language-native) in CI.
- Deploy-blocking security gate (`audit.sh` mirrors CI).
- Signed commits; SBOM per build; container image scanned.
- Least-privilege pipeline creds; manual approval gate before prod.

## Agent-loop rules (baked into generated CLAUDE.md)
- One atomic task at a time; `/clear` context between unrelated tasks.
- Explore → Plan → Implement → Commit; plan before multi-file work.
- Adversarial review in a fresh context (reviewer sees only the diff).
- Require evidence — test output, command result, screenshot — not assertions.
- Must-happen-every-time → hooks / CI gates, never prose.

## How half enforces it
| Capability | Command |
|---|---|
| Scaffold the gate into a new project | `half new <name>` (on by default; `--no-standards` to skip) |
| Add the gate to an existing project | `half standards init` |
| Run the gate locally / in CI | `half standards check` (nonzero exit on failure) |
| Seed the atomic hardening backlog | `half standards seed` |
| Track the backlog live | `half watch` |

## Sources
- Claude Code best practices — https://code.claude.com/docs/en/best-practices
- Building effective agents — https://www.anthropic.com/research/building-effective-agents
- OWASP CI/CD Security Cheat Sheet
- OWASP ASVS — https://owasp.org/www-project-application-security-verification-standard/
- SLSA — https://slsa.dev/spec/v1.1/levels
- SOC 2 controls for SaaS startups
