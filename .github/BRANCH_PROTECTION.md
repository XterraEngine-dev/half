# Branch protection — half

SOC 2 change-management + OWASP CI/CD baseline. Apply on the default branch.
These are repo settings, not code — set them once in GitHub → Settings → Branches
(or via `gh api`). `half standards check` flags the docs/CI side; the no-bypass
enforcement itself must be configured here.

## Required settings (default branch)
- [ ] Require a pull request before merging.
- [ ] Require **at least 1 approving review** (author ≠ approver — separation of duties).
- [ ] Require review from **Code Owners** (`CODEOWNERS`).
- [ ] Dismiss stale approvals on new commits.
- [ ] Require status checks to pass: `ci`, `security / secret-scan`,
      `security / sast`, `security / sca`, `security / sbom-and-image`.
- [ ] Require branches to be up to date before merging.
- [ ] Require **signed commits**.
- [ ] Require linear history (no merge commits if you squash).
- [ ] Include administrators (no bypass).
- [ ] Restrict who can push to matching branches.
- [ ] Block force pushes and deletions.

## Production deploys
- [ ] Use a GitHub Environment named `production` with a **required reviewer**
      (manual approval gate before prod).

## One-shot via gh (edit OWNER/REPO)
```bash
gh api -X PUT repos/OWNER/REPO/branches/main/protection \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f required_pull_request_reviews.require_code_owner_reviews=true \
  -f enforce_admins=true \
  -f required_signatures=true \
  -F required_status_checks.strict=true \
  -f 'required_status_checks.contexts[]=ci' \
  -f 'required_status_checks.contexts[]=security / secret-scan' \
  -f restrictions=
```
