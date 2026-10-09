import { mulberry32 } from './oracleDetective';

/**
 * Hype Check (Module 0): sort claims about quantum computers into what is real today, what might happen someday,
 * and what is hype or a myth. The three bins simplify a messy picture; each card explains the nuance.
 */
export type Bin = 'real' | 'someday' | 'hype';

export interface BinInfo {
  id: Bin;
  label: string;
  hint: string;
}

export const BINS: BinInfo[] = [
  { id: 'real', label: 'Real today', hint: 'True now: you can do it or see it.' },
  { id: 'someday', label: 'Maybe someday', hint: 'Plausible, but it needs bigger, better machines or is still being researched.' },
  { id: 'hype', label: 'Hype or myth', hint: 'Not how quantum computers work, or not something they will do.' },
];

export interface Card {
  id: string;
  claim: string;
  bin: Bin;
  /** Why, in a sentence or two. Shown after the player answers. */
  why: string;
}

export const CARDS: Card[] = [
  // real today
  { id: 'cloud', bin: 'real', claim: 'You can run a program on a real quantum computer over the internet today.', why: 'True. Several companies let anyone run circuits on real quantum hardware in the cloud. The machines are small, but they are real.' },
  { id: 'noisy', bin: 'real', claim: "Today's quantum computers are small and noisy, so they make mistakes.", why: "True. Qubits are fragile and today's machines make errors, which is why error correction (Module 7) matters." },
  { id: 'interference', bin: 'real', claim: 'A quantum algorithm can use interference to cancel wrong answers and boost the right one.', why: 'True. This is the core trick behind quantum speed-ups. You will see it in Module 4 and Module 6.' },
  { id: 'post_quantum', bin: 'real', claim: 'Researchers are building new kinds of encryption that quantum computers are not known to break.', why: "True. It is called post-quantum cryptography, and it is being rolled out because a large quantum computer could someday threaten today's methods." },
  { id: 'one_bit', bin: 'real', claim: 'Measuring a qubit gives you just one ordinary bit, a 0 or a 1.', why: "True. However rich a qubit's state is, a measurement hands back a single 0 or 1 (Module 2)." },

  // maybe someday
  { id: 'break_rsa', bin: 'someday', claim: 'A large, error-corrected quantum computer could break the public-key encryption used on websites.', why: "Possible in principle (Shor's algorithm), but it needs a machine far larger and more reliable than any that exists today." },
  { id: 'molecules', bin: 'someday', claim: 'Quantum computers could help design new medicines and batteries by simulating molecules.', why: 'Promising. Molecules follow quantum rules, so a quantum computer is a natural fit, but useful results need bigger, less noisy machines.' },
  { id: 'optimise', bin: 'someday', claim: 'Quantum computers might speed up some optimisation and sampling problems.', why: 'Maybe. It is an active research area, and for many problems nobody has shown a clear advantage yet.' },
  { id: 'logical', bin: 'someday', claim: 'Many noisy physical qubits will one day act together as one reliable logical qubit.', why: 'That is the plan (error correction, Module 7). It has been tried in small experiments, but doing it at scale is still ahead of us.' },
  { id: 'network', bin: 'someday', claim: 'Quantum computers could one day be linked into a network using entanglement.', why: 'Researchers are working on it (teleportation and repeaters, Module 5B), but a large working quantum network is still ahead of us.' },

  // hype or myth
  { id: 'replace_phone', bin: 'hype', claim: 'A quantum computer will replace your phone or laptop.', why: 'Myth. Quantum computers are specialist machines for a few kinds of problems, and they need extreme conditions to run. They will sit next to normal computers, not replace them.' },
  { id: 'every_answer', bin: 'hype', claim: 'A quantum computer tries every possible answer at once and picks the right one.', why: 'The most common myth. If it did, a measurement would just give a random answer. The real trick is interference, which cancels the wrong answers.' },
  { id: 'streaming', bin: 'hype', claim: 'Quantum computers will make web browsing and video streaming much faster.', why: 'Myth. Those jobs have no structure that quantum tricks can use, so a normal computer is better, cheaper and always will be.' },
  { id: 'ftl', bin: 'hype', claim: 'Entanglement lets you send messages faster than light.', why: "Myth. Each person's results look random on their own, and they only see the link when they compare them with a normal message (Module 5A)." },
  { id: 'everything', bin: 'hype', claim: 'A quantum computer is faster than a normal computer at everything.', why: 'Myth. Speed-ups exist only for particular problems. For most jobs a normal computer wins.' },
  { id: 'infinite', bin: 'hype', claim: 'A qubit can store infinitely much information because its state is a continuous number.', why: 'Myth. The state does take continuous values, but you can never read them out: a measurement gives one bit.' },
];

/** How many of each kind a round has: mostly an even mix, with one extra myth to bust. */
export const ROUND_MIX: Record<Bin, number> = { real: 3, someday: 3, hype: 4 };
export const ROUND_SIZE = Object.values(ROUND_MIX).reduce((a, b) => a + b, 0);
/** Right answers needed to clear the round. */
export const PASS_MARK = 7;

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A round of cards: the same for the same seed, different for another, never the same card twice, no more than two of a kind in a row. */
export function dealRound(seed: number): Card[] {
  const rng = mulberry32(seed * 2654435761 + 12345);
  const picked = (Object.keys(ROUND_MIX) as Bin[]).flatMap((bin) => shuffle(CARDS.filter((c) => c.bin === bin), rng).slice(0, ROUND_MIX[bin]));
  let round = shuffle(picked, rng);
  for (let attempt = 0; attempt < 50; attempt++) {
    if (!round.some((c, i) => i >= 2 && c.bin === round[i - 1].bin && c.bin === round[i - 2].bin)) break;
    round = shuffle(picked, rng);
  }
  return round;
}

export const judge = (card: Card, choice: Bin): { correct: boolean; right: Bin } => ({ correct: choice === card.bin, right: card.bin });

export interface RoundSummary {
  correct: number;
  total: number;
  stars: 0 | 1 | 2 | 3;
  cleared: boolean;
}

export function summariseRound(answers: boolean[]): RoundSummary {
  const correct = answers.filter(Boolean).length;
  const stars = correct >= 9 ? 3 : correct >= PASS_MARK ? 2 : correct >= 5 ? 1 : 0;
  return { correct, total: answers.length, stars, cleared: correct >= PASS_MARK };
}
