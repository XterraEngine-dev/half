import type { ParsedArgs } from './types.js';

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        flags[arg.slice(2)] = args[i + 1];
        i++;
      } else {
        flags[arg.slice(2)] = true;
      }
    } else {
      positionals.push(arg);
    }
    i++;
  }

  const [command = '', subcommand = null, ...rest] = positionals;

  return {
    command,
    subcommand: subcommand ?? null,
    positionals: rest,
    flags,
  };
}
