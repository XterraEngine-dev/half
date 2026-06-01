import { createInterface } from 'node:readline';
import { write, writeln, A } from './ansi.js';

/* ── text input ── */
export function askText(question: string, placeholder = ''): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      `${A.orange}❯${A.reset} ${A.white}${question}${A.reset} ${A.muted}${placeholder ? `(${placeholder}) ` : ''}${A.reset}`,
      (answer) => { rl.close(); resolve(answer.trim() || placeholder); }
    );
  });
}

/* ── arrow-key single-select menu ── */
export interface Choice<T> {
  value: T;
  label: string;
  hint?: string;
}

export function selectMenu<T>(title: string, choices: Choice<T>[]): Promise<T> {
  return new Promise((resolve) => {
    let idx = 0;
    const lines = choices.length + 2;

    function render() {
      write(A.up(lines));
      writeln(`  ${A.bold}${A.white}${title}${A.reset}`);
      writeln();
      choices.forEach((c, i) => {
        const active  = i === idx;
        const cursor  = active ? `${A.orange}❯${A.reset}` : ' ';
        const bullet  = active ? `${A.orange}●${A.reset}` : `${A.muted}○${A.reset}`;
        const label   = active ? `${A.white}${c.label}${A.reset}` : `${A.muted}${c.label}${A.reset}`;
        const hint    = c.hint ? `  ${A.muted}${c.hint}${A.reset}` : '';
        writeln(`  ${cursor} ${bullet} ${label}${hint}`);
      });
    }

    // initial render
    writeln();
    writeln(`  ${A.bold}${A.white}${title}${A.reset}`);
    writeln();
    choices.forEach((c, i) => {
      const active = i === 0;
      const cursor = active ? `${A.orange}❯${A.reset}` : ' ';
      const bullet = active ? `${A.orange}●${A.reset}` : `${A.muted}○${A.reset}`;
      const label  = active ? `${A.white}${c.label}${A.reset}` : `${A.muted}${c.label}${A.reset}`;
      const hint   = c.hint ? `  ${A.muted}${c.hint}${A.reset}` : '';
      writeln(`  ${cursor} ${bullet} ${label}${hint}`);
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function onKey(key: string) {
      if (key === '') { cleanup(); process.exit(0); }        // ctrl+c
      if (key === '[A') { idx = (idx - 1 + choices.length) % choices.length; render(); } // up
      if (key === '[B') { idx = (idx + 1) % choices.length; render(); }                  // down
      if (key === '\r' || key === '\n') { cleanup(); resolve(choices[idx].value); }                       // enter
    }

    function cleanup() {
      process.stdin.removeListener('data', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }

    process.stdin.on('data', onKey);
  });
}

/* ── yes/no ── */
export function confirm(question: string, def = true): Promise<boolean> {
  return selectMenu(question, [
    { value: true,  label: 'Yes', hint: def ? 'default' : '' },
    { value: false, label: 'No',  hint: !def ? 'default' : '' },
  ]);
}
