<p align="center">
  <img src="assets/logo-wide.svg" alt="half" width="180"/>
</p>

<p align="center">
  <strong>Scaffolder de proyectos + gestor de tareas atómicas para desarrollo asistido por IA.</strong>
</p>

`half new` genera la estructura completa de un proyecto a partir de capas de templates componibles. `half task` gestiona una lista de tareas portable en `.half/tasks.json` que los agentes de IA leen y ejecutan una a la vez. `half watch` abre un visualizador kanban en vivo que se actualiza mientras el trabajo ocurre.

```bash
half new mi-app --backend go --frontend vue --db postgres --docker --qa
```

---

## Instalación

```bash
npm install -g half
```

Desde el código fuente:

```bash
git clone https://github.com/XterraEngine-dev/half
cd half
npm install
npm run build
npm link
```

---

## Comandos

### `half new`

Genera un nuevo proyecto a partir de capas componibles.

```bash
half new <nombre> [opciones]
```

| Flag | Valores | Descripción |
|------|---------|-------------|
| `--backend` | `go` `node` `python` | Lenguaje de backend |
| `--frontend` | `nextjs` `react-vite` `vue` `html5` | Framework de frontend |
| `--db` | `postgres` `mysql` `sqlite` | Capa de base de datos |
| `--docker` | — | Agrega `docker-compose.yml` + `Makefile` |
| `--qa` | — | Agrega suite de tests E2E con Playwright |
| `--dry-run` | — | Previsualiza archivos sin escribirlos |

**Ejemplos:**

```bash
# Go + Vue + Postgres + Docker + tests
half new mi-app --backend go --frontend vue --db postgres --docker --qa

# Solo API en Node
half new mi-servicio --backend node

# Prototipo HTML estático
half new prototipo --frontend html5

# Previsualizar qué se generaría
half new tienda --backend go --frontend nextjs --db postgres --dry-run
```

Todo proyecto recibe:
- `CLAUDE.md` — archivo de restricción para agentes (protocolo single-task)
- `.half/tasks.json` — lista de tareas del equipo
- `README.md`, `.gitignore`

---

### `half task`

Gestiona la lista de tareas del proyecto. Las tareas viven en `.half/tasks.json` — commitea este archivo.

```bash
# Agregar tarea
half task add "Implementar middleware JWT" --priority high --tags backend,auth

# Listar tareas (todas o filtradas)
half task list
half task list --status pending
half task list --assignee alice
half task list --tag backend

# Ver detalle de tarea
half task show t_7f3a2b

# Marcar como completada / bloqueada
half task done t_7f3a2b
half task block t_7f3a2b

# Asignar a alguien
half task assign t_7f3a2b alice

# Tomar la siguiente tarea pendiente (diseñado para agentes)
half task pick
half task pick --assignee claude --tag backend
```

**Prioridades:** `high` `medium` (default) `low`

**Estados:** `pending` → `in_progress` → `done` / `blocked`

---

### `half watch`

Inicia el visualizador de harness en `http://localhost:4747`.

```bash
half watch
half watch --port 8888
```

Muestra:
- **Kanban** — tareas por estado, actualización en tiempo real
- **Actividad de archivos** — archivos modificados por el agente aparecen como chips
- **Feed de eventos** — línea de tiempo completa de eventos de tareas y agentes

Relanzar `half watch` mata automáticamente la instancia anterior en el mismo puerto.

---

### `half log`

Agrega un evento de agente a `.half/events.jsonl`. Usado por agentes para señalar actividad.

```bash
half log "Leyendo main.go para entender estructura de handlers"
half log "Sesión de agente iniciada" --type agent.start
half log "Bloqueado: falta definición del schema" --type agent.log
```

---

## Flujo con agentes de IA

`half` está diseñado para agentes de IA (Claude Code, etc.) que ejecutan una tarea a la vez.

### Cómo funciona

1. El desarrollador agrega tareas con `half task add`
2. El agente ejecuta `half task pick` — marca la tarea pendiente de mayor prioridad como `in_progress`
3. El agente implementa exactamente lo que dice `description` — nada más
4. El agente ejecuta `half task done <id>`
5. El panel se actualiza en tiempo real vía SSE

### CLAUDE.md

Todo proyecto scaffoldeado incluye un `CLAUDE.md` que restringe al agente:

```
- Corre half task list --status in_progress primero
- Implementa exactamente lo que dice description — sin más
- No refactorices fuera del scope de la tarea
- No cambies dependencias ni arquitectura
- Termina con: half task done <id>
```

### Formato recomendado para description

Escribe `description` como una spec acotada que el agente pueda ejecutar sin ambigüedad:

```bash
half task add "Agregar rate limiting al API" \
  --description "En main.go agregar middleware que limite cada IP a 100 req/min. \
Usar golang.org/x/time/rate. Aplicar solo a rutas /items. Sin nuevos paquetes." \
  --priority high --tags backend
```

---

## Uso en equipo

`.half/tasks.json` es un archivo JSON plano — commitéalo. Múltiples agentes pueden usar `half task pick --assignee <nombre>` para reclamar tareas. El file locking previene condiciones de carrera.

---

## Agregar templates

1. Crea un directorio en `src/templates/<capa>/`
2. Agrega archivos con extensión `.tmpl`
3. Usa `[[HALF:TOKEN]]` para sustituciones
4. Extiende los tipos en `src/core/types.ts`
5. Agrega al array válido en `src/commands/new.ts`

**Tokens disponibles:** `PROJECT_NAME`, `PROJECT_NAME_PASCAL`, `PROJECT_NAME_SNAKE`, `YEAR`, `DATE`, `BACKEND`, `FRONTEND`, `DB`, `GO_MODULE`, `DB_PORT`, `DB_IMAGE`

---

## Licencia

MIT © [Luis Cifuentes](https://github.com/XterraEngine-dev)
