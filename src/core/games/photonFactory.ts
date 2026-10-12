import { transmission } from '../hardware/loss';

/**
 * Photon Factory: a photonic machine builds its state in heralded steps. Each attempt at a step works with some chance
 * (and the machine is told when it did, so it keeps only successes). To make a step reliable you try many copies at once
 * and switch the first success through: multiplexing. But the switching network costs light: every doubling of the
 * number of copies adds one layer of switches, and each layer loses a little. The player picks how many copies each step
 * gets, within a budget of sources, and must reach a target success chance.
 *
 *   effective chance of one attempt   p_eff = p * transmission(layers * loss_per_layer),  layers = log2(copies)
 *   chance a step succeeds            1 - (1 - p_eff)^copies
 *   the whole chain                   the product over the steps
 *
 * Simplified: identical attempts, independent steps, and no loss anywhere except the switches.
 */
export interface FactoryStage {
  name: string;
  /** Chance that one attempt works. */
  p: number;
}

export interface FactoryLevel {
  id: string;
  title: string;
  story: string;
  stages: FactoryStage[];
  /** Loss of one layer of switches, in dB. */
  switchLossDb: number;
  /** The most sources (attempts in total) the budget allows. */
  budget: number;
  /** The success chance the chain must reach. */
  target: number;
}

/** The numbers of copies on offer for each step. */
export const COPIES = [1, 2, 4, 8, 16];

export const layersFor = (copies: number): number => Math.round(Math.log2(Math.max(1, copies)));

export function stageSuccess(p: number, copies: number, switchLossDb: number): number {
  const eff = p * transmission(layersFor(copies) * switchLossDb);
  return 1 - Math.pow(1 - Math.min(1, eff), copies);
}

export interface FactoryResult {
  perStage: number[];
  success: number;
  used: number;
  withinBudget: boolean;
  passed: boolean;
}

export function evaluate(level: FactoryLevel, copies: number[]): FactoryResult {
  const perStage = level.stages.map((s, i) => stageSuccess(s.p, copies[i] ?? 1, level.switchLossDb));
  const success = perStage.reduce((a, b) => a * b, 1);
  const used = copies.reduce((a, b) => a + b, 0);
  const withinBudget = used <= level.budget;
  return { perStage, success, used, withinBudget, passed: withinBudget && success >= level.target };
}

/** Every assignment of copies to steps, by brute force (five options per step, at most six steps). */
function* assignments(stages: number): Generator<number[]> {
  const total = Math.pow(COPIES.length, stages);
  for (let n = 0; n < total; n++) {
    const out: number[] = [];
    let rest = n;
    for (let i = 0; i < stages; i++) {
      out.push(COPIES[rest % COPIES.length]);
      rest = Math.floor(rest / COPIES.length);
    }
    yield out;
  }
}

/** The assignment with the highest success chance inside the budget. */
export function bestWithinBudget(level: FactoryLevel): { copies: number[]; result: FactoryResult } {
  let best: { copies: number[]; result: FactoryResult } | null = null;
  for (const copies of assignments(level.stages.length)) {
    const result = evaluate(level, copies);
    if (!result.withinBudget) continue;
    if (!best || result.success > best.result.success) best = { copies, result };
  }
  return best as { copies: number[]; result: FactoryResult };
}

/** The fewest sources that still reach the target, or null if nothing within the budget does. */
export function cheapestPass(level: FactoryLevel): number | null {
  let cheapest: number | null = null;
  for (const copies of assignments(level.stages.length)) {
    const result = evaluate(level, copies);
    if (result.passed && (cheapest === null || result.used < cheapest)) cheapest = result.used;
  }
  return cheapest;
}

/** 3 stars if the passing plan uses no more than 1.15 times the fewest sources, 2 within 1.5 times, otherwise 1. */
export function stars(level: FactoryLevel, result: FactoryResult): 0 | 1 | 2 | 3 {
  if (!result.passed) return 0;
  const least = cheapestPass(level) ?? result.used;
  if (result.used <= least * 1.15) return 3;
  if (result.used <= least * 1.5) return 2;
  return 1;
}

export const LEVELS: FactoryLevel[] = [
  {
    id: 'first_line', title: 'The first line', story: 'Three steps that each work half the time. A few copies per step make the chain dependable.',
    stages: [{ name: 'Photon source', p: 0.5 }, { name: 'Fusion', p: 0.5 }, { name: 'Detector herald', p: 0.5 }],
    switchLossDb: 0.2, budget: 14, target: 0.72,
  },
  {
    id: 'weak_link', title: 'The weak link', story: 'One step in the chain works only a quarter of the time. Spend where it matters.',
    stages: [{ name: 'Source', p: 0.5 }, { name: 'Weak fusion', p: 0.25 }, { name: 'Source', p: 0.5 }, { name: 'Weak fusion', p: 0.25 }],
    switchLossDb: 0.2, budget: 30, target: 0.6,
  },
  {
    id: 'lossy_switches', title: 'Lossy switches', story: 'These switches lose a lot of light. Copies still help, but each doubling gains less than it did, and the target is modest.',
    stages: [{ name: 'Source', p: 0.3 }, { name: 'Fusion', p: 0.3 }, { name: 'Fusion', p: 0.3 }],
    switchLossDb: 1.5, budget: 40, target: 0.25,
  },
  {
    id: 'too_lossy', title: 'More is less', story: 'These switches are so lossy that every extra copy lowers the chance. Try some, then find the cheapest plan that clears a modest bar.',
    stages: [{ name: 'Source', p: 0.5 }, { name: 'Fusion', p: 0.5 }, { name: 'Fusion', p: 0.5 }, { name: 'Herald', p: 0.5 }],
    switchLossDb: 3.5, budget: 20, target: 0.06,
  },
  {
    id: 'long_chain', title: 'The long chain', story: 'Five steps with mixed odds on a tight budget of sources.',
    stages: [{ name: 'Source', p: 0.6 }, { name: 'Fusion', p: 0.4 }, { name: 'Fusion', p: 0.3 }, { name: 'Fusion', p: 0.4 }, { name: 'Herald', p: 0.6 }],
    switchLossDb: 0.5, budget: 36, target: 0.6,
  },
];
