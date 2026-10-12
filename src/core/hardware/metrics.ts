/**
 * Qubit Metrics Lab: how many gates fit in a qubit's life. Two rules of thumb, and the smaller one is the budget:
 *
 *   by time:   T2 / (gate time)        the qubit forgets its phase after about T2
 *   by error:  1 / (error per gate)    after about 1/error gates, one error is expected
 *
 * Both are rough: real devices have several error sources and the numbers are not independent. They are the right size
 * for building intuition, which is what the lab is for.
 */

/** Gates that fit inside the coherence time: T2 divided by the gate time (microseconds and nanoseconds). */
export function depthByTime(t2Us: number, gateNs: number): number {
  if (!(t2Us > 0) || !(gateNs > 0)) return 0;
  return Math.floor((t2Us * 1000) / gateNs);
}

/** Gates after which about one error is expected: 1 over the error per gate. */
export function depthByError(error: number): number {
  if (!(error > 0)) return Infinity;
  return Math.floor(1 / error);
}

export type Limit = 'time' | 'error';

export interface Budget {
  byTime: number;
  byError: number;
  /** The smaller of the two. */
  usable: number;
  /** Which one is the limit (a tie counts as time). */
  limit: Limit;
}

export function budget(t2Us: number, gateNs: number, error: number): Budget {
  const byTime = depthByTime(t2Us, gateNs);
  const byError = depthByError(error);
  return { byTime, byError, usable: Math.min(byTime, byError), limit: byTime <= byError ? 'time' : 'error' };
}

/** The chance that a circuit of `gates` gates has no error at all, if each gate fails independently with `error`. */
export function cleanChance(gates: number, error: number): number {
  return Math.pow(1 - Math.min(1, Math.max(0, error)), Math.max(0, gates));
}

/** Physics sets a ceiling: T2 can never be longer than twice T1. */
export const maxT2 = (t1Us: number): number => 2 * t1Us;

/** Brings a requested T2 back under the ceiling. */
export const clampT2 = (t2Us: number, t1Us: number): number => Math.min(t2Us, maxT2(t1Us));

/** Quantum-volume-style rule of thumb is deliberately NOT here: this lab only does the two limits above. */
