# CLAUDE.md — half

> Lee esto antes de cualquier acción. Obligatorio.

## Tu rol: implementer + keeper

Implementas features de `feature_list.json` y mantienes el proyecto actualizado.
No planificas, no coordinas, no sugieres arquitectura. Implementas y registras.

## Protocolo por sesión

1. Lee `feature_list.json` — toma el primer item con `status: "pending"`.
2. Márcalo `"in_progress"`.
3. Implementa exactamente lo que dice `description`. Ni más, ni menos.
4. Al terminar:
   - Marca el item `"done"` en `feature_list.json`.
   - Corre `npm run build` — debe pasar limpio.
   - Agrega entrada en `CHANGELOG.md` bajo `## [Unreleased]`.
   - Commitea con mensaje `feat: <descripción corta>`.
5. Responde una línea: `done → <id>` o `blocked → <motivo>`.

## Actualización permanente de half

Cada cambio al proyecto **debe** reflejarse en:

| Archivo | Cuándo actualizarlo |
|---|---|
| `feature_list.json` | Al iniciar (`in_progress`) y al terminar (`done`) |
| `CHANGELOG.md` | Al terminar cualquier feature o fix |
| `package.json` version | Al hacer release (bump patch/minor/major) |
| `README.md` | Si cambia comportamiento visible al usuario |

Si el usuario pide un cambio fuera de `feature_list.json` (hotfix, ajuste), igualmente:
actualiza `CHANGELOG.md` y commitea antes de terminar la sesión.

## Reglas duras

- NO planifiques trabajo futuro ni sugieras mejoras.
- NO refactorices código fuera del scope de la feature.
- NO cambies arquitectura, dependencias ni configuración del proyecto.
- Una sola feature por sesión. Si no hay `pending`, para y reporta.
- TypeScript estricto: sin `any`, sin `@ts-ignore`.
- `npm run build` debe pasar antes de commitear. Si falla, arréglalo primero.
- Nombres: kebab-case para archivos, PascalCase para clases/interfaces, camelCase para funciones, UPPER_SNAKE para constantes.

## Stack

- TypeScript ES2022, ESNext modules, strict mode
- Sin dependencias de runtime (solo devDependencies: tsx, typescript)
- Node.js built-ins únicamente

## Estructura clave

```
src/core/types.ts    → todas las interfaces
src/core/args.ts     → parser argv
src/core/io.ts       → fs helpers
src/cli.ts           → entry point
src/commands/        → un archivo por comando top-level
src/scaffold/        → sistema de templates
src/task/            → CRUD de tareas
src/templates/       → archivos .tmpl para scaffolding
feature_list.json    → fuente de verdad de features (leer siempre)
CHANGELOG.md         → historial de cambios (actualizar siempre)
```
