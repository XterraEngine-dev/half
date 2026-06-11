# Security policy — half

## Reporting a vulnerability
Email the maintainers privately. Do **not** open a public issue for security
reports. Expect an acknowledgement within 72 hours.

## Supported versions
The latest released version on the default branch is supported.

## Controls in this repo
- Secrets live in env / a vault — never committed. `.env` is gitignored and
  scanned by gitleaks on every commit and in CI.
- Dependencies are pinned via a committed lockfile and scanned (SCA) on every PR.
- SAST (semgrep + language-native) runs in CI; HIGH/CRITICAL blocks merge.
- All auth/authz events are audit-logged.
- See `STANDARDS.md` for the full gate and `docs/THREAT_MODEL.md` for the model.

## Disclosure
We follow coordinated disclosure. Fixes ship before public details.
