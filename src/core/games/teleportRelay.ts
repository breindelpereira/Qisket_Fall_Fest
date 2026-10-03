import { Gates } from '../circuit';
import type { Matrix2x2 } from '../circuit';
import { reducedQubit } from '../labs/twoQubit';
import { bobFidelity, correctionFor, teleportUpTo } from '../labs/teleport';
import type { Bit, Message } from '../labs/teleport';

/**
 * Teleport Relay: a qubit is teleported hop by hop along a chain of repeaters. At every hop a fresh Bell pair is used,
 * Alice's measurement gives two bits, and the receiving repeater must apply the right fix before passing the qubit on.
 */
export type FixGate = 'X' | 'Z' | 'H' | 'S';

export const FIX_MATRIX: Record<FixGate, () => Matrix2x2> = { X: Gates.X, Z: Gates.Z, H: Gates.H, S: Gates.S };

export interface RelayLevel {
  id: number;
  title: string;
  story: string;
  hint: string;
  message: Message;
  /** Alice's two bits at each hop. */
  hops: [Bit, Bit][];
  allowed: FixGate[];
}

export const RELAY_LEVELS: RelayLevel[] = [
  {
    id: 1, title: 'First Hop', allowed: ['X', 'Z'], hops: [[0, 1]],
    message: { theta: Math.PI / 2, phi: Math.PI / 2 },
    story: 'Alice sends the |+i⟩ qubit one hop. Her bits are 01. What does Bob have to do to his half?',
    hint: 'The second bit says whether the qubit was bit-flipped.',
  },
  {
    id: 2, title: 'The Other Bit', allowed: ['X', 'Z'], hops: [[1, 0]],
    message: { theta: Math.PI / 2, phi: 0 },
    story: 'Same trip, new bits: 10. This time the message is |+⟩.',
    hint: 'The first bit says whether the qubit was phase-flipped.',
  },
  {
    id: 3, title: 'Both Bits', allowed: ['X', 'Z'], hops: [[1, 1]],
    message: { theta: 1.1, phi: 2.3 },
    story: 'Bits 11, and a tilted message that is on no axis. Combine what you learned.',
    hint: 'Undo both flips. The order only changes a global phase, which nobody can measure.',
  },
  {
    id: 4, title: 'Two Hops', allowed: ['X', 'Z'], hops: [[0, 1], [1, 1]],
    message: { theta: 2.0, phi: -1.0 },
    story: 'Now the qubit crosses a repeater. Alice → Repeater → Bob, a fresh Bell pair for each hop.',
    hint: 'Each hop has its own two bits. Fix one hop at a time.',
  },
  {
    id: 5, title: 'Nothing To Fix', allowed: ['X', 'Z', 'H', 'S'], hops: [[1, 0], [0, 0], [0, 1]],
    message: { theta: 0.8, phi: 0.5 },
    story: 'Three hops, and extra gates on the panel that you do not need. One hop needs no fix at all.',
    hint: 'Bits 00 mean the qubit arrived intact. Send it on without gates.',
  },
  {
    id: 6, title: 'Long Haul', allowed: ['X', 'Z', 'H', 'S'], hops: [[1, 1], [0, 1], [1, 0], [0, 0]],
    message: { theta: 2.6, phi: 1.9 },
    story: 'Four hops across the network. Every repeater must get it right or the message is lost.',
    hint: 'Only X and Z ever matter. If you are unsure, look at which bit is 1.',
  },
];

/*
 * Level design note: a message that a fix leaves unchanged (|+> under X, |0> under Z) would make that fix invisible,
 * so each level uses a message the needed fix really moves; tests check that skipping the fix always fails.
 */

/** Angles of the Bloch vector (x, y, z), so a received qubit can become the next message. */
export const messageFromBloch = (x: number, y: number, z: number): Message => ({
  theta: Math.acos(Math.max(-1, Math.min(1, z))),
  phi: Math.atan2(y, x),
});

export interface HopResult {
  /** The qubit the receiving repeater now holds, as a message for the next hop. */
  next: Message;
  /** How close that qubit is to the one that was sent: 1 = perfect. */
  fidelity: number;
  correct: boolean;
}

export const SOLVED_FIDELITY = 0.9999;

/** Teleports `current` across one hop, with Alice's bits fixed, then applies the chosen fix gates in order. */
export function relayHop(current: Message, bits: [Bit, Bit], fix: FixGate[]): HopResult {
  const { state } = teleportUpTo(current, 4, { forceBits: bits });
  for (const gate of fix) state.applyGate(FIX_MATRIX[gate](), 2);
  const b = reducedQubit(state, 2);
  const fidelity = bobFidelity(current, state);
  return { next: messageFromBloch(b.x / b.length, b.y / b.length, b.z / b.length), fidelity, correct: fidelity >= SOLVED_FIDELITY };
}

/** The fix the textbook protocol calls for. */
export const rightFix = (bits: [Bit, Bit]): FixGate[] => correctionFor(bits[0], bits[1]);

export function starRating(mistakes: number): 1 | 2 | 3 {
  if (mistakes === 0) return 3;
  return mistakes <= 2 ? 2 : 1;
}

/** Plain text description of a hop's fix, for feedback. */
export const describeFix = (fix: FixGate[]): string => (fix.length === 0 ? 'no gates' : fix.join(' then '));
