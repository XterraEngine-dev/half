# Changelog

All notable changes to this project will be documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-05-29

First public release.

### Added

**CLI**
- `half new <name>` — scaffold new projects from composable template layers
- `half task add|list|show|done|block|assign|pick` — atomic task management
- `half watch [--port]` — live kanban viewer with SSE push, auto-kills previous instance on same port
- `half log <message> [--type]` — append agent events to `.half/events.jsonl`

**Scaffolding**
- Backend templates: `go`, `node`, `python`
- Frontend templates: `nextjs`, `react-vite`, `vue`, `html5`
- Database layer: `--db postgres` (pgx v5, migrations, `.env.example`)
- Docker layer: `--docker` generates `docker-compose.yml` + `Makefile`
- QA layer: `--qa` adds Playwright config + smoke test suite
- `--dry-run` flag previews all files before writing
- Token system `[[HALF:TOKEN]]` — avoids conflicts with Go `{{}}`, Vue templates, JSX

**Task system**
- `.half/tasks.json` — portable, committable task store
- File locking via `fs.open` exclusive flag — safe for team concurrent use
- Priority sorting: `high` → `medium` → `low`
- `half task pick` — atomic pending → in_progress transition for agents

**Harness viewer (`half watch`)**
- Kanban board with real-time SSE updates
- File activity bar — shows files modified by agent as they change
- Event feed — full timeline of task + agent events
- `fs.watch` on `tasks.json` + `events.jsonl` for immediate push on macOS

**Agent protocol**
- Generated `CLAUDE.md` constrains agents to single-task execution
- `half log` for agent-to-panel communication
- Workflow: `half task pick` → implement → `half task done`

**Infrastructure**
- Zero runtime dependencies (Node.js built-ins only)
- TypeScript strict mode, ESNext modules
- `npm link` for global installation
- `scripts/copy-templates.mjs` copies `.tmpl` assets post-build

---

[0.1.0]: https://github.com/XterraEngine-dev/half/releases/tag/v0.1.0
