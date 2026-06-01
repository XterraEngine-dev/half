# Contributing to half

## Before opening a PR

- Open an issue first for non-trivial changes — alignment before code
- One concern per PR: bug fix, feature, or refactor — not all three
- PRs without a linked issue or clear description will be closed

## Setup

```bash
git clone https://github.com/XterraEngine-dev/half
cd half
npm install
npm run build
npm link       # installs `half` globally for manual testing
```

## Development

```bash
npm run dev    # run without compiling (tsx)
npm run build  # compile TypeScript → dist/
npm run typecheck  # type check without emit
```

After editing templates, rebuild to copy to `dist/templates/`:
```bash
npm run build
```

## Code rules

- TypeScript strict mode — no `any`, no `@ts-ignore`
- No runtime dependencies (only `tsx` + `typescript` as devDeps)
- Node.js built-ins only — no external packages in `src/`
- Template delimiter is `[[HALF:TOKEN]]` — not `{{}}` (conflicts with Go/Vue)
- Kebab-case filenames, PascalCase classes, camelCase functions, UPPER_SNAKE constants
- No comments unless the why is non-obvious

## Adding a template layer

1. Create `src/templates/<category>/<name>/`
2. Add `.tmpl` files — use `[[HALF:TOKEN]]` for substitutions
3. Extend `BackendFlavor | FrontendFlavor | DbFlavor` in `src/core/types.ts`
4. Add to the valid arrays in `src/commands/new.ts`
5. Add a dry-run test in your PR description

## PR checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] Manual test: `half new test-proj --<flags> --dry-run` shows expected files
- [ ] No new runtime dependencies
- [ ] Existing commands unchanged (backwards compatible)

## Commit style

```
<type>: <short description>

type: feat | fix | refactor | docs | chore | template
```

Examples:
```
feat: add --db sqlite template layer
fix: watch server kills existing process on port reuse
template: add Rust backend scaffold
docs: expand agent workflow section in README
```
