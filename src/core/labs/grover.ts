import { Complex, QuantumStateVector } from '../circuit';

/** Grover search over N = 2^n items with one or more marked items. */
export const MAX_QUBITS = 4;

export function uniformState(n: number): QuantumStateVector {
  const s = new QuantumStateVector(n);
  for (let q = 0; q < n; q++) s.applyH(q);
  return s;
}

/** Oracle: flip the sign of every marked item's amplitude. */
export function applyGroverOracle(state: QuantumStateVector, marked: number[]): void {
  for (const m of marked) state.amplitudes[m] = Complex.scale(state.amplitudes[m], -1);
}

/** Diffusion ("inversion about the mean"): a -> 2*mean(a) - a, which is H^n (2|0><0| - I) H^n. */
export function applyDiffusion(state: QuantumStateVector): void {
  const n = state.dim;
  let re = 0;
  let im = 0;
  for (const a of state.amplitudes) {
    re += a.re;
    im += a.im;
  }
  const mean = Complex.create(re / n, im / n);
  state.amplitudes = state.amplitudes.map((a) => Complex.sub(Complex.scale(mean, 2), a));
}

export function groverIteration(state: QuantumStateVector, marked: number[]): void {
  applyGroverOracle(state, marked);
  applyDiffusion(state);
}

export function runGrover(n: number, marked: number[], iterations: number): QuantumStateVector {
  const s = uniformState(n);
  for (let i = 0; i < iterations; i++) groverIteration(s, marked);
  return s;
}

export const successProbability = (state: QuantumStateVector, marked: number[]): number =>
  marked.reduce((sum, m) => sum + Complex.absSq(state.amplitudes[m]), 0);

/** Closed form sin^2((2k+1) theta) with sin(theta) = sqrt(M/N). */
export function theoreticalProbability(n: number, marked: number, iterations: number): number {
  const theta = Math.asin(Math.sqrt(marked / (1 << n)));
  return Math.sin((2 * iterations + 1) * theta) ** 2;
}

/** The number of iterations that gets closest to a certain find. */
export function optimalIterations(n: number, marked: number): number {
  const theta = Math.asin(Math.sqrt(marked / (1 << n)));
  return Math.max(0, Math.round(Math.PI / (4 * theta) - 0.5));
}

/** Average number of guesses a classical search needs for one marked item among N. */
export const classicalExpectedGuesses = (n: number, marked: number): number => ((1 << n) + 1) / (marked + 1);
