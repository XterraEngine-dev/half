import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateFile, TemplateToken } from '../core/types.js';
import { replaceTokens } from './token-replacer.js';

function templatesRoot(): string {
  return fileURLToPath(new URL('../templates', import.meta.url));
}

async function walkDir(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walkDir(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

export async function loadLayer(
  layer: string,
  projectName: string,
  tokens: TemplateToken
): Promise<TemplateFile[]> {
  const layerDir = join(templatesRoot(), layer);
  let allFiles: string[];
  try {
    allFiles = await walkDir(layerDir);
  } catch {
    throw new Error(`Template layer not found: ${layer}`);
  }

  const results: TemplateFile[] = [];
  for (const absPath of allFiles) {
    const rel = relative(layerDir, absPath);
    const outRel = rel.endsWith('.tmpl') ? rel.slice(0, -5) : rel;
    const outPath = join(projectName, outRel);

    const raw = await readFile(absPath, 'utf-8');
    const content = replaceTokens(raw, tokens);
    results.push({ outPath, content, layer });
  }
  return results;
}
