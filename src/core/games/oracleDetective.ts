import { constantOracle, inputDistribution, randomBalanced, runDeutschJozsa } from '../labs/deutschJozsa';
import type { Bit } from '../labs/deutschJozsa';

/**
 * Oracle Detective: a hidden function f is either constant or balanced. The player may open inputs one at a time
 * (classical queries) or, in later cases, ask the quantum informant, who runs Deutsch-Jozsa once.
 */
export type Truth = 'constant' | 'balanced';

export interface CaseFile {
  id: number;
  title: string;
  story: string;
  /** Number of input bits; there are 2^n inputs. */
  n: number;
  truth: Truth;
  seed: number;
  /** Whether the quantum informant is available on this case. */
  informant: boolean;
}

export const CASES: CaseFile[] = [
  { id: 1, title: 'The Four Lockers', n: 2, truth: 'balanced', seed: 11, informant: false, story: 'Four lockers hold a light that is either on or off. All four the same, or exactly two on? You can only open them one at a time.' },
  { id: 2, title: 'The Same Four', n: 2, truth: 'constant', seed: 23, informant: false, story: 'Another set of four. How many lockers do you need to open before you can be certain?' },
  { id: 3, title: 'Eight Lockers', n: 3, truth: 'balanced', seed: 37, informant: true, story: 'Eight lockers. The quantum informant is in town, but each use is one question, and it asks the lockers all at once.' },
  { id: 4, title: 'Eight, Again', n: 3, truth: 'constant', seed: 41, informant: true, story: 'Same size. A constant file can look balanced for a long while: all-equal answers prove nothing until more than half are open.' },
  { id: 5, title: 'The Big Vault', n: 4, truth: 'balanced', seed: 53, informant: true, story: 'Sixteen lockers. Going classical, you might need nine. Going quantum, you need one.' },
  { id: 6, title: 'The Last Vault', n: 4, truth: 'constant', seed: 67, informant: true, story: 'Sixteen lockers, the final case file. Solve it however you like.' },
];

/** Small deterministic generator, so each case file is the same every time it is opened. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The hidden function for a case (or for a replay with another seed). */
export function makeOracle(n: number, truth: Truth, seed: number): Bit[] {
  const rng = mulberry32(seed);
  return truth === 'constant' ? constantOracle(n, rng() < 0.5 ? 0 : 1) : randomBalanced(n, rng);
}

/**
 * What the opened lockers prove. Two different values means balanced for sure; more than half the lockers all
 * showing the same value means constant for sure (a balanced function has exactly half of each). Otherwise: not yet.
 */
export function classicalCertainty(n: number, seen: Record<number, Bit>): Truth | null {
  const values = Object.values(seen);
  if (values.includes(0) && values.includes(1)) return 'balanced';
  if (values.length > (1 << n) / 2) return 'constant';
  return null;
}

export interface InformantReport {
  /** What the n input qubits read. */
  readout: number;
  verdict: Truth;
}

/** One run of Deutsch-Jozsa. Reading all zeros means constant, anything else means balanced. */
export function askInformant(f: Bit[], n: number, rng: () => number = Math.random): InformantReport {
  const dist = inputDistribution(runDeutschJozsa(f, n).final, n);
  let r = rng();
  let readout = dist.length - 1;
  for (let i = 0; i < dist.length; i++) {
    if (r < dist[i]) {
      readout = i;
      break;
    }
    r -= dist[i];
  }
  return { readout, verdict: readout === 0 ? 'constant' : 'balanced' };
}

export interface Outcome {
  correct: boolean;
  /** The evidence actually proved the answer (as opposed to a guess). */
  proven: boolean;
  stars: 0 | 1 | 2 | 3;
}

/** Wrong answer: no stars. A lucky guess: 1. Proven with many queries: 2. Proven with at most two: 3. */
export function scoreCase(accused: Truth, truth: Truth, proven: boolean, queries: number): Outcome {
  if (accused !== truth) return { correct: false, proven, stars: 0 };
  if (!proven) return { correct: true, proven, stars: 1 };
  return { correct: true, proven, stars: queries <= 2 ? 3 : 2 };
}
