/**
 * Ion Chain Conductor: ions sit in several traps (zones). Two ions can only interact when they are in the same trap, and
 * a trap holds only so many. Moving an ion from one trap to another is called shuttling and costs one move, because it is
 * slow and heats the ion. A list of two-qubit gates has to run in order with as few moves as possible.
 *
 * This is the "linking traps" idea from the trapped-ion lesson boiled down: inside one chain everyone talks to everyone,
 * so the cost shows up only when ions have to change traps. Real machines also have gate zones, cooling steps and ion
 * ordering inside a chain, which this game leaves out.
 */
export type Gate = [number, number];

export interface IonLevel {
  id: string;
  title: string;
  story: string;
  traps: number;
  /** The most ions one trap can hold. */
  capacity: number;
  /** Where each ion starts: start[i] is the trap of ion i. */
  start: number[];
  /** The gates, in the order they must run. */
  gates: Gate[];
}

export interface IonState {
  /** assign[i] is the trap that holds ion i. */
  assign: number[];
  /** How many gates have run. */
  done: number;
}

export const ionCount = (level: IonLevel): number => level.start.length;

/** Runs every gate at the front of the list whose two ions share a trap. */
export function settle(level: IonLevel, assign: number[], done: number): IonState {
  let d = done;
  while (d < level.gates.length && assign[level.gates[d][0]] === assign[level.gates[d][1]]) d++;
  return { assign, done: d };
}

export const initial = (level: IonLevel): IonState => settle(level, level.start.slice(), 0);

export const finished = (level: IonLevel, state: IonState): boolean => state.done >= level.gates.length;

export const occupancy = (level: IonLevel, assign: number[]): number[] => {
  const counts = new Array<number>(level.traps).fill(0);
  for (const t of assign) counts[t]++;
  return counts;
};

/** Why a move is not allowed, or null if it is. */
export function moveProblem(level: IonLevel, state: IonState, ion: number, trap: number): string | null {
  if (ion < 0 || ion >= ionCount(level)) return 'There is no such ion.';
  if (trap < 0 || trap >= level.traps) return 'There is no such trap.';
  if (state.assign[ion] === trap) return 'That ion is already in that trap.';
  if (occupancy(level, state.assign)[trap] >= level.capacity) return 'That trap is full.';
  return null;
}

/** Shuttles an ion and runs whatever gates become possible. Returns the new state, or null if the move is not allowed. */
export function move(level: IonLevel, state: IonState, ion: number, trap: number): IonState | null {
  if (moveProblem(level, state, ion, trap)) return null;
  const assign = state.assign.slice();
  assign[ion] = trap;
  return settle(level, assign, state.done);
}

const key = (s: IonState): string => `${s.done}|${s.assign.join('')}`;

/** The fewest moves that run every gate, by breadth-first search over all arrangements. */
export function par(level: IonLevel): number | null {
  const start = initial(level);
  if (finished(level, start)) return 0;
  const seen = new Set<string>([key(start)]);
  let frontier: IonState[] = [start];
  for (let moves = 1; moves <= 30 && frontier.length; moves++) {
    const next: IonState[] = [];
    for (const state of frontier) {
      for (let ion = 0; ion < ionCount(level); ion++) {
        for (let trap = 0; trap < level.traps; trap++) {
          const after = move(level, state, ion, trap);
          if (!after) continue;
          if (finished(level, after)) return moves;
          const k = key(after);
          if (seen.has(k)) continue;
          seen.add(k);
          next.push(after);
        }
      }
    }
    frontier = next;
  }
  return null;
}

/** 3 stars for the fewest moves, 2 for one or two more, 1 for anything else that finishes. */
export function stars(parMoves: number, used: number): 1 | 2 | 3 {
  if (used <= parMoves) return 3;
  if (used <= parMoves + 2) return 2;
  return 1;
}

export const LEVELS: IonLevel[] = [
  {
    id: 'two_pairs', title: 'Two meetings', story: 'Two traps, four ions. Bring the right pairs together, one at a time.',
    traps: 2, capacity: 3, start: [0, 0, 1, 1], gates: [[0, 2], [1, 3]],
  },
  {
    id: 'chain_of_gates', title: 'A chain of gates', story: 'Each gate shares one ion with the next. Let the ion that is needed twice do the travelling.',
    traps: 2, capacity: 3, start: [0, 0, 1, 1, 1], gates: [[1, 2], [2, 3], [3, 0]],
  },
  {
    id: 'three_traps', title: 'Three zones', story: 'Three traps and a gate between every pair of the first three ions.',
    traps: 3, capacity: 2, start: [0, 1, 2, 2], gates: [[0, 1], [1, 2], [0, 2], [2, 3]],
  },
  {
    id: 'full_house', title: 'Full house', story: 'Every trap is nearly full, so an ion can only move where there is a free place.',
    traps: 3, capacity: 3, start: [0, 0, 0, 1, 1, 1, 2, 2], gates: [[0, 3], [1, 6], [4, 7], [2, 5]],
  },
  {
    id: 'relay', title: 'The relay', story: 'A long ladder of gates across all three traps. Plan the order of moves ahead.',
    traps: 3, capacity: 3, start: [0, 0, 1, 1, 2, 2], gates: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 5], [5, 0]],
  },
];
