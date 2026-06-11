#!/usr/bin/env bash
# audit.sh — local security gate. Mirrors .github/workflows/security.yml.
# Stack-agnostic: runs only the checks relevant to files present.
set -euo pipefail

fail=0
say()  { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }
ok()   { printf '\033[32m  ok\033[0m %s\n' "$1"; }
bad()  { printf '\033[31m  FAIL\033[0m %s\n' "$1"; fail=1; }
skip() { printf '\033[2m  skip\033[0m %s\n' "$1"; }

say "secret scan (gitleaks)"
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --no-banner --redact && ok "no secrets" || bad "gitleaks found secrets"
else
  skip "gitleaks not installed (brew install gitleaks)"
fi

if [ -f go.mod ]; then
  say "go: vuln + vet"
  command -v govulncheck >/dev/null 2>&1 \
    && { govulncheck ./... && ok "govulncheck clean" || bad "govulncheck advisories"; } \
    || skip "govulncheck not installed (go install golang.org/x/vuln/cmd/govulncheck@latest)"
  go vet ./... && ok "go vet" || bad "go vet"
  command -v gosec >/dev/null 2>&1 \
    && { gosec -quiet ./... && ok "gosec" || bad "gosec findings"; } \
    || skip "gosec not installed"
fi

if [ -f package.json ]; then
  say "node: audit"
  npm audit --audit-level=high && ok "npm audit clean" || bad "npm audit HIGH+"
fi

if [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  say "python: audit"
  command -v pip-audit >/dev/null 2>&1 \
    && { pip-audit && ok "pip-audit clean" || bad "pip-audit advisories"; } \
    || skip "pip-audit not installed (pip install pip-audit)"
fi

say "tests"
if [ -f go.mod ]; then go test ./... && ok "go test" || bad "go test"; fi
if [ -f package.json ] && grep -q '"test"' package.json; then
  npm test --silent && ok "npm test" || bad "npm test"
fi

echo
[ "$fail" -eq 0 ] && printf '\033[32mAUDIT PASS\033[0m\n' || { printf '\033[31mAUDIT FAIL\033[0m\n'; exit 1; }
