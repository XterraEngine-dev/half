import { join } from 'node:path';
import { writeText } from '../core/io.js';
import { buildTokens } from './token-replacer.js';
import { loadLayer } from './template-loader.js';
import type { ScaffoldOptions, TemplateFile } from '../core/types.js';

export async function scaffold(opts: ScaffoldOptions): Promise<void> {
  const layers: string[] = ['shared'];
  if (opts.backend) layers.push(`backend/${opts.backend}`);
  if (opts.frontend) layers.push(`frontend/${opts.frontend}`);
  if (opts.db)     layers.push(`db/${opts.db}`);
  if (opts.docker) layers.push('docker');
  if (opts.qa)     layers.push('qa');

  const tokens = buildTokens(opts.name, opts.backend ?? '', opts.frontend ?? '', opts.db ?? '');

  const allFiles: TemplateFile[] = [];
  const seen = new Map<string, string>();

  for (const layer of layers) {
    const files = await loadLayer(layer, opts.name, tokens);
    for (const f of files) {
      if (seen.has(f.outPath)) {
        throw new Error(
          `Template collision: "${f.outPath}" produced by both "${seen.get(f.outPath)}" and "${f.layer}"`
        );
      }
      seen.set(f.outPath, f.layer);
      allFiles.push(f);
    }
  }

  if (opts.dryRun) {
    console.log(`Dry run — would create ${allFiles.length} files:\n`);
    for (const f of allFiles) {
      console.log(`  [${f.layer.padEnd(16)}]  ${f.outPath}`);
    }
    return;
  }

  const outBase = join(opts.outputDir, opts.name);
  for (const f of allFiles) {
    const dest = join(opts.outputDir, f.outPath);
    await writeText(dest, f.content);
  }

  console.log(`\nScaffolded "${opts.name}" with ${allFiles.length} files in ${outBase}`);
  if (!opts.backend && !opts.frontend) {
    console.log('Tip: use --backend go|node|python and/or --frontend nextjs|react-vite|vue to add runnable code.');
  }
}
