<p align="center">
  <img src="assets/logo-wide.svg" alt="half" width="180"/>
</p>

<p align="center">
  <strong>Project scaffolder + atomic task manager for AI-assisted development.</strong>
</p>

`half new` generates a full project structure from composable templates. `half task` manages a portable todo-list in `.half/tasks.json` that AI agents read and execute one task at a time. `half watch` opens a live kanban viewer that updates as work happens.

```
half new my-api --backend go --frontend vue --db postgres --docker --qa
```

---

## Install

```bash
npm install -g half
```

Or from source:

```bash
git clone https://github.com/XterraEngine-dev/half
cd half
npm install
npm run build
npm link
```

---

## Commands

### `half new`

Scaffold a new project from composable layers.

```bash
half new <name> [options]
```

| Flag | Values | Description |
|------|--------|-------------|
| `--backend` | `go` `node` `python` | Backend language |
| `--frontend` | `nextjs` `react-vite` `vue` `html5` | Frontend framework |
| `--db` | `postgres` `mysql` `sqlite` | Database layer |
| `--docker` | — | Add `docker-compose.yml` + `Makefile` |
| `--qa` | — | Add Playwright E2E test suite |
| `--dry-run` | — | Preview files without writing |

**Examples:**

```bash
# Go API + Vue + Postgres + Docker + tests
half new my-app --backend go --frontend vue --db postgres --docker --qa

# Node API only
half new my-service --backend node

# Static HTML prototype
half new prototype --frontend html5

# Preview what would be generated
half new shop --backend go --frontend nextjs --db postgres --dry-run
```

Every project gets:
- `CLAUDE.md` — agent constraint file (single-task protocol)
- `.half/tasks.json` — team task list
- `README.md`, `.gitignore`

---

### `half task`

Manage the project task list. Tasks live in `.half/tasks.json` — commit this file.

```bash
# Add a task
half task add "Implement JWT middleware" --priority high --tags backend,auth

# List tasks (all or filtered)
half task list
half task list --status pending
half task list --assignee alice
half task list --tag backend

# Show task detail
half task show t_7f3a2b

# Mark done / blocked
half task done t_7f3a2b
half task block t_7f3a2b

# Assign to someone
half task assign t_7f3a2b alice

# Pick next pending task (marks in_progress — designed for agents)
half task pick
half task pick --assignee claude --tag backend
```

**Task priorities:** `high` `medium` (default) `low`

**Task statuses:** `pending` → `in_progress` → `done` / `blocked`

---

### `half watch`

Start the live harness viewer at `http://localhost:4747`.

```bash
half watch
half watch --port 8888
```

Shows:
- **Kanban** — tasks by status, updates in real time
- **File activity** — files modified by the agent appear as chips
- **Event feed** — full timeline of task and agent events

Re-running `half watch` automatically kills the previous instance on the same port.

---

### `half log`

Append an agent event to `.half/events.jsonl`. Used by agents to signal activity.

```bash
half log "Reading main.go to understand handler structure"
half log "Agent session started" --type agent.start
half log "Blocked: missing schema definition" --type agent.log
```

---

## Agent workflow

`half` is designed for AI agents (Claude Code, etc.) that execute one task at a time.

### How it works

1. Developer adds tasks with `half task add`
2. Agent runs `half task pick` — marks the highest-priority pending task as `in_progress`
3. Agent implements exactly what `description` says — nothing more
4. Agent runs `half task done <id>`
5. Panel updates live via SSE

### CLAUDE.md

Every scaffolded project includes a `CLAUDE.md` that constrains the agent:

```
- Run half task list --status in_progress first
- Implement exactly what description says — no more
- No refactoring outside task scope
- No architecture changes
- End with: half task done <id>
```

### Recommended task description format

Write `description` as a bounded spec the agent can execute without ambiguity:

```bash
half task add "Add rate limiting to API" \
  --description "In main.go, add a middleware that limits each IP to 100 req/min. Use golang.org/x/time/rate. Apply only to /items routes. No new packages beyond x/time." \
  --priority high --tags backend
```

---

## Team use

`.half/tasks.json` is a plain JSON file — commit it. Multiple agents can use `half task pick --assignee <name>` to claim tasks. File locking prevents race conditions.

```json
{
  "version": 1,
  "project": "my-app",
  "tasks": [
    {
      "id": "t_7f3a2b",
      "title": "Add rate limiting",
      "description": "...",
      "status": "pending",
      "priority": "high",
      "assignee": null,
      "tags": ["backend"],
      "createdAt": "2026-05-29T14:00:00Z",
      "updatedAt": "2026-05-29T14:00:00Z",
      "doneAt": null
    }
  ]
}
```

---

## Architecture

```
half/
  src/
    cli.ts              Entry point + command dispatch
    commands/           new.ts, task.ts, watch.ts
    core/               types.ts, args.ts, io.ts
    scaffold/           scaffold.ts, template-loader.ts, token-replacer.ts
    task/               task-store.ts, task-id.ts, task-display.ts
    watch/              server.ts, event-log.ts, ui.ts
    templates/
      shared/           CLAUDE.md, tasks.json, .gitignore, README.md
      backend/          go/, node/, python/
      frontend/         nextjs/, react-vite/, vue/, html5/
      db/               postgres/, mysql/, sqlite/
      docker/           docker-compose.yml, Makefile
      qa/               playwright.config.ts, e2e/
```

**Token system** — templates use `[[HALF:TOKEN]]` delimiters (avoids conflict with Go `{{}}`, Vue templates, JSX).

Available tokens: `PROJECT_NAME`, `PROJECT_NAME_PASCAL`, `PROJECT_NAME_SNAKE`, `YEAR`, `DATE`, `BACKEND`, `FRONTEND`, `DB`, `GO_MODULE`, `DB_PORT`, `DB_IMAGE`.

---

## Adding templates

1. Create a directory under `src/templates/<layer>/`
2. Add files with `.tmpl` extension
3. Use `[[HALF:TOKEN]]` for substitution
4. Pass the layer name to `--backend`, `--frontend`, `--db`, or extend `scaffold.ts`

---

## License

MIT © [Luis Cifuentes](https://github.com/XterraEngine-dev)
