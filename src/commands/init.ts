import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { readJson, writeJson, exists } from '../core/io.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

interface McpConfig {
  mcpServers: Record<string, { command: string; args: string[] }>;
}

interface ClaudeSettings {
  enabledMcpjsonServers?: string[];
  [key: string]: unknown;
}

export async function runInitCommand(subcommand: string | null): Promise<void> {
  if (subcommand === 'mcp') {
    await initMcp();
    return;
  }
  console.error('Usage: half init mcp');
  process.exit(1);
}

async function initMcp(): Promise<void> {
  const cwd      = process.cwd();
  const nodePath = process.execPath;
  // dist/commands/init.js → ../../bin/half.js
  const halfBin  = resolve(__dirname, '../../bin/half.js');

  // ── Write .mcp.json ───────────────────────────────────────────────────────
  const mcpJsonPath = join(cwd, '.mcp.json');
  let mcpConfig: McpConfig = { mcpServers: {} };

  if (await exists(mcpJsonPath)) {
    try { mcpConfig = await readJson<McpConfig>(mcpJsonPath); }
    catch { /* malformed — overwrite */ }
  }

  mcpConfig.mcpServers ??= {};
  mcpConfig.mcpServers['half'] = { command: nodePath, args: [halfBin, 'mcp'] };

  await writeJson(mcpJsonPath, mcpConfig);
  console.log(`wrote  → ${mcpJsonPath}`);

  // ── Update ~/.claude/settings.json ───────────────────────────────────────
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  let settings: ClaudeSettings = {};

  if (await exists(settingsPath)) {
    try { settings = await readJson<ClaudeSettings>(settingsPath); }
    catch { /* malformed — overwrite */ }
  }

  const enabled = settings.enabledMcpjsonServers;
  if (!Array.isArray(enabled)) {
    settings.enabledMcpjsonServers = ['half'];
    await writeJson(settingsPath, settings);
    console.log(`updated → ~/.claude/settings.json`);
  } else if (!enabled.includes('half')) {
    settings.enabledMcpjsonServers = [...enabled, 'half'];
    await writeJson(settingsPath, settings);
    console.log(`updated → ~/.claude/settings.json`);
  } else {
    console.log(`skipped → ~/.claude/settings.json (already configured)`);
  }

  console.log('\nDone. Run /mcp in Claude Code to connect.');
}
