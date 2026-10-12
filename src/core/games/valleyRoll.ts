import { PROBLEMS, anneal, energies, groundEnergy } from '../hardware/annealing';
import type { IsingProblem } from '../hardware/annealing';

/**
 * Valley Roll: an annealer is run again and again on a landscape of answers and the best result is kept. Each run lasts as
 * long as you choose (the anneal time) plus a fixed readout. A slow run is more likely to end in the lowest valley but
 * costs more time; a quick run is cheap and usually lands in a worse valley. Every run also pays a fixed time for reset and readout. With a fixed time budget the question is how
 * to spend it: a few slow runs, or many fast ones?
 *
 * The chance of a run is taken from the exact few-spin simulation in the Annealing Lab (`core/hardware/annealing.ts`), and
 * each run is a real random draw from that outcome, so the same plan can have good or bad luck.
 *
 * This game says nothing about whether real annealers beat classical machines: that is an open question, and the finish
 * screen says so. It is a closed, perfect, five-or-six-spin model.
 */
export const READOUT = 5;
/** The anneal times on offer. */
export const TIMES = [1, 3, 10, 30, 100];

export const runCost = (T: number): number => T + READOUT;

const extra = (id: string, name: string, about: string, h: number[], couplings: [number, number, number][]): IsingProblem => ({
  id, name, about, spins: h.length, h, couplings,
});

const VALLEY_PROBLEMS: Record<string, IsingProblem> = {
  easy: PROBLEMS.find((p) => p.id === 'easy')!,
  ring: PROBLEMS.find((p) => p.id === 'ring')!,
  hard: PROBLEMS.find((p) => p.id === 'hard')!,
  maze: extra(
    'maze', 'A maze of valleys', 'Five spins whose best and second-best answers differ in all five.',
    [0.5, 0, 0, 0.5, 0.5], [[0, 2, -1], [0, 4, 2], [1, 2, -1], [1, 4, 1], [2, 3, 1], [3, 4, -1]],
  ),
  deep: extra(
    'deep', 'A deep, narrow valley', 'Six spins with a small gap: the lowest valley is hard to find quickly.',
    [0, 0, 0.5, 0, 0, 0.5], [[0, 4, -1], [0, 5, -1], [1, 3, -2], [1, 4, 2], [2, 3, 1], [3, 5, -2], [4, 5, -1]],
  ),
};

export interface ValleyLevel {
  id: string;
  title: string;
  story: string;
  problem: IsingProblem;
  /** Total time available for all the runs together. */
  budget: number;
}

export const LEVELS: ValleyLevel[] = [
  { id: 'easy', title: 'A gentle slope', story: 'A wide valley. Even a quick run finds the bottom most of the time.', problem: VALLEY_PROBLEMS.easy, budget: 40 },
  { id: 'ring', title: 'The ring', story: 'Spins that dislike their neighbours. A narrower gap, so rushing costs you.', problem: VALLEY_PROBLEMS.ring, budget: 50 },
  { id: 'hard', title: 'Tangled five', story: 'Five spins and a small gap. Decide how to split the time between fast and slow runs.', problem: VALLEY_PROBLEMS.hard, budget: 70 },
  { id: 'maze', title: 'A maze', story: 'The second-best answer is the far side of the landscape. Quick runs often get stuck there.', problem: VALLEY_PROBLEMS.maze, budget: 60 },
  { id: 'deep', title: 'Deep and narrow', story: 'Six spins and the smallest gap yet. Even the slowest run sometimes misses.', problem: VALLEY_PROBLEMS.deep, budget: 100 },
];

const cache = new Map<string, { success: number; probabilities: number[] }>();

/** What one run of anneal time T does on this problem (cached: it takes a moment to compute). */
export function runOutcome(problem: IsingProblem, T: number): { success: number; probabilities: number[] } {
  const k = `${problem.id}|${T}`;
  let hit = cache.get(k);
  if (!hit) {
    const r = anneal(problem, T);
    hit = { success: r.success, probabilities: r.probabilities };
    cache.set(k, hit);
  }
  return hit;
}

export const runChance = (problem: IsingProblem, T: number): number => runOutcome(problem, T).success;

/** The time a plan of identical runs is expected to take to find the best answer: cost of one run over its chance. */
export function expectedCost(problem: IsingProblem, T: number): number {
  const p = runChance(problem, T);
  return p > 0 ? runCost(T) / p : Infinity;
}

/** The anneal time with the lowest expected cost, among the times on offer. */
export function bestTime(problem: IsingProblem): number {
  return TIMES.reduce((a, b) => (expectedCost(problem, b) < expectedCost(problem, a) ? b : a));
}

/** The chance of finding the best answer at least once, if the whole budget is spent on runs of anneal time T. */
export function chanceWithin(problem: IsingProblem, T: number, budget: number): number {
  const runs = Math.floor(budget / runCost(T));
  return 1 - Math.pow(1 - runChance(problem, T), runs);
}

export interface Draw {
  state: number;
  energy: number;
  isBest: boolean;
}

/** One run: a random draw from the outcome the simulation gives. */
export function draw(problem: IsingProblem, T: number, rng: () => number = Math.random): Draw {
  const { probabilities } = runOutcome(problem, T);
  const e = energies(problem);
  let r = rng();
  let state = probabilities.length - 1;
  for (let i = 0; i < probabilities.length; i++) {
    r -= probabilities[i];
    if (r <= 0) {
      state = i;
      break;
    }
  }
  return { state, energy: e[state], isBest: Math.abs(e[state] - groundEnergy(problem)) < 1e-9 };
}

/** The landscape for drawing: states in Gray-code order (neighbours differ by one spin), with energy and probability. */
export function landscape(problem: IsingProblem, T: number): { state: number; energy: number; probability: number }[] {
  const e = energies(problem);
  const { probabilities } = runOutcome(problem, T);
  return Array.from({ length: e.length }, (_, i) => {
    const state = i ^ (i >> 1);
    return { state, energy: e[state], probability: probabilities[state] };
  });
}

/** 3 stars if the best answer was found using at most 1.5 times the budget's fair share, 2 for up to the whole budget, 1 otherwise. */
export function stars(level: ValleyLevel, spent: number, found: boolean): 0 | 1 | 2 | 3 {
  if (!found || spent > level.budget) return 0;
  const fair = expectedCost(level.problem, bestTime(level.problem));
  return spent <= fair * 1.5 ? 3 : spent <= level.budget * 0.75 ? 2 : 1;
}

export const bitsOf = (state: number, spins: number): string =>
  state.toString(2).padStart(spins, '0').split('').reverse().join('');
