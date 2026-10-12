/**
 * Tweezer Shuffle: atoms sit in a grid of optical tweezers. A tweezer can pick one atom up and set it down on a free
 * neighbouring site, which takes one move. Some sites are blocked (a defective tweezer, or light scattered from a trap that
 * must stay clear). The aim is to rearrange the atoms into a target pattern with the fewest moves; the pattern matters
 * because two atoms interact (through the Rydberg blockade) only when they are close enough, so where atoms sit decides
 * which gates are possible.
 *
 * The atoms are identical, so only the set of occupied sites matters. The rules are simplified: real arrays move a whole
 * row at once and lose atoms along the way, and this game does neither.
 */
export interface TweezerLevel {
  id: string;
  title: string;
  story: string;
  width: number;
  height: number;
  /** Occupied sites at the start, as [x, y]. */
  atoms: [number, number][];
  /** The pattern to reach, as [x, y]. */
  target: [number, number][];
  /** Sites a tweezer cannot use. */
  blocked: [number, number][];
}

export const siteIndex = (level: Pick<TweezerLevel, 'width'>, x: number, y: number): number => y * level.width + x;
export const siteXY = (level: Pick<TweezerLevel, 'width'>, i: number): [number, number] => [i % level.width, Math.floor(i / level.width)];

/** A set of occupied sites, kept as a sorted list of site indices. */
export type Occupied = number[];

export const startSites = (level: TweezerLevel): Occupied => level.atoms.map(([x, y]) => siteIndex(level, x, y)).sort((a, b) => a - b);
export const targetSites = (level: TweezerLevel): Occupied => level.target.map(([x, y]) => siteIndex(level, x, y)).sort((a, b) => a - b);
const blockedSet = (level: TweezerLevel): Set<number> => new Set(level.blocked.map(([x, y]) => siteIndex(level, x, y)));

const neighbours = (level: TweezerLevel, i: number): number[] => {
  const [x, y] = siteXY(level, i);
  const out: number[] = [];
  if (x > 0) out.push(i - 1);
  if (x < level.width - 1) out.push(i + 1);
  if (y > 0) out.push(i - level.width);
  if (y < level.height - 1) out.push(i + level.width);
  return out;
};

/** Why an atom cannot go from one site to another, or null if it can. */
export function moveProblem(level: TweezerLevel, occupied: Occupied, from: number, to: number): string | null {
  if (!occupied.includes(from)) return 'There is no atom there to pick up.';
  if (!neighbours(level, from).includes(to)) return 'A tweezer only moves an atom to the next site along.';
  if (blockedSet(level).has(to)) return 'That site is blocked.';
  if (occupied.includes(to)) return 'That site already holds an atom.';
  return null;
}

/** The arrangement after one move, or null if it is not allowed. */
export function move(level: TweezerLevel, occupied: Occupied, from: number, to: number): Occupied | null {
  if (moveProblem(level, occupied, from, to)) return null;
  return occupied.map((s) => (s === from ? to : s)).sort((a, b) => a - b);
}

export const matches = (a: Occupied, b: Occupied): boolean => a.length === b.length && a.every((v, i) => v === b[i]);

export const solved = (level: TweezerLevel, occupied: Occupied): boolean => matches(occupied, targetSites(level));

/** The fewest moves from the start to the target pattern (breadth-first search over arrangements), or null. */
export function par(level: TweezerLevel): number | null {
  const goal = targetSites(level).join(',');
  const start = startSites(level);
  if (start.join(',') === goal) return 0;
  const seen = new Set<string>([start.join(',')]);
  let frontier: Occupied[] = [start];
  for (let moves = 1; moves <= 60 && frontier.length; moves++) {
    const next: Occupied[] = [];
    for (const state of frontier) {
      for (const from of state) {
        for (const to of neighbours(level, from)) {
          const after = move(level, state, from, to);
          if (!after) continue;
          const k = after.join(',');
          if (k === goal) return moves;
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

/** Pairs of atoms on neighbouring sites: the ones close enough to feel the blockade and to be entangled. */
export function neighbourPairs(level: TweezerLevel, occupied: Occupied): [number, number][] {
  const pairs: [number, number][] = [];
  for (const a of occupied) for (const b of neighbours(level, a)) if (b > a && occupied.includes(b)) pairs.push([a, b]);
  return pairs;
}

/** 3 stars for the fewest moves, 2 for up to 3 more, 1 for anything else that finishes. */
export function stars(parMoves: number, used: number): 1 | 2 | 3 {
  if (used <= parMoves) return 3;
  if (used <= parMoves + 3) return 2;
  return 1;
}

export const LEVELS: TweezerLevel[] = [
  {
    id: 'slide', title: 'Slide a row', story: 'Three atoms in the top row must end up in the bottom row. Each move shifts one atom one site.',
    width: 4, height: 3, atoms: [[0, 0], [1, 0], [2, 0]], target: [[0, 2], [1, 2], [2, 2]], blocked: [],
  },
  {
    id: 'pairs', title: 'Make pairs', story: 'Four lonely atoms in the corners. A gate needs a neighbour: build two touching pairs.',
    width: 4, height: 4, atoms: [[0, 0], [3, 0], [0, 3], [3, 3]], target: [[0, 1], [0, 2], [3, 1], [3, 2]], blocked: [],
  },
  {
    id: 'wall', title: 'Round the wall', story: 'A line of blocked sites splits the array. Find the gap, and mind the order of moves.',
    width: 5, height: 4, atoms: [[1, 2], [1, 3]], target: [[3, 2], [3, 3]],
    blocked: [[2, 0], [2, 1], [2, 2]],
  },
  {
    id: 'ring', title: 'A ring', story: 'Six atoms start in a block. Make a ring around the centre, where every atom touches two others.',
    width: 4, height: 4, atoms: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
    target: [[1, 1], [2, 1], [1, 2], [2, 2], [1, 0], [2, 0]], blocked: [],
  },
  {
    id: 'squeeze', title: 'Squeeze through', story: 'Two atoms on one side, two spots on the other, and one gap in the wall that both must use. Mind who goes first.',
    width: 5, height: 3, atoms: [[1, 0], [1, 2]], target: [[3, 0], [3, 2]],
    blocked: [[2, 0], [2, 2]],
  },
];
