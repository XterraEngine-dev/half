export const A = {
  reset:       '\x1b[0m',
  bold:        '\x1b[1m',
  dim:         '\x1b[2m',
  italic:      '\x1b[3m',
  clearScreen: '\x1b[2J\x1b[H',
  clearLine:   '\x1b[2K\r',
  hideCursor:  '\x1b[?25l',
  showCursor:  '\x1b[?25h',
  up:   (n: number) => `\x1b[${n}A`,
  down: (n: number) => `\x1b[${n}B`,
  col:  (n: number) => `\x1b[${n}G`,
  move: (r: number, c: number) => `\x1b[${r};${c}H`,

  // 256-colour helpers
  fg: (n: number) => `\x1b[38;5;${n}m`,
  bg: (n: number) => `\x1b[48;5;${n}m`,

  // half design system — IBM Plex palette in terminal approx
  terra:  '\x1b[38;5;173m',   // #d97455 terracota — acento activo
  terraDim:'\x1b[38;5;130m',  // #a8553d
  bone:   '\x1b[38;5;230m',   // #e9e3d8 hueso — tinta primaria
  bone2:  '\x1b[38;5;187m',   // #bdb6a8
  muted:  '\x1b[38;5;243m',   // #7c7367 piedra
  faint:  '\x1b[38;5;238m',   // #4f483f
  green:  '\x1b[38;5;108m',   // #74b089 done
  red:    '\x1b[38;5;167m',   // #c4604d blocked
  white:  '\x1b[38;5;230m',
  cream:  '\x1b[38;5;230m',
  // aliases for backwards compat
  orange: '\x1b[38;5;173m',
  yellow: '\x1b[38;5;173m',
  cyan:   '\x1b[38;5;187m',
};

export function write(s: string): void { process.stdout.write(s); }
export function writeln(s = ''): void  { process.stdout.write(s + '\n'); }

export function box(lines: string[], color = A.orange): string {
  const w = Math.max(...lines.map(l => stripAnsi(l).length));
  const top = color + '╭' + '─'.repeat(w + 2) + '╮' + A.reset;
  const bot = color + '╰' + '─'.repeat(w + 2) + '╯' + A.reset;
  const mid = lines.map(l => {
    const pad = w - stripAnsi(l).length;
    return color + '│' + A.reset + ' ' + l + ' '.repeat(pad) + ' ' + color + '│' + A.reset;
  });
  return [top, ...mid, bot].join('\n');
}

export function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}
