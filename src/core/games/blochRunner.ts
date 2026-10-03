import { Complex, Gates, QuantumStateVector } from '../circuit';
import type { Matrix2x2 } from '../circuit';

export type GateName = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'Sdg' | 'T';

export interface GateInfo {
  name: GateName;
  label: string;
  blurb: string;
  matrix: () => Matrix2x2;
}

export const GATE_INFO: Record<GateName, GateInfo> = {
  H: { name: 'H', label: 'H', blurb: 'Hadamard: pole to equator', matrix: Gates.H },
  X: { name: 'X', label: 'X', blurb: 'Flip: half-turn about X', matrix: Gates.X },
  Y: { name: 'Y', label: 'Y', blurb: 'Half-turn about Y', matrix: Gates.Y },
  Z: { name: 'Z', label: 'Z', blurb: 'Phase flip: half-turn about Z', matrix: Gates.Z },
  S: { name: 'S', label: 'S', blurb: 'Quarter-turn about Z', matrix: Gates.S },
  Sdg: {
    name: 'Sdg',
    label: 'S†',
    blurb: 'Quarter-turn the other way',
    matrix: (): Matrix2x2 => [
      [Complex.one(), Complex.zero()],
      [Complex.zero(), Complex.create(0, -1)],
    ],
  },
  T: { name: 'T', label: 'T', blurb: 'Eighth-turn about Z', matrix: Gates.T },
};

export interface RunnerLevel {
  id: number;
  title: string;
  story: string;
  hint: string;
  /** Gates that prepare the starting state from |0>. */
  prep: GateName[];
  /** Gates applied after prep that define the target, which guarantees the level is solvable. */
  targetFrom: GateName[];
  allowed: GateName[];
}

export const LEVELS: RunnerLevel[] = [
  { id: 1, title: 'Flip the Switch', story: 'The door needs a qubit at the SOUTH pole.', hint: 'A half-turn about X swaps |0> and |1>.', prep: [], targetFrom: ['X'], allowed: ['X', 'H', 'Z'] },
  { id: 2, title: 'Ride the Equator', story: 'Get onto the equator, facing +X.', hint: 'Hadamard moves the pole onto the equator.', prep: [], targetFrom: ['H'], allowed: ['H', 'X', 'Z'] },
  { id: 3, title: 'The Other Side', story: 'Reach the equator facing -X.', hint: 'Combine a Hadamard with a phase flip.', prep: [], targetFrom: ['H', 'Z'], allowed: ['H', 'X', 'Z'] },
  { id: 4, title: 'Quarter Turn', story: 'Land on the equator facing +Y.', hint: 'S spins you a quarter-turn around the vertical axis.', prep: [], targetFrom: ['H', 'S'], allowed: ['H', 'S', 'X', 'Z'] },
  { id: 5, title: 'Eighth Turn', story: 'A half-way step between +X and +Y.', hint: 'T is an eighth-turn: half of S.', prep: [], targetFrom: ['H', 'T'], allowed: ['H', 'S', 'T', 'X'] },
  { id: 6, title: 'Spin Back', story: 'You start facing +Y. Get to -Y.', hint: 'Two quarter-turns make a half-turn. Or one Z.', prep: ['H', 'S'], targetFrom: ['Sdg', 'Sdg'], allowed: ['S', 'Sdg', 'Z', 'H'] },
  { id: 7, title: 'Only Two Buttons', story: 'The panel is damaged: only H and S work. Reach -X.', hint: 'S twice acts like Z.', prep: [], targetFrom: ['H', 'Z'], allowed: ['H', 'S'] },
  { id: 8, title: 'The Final Gate', story: 'Boss level: reach a tilted state that sits off every axis.', hint: 'Plan the path. H and T together reach new latitudes.', prep: [], targetFrom: ['H', 'T', 'H', 'S'], allowed: ['H', 'S', 'T', 'X'] },
];

export function stateFromGates(seq: GateName[]): QuantumStateVector {
  const state = new QuantumStateVector(1);
  for (const g of seq) state.applyGate(GATE_INFO[g].matrix(), 0);
  return state;
}

/** Overlap |<a|b>|^2. Ignores global phase, which is physically unobservable. */
export function fidelity(a: QuantumStateVector, b: QuantumStateVector): number {
  let re = 0;
  let im = 0;
  for (let i = 0; i < a.dim; i++) {
    const p = Complex.mul(Complex.conj(a.amplitudes[i]), b.amplitudes[i]);
    re += p.re;
    im += p.im;
  }
  return re * re + im * im;
}

export const SOLVED_FIDELITY = 0.9999;

export function levelStart(level: RunnerLevel): QuantumStateVector {
  return stateFromGates(level.prep);
}

export function levelTarget(level: RunnerLevel): QuantumStateVector {
  return stateFromGates([...level.prep, ...level.targetFrom]);
}

export function playerState(level: RunnerLevel, moves: GateName[]): QuantumStateVector {
  return stateFromGates([...level.prep, ...moves]);
}

export function isSolved(level: RunnerLevel, moves: GateName[]): boolean {
  return fidelity(playerState(level, moves), levelTarget(level)) >= SOLVED_FIDELITY;
}

/** Fewest allowed gates that solve the level (breadth-first search), or null if none within maxDepth. */
export function shortestSolution(level: RunnerLevel, maxDepth = 8): GateName[] | null {
  let frontier: GateName[][] = [[]];
  for (let depth = 0; depth <= maxDepth; depth++) {
    for (const seq of frontier) {
      if (isSolved(level, seq)) return seq;
    }
    frontier = frontier.flatMap((seq) => level.allowed.map((g) => [...seq, g]));
  }
  return null;
}

export function parFor(level: RunnerLevel): number {
  return shortestSolution(level)?.length ?? level.targetFrom.length;
}

export function moveLimit(level: RunnerLevel): number {
  return parFor(level) + 3;
}

export function starRating(moves: number, par: number): 1 | 2 | 3 {
  if (moves <= par) return 3;
  if (moves <= par + 1) return 2;
  return 1;
}
