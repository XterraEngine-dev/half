import { A } from './ansi.js';

// Zen — half's mascot. 8-bit pixel creature.
// Expression swaps eyes/mouth for state feedback.

export type ZenMood = 'idle' | 'happy' | 'think' | 'wow' | 'warn' | 'done';

const EYES: Record<ZenMood, string> = {
  idle:  `${A.orange}◉${A.reset} ${A.orange}◉${A.reset}`,
  happy: `${A.yellow}^${A.reset} ${A.yellow}^${A.reset}`,
  think: `${A.cyan}◑${A.reset} ${A.muted}─${A.reset}`,
  wow:   `${A.yellow}◎${A.reset} ${A.yellow}◎${A.reset}`,
  warn:  `${A.red}◉${A.reset} ${A.red}◉${A.reset}`,
  done:  `${A.green}◉${A.reset} ${A.green}◉${A.reset}`,
};

const MOUTH: Record<ZenMood, string> = {
  idle:  `${A.muted}─ω─${A.reset}`,
  happy: `${A.yellow}\\▽/${A.reset}`,
  think: `${A.muted}...${A.reset}`,
  wow:   `${A.yellow} O ${A.reset}`,
  warn:  `${A.red}>▂<${A.reset}`,
  done:  `${A.green}\\ω/${A.reset}`,
};

const BODY_COLOR: Record<ZenMood, string> = {
  idle:  A.orange,
  happy: A.yellow,
  think: A.cyan,
  wow:   A.yellow,
  warn:  A.red,
  done:  A.green,
};

export const ZEN_QUOTES: Record<ZenMood, string[]> = {
  idle:  ['Ready when you are.', 'What are we building?', 'Let\'s scaffold something.'],
  happy: ['Great name!', 'Nice choice!', 'Love it!', 'Let\'s go!'],
  think: ['Hmm...', 'One sec...', 'Thinking...'],
  wow:   ['Whoa, full stack!', 'The whole thing!', 'Big project!'],
  warn:  ['Are you sure?', 'Double-check this.', 'No going back!'],
  done:  ['Done! Go build.', 'Your stack is ready.', 'Let\'s ship it.'],
};

export function renderZen(mood: ZenMood, quoteIdx = 0): string[] {
  const c  = BODY_COLOR[mood];
  const e  = EYES[mood];
  const m  = MOUTH[mood];
  const q  = ZEN_QUOTES[mood][quoteIdx % ZEN_QUOTES[mood].length];

  return [
    `      ${c}╻${A.reset}        `,
    `   ${c}╭─────╮${A.reset}   `,
    `   ${c}│${A.reset} ${e} ${c}│${A.reset}   `,
    `   ${c}│ ${m} │${A.reset}   `,
    `   ${c}╰──┬──╯${A.reset}   `,
    `   ${c}╭──┴──╮${A.reset}   `,
    `   ${c}│     │${A.reset}   `,
    `   ${c}╰─┬─┬─╯${A.reset}   `,
    `     ${c}╵${A.reset} ${c}╵${A.reset}      `,
    `  ${A.muted}"${q}"${A.reset}`,
  ];
}
