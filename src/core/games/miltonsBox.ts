import { Complex, Gates, QuantumStateVector } from '../circuit';
import type { Matrix2x2 } from '../circuit';

/**
 * Milton's Box: Schrödinger's cat as a qubit. The cat is Awake (|0>) or Asleep (|1>) when the box is opened, and the
 * chance of each is the Born rule, |amplitude|². Everything here runs on the state-vector engine, and the component only
 * draws it. (In the 1935 thought experiment the cat is alive or dead; Milton is the app's tutor, so he only sleeps.)
 */
export type Outcome = 'awake' | 'asleep';

export const OUTCOME_LABEL: Record<Outcome, string> = { awake: 'Awake', asleep: 'Asleep' };

/** The three buttons the "prepare" levels offer. */
export type BoxGate = 'H' | 'X' | 'Z';

export const GATE_LABEL: Record<BoxGate, string> = {
  H: 'H: spread out',
  X: 'X: flip',
  Z: 'Z: flip the sign',
};

const MATRIX: Record<BoxGate, () => Matrix2x2> = { H: Gates.H, X: Gates.X, Z: Gates.Z };

/** A box that starts Awake, |0>, with the given gates applied in order. */
export function prepared(gates: BoxGate[]): QuantumStateVector {
  const state = new QuantumStateVector(1);
  for (const g of gates) state.applyGate(MATRIX[g](), 0);
  return state;
}

/** A box with real amplitudes (alpha for Awake, beta for Asleep), normalised so the two chances add up to 1. */
export function boxFromAmplitudes(alpha: number, beta: number): QuantumStateVector {
  const state = QuantumStateVector.fromAmplitudes([Complex.create(alpha, 0), Complex.create(beta, 0)]);
  state.normalize();
  return state;
}

/** The chance (0 to 100) of finding the cat Awake when the box is opened. */
export function chanceAwake(state: QuantumStateVector): number {
  return state.getProbabilities()[0] * 100;
}

/**
 * Opens `count` freshly prepared, identical boxes. Each opening is a new box: a box that has been opened is not random
 * any more (see `reopen`).
 */
export function openMany(state: QuantumStateVector, count: number, rng: () => number = Math.random): Record<Outcome, number> {
  const counts = state.sampleCounts(count, rng);
  return { awake: counts['0'] ?? 0, asleep: counts['1'] ?? 0 };
}

/** Opens one box. The box is left in the state it was found in, which is what makes a second look boring. */
export function openOnce(state: QuantumStateVector, rng: () => number = Math.random): { outcome: Outcome; box: QuantumStateVector } {
  const box = state.clone();
  const result = box.measureQubit(0, rng);
  return { outcome: result === 0 ? 'awake' : 'asleep', box };
}

/** Looks again at a box that has already been opened. It always finds what the first look found. */
export function reopen(box: QuantumStateVector, rng: () => number = Math.random): Outcome {
  return box.measureQubit(0, rng) === 0 ? 'awake' : 'asleep';
}

interface LevelBase {
  id: string;
  title: string;
  story: string;
  /** Shown after the level is cleared: the idea in two sentences. */
  why: string;
}

/** Guess the chance of Awake from the amplitudes (the numbers the box is prepared with). */
export interface PredictLevel extends LevelBase {
  kind: 'predict';
  alpha: number;
  beta: number;
  /** How many percentage points off still counts (the slider moves in 5s). */
  tolerance: number;
  /** Nudge shown with "Hint": a question, not the answer. */
  hint: string;
}

/** Use the gate buttons to make a box with a given chance of Awake. */
export interface PrepareLevel extends LevelBase {
  kind: 'prepare';
  gates: BoxGate[];
  /** The chance of Awake the box has to reach, in percent. */
  target: number;
  targetText: string;
  maxGates: number;
  hint: string;
}

/** Open one box several times and see that the answer never changes. */
export interface AgainLevel extends LevelBase {
  kind: 'again';
  /** How many repeat looks the learner makes before the level is cleared. */
  looks: number;
}

export type BoxLevel = PredictLevel | PrepareLevel | AgainLevel;

export const LEVELS: BoxLevel[] = [
  {
    kind: 'predict',
    id: 'odds',
    title: 'Read the recipe',
    story: 'Milton is in a box prepared with the amplitudes below. What are the chances he is Awake when you open it?',
    alpha: 0.6,
    beta: 0.8,
    tolerance: 5,
    hint: 'The chance of an outcome is its amplitude squared. What is 0.6 times 0.6?',
    why: 'The chance of an outcome is its amplitude squared (the Born rule). The two chances always add up to 100%, which is why the amplitudes have to be squared before they add up to 1.',
  },
  {
    kind: 'predict',
    id: 'minus',
    title: 'A minus sign',
    story: 'A new recipe, this time with a minus sign. Does the sign change the odds of finding Milton Awake?',
    alpha: 0.28,
    beta: -0.96,
    tolerance: 5,
    hint: 'Squaring a negative number gives a positive one. What is 0.28 times 0.28?',
    why: 'The sign of an amplitude does not change the chance of an opening. It does change what happens when amplitudes meet, which is interference, and you will meet that in the lessons on gates and Mach–Zehnder. A small chance is not zero: you will sometimes find Milton Awake.',
  },
  {
    kind: 'prepare',
    id: 'half',
    title: 'Make it 50/50',
    story: 'Milton starts Awake for certain. Use the gate buttons to make him exactly as likely to be Asleep as Awake.',
    gates: ['H', 'X', 'Z'],
    target: 50,
    targetText: 'Awake: 50%',
    maxGates: 4,
    hint: 'One of the three gates spreads a certain state into a fifty-fifty one.',
    why: 'The Hadamard gate (H) turns a certain Awake into an equal mix of Awake and Asleep. That equal mix is a superposition.',
  },
  {
    kind: 'prepare',
    id: 'jammed',
    title: 'The jammed flip',
    story: 'Milton starts Awake and you need him Asleep for certain, but the X button is jammed. Only H and Z work.',
    gates: ['H', 'Z'],
    target: 0,
    targetText: 'Awake: 0%, so Asleep for certain',
    maxGates: 6,
    hint: 'H spreads a certain state out and Z only flips a sign. What would a second H do after the sign was flipped?',
    why: 'H, then Z, then H does the job of an X. Z alone changes no odds, but sandwiched between two spreading gates it changes which way the second one pushes. That is interference, and it is the reason quantum circuits can do more than shuffle probabilities.',
  },
  {
    kind: 'again',
    id: 'again',
    title: 'Look again',
    story: 'Milton is 50/50. Open the box, then look again, as many times as the level asks. Does the answer ever change?',
    looks: 3,
    why: 'Opening the box is a measurement and it changes the state: Milton is now Awake or Asleep for certain, so every later look agrees. A real cat is never in a clean superposition for long, because the air, the light and the box itself keep "looking" at it.',
  },
];

/** The fewest gates that clear a prepare level, by trying every sequence up to its limit; null if none does. */
export function parGates(level: PrepareLevel): number | null {
  const solved = (gates: BoxGate[]) => isPrepared(level, gates);
  let frontier: BoxGate[][] = [[]];
  for (let length = 1; length <= level.maxGates; length++) {
    frontier = frontier.flatMap((seq) => level.gates.map((g) => [...seq, g]));
    if (frontier.some(solved)) return length;
  }
  return null;
}

/** True when the gates put the box on the level's target chance. */
export function isPrepared(level: PrepareLevel, gates: BoxGate[]): boolean {
  return gates.length > 0 && Math.abs(chanceAwake(prepared(gates)) - level.target) < 0.5;
}

export interface GuessResult {
  correct: boolean;
  /** The true chance of Awake, in percent. */
  truth: number;
  /** How many percentage points the guess was off by. */
  off: number;
}

export function judgeGuess(level: PredictLevel, guess: number): GuessResult {
  const truth = chanceAwake(boxFromAmplitudes(level.alpha, level.beta));
  const off = Math.abs(guess - truth);
  return { correct: off <= level.tolerance + 1e-9, truth, off };
}

/** Three stars for a first try (or par), two for one retry (or one gate over par), one for anything else. */
export function starsFor(tries: number, extra: number): 1 | 2 | 3 {
  if (tries <= 1 && extra <= 0) return 3;
  if (tries <= 2 && extra <= 1) return 2;
  return 1;
}

export type GuessSlip = 'amplitude' | 'other-outcome' | 'too-high' | 'too-low';

/**
 * Why a wrong guess is wrong, for the two slips learners really make: reading the amplitude as the chance (0.6 -> 60%),
 * and giving the chance of the other outcome. Anything else only gets "too high" or "too low".
 */
export function diagnoseGuess(level: PredictLevel, guess: number): GuessSlip {
  const { truth } = judgeGuess(level, guess);
  // the two slips can sit close together (60% and 64%), so the nearer one is the one the learner made
  const amplitude = Math.abs(Math.abs(guess) - (Math.abs(level.alpha) * 100) / Math.hypot(level.alpha, level.beta));
  const other = Math.abs(guess - (100 - truth));
  if (Math.min(amplitude, other) <= level.tolerance) return amplitude <= other ? 'amplitude' : 'other-outcome';
  return guess > truth ? 'too-high' : 'too-low';
}
