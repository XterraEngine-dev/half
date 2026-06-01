# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) · Versioning: [SemVer](https://semver.org/)

---

## [Unreleased]

### Added

- **Buck — pixel-art beaver mascot** (`src/wizard/zen.ts`). Animated terminal sprite: 10-pixel-wide block-art body, round head with round ears, large dark nose, cream muzzle, two white buck teeth (chomp animation), raised paws, crosshatch flat tail with shimmer. Colors match the half terracotta palette. 16-frame animation at 120 ms/frame via `playBuckIntro()`. Not wired to `half build` yet — pending final design sign-off.

---

## [0.1.1] — 2026-05-31

### Changed

- **Visual identity applied across the full product.** The watch panel, CLI wizard, and all logo assets now use the official half design system: IBM Plex Serif + IBM Plex Mono typography, `#120f0d` carbon background, `#e9e3d8` bone ink, `#d97455` terracotta accent.
- **Animated split-h logomark** in `half watch` topbar — the CSS clip-path technique from the brand system, cycling the right half fill in terracotta.
- **Three SVG logo variants** shipped: `logo.svg` (dark), `logo-terra.svg` (terracotta badge), `logo-wide.svg` (wordmark).
- **No gradients, no glow, no shadows** — brand rules enforced throughout the UI.

---

## [0.1.0] — 2026-05-29

First public release.

### Added

**CLI**
- `half build` — interactive project wizard with arrow-key menus and Zen mascot (pixel ASCII creature, 6 moods)
- `half new <name>` — scaffold projects from composable template layers with `--dry-run` preview
- `half task add|list|show|done|block|assign|pick|progress` — atomic task management
- `half task progress <id> <0–100>` — real-time progress tracking; auto-marks done at 100%
- `half watch [--port]` — live kanban panel via SSE; auto-kills previous instance on same port
- `half log <message> [--type]` — append agent events to `.half/events.jsonl`
- `half prompt [raw|claude]` — print agent system prompt with progress tracking protocol

**Scaffolding**
- Backend templates: `go` (Chi router), `node` (TypeScript ESM), `python` (FastAPI)
- Frontend templates: `nextjs` (React 19 App Router), `react-vite`, `vue` (Composition API), `html5` (vanilla)
- Database layer: `--db postgres` (pgx v5, migrations, `.env.example`), `mysql`, `sqlite`
- Docker layer: `--docker` generates `docker-compose.yml` + `Makefile` (`make up/down/db/logs`)
- QA layer: `--qa` adds Playwright config + smoke test suite under `qa/`
- Token system `[[HALF:TOKEN]]` — no conflict with Go `{{}}`, Vue templates, or JSX

**Task system**
- `.half/tasks.json` — portable, committable task store
- File locking via `fs.open` exclusive flag — safe for concurrent team use
- Priority sorting: `high → medium → low`
- `half task pick` — atomic `pending → in_progress` transition designed for agents

**Harness viewer (`half watch`)**
- Kanban board — 4 columns (Pending / In Progress / Done / Blocked), SSE real-time push
- Progress bars on active task cards
- File activity bar — shows files modified by the agent as chips, pulses on write
- Event feed — full timeline with type, description, timestamp
- `fs.watch` on `tasks.json` + `events.jsonl` for immediate push on macOS
- Polling fallback every 2 seconds

**Agent protocol**
- Every scaffolded project includes `CLAUDE.md` constraining agents to single-task execution
- `half task progress` checkpoints: 10 / 25 / 50 / 75 / 90 / 100
- `half prompt raw` — pipe to any AI agent as system prompt

**Open source**
- MIT license — © Luis Cifuentes
- README (EN + ES), CONTRIBUTING, CODE_OF_CONDUCT
- GitHub issue templates (bug report, feature request), PR template
- CHANGELOG following Keep a Changelog

**Tests**
- 54 passing: 37 unit + 17 E2E
- Zero runtime dependencies — Node.js built-ins only

---

[Unreleased]: https://github.com/XterraEngine-dev/half/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/XterraEngine-dev/half/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/XterraEngine-dev/half/releases/tag/v0.1.0
