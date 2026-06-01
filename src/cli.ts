import { parseArgs } from './core/args.js';
import { runNewCommand } from './commands/new.js';
import { runBuildCommand } from './commands/build.js';
import { runPromptCommand } from './commands/prompt.js';
import { runTaskCommand } from './commands/task.js';
import { runWatchCommand } from './commands/watch.js';
import { runMcpCommand } from './commands/mcp.js';
import { runInitCommand } from './commands/init.js';
import { appendEvent } from './watch/event-log.js';
import { resolve } from 'node:path';

const HELP = `
half — project scaffolder and task manager

Commands:
  half build                    interactive project wizard (recommended)
  half new <name> [--backend go|node|python] [--frontend nextjs|react-vite|vue|html5] [--db postgres|mysql|sqlite] [--docker] [--qa] [--dry-run]
  half task add "<title>" [--description <text>] [--priority high|medium|low] [--assignee <name>] [--tags tag1,tag2]
  half task list [--status pending|in_progress|done|blocked] [--assignee <name>] [--tag <tag>] [--priority high|medium|low]
  half task show <id>
  half task done <id>
  half task block <id>
  half task assign <id> <assignee>
  half task pick [--assignee <name>] [--tag <tag>]
  half task progress <id> <0-100>
  half watch [--port 4747]
  half init mcp                 configure Claude Code MCP integration in current project
  half mcp                      start MCP stdio server (for Claude Code integration)
  half log <message> [--type agent.start|agent.stop|agent.log]
  half prompt [claude|raw]     print agent system prompt
`.trim();

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (!args.command || args.command === 'help' || args.flags['help'] === true) {
    console.log(HELP);
    return;
  }

  if (args.command === 'build') {
    await runBuildCommand();
    return;
  }

  if (args.command === 'new') {
    await runNewCommand(args);
    return;
  }

  if (args.command === 'task') {
    await runTaskCommand(args);
    return;
  }

  if (args.command === 'watch') {
    await runWatchCommand(args);
    return;
  }

  if (args.command === 'prompt') {
    const target = (args.subcommand ?? 'generic') as 'claude' | 'generic' | 'raw';
    await runPromptCommand(target);
    return;
  }

  if (args.command === 'init') {
    await runInitCommand(args.subcommand);
    return;
  }

  if (args.command === 'mcp') {
    await runMcpCommand();
    return;
  }

  if (args.command === 'log') {
    const message = args.subcommand ?? args.positionals[0];
    if (!message) { console.error('Usage: half log "<message>"'); process.exit(1); }
    const type = (args.flags['type'] as 'agent.start' | 'agent.stop' | 'agent.log') ?? 'agent.log';
    await appendEvent(resolve(process.cwd()), { type, message });
    console.log(`logged → ${type}`);
    return;
  }

  console.error(`Unknown command: ${args.command}`);
  console.error('Run "half help" for usage.');
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
