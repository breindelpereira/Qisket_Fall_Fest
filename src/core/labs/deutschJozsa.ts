import { QuantumStateVector } from '../circuit';

/**
 * Deutsch-Jozsa. A function f on n bits (a truth table with 2^n entries) is promised to be constant or balanced.
 * The circuit has n input qubits (q0..q(n-1)) and one ancilla (q n): ancilla starts at |1>, H on everything,
 * the oracle |x>|y> -> |x>|y xor f(x)>, then H on the inputs. Reading all zeros means "constant".
 */
export type Bit = 0 | 1;
export type Kind = 'constant' | 'balanced' | 'neither';

export const MAX_INPUTS = 3;

export function classify(f: Bit[]): Kind {
  const ones = f.filter((v) => v === 1).length;
  if (ones === 0 || ones === f.length) return 'constant';
  return ones * 2 === f.length ? 'balanced' : 'neither';
}

export const constantOracle = (n: number, value: Bit): Bit[] => Array.from({ length: 1 << n }, () => value);

/** f(x) = parity of the bits of x selected by `mask` (a nonzero mask is always balanced). */
export const parityOracle = (n: number, mask: number): Bit[] =>
  Array.from({ length: 1 << n }, (_, x) => {
    let v = x & mask;
    let parity = 0;
    while (v) {
      parity ^= v & 1;
      v >>= 1;
    }
    return parity as Bit;
  });

/** A random balanced function: half the inputs map to 1. */
export function randomBalanced(n: number, rng: () => number = Math.random): Bit[] {
  const idx = Array.from({ length: 1 << n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const f = constantOracle(n, 0);
  for (const i of idx.slice(0, idx.length / 2)) f[i] = 1;
  return f;
}

/** Applies |x>|y> -> |x>|y xor f(x)>; the ancilla is the top qubit. */
export function applyOracle(state: QuantumStateVector, f: Bit[], n: number): void {
  const next = state.amplitudes.map((a) => ({ ...a }));
  for (let x = 0; x < 1 << n; x++) {
    for (const y of [0, 1]) {
      const from = x | (y << n);
      const to = x | ((y ^ f[x]) << n);
      next[to] = state.amplitudes[from];
    }
  }
  state.amplitudes = next;
}

export interface DJStages {
  /** After H on everything (ancilla started at 1). */
  afterH: QuantumStateVector;
  afterOracle: QuantumStateVector;
  final: QuantumStateVector;
  /** Chance that all n input qubits read 0. */
  probAllZero: number;
}

export function runDeutschJozsa(f: Bit[], n: number): DJStages {
  const state = new QuantumStateVector(n + 1);
  state.applyX(n);
  for (let q = 0; q <= n; q++) state.applyH(q);
  const afterH = state.clone();
  applyOracle(state, f, n);
  const afterOracle = state.clone();
  for (let q = 0; q < n; q++) state.applyH(q);
  const probs = state.getProbabilities();
  return { afterH, afterOracle, final: state, probAllZero: probs[0] + probs[1 << n] };
}

/** Closed form for the chance of reading all zeros: (sum over x of (-1)^f(x) / 2^n)^2. */
export const analyticAllZero = (f: Bit[]): number => {
  const sum = f.reduce<number>((acc, v) => acc + (v === 0 ? 1 : -1), 0);
  return (sum / f.length) ** 2;
};

/** A classical algorithm must be ready to ask this many questions to be certain. */
export const classicalWorstCase = (n: number): number => (1 << (n - 1)) + 1;

/** Distribution of input results (all n input qubits), index = x. */
export function inputDistribution(state: QuantumStateVector, n: number): number[] {
  const p = state.getProbabilities();
  return Array.from({ length: 1 << n }, (_, x) => p[x] + p[x | (1 << n)]);
}
