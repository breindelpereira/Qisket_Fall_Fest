import { Gates, QuantumStateVector } from '../circuit';

/**
 * Shake to Measure: the accelerometer is only a button that says "measure now". The measurement itself is the engine's:
 * a qubit prepared with a chance p of reading 0 is measured with `measureQubit`, which gives 0 with chance p, 1 with
 * chance 1 - p (the Born rule), and leaves the qubit in the state it was found in.
 *
 * The shake detector and the statistics are pure functions, tested with made-up readings. The sensor is read in
 * utils/motion.ts, and every game here also works from a button.
 */
export interface Sample {
  /** Milliseconds, from any clock. */
  t: number;
  /** Acceleration including gravity, metres per second squared. */
  x: number;
  y: number;
  z: number;
}

export const GRAVITY = 9.81;

export interface ShakeOptions {
  /** How far the strength of the acceleration must be from gravity (m/s²) to count as a shake. */
  threshold: number;
  /** Quiet time after a shake, in milliseconds, so one shake is one measurement. */
  cooldownMs: number;
}

export const DEFAULT_SHAKE: ShakeOptions = { threshold: 9, cooldownMs: 700 };

export interface ShakeDetector {
  /** Feed one reading; true when it is a new shake. */
  push(sample: Sample): boolean;
  reset(): void;
}

export function createShakeDetector(options: ShakeOptions = DEFAULT_SHAKE): ShakeDetector {
  let lastShake = -Infinity;
  return {
    push(s) {
      const strength = Math.hypot(s.x, s.y, s.z);
      if (Math.abs(strength - GRAVITY) < options.threshold) return false;
      if (s.t - lastShake < options.cooldownMs) return false;
      lastShake = s.t;
      return true;
    },
    reset() {
      lastShake = -Infinity;
    },
  };
}

/** A qubit with the chance `p0` of reading 0: Ry(theta) on |0> with cos²(theta/2) = p0. */
export function prepare(p0: number): QuantumStateVector {
  const p = Math.min(1, Math.max(0, p0));
  const state = new QuantumStateVector(1);
  state.applyGate(Gates.Ry(2 * Math.acos(Math.sqrt(p))), 0);
  return state;
}

export const chanceOfZero = (state: QuantumStateVector): number => state.getProbabilities()[0];

export type Outcome = 0 | 1;

/** Prepares a fresh qubit and measures it once. */
export function measureFresh(p0: number, rng: () => number = Math.random): Outcome {
  return prepare(p0).measureQubit(0, rng);
}

/** Measures a qubit that has already been measured: it was left in the state it was found in, so the answer repeats. */
export function measureAgain(state: QuantumStateVector, rng: () => number = Math.random): Outcome {
  return state.measureQubit(0, rng);
}

export interface Tally {
  zeros: number;
  ones: number;
}

export const EMPTY_TALLY: Tally = { zeros: 0, ones: 0 };

export const addToTally = (t: Tally, o: Outcome): Tally => (o === 0 ? { zeros: t.zeros + 1, ones: t.ones } : { zeros: t.zeros, ones: t.ones + 1 });
export const total = (t: Tally): number => t.zeros + t.ones;
export const estimateOfZero = (t: Tally): number => (total(t) === 0 ? 0.5 : t.zeros / total(t));

/** The usual wobble of an estimate from `n` measurements of a coin with chance p: sqrt(p (1 - p) / n). */
export const wobble = (p: number, n: number): number => (n > 0 ? Math.sqrt((p * (1 - p)) / n) : 1);

export interface EstimateLevel {
  kind: 'estimate';
  id: string;
  title: string;
  story: string;
  /** How many measurements to make before guessing. */
  shakes: number;
  /** How far (in percentage points) the guess may be from the hidden chance. */
  tolerance: number;
}

export interface AgainLevel {
  kind: 'again';
  id: string;
  title: string;
  story: string;
  /** How many repeat shakes of one measured qubit to make. */
  repeats: number;
}

export type ShakeLevel = EstimateLevel | AgainLevel;

export const LEVELS: ShakeLevel[] = [
  {
    kind: 'estimate', id: 'few', title: 'A first guess',
    story: 'A box prepares the same qubit every time, but you are not told the odds. Measure it a few times, then guess the chance of 0.',
    shakes: 8, tolerance: 25,
  },
  {
    kind: 'estimate', id: 'more', title: 'More measurements',
    story: 'A new hidden qubit. More shakes means a steadier histogram, so the guess has to be closer.',
    shakes: 16, tolerance: 20,
  },
  {
    kind: 'estimate', id: 'many', title: 'Close as you can',
    story: 'One more hidden qubit and the smallest margin. The histogram needs time to settle.',
    shakes: 30, tolerance: 14,
  },
  {
    kind: 'again', id: 'again', title: 'Shake the same qubit again',
    story: 'Measure a fifty-fifty qubit once. Then keep shaking the same qubit and see whether the answer ever changes.',
    repeats: 3,
  },
];

/** Hidden chances of 0 to draw from, far enough from 50% that guessing 50% without measuring never passes. */
export const HIDDEN_CHANCES = [0.1, 0.15, 0.2, 0.8, 0.85, 0.9];

export function pickHidden(rng: () => number = Math.random): number {
  return HIDDEN_CHANCES[Math.floor(rng() * HIDDEN_CHANCES.length)];
}

/** Is the guess (a chance of 0, between 0 and 1) close enough to the hidden chance? */
export const guessIsClose = (guess: number, hidden: number, tolerancePoints: number): boolean =>
  Math.abs(guess - hidden) * 100 <= tolerancePoints + 1e-9;

/** 3 stars for a guess within half the tolerance, 2 within it, 1 for a guess that missed (it can be tried on a new qubit). */
export function stars(guess: number, hidden: number, tolerancePoints: number): 0 | 2 | 3 {
  const miss = Math.abs(guess - hidden) * 100;
  if (miss <= tolerancePoints / 2) return 3;
  return miss <= tolerancePoints ? 2 : 0;
}
