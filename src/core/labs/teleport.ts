import { Complex, Gates, QuantumStateVector } from '../circuit';
import { reducedQubit } from './twoQubit';

/**
 * Teleportation of one qubit. q0 holds the message (Alice), q1 is Alice's half of a Bell pair, q2 is Bob's half.
 * Steps: 0 message + |00>, 1 Bell pair made, 2 CNOT(q0 -> q1), 3 H on q0, 4 Alice measures q0 and q1, 5 Bob corrects.
 */
export type Bit = 0 | 1;

export interface Message {
  theta: number;
  phi: number;
}

export const STEP_COUNT = 5;

export const STEP_LABELS = [
  'Make a Bell pair',
  'Alice entangles her message with her half (CNOT)',
  'Alice applies a Hadamard to the message qubit',
  'Alice measures both of her qubits',
  'Bob fixes his qubit using the two bits',
];

export const NAMED_MESSAGES: { label: string; message: Message }[] = [
  { label: '|1⟩', message: { theta: Math.PI, phi: 0 } },
  { label: '|+⟩', message: { theta: Math.PI / 2, phi: 0 } },
  { label: '|+i⟩', message: { theta: Math.PI / 2, phi: Math.PI / 2 } },
  { label: 'tilted', message: { theta: 1.1, phi: 2.3 } },
];

/** Bloch vector of the message. */
export const messageVector = (m: Message): [number, number, number] => [
  Math.sin(m.theta) * Math.cos(m.phi),
  Math.sin(m.theta) * Math.sin(m.phi),
  Math.cos(m.theta),
];

const forced = (bit: Bit) => () => (bit === 0 ? 0 : 0.999999999);

export interface TeleportState {
  state: QuantumStateVector;
  /** Alice's measurement results, null until step 4. */
  m0: Bit | null;
  m1: Bit | null;
}

/** Gates Bob applies for the given bits, in order: X if the second bit is 1, then Z if the first bit is 1. */
export function correctionFor(m0: Bit, m1: Bit): ('X' | 'Z')[] {
  return [...(m1 === 1 ? (['X'] as const) : []), ...(m0 === 1 ? (['Z'] as const) : [])];
}

/**
 * Runs the protocol up to `step` (0..5). Alice's measurement uses `forceBits` if given, else `rng`.
 * With `correct` false, step 5 leaves Bob's qubit untouched (the classical message is "lost").
 */
export function teleportUpTo(
  m: Message,
  step: number,
  opts: { forceBits?: [Bit, Bit]; rng?: () => number; correct?: boolean } = {},
): TeleportState {
  const state = new QuantumStateVector(3);
  state.applyGate(Gates.Ry(m.theta), 0).applyGate(Gates.Rz(m.phi), 0);
  let m0: Bit | null = null;
  let m1: Bit | null = null;
  if (step >= 1) state.applyH(1).applyCNOT(1, 2);
  if (step >= 2) state.applyCNOT(0, 1);
  if (step >= 3) state.applyH(0);
  if (step >= 4) {
    const rng0 = opts.forceBits ? forced(opts.forceBits[0]) : (opts.rng ?? Math.random);
    m0 = state.measureQubit(0, rng0);
    const rng1 = opts.forceBits ? forced(opts.forceBits[1]) : (opts.rng ?? Math.random);
    m1 = state.measureQubit(1, rng1);
  }
  if (step >= 5 && opts.correct !== false && m0 !== null && m1 !== null) {
    for (const g of correctionFor(m0, m1)) state.applyGate(g === 'X' ? Gates.X() : Gates.Z(), 2);
  }
  return { state, m0, m1 };
}

/** How close Bob's qubit is to the message: (1 + r_msg . r_bob) / 2, which is 1 for a perfect copy. */
export function bobFidelity(m: Message, state: QuantumStateVector): number {
  const b = reducedQubit(state, 2);
  const r = messageVector(m);
  return (1 + r[0] * b.x + r[1] * b.y + r[2] * b.z) / 2;
}

/** Probability of each pair of Alice's outcomes just before she measures (step 3), indexed m0*2 + m1. */
export function outcomeProbabilities(m: Message): number[] {
  const { state } = teleportUpTo(m, 3);
  const p = state.getProbabilities();
  const out = [0, 0, 0, 0];
  for (let i = 0; i < 8; i++) out[(i & 1) * 2 + ((i >> 1) & 1)] += p[i]; // q0 is bit 0, q1 is bit 1
  return out;
}

/** What Bob holds, averaged over Alice's four outcomes, if the two bits never arrive: a length-0 Bloch vector. */
export function bobWithoutMessageLength(m: Message): number {
  const probs = outcomeProbabilities(m);
  let x = 0;
  let y = 0;
  let z = 0;
  ([[0, 0], [0, 1], [1, 0], [1, 1]] as [Bit, Bit][]).forEach((bits, i) => {
    const b = reducedQubit(teleportUpTo(m, 4, { forceBits: bits }).state, 2);
    x += probs[i] * b.x;
    y += probs[i] * b.y;
    z += probs[i] * b.z;
  });
  return Math.sqrt(x * x + y * y + z * z);
}

export const bitsLabel = (m0: Bit | null, m1: Bit | null): string => (m0 === null || m1 === null ? '??' : `${m0}${m1}`);

export const complexOf = (m: Message): [Complex, Complex] => [
  Complex.create(Math.cos(m.theta / 2), 0),
  Complex.scale(Complex.exp(m.phi), Math.sin(m.theta / 2)),
];
