import { Complex, QuantumStateVector } from '../circuit';
import { applyPlaced } from '../labs/circuitBuilder';
import type { GateName, Placed } from '../labs/circuitBuilder';

/**
 * Gate Deck: build a target gate out of the cards in your hand. Cards are used at most once and played left to right.
 * A circuit solves a level when it acts exactly like the target on every input, ignoring an overall phase
 * (which nothing can measure).
 */
export interface DeckLevel {
  id: number;
  title: string;
  story: string;
  hint: string;
  qubits: 1 | 2;
  /** What the learner is asked to build, in words. */
  targetName: string;
  hand: Placed[];
  /** A circuit that defines the target. Not shown to the learner. */
  target: Placed[];
}

const g = (gate: GateName, qubit = 0): Placed => ({ kind: 'gate', gate, qubit });
const cx = (control: number, target: number): Placed => ({ kind: 'cnot', control, target });

export const LEVELS: DeckLevel[] = [
  {
    id: 1, title: 'Phase Flip Trick', qubits: 1, targetName: 'Z',
    story: 'Z flips the sign of |1⟩ and leaves |0⟩ alone. The deck has no Z card, but it has other tools.',
    hint: 'Hadamard changes the axis you look along. Flip the bit in that view, then change back.',
    hand: [g('H'), g('X'), g('H')], target: [g('Z')],
  },
  {
    id: 2, title: 'Bit Flip Trick', qubits: 1, targetName: 'X',
    story: 'Now the other way round: make an X from cards that are not X.',
    hint: 'The same sandwich as before, with a different filling.',
    hand: [g('H'), g('Z'), g('H'), g('S')], target: [g('X')],
  },
  {
    id: 3, title: 'Half of Half', qubits: 1, targetName: 'S',
    story: 'T is an eighth-turn about the vertical axis. S is a quarter-turn.',
    hint: 'Two eighths make a quarter.',
    hand: [g('T'), g('T'), g('H')], target: [g('S')],
  },
  {
    id: 4, title: 'S Squared', qubits: 1, targetName: 'Z',
    story: 'Quarter-turn twice is a half-turn.',
    hint: 'You only need the S cards.',
    hand: [g('S'), g('S'), g('T')], target: [g('Z')],
  },
  {
    id: 5, title: 'Undo the Quarter Turn', qubits: 1, targetName: 'S† (a quarter-turn the other way)',
    story: 'Three quarter-turns forward is one back. But is there a shortcut in your hand?',
    hint: 'A half-turn plus a quarter-turn forward lands on three quarters.',
    hand: [g('S'), g('S'), g('S'), g('Z')], target: [g('S'), g('S'), g('S')],
  },
  {
    id: 6, title: 'The Y Gate', qubits: 1, targetName: 'Y',
    story: 'Y is a half-turn about the Y axis. A bit flip and a phase flip together do the same job.',
    hint: 'Use just two cards. The order does not matter here (it only changes a global phase).',
    hand: [g('X'), g('Z'), g('H')], target: [g('Y')],
  },
  {
    id: 7, title: 'Reverse the CNOT', qubits: 2, targetName: 'CNOT with the roles swapped (qubit 1 controls qubit 0)',
    story: 'Your CNOT only works one way. Make it work the other way by changing the point of view with Hadamards.',
    hint: 'Hadamards on both qubits swap the roles of control and target.',
    hand: [g('H', 0), g('H', 1), cx(0, 1), g('H', 0), g('H', 1), g('X', 0)], target: [cx(1, 0)],
  },
  {
    id: 8, title: 'Three-CNOT Swap', qubits: 2, targetName: 'SWAP (the qubits trade places)',
    story: 'There is no SWAP card. Three CNOTs in the right order trade two qubits.',
    hint: 'Alternate the direction: one way, the other way, then the first way again.',
    hand: [cx(0, 1), cx(1, 0), cx(0, 1), g('H', 0)], target: [cx(0, 1), cx(1, 0), cx(0, 1)],
  },
  {
    id: 9, title: 'Controlled-Z', qubits: 2, targetName: 'CZ (flips the sign of |11⟩ only)',
    story: 'CZ is symmetric: it does not matter which qubit is the control. You can build it from a CNOT.',
    hint: 'A Hadamard on the target turns a bit flip into a phase flip.',
    hand: [g('H', 1), cx(0, 1), g('H', 1), g('Z', 0)], target: [g('H', 1), cx(0, 1), g('H', 1)],
  },
];

export function cardLabel(p: Placed): string {
  return p.kind === 'cnot' ? `CNOT ${p.control}→${p.target}` : `${p.gate} q${p.qubit}`;
}

/** Column j of the unitary is the circuit's output for input |j>; returned as rows for readability. */
export function unitaryOf(n: number, items: Placed[]): Complex[][] {
  const dim = 1 << n;
  const cols: Complex[][] = [];
  for (let j = 0; j < dim; j++) {
    const amps = Array.from({ length: dim }, (_, i) => (i === j ? Complex.one() : Complex.zero()));
    const state = QuantumStateVector.fromAmplitudes(amps);
    for (const p of items) applyPlaced(state, p);
    cols.push(state.amplitudes);
  }
  return Array.from({ length: dim }, (_, r) => cols.map((c) => c[r]));
}

/** True when U = e^(i a) V for some angle a. */
export function equalUpToPhase(u: Complex[][], v: Complex[][], eps = 1e-6): boolean {
  let phase: Complex | null = null;
  for (let r = 0; r < v.length; r++) {
    for (let c = 0; c < v.length; c++) {
      if (Complex.abs(v[r][c]) > 1e-6) {
        phase = Complex.div(u[r][c], v[r][c]);
        break;
      }
    }
    if (phase) break;
  }
  if (!phase || Math.abs(Complex.abs(phase) - 1) > eps) return false;
  for (let r = 0; r < v.length; r++) {
    for (let c = 0; c < v.length; c++) {
      if (!Complex.equals(u[r][c], Complex.mul(phase, v[r][c]), eps)) return false;
    }
  }
  return true;
}

export const handItems = (level: DeckLevel, picks: number[]): Placed[] => picks.map((i) => level.hand[i]);

export function isSolved(level: DeckLevel, picks: number[]): boolean {
  if (picks.length === 0) return false;
  return equalUpToPhase(unitaryOf(level.qubits, handItems(level, picks)), unitaryOf(level.qubits, level.target));
}

/** Fewest cards that solve the level: tries every ordered selection of distinct cards from the hand. */
export function shortestSolution(level: DeckLevel): number[] | null {
  let best: number[] | null = null;
  const walk = (picks: number[]) => {
    if (best && picks.length >= best.length) return;
    if (picks.length > 0 && isSolved(level, picks)) {
      best = picks;
      return;
    }
    for (let i = 0; i < level.hand.length; i++) {
      if (!picks.includes(i)) walk([...picks, i]);
    }
  };
  walk([]);
  return best;
}

export const parFor = (level: DeckLevel): number => shortestSolution(level)?.length ?? level.hand.length;

export function starRating(cards: number, par: number): 1 | 2 | 3 {
  if (cards <= par) return 3;
  if (cards <= par + 1) return 2;
  return 1;
}

export interface TestInput {
  label: string;
  amplitudes: Complex[];
}

const INV = 1 / Math.SQRT2;

/** Inputs that together pin the unitary down (up to phase): every basis state and each pair mixed together. */
export function testInputs(n: number): TestInput[] {
  const dim = 1 << n;
  const basis = (j: number, len = n) => `|${j.toString(2).padStart(len, '0')}⟩`;
  const out: TestInput[] = [];
  for (let j = 0; j < dim; j++) {
    out.push({ label: basis(j), amplitudes: Array.from({ length: dim }, (_, i) => (i === j ? Complex.one() : Complex.zero())) });
  }
  for (let j = 1; j < dim; j++) {
    out.push({
      label: `${basis(0)}+${basis(j)}`,
      amplitudes: Array.from({ length: dim }, (_, i) => (i === 0 || i === j ? Complex.create(INV, 0) : Complex.zero())),
    });
  }
  return out;
}

function runOn(input: TestInput, items: Placed[]): QuantumStateVector {
  const s = QuantumStateVector.fromAmplitudes(input.amplitudes);
  for (const p of items) applyPlaced(s, p);
  return s;
}

/** For each test input: does the player's circuit give the same state as the target (up to global phase)? */
export function checkInputs(level: DeckLevel, picks: number[]): { label: string; ok: boolean }[] {
  return testInputs(level.qubits).map((input) => {
    const mine = runOn(input, handItems(level, picks));
    const want = runOn(input, level.target);
    let re = 0;
    let im = 0;
    for (let i = 0; i < mine.dim; i++) {
      const p = Complex.mul(Complex.conj(mine.amplitudes[i]), want.amplitudes[i]);
      re += p.re;
      im += p.im;
    }
    return { label: input.label, ok: re * re + im * im > 0.9999 };
  });
}
