import { Gates, QuantumStateVector } from '../circuit';
import type { Matrix2x2 } from '../circuit';

/**
 * Circuit Lab model: a grid of columns. Within a column single-qubit gates sit on different qubits, or the column
 * holds one CNOT. Columns run left to right, so the order of gates on one qubit is simply the column order.
 * Qubit 0 is the least significant bit, so bitstrings read q(n-1) ... q0 like Qiskit.
 */
export type GateName = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T';
export const GATE_NAMES: GateName[] = ['H', 'X', 'Y', 'Z', 'S', 'T'];

export type Placed =
  | { kind: 'gate'; gate: GateName; qubit: number }
  | { kind: 'cnot'; control: number; target: number };

export interface Circuit {
  numQubits: number;
  columns: Placed[][];
}

export const MAX_QUBITS = 3;
export const DEFAULT_COLUMNS = 6;

const MATRICES: Record<GateName, () => Matrix2x2> = {
  H: Gates.H, X: Gates.X, Y: Gates.Y, Z: Gates.Z, S: Gates.S, T: Gates.T,
};

export const emptyCircuit = (numQubits: number, columns = DEFAULT_COLUMNS): Circuit => ({
  numQubits,
  columns: Array.from({ length: columns }, () => []),
});

const touches = (p: Placed, qubit: number): boolean =>
  p.kind === 'gate' ? p.qubit === qubit : p.control === qubit || p.target === qubit;

export const itemAt = (c: Circuit, col: number, qubit: number): Placed | undefined =>
  c.columns[col]?.find((p) => touches(p, qubit));

const withColumn = (c: Circuit, col: number, items: Placed[]): Circuit => ({
  ...c,
  columns: c.columns.map((existing, i) => (i === col ? items : existing)),
});

/** Puts a gate in a cell, replacing whatever was on that qubit; a CNOT in the same column is removed. */
export function placeGate(c: Circuit, col: number, qubit: number, gate: GateName): Circuit {
  if (col < 0 || col >= c.columns.length || qubit < 0 || qubit >= c.numQubits) return c;
  const kept = c.columns[col].filter((p) => p.kind === 'gate' && p.qubit !== qubit);
  return withColumn(c, col, [...kept, { kind: 'gate', gate, qubit }]);
}

/** A CNOT takes over its whole column. */
export function placeCnot(c: Circuit, col: number, control: number, target: number): Circuit {
  if (col < 0 || col >= c.columns.length || control === target) return c;
  if ([control, target].some((q) => q < 0 || q >= c.numQubits)) return c;
  return withColumn(c, col, [{ kind: 'cnot', control, target }]);
}

/** Removes whatever touches this cell (a CNOT disappears entirely). */
export function clearCell(c: Circuit, col: number, qubit: number): Circuit {
  if (col < 0 || col >= c.columns.length) return c;
  return withColumn(c, col, c.columns[col].filter((p) => !touches(p, qubit)));
}

/** Changes the number of wires; anything that used a removed wire is dropped. */
export function resizeCircuit(c: Circuit, numQubits: number): Circuit {
  const n = Math.min(Math.max(numQubits, 1), MAX_QUBITS);
  return {
    numQubits: n,
    columns: c.columns.map((col) =>
      col.filter((p) => (p.kind === 'gate' ? p.qubit < n : p.control < n && p.target < n))),
  };
}

export const gateCount = (c: Circuit): number => c.columns.reduce((sum, col) => sum + col.length, 0);

export function applyPlaced(state: QuantumStateVector, p: Placed): void {
  if (p.kind === 'cnot') state.applyCNOT(p.control, p.target);
  else state.applyGate(MATRICES[p.gate](), p.qubit);
}

/** Runs the circuit on |0...0> and returns the final state vector. */
export function runCircuit(c: Circuit): QuantumStateVector {
  const state = new QuantumStateVector(c.numQubits);
  for (const col of c.columns) {
    const ordered = [...col].sort((a, b) => (a.kind === 'gate' && b.kind === 'gate' ? a.qubit - b.qubit : 0));
    for (const p of ordered) applyPlaced(state, p);
  }
  return state;
}

export interface CircuitPreset {
  id: string;
  label: string;
  blurb: string;
  circuit: Circuit;
}

const build = (n: number, items: [number, Placed][]): Circuit =>
  items.reduce((c, [col, p]) => (p.kind === 'cnot' ? placeCnot(c, col, p.control, p.target) : placeGate(c, col, p.qubit, p.gate)),
    emptyCircuit(n));

export const PRESETS: CircuitPreset[] = [
  {
    id: 'bell',
    label: 'Bell pair',
    blurb: 'H then CNOT: two qubits that always agree, yet each one alone is a coin flip.',
    circuit: build(2, [[0, { kind: 'gate', gate: 'H', qubit: 0 }], [1, { kind: 'cnot', control: 0, target: 1 }]]),
  },
  {
    id: 'ghz',
    label: 'GHZ state',
    blurb: 'Three qubits that all agree: only 000 and 111 ever appear.',
    circuit: build(3, [
      [0, { kind: 'gate', gate: 'H', qubit: 0 }],
      [1, { kind: 'cnot', control: 0, target: 1 }],
      [2, { kind: 'cnot', control: 1, target: 2 }],
    ]),
  },
  {
    id: 'hxh',
    label: 'H X H = Z',
    blurb: 'Sandwiching X between two Hadamards turns a bit flip into a phase flip. Check: it leaves |0⟩ alone.',
    circuit: build(1, [
      [0, { kind: 'gate', gate: 'H', qubit: 0 }],
      [1, { kind: 'gate', gate: 'X', qubit: 0 }],
      [2, { kind: 'gate', gate: 'H', qubit: 0 }],
    ]),
  },
  {
    id: 'hzh',
    label: 'H Z H = X',
    blurb: 'The other way round: H Z H flips |0⟩ to |1⟩, just like X.',
    circuit: build(1, [
      [0, { kind: 'gate', gate: 'H', qubit: 0 }],
      [1, { kind: 'gate', gate: 'Z', qubit: 0 }],
      [2, { kind: 'gate', gate: 'H', qubit: 0 }],
    ]),
  },
];

/** "|01⟩" style label for basis state `index` on n qubits. */
export const basisLabel = (index: number, numQubits: number): string => `|${index.toString(2).padStart(numQubits, '0')}⟩`;
