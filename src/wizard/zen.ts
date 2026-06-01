import { A } from './ansi.js';

// ── Buck — pixel art beaver mascot ────────────────────────────────────────
//
//  10 pixels wide × 11 rows, 2 chars per pixel = 20 chars per body row
//  Faithful to the pixel art image: round head, big nose, buck teeth,
//  raised paws, chubby body, crosshatch tail to the right.
//
//      row 0:    ████        ████         ears (px 2, 7)
//      row 1:   ████████████████          dome (px 1-8)
//      row 2:  ████████████████████       full face
//      row 3:  ████[E]████████[E]████     eyes (px 2, 7)
//      row 4:  ██████[NOSE  ]██████       nose (px 3-6)
//      row 5:  ████[cream muzzle  ]████   muzzle
//      row 6:  ████[c][TH][c][TH][c]████  teeth — CHOMP
//      row 7:  [lighter chest / belly  ]  [tail]
//      row 8:  [pw][  belly  ][pw]        [tail]  ← paws raised
//      row 9:  [body lower             ]  [tail]
//      row 10:    [paw]        [paw]       feet
//      quote

const BB  = '\x1b[38;5;130m';   // dark brown fur (main body)
const BL  = '\x1b[38;5;172m';   // lighter orange-brown (belly / chest)
const CR  = '\x1b[38;5;223m';   // cream muzzle
const NS  = '\x1b[38;5;88m';    // dark nose
const EY  = '\x1b[38;5;232m';   // eyes (black)
const EH  = '\x1b[38;5;255m';   // eye highlight (white shine dot)
const TH  = '\x1b[38;5;255m';   // teeth (white)
const TL  = '\x1b[38;5;95m';    // tail light gray-brown
const TLD = '\x1b[38;5;239m';   // tail dark (crosshatch lines)
const PW  = '\x1b[38;5;94m';    // paws / feet dark brown
const BUCK_H = 12;              // 11 body rows + 1 quote

function buckFrame(n: number): string[] {
  const R = A.reset;

  // eyes: black with white-shine on open; half-block squint on blink frame
  const ep = n % 8 === 4
    ? `${EY}▄▄`          // squint
    : `${EY}█${EH}▌`;    // open — black + right-half white shine

  // teeth: 2 white buck teeth (pos 3-4 & 6-7 in muzzle) or chomped
  const teethRow = n % 4 === 1
    ? `${BB}████${CR}██████████████${BB}██${R}`                       // chomped
    : `${BB}████${CR}██${TH}████${CR}██${TH}████${CR}██${BB}██${R}`; // showing

  // tail crosshatch: alternate A/B for shimmer texture
  const txa = n % 2 === 0 ? TL  : TLD;
  const txb = n % 2 === 0 ? TLD : TL;
  const tail = `${txa}▒▒${txb}▒▒${txa}▒▒${txb}▒▒${R}`;  // 8 chars = 4 tail pixels

  const quotes = [
    '"Let\'s build!"',
    '"Ready to chop!"',
    '"What are we building?"',
    '"Dam good project."',
  ];
  const q = quotes[n % quotes.length];

  return [
    // row 0: ears at px 2 and 7                        — 20 chars
    `    ${A.dim}${BB}██${R}        ${A.dim}${BB}██${R}    `,
    // row 1: head dome px 1-8                           — 20 chars
    `  ${BB}████████████████${R}  `,
    // row 2: full face px 0-9                           — 20 chars
    `${BB}████████████████████${R}`,
    // row 3: eyes at px 2 and 7                         — 20 chars
    `${BB}████${R}${ep}${R}${BB}████████${R}${ep}${R}${BB}████${R}`,
    // row 4: large oval nose px 3-6                     — 20 chars
    `${BB}██████${NS}████████${BB}██████${R}`,
    // row 5: cream muzzle px 2-8                        — 20 chars
    `${BB}████${CR}██████████████${BB}██${R}`,
    // row 6: buck teeth inside muzzle                   — 20 chars
    teethRow,
    // row 7: lighter chest + tail starts               — 20 + 8
    `${BL}████████████████████${R}${tail}`,
    // row 8: raised paws + belly + tail                — 20 + 8
    `${BB}██${PW}████${BL}████████${PW}████${BB}██${R}${tail}`,
    // row 9: lower body + tail                         — 20 + 8
    `${BB}████████████████████${R}${tail}`,
    // row 10: feet at px 1-2 and 7-8                   — 20 chars
    `  ${PW}████${R}        ${PW}████${R}  `,
    // quote
    `  ${A.muted}${q}${R}`,
  ];
}

function buckSleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export async function playBuckIntro(): Promise<void> {
  const FRAMES = 16;
  const DELAY  = 120;
  process.stdout.write(A.hideCursor);
  for (const l of buckFrame(0)) process.stdout.write(l + '\n');
  for (let i = 1; i < FRAMES; i++) {
    await buckSleep(DELAY);
    process.stdout.write(A.up(BUCK_H));
    for (const l of buckFrame(i)) process.stdout.write(A.clearLine + l + '\n');
  }
  await buckSleep(200);
  process.stdout.write(A.up(BUCK_H));
  for (const l of buckFrame(0)) process.stdout.write(A.clearLine + l + '\n');
  process.stdout.write(A.showCursor);
}

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
