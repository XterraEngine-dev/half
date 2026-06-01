import type { TemplateToken } from '../core/types.js';

const TOKEN_RE = /\[\[HALF:([A-Z_]+)\]\]/g;

export function replaceTokens(content: string, tokens: TemplateToken): string {
  return content.replace(TOKEN_RE, (_, key: string) => {
    const value = tokens[key as keyof TemplateToken];
    return value !== undefined ? value : `[[HALF:${key}]]`;
  });
}

const DB_PORT  = { postgres: '5432', mysql: '3306', sqlite: '' };
const DB_IMAGE = { postgres: 'postgres:16-alpine', mysql: 'mysql:8', sqlite: '' };

export function buildTokens(name: string, backend: string, frontend: string, db = ''): TemplateToken {
  const now = new Date();
  return {
    PROJECT_NAME: name,
    PROJECT_NAME_PASCAL: toPascal(name),
    PROJECT_NAME_SNAKE: name.replace(/-/g, '_'),
    YEAR: String(now.getFullYear()),
    DATE: now.toISOString().slice(0, 10),
    BACKEND: backend || 'none',
    FRONTEND: frontend || 'none',
    DB: db || 'none',
    GO_MODULE: `github.com/XterraEngine-dev/${name.replace(/-/g, '_')}`,
    DB_PORT:  DB_PORT[db as keyof typeof DB_PORT]  ?? '',
    DB_IMAGE: DB_IMAGE[db as keyof typeof DB_IMAGE] ?? '',
  };
}

function toPascal(s: string): string {
  return s
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}
