import { Complex, Gates, QuantumStateVector } from '../circuit';

/**
 * The three-qubit repetition code (Module 7), enough to show the key idea of error correction:
 * find a flipped qubit by comparing qubits with a helper, without ever reading the data itself.
 *
 *   data qubits q0, q1, q2 hold  alpha|000> + beta|111>   (one logical qubit; this is NOT three copies of the state)
 *   helper qubit q3 is used to check whether two data qubits agree, and is measured instead of the data.
 *
 * A "probe" compares two data qubits: A = (q0, q1), B = (q1, q2), C = (q0, q2). Any two probes pin down a single flipped qubit.
 * The model is deliberately simple: only bit-flip errors, perfect probes and perfect gates (see the notes in the lab).
 */
export type Bit = 0 | 1;
export const DATA_QUBITS = 3;
const HELPER = 3;

export const PROBES = {
  A: [0, 1],
  B: [1, 2],
  C: [0, 2],
} as const;
export type ProbeId = keyof typeof PROBES;
export const PROBE_IDS: ProbeId[] = ['A', 'B', 'C'];

/** Which data qubits have been flipped. */
export type Flips = [boolean, boolean, boolean];

/** Which data qubit to flip back, or null to leave them alone. */
export type Fix = 0 | 1 | 2 | null;

/** What a probe reads: 0 if the two qubits agree, 1 if they differ. */
export function parityOf(flips: readonly boolean[], probe: ProbeId): Bit {
  const [a, b] = PROBES[probe];
  return flips[a] !== flips[b] ? 1 : 0;
}

/** The readings of probes A and B, the "syndrome". */
export const syndromeOf = (flips: readonly boolean[]): [Bit, Bit] => [parityOf(flips, 'A'), parityOf(flips, 'B')];

/** The qubit that a single flip would have to be, given the readings of probes A and B. */
export function fixForSyndrome(s: readonly [Bit, Bit]): Fix {
  if (s[0] === 0 && s[1] === 0) return null;
  if (s[0] === 1 && s[1] === 0) return 0;
  if (s[0] === 1 && s[1] === 1) return 1;
  return 2;
}

/** The best fix for these flips: what the probes point at. Right when at most one qubit flipped. */
export const bestFix = (flips: readonly boolean[]): Fix => fixForSyndrome(syndromeOf(flips));

export type Readings = Partial<Record<ProbeId, Bit>>;

/**
 * What the probes taken so far prove. Any two different probes are enough (the third is their sum); with fewer the
 * answer is not known yet.
 */
export function diagnose(readings: Readings): Fix | 'unknown' {
  const a = readings.A;
  const b = readings.B;
  const c = readings.C;
  const known = [a, b, c].filter((r) => r !== undefined).length;
  if (known < 2) return 'unknown';
  const A = (a ?? ((b ?? 0) ^ (c ?? 0))) as Bit;
  const B = (b ?? ((a ?? 0) ^ (c ?? 0))) as Bit;
  return fixForSyndrome([A, B]);
}

/** The flips left after applying a fix. */
export function afterFix(flips: Flips, fix: Fix): Flips {
  const out: Flips = [...flips];
  if (fix !== null) out[fix] = !out[fix];
  return out;
}

export type Outcome = 'clean' | 'corrupted' | 'logical-flip';

/**
 * `clean`: no flips are left, the qubit is saved. `logical-flip`: all three are flipped, which looks like a perfectly fine
 * encoded qubit holding the opposite value, and no probe can notice. `corrupted`: one or two flips are still there.
 */
export function outcomeOf(flips: readonly boolean[]): Outcome {
  const n = flips.filter(Boolean).length;
  if (n === 0) return 'clean';
  return n === DATA_QUBITS ? 'logical-flip' : 'corrupted';
}

export const surgerySucceeded = (flips: Flips, fix: Fix): boolean => outcomeOf(afterFix(flips, fix)) === 'clean';

// ---------- the same thing with real amplitudes (the state-vector engine) ----------

/** alpha|000> + beta|111> on q0..q2, with the helper q3 in |0>. The message is Ry(theta) then Rz(phi) on the first qubit. */
export function encodeLogical(theta: number, phi = 0): QuantumStateVector {
  const state = new QuantumStateVector(DATA_QUBITS + 1);
  state.applyGate(Gates.Ry(theta), 0).applyGate(Gates.Rz(phi), 0).applyCNOT(0, 1).applyCNOT(0, 2);
  return state;
}

export function injectFlips(state: QuantumStateVector, flips: readonly boolean[]): QuantumStateVector {
  flips.forEach((flipped, q) => {
    if (flipped) state.applyX(q);
  });
  return state;
}

/**
 * Compares two data qubits using the helper: CNOT from each onto the helper, then measure the helper (and put it back to 0
 * for the next probe). Only the helper is measured, never the data. Returns what the helper read.
 */
export function checkParity(state: QuantumStateVector, probe: ProbeId, rng: () => number = Math.random): Bit {
  const [a, b] = PROBES[probe];
  state.applyCNOT(a, HELPER).applyCNOT(b, HELPER);
  const bit = state.measureQubit(HELPER, rng);
  if (bit === 1) state.applyX(HELPER);
  return bit;
}

export function applyFix(state: QuantumStateVector, fix: Fix): QuantumStateVector {
  if (fix !== null) state.applyX(fix);
  return state;
}

/** The tempting mistake: measuring a data qubit directly. This collapses alpha|000> + beta|111> to |000> or |111>. */
export function measureDataDirectly(state: QuantumStateVector, rng: () => number = Math.random): Bit {
  return state.measureQubit(0, rng);
}

/** |<a|b>|^2: 1 when the two states are the same (up to a global phase), 0 when they have nothing in common. */
export function overlap(a: QuantumStateVector, b: QuantumStateVector): number {
  let inner: Complex = Complex.zero();
  for (let i = 0; i < a.dim; i++) inner = Complex.add(inner, Complex.mul(Complex.conj(a.amplitudes[i]), b.amplitudes[i]));
  return Complex.absSq(inner);
}

/** The two amplitudes that matter for an encoded state: of |000> and of |111>. */
export const logicalAmplitudes = (state: QuantumStateVector): { zero: Complex; one: Complex } => ({
  zero: state.amplitudes[0b0000],
  one: state.amplitudes[0b0111],
});

// ---------- how often the code fails ----------

export const CODE_SIZES = [1, 3, 5, 7] as const;

function choose(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

/**
 * Chance that an n-qubit repetition code (n odd) is read wrongly when each qubit flips with probability p: more than half
 * of them flip, so the majority is wrong. For n = 3 this is 3p^2 - 2p^3; for n = 1 (no code) it is just p.
 */
export function logicalErrorRate(p: number, n: number): number {
  if (n < 1 || n % 2 === 0) throw new Error('A repetition code needs an odd number of qubits');
  let sum = 0;
  for (let k = (n + 1) / 2; k <= n; k++) sum += choose(n, k) * p ** k * (1 - p) ** (n - k);
  return sum;
}

export interface TrialSummary {
  trials: number;
  /** Rounds in which the majority was wrong. */
  failures: number;
  rate: number;
  /** How many rounds had exactly k qubits flipped, for k = 0..n. */
  flipCounts: number[];
}

/** Runs many rounds: flip each of n qubits with probability p, then take the majority. */
export function simulateRepetition(p: number, n: number, trials: number, rng: () => number = Math.random): TrialSummary {
  const flipCounts = new Array<number>(n + 1).fill(0);
  let failures = 0;
  for (let t = 0; t < trials; t++) {
    let flipped = 0;
    for (let q = 0; q < n; q++) if (rng() < p) flipped += 1;
    flipCounts[flipped] += 1;
    if (flipped > n / 2) failures += 1;
  }
  return { trials, failures, rate: trials > 0 ? failures / trials : 0, flipCounts };
}

/** Points for drawing the curve of logical against physical error rate. */
export function errorCurve(n: number, maxP = 0.6, steps = 60): { p: number; logical: number }[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const p = (i / steps) * maxP;
    return { p, logical: logicalErrorRate(p, n) };
  });
}
