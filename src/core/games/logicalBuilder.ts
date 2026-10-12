import { THRESHOLD, belowThreshold, logicalError, physicalQubits } from '../hardware/overhead';

/**
 * Logical Qubit Builder: turn noisy physical qubits into one good logical qubit with a surface code. Two levers:
 *
 *  - the code distance d (odd): more qubits, and below the threshold a lower logical error;
 *  - improving the hardware: each step multiplies the physical error by 0.7 (better materials, calibration, shielding).
 *
 * The surface-code formula is the one in the Overhead Calculator (Fowler et al. 2012: threshold 0.57%, prefactor 0.03,
 * (2d - 1)^2 qubits). Above the threshold a bigger code is WORSE, so the only winning move is to improve the hardware
 * first. Distance 1 is no code at all: the logical qubit is just a physical qubit. Improvement steps are not free: they
 * are scored, because in the real world they are years of work.
 */
export const IMPROVE_FACTOR = 0.7;
export const MAX_STEPS = 8;
export const MAX_DISTANCE = 61;

export interface BuilderLevel {
  id: string;
  title: string;
  story: string;
  /** Physical error per step at the start. */
  p: number;
  /** The logical error the customer needs. */
  target: number;
  /** The most physical qubits that can be spent on the one logical qubit. */
  budget: number;
}

export interface Build {
  /** Odd code distance; 1 means no code. */
  distance: number;
  /** How many times the hardware was improved. */
  improvements: number;
}

export const physicalError = (level: BuilderLevel, improvements: number): number => level.p * Math.pow(IMPROVE_FACTOR, improvements);

export interface Outcome {
  physical: number;
  logical: number;
  qubits: number;
  below: boolean;
  withinBudget: boolean;
  passed: boolean;
}

export function evaluate(level: BuilderLevel, build: Build): Outcome {
  const physical = physicalError(level, build.improvements);
  const qubits = build.distance <= 1 ? 1 : physicalQubits(build.distance);
  const logical = build.distance <= 1 ? Math.min(1, physical) : Math.min(1, logicalError(physical, build.distance));
  const withinBudget = qubits <= level.budget;
  return { physical, logical, qubits, below: belowThreshold(physical), withinBudget, passed: withinBudget && logical <= level.target };
}

/** The cheapest passing build: fewest improvement steps first, then fewest qubits. Null if nothing passes. */
export function cheapestBuild(level: BuilderLevel): (Build & { qubits: number }) | null {
  for (let improvements = 0; improvements <= MAX_STEPS; improvements++) {
    for (let distance = 1; distance <= MAX_DISTANCE; distance += 2) {
      const o = evaluate(level, { distance, improvements });
      if (o.passed) return { distance, improvements, qubits: o.qubits };
    }
  }
  return null;
}

/** 3 stars for the fewest improvements and a code within 20% of the smallest, 2 for at most one more step, 1 otherwise. */
export function stars(level: BuilderLevel, build: Build, outcome: Outcome): 0 | 1 | 2 | 3 {
  if (!outcome.passed) return 0;
  const best = cheapestBuild(level);
  if (!best) return 1;
  if (build.improvements <= best.improvements && outcome.qubits <= best.qubits * 1.2) return 3;
  if (build.improvements <= best.improvements + 1) return 2;
  return 1;
}

export const LEVELS: BuilderLevel[] = [
  { id: 'good_qubits', title: 'Good qubits', story: 'The physical qubits are well below the threshold. Pick the smallest code that gets the logical error you need.', p: 0.001, target: 1e-6, budget: 2000 },
  { id: 'getting_close', title: 'Getting close', story: 'Qubits nearer the threshold, and a budget that a big enough code would not fit in. Improve the hardware once or twice, then build.', p: 0.003, target: 1e-6, budget: 3000 },
  { id: 'edge', title: 'On the edge', story: 'Almost at the threshold. Each step of distance now helps only a little, so improving the qubits pays much more.', p: 0.005, target: 1e-4, budget: 5000 },
  { id: 'too_noisy', title: 'Too noisy', story: 'These qubits are above the threshold. Try a bigger code and watch the logical error get worse. Then fix the hardware.', p: 0.009, target: 1e-3, budget: 10000 },
  { id: 'tiny_budget', title: 'A tiny budget', story: 'Very good qubits and a very high bar, but only 600 physical qubits to spend. Hardware improvement is the cheaper lever.', p: 0.0005, target: 1e-12, budget: 600 },
];

export const THRESHOLD_PERCENT = THRESHOLD * 100;
