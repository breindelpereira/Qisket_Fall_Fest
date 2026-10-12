import { CLASSICAL_LIMIT, QUANTUM_LIMIT, QUESTION_PAIRS, bellOutcomeProbabilities, quantumWinProbability, wins } from './chsh';
import type { Bit, QuantumStrategy } from './chsh';

/**
 * Entangled Pair: the CHSH game, played by two people passing one phone. Each player gets a question bit and chooses an
 * angle to measure their half of a shared entangled pair at (by tilting the phone, or with a slider). The engine in
 * `chsh.ts` gives the answers: Alice's and Bob's bits are each random, but correlated according to the two angles.
 *
 * No strategy that uses only shared answers decided beforehand can win more than 75% of the time; with the right angles
 * on an entangled pair the win rate is about 85%. The winning angles are not told to the player at the start: they find
 * them by playing, with a hint ladder for anyone who wants it.
 */
export const ROUNDS = 24;
export const DEG = Math.PI / 180;

/** The angles in degrees, one for each question, as the players chose them. */
export interface Played {
  x: Bit;
  y: Bit;
  /** Alice's and Bob's angles in degrees for this round. */
  alpha: number;
  beta: number;
  a: Bit;
  b: Bit;
  won: boolean;
}

/** Plays one round with the angles chosen (degrees), sampling the outcomes from the engine's joint distribution. */
export function playRound(x: Bit, y: Bit, alphaDeg: number, betaDeg: number, rng: () => number = Math.random): Played {
  const joint = bellOutcomeProbabilities(alphaDeg * DEG, betaDeg * DEG);
  const r = rng();
  let acc = 0;
  let a: Bit = 1;
  let b: Bit = 1;
  outer: for (const ai of [0, 1] as Bit[]) {
    for (const bi of [0, 1] as Bit[]) {
      acc += joint[ai][bi];
      if (r < acc) {
        a = ai;
        b = bi;
        break outer;
      }
    }
  }
  return { x, y, alpha: alphaDeg, beta: betaDeg, a, b, won: wins(x, y, a, b) };
}

/** The exact chance that these two angles win the question pair (x, y). */
export function winChance(x: Bit, y: Bit, alphaDeg: number, betaDeg: number): number {
  const joint = bellOutcomeProbabilities(alphaDeg * DEG, betaDeg * DEG);
  let p = 0;
  for (const a of [0, 1] as Bit[]) for (const b of [0, 1] as Bit[]) if (wins(x, y, a, b)) p += joint[a][b];
  return p;
}

/**
 * The questions for a game: every one of the four pairs the same number of times, in a shuffled order, so the luck of
 * the draw cannot make one game easier than another.
 */
export function questionList(rounds: number = ROUNDS, rng: () => number = Math.random): [Bit, Bit][] {
  const list: [Bit, Bit][] = [];
  for (let i = 0; i < rounds; i++) list.push(QUESTION_PAIRS[i % 4]);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** A tilt (degrees, as the phone reports it) as a measurement angle, limited to -90 to 90 and rounded to 1 degree. */
export const angleFromTilt = (tiltDeg: number): number => Math.round(Math.min(90, Math.max(-90, tiltDeg)));

const mean = (values: number[]): number | null => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/**
 * The strategy the players' choices add up to: for each question, the average angle they used. It is what they would
 * win with in the long run if they kept doing that, which is a fairer score than 24 lucky or unlucky rounds.
 */
export function impliedStrategy(rounds: Played[]): QuantumStrategy {
  const alice = [0, 1].map((x) => mean(rounds.filter((r) => r.x === x).map((r) => r.alpha)) ?? 0) as [number, number];
  const bob = [0, 1].map((y) => mean(rounds.filter((r) => r.y === y).map((r) => r.beta)) ?? 0) as [number, number];
  return { alice: [alice[0] * DEG, alice[1] * DEG], bob: [bob[0] * DEG, bob[1] * DEG] };
}

/** The long-run win chance of the strategy the players' choices add up to. */
export const longRunWin = (rounds: Played[]): number => (rounds.length === 0 ? 0 : quantumWinProbability(impliedStrategy(rounds)));

export const winRate = (rounds: Played[]): number => (rounds.length === 0 ? 0 : rounds.filter((r) => r.won).length / rounds.length);

export { CLASSICAL_LIMIT, QUANTUM_LIMIT };

/** Stars from the strategy, not from luck: 3 above 82%, 2 above the classical bound of 75%, 1 otherwise. */
export function stars(longRun: number): 1 | 2 | 3 {
  if (longRun >= 0.82) return 3;
  return longRun > CLASSICAL_LIMIT + 0.005 ? 2 : 1;
}

/** Hints, from a nudge to the answer. The last one gives the angles away, so the game says so first. */
export const HINTS: string[] = [
  'Two players, two angles each. If both always measure along 0 degrees you win only about 75% of the time. Try changing just one player\'s angle for one of the questions.',
  'The two players should use angles that are 45 degrees apart for question 0 and question 1, and the same gap again for the other player.',
  'One way to do it: Alice uses 0 degrees for her question 0 and 45 degrees for her question 1; Bob uses 22.5 degrees for his question 0 and -22.5 degrees for his question 1.',
];
