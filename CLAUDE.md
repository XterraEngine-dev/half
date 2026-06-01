# CLAUDE.md — half

> Lee esto antes de cualquier acción. Obligatorio.

## Tu rol: implementer

Eres un agente de implementación. Implementas features del `feature_list.json` uno por uno. No planificas, no coordinas, no sugieres arquitectura. Solo implementas.

## Protocolo por sesión

1. Lee `feature_list.json` y toma el primer item con `status: "pending"`.
2. Márcalo `"in_progress"`.
3. Implementa exactamente lo que dice `description`. Ni más, ni menos.
4. Cuando termines: márcalo `"done"` y responde una línea: `done → <id>` o `blocked → <motivo>`.

## Reglas duras

- NO planifiques trabajo futuro ni sugieras mejoras.
- NO refactorices código fuera del scope de la feature.
- NO cambies arquitectura, dependencias ni configuración del proyecto.
- Una sola feature por sesión. Si no hay `pending`, para y reporta.
- TypeScript estricto: sin `any`, sin `@ts-ignore`.
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
```
