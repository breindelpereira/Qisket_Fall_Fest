/**
 * Overhead Calculator: what error correction costs. Surface-code scaling from Fowler, Mariantoni, Martinis and Cleland,
 * "Surface codes: Towards practical large-scale quantum computation", Phys. Rev. A 86, 032324 (2012), arXiv:1208.0928:
 *
 *   logical error per cycle  P_L = 0.03 * (p / p_th) ^ ((d + 1) / 2)     (their Eq. 11, an empirical fit)
 *   threshold                p_th = 0.57% per step in their circuit model
 *   physical qubits          (2d - 1)^2   data plus measurement qubits for one logical qubit of distance d
 *
 * The prefactor and threshold depend on the noise model and the decoder; layouts newer than that paper need about half
 * the qubits. Use it for the SHAPE of the trade-off (exponential gain below threshold, none above), not as a forecast.
 */
export const THRESHOLD = 0.0057;
export const PREFACTOR = 0.03;

/** Logical error rate for physical error `p` and odd code distance `d`. Above threshold it grows with d. */
export function logicalError(p: number, d: number, threshold = THRESHOLD, prefactor = PREFACTOR): number {
  if (!(p >= 0) || !(d >= 1)) return NaN;
  const value = prefactor * Math.pow(p / threshold, (d + 1) / 2);
  return Math.min(1, value);
}

/** Data plus measurement qubits for one logical qubit of distance d. */
export const physicalQubits = (d: number): number => (2 * d - 1) * (2 * d - 1);

/** How much each step of +2 in distance divides the logical error by: p_th / p (above 1 only below threshold). */
export const suppressionFactor = (p: number, threshold = THRESHOLD): number => (p > 0 ? threshold / p : Infinity);

export const belowThreshold = (p: number, threshold = THRESHOLD): boolean => p < threshold;

export interface Plan {
  /** The smallest odd distance that reaches the target, or null when the physical error is at or above threshold. */
  distance: number | null;
  logicalError: number | null;
  qubits: number | null;
}

export const MAX_DISTANCE = 201;

/** The smallest odd distance (3 or more) that brings the logical error down to `target`. */
export function plan(p: number, target: number, threshold = THRESHOLD): Plan {
  if (!(p > 0) || !(target > 0) || p >= threshold) return { distance: null, logicalError: null, qubits: null };
  for (let d = 3; d <= MAX_DISTANCE; d += 2) {
    const l = logicalError(p, d, threshold);
    if (l <= target) return { distance: d, logicalError: l, qubits: physicalQubits(d) };
  }
  return { distance: null, logicalError: null, qubits: null };
}

/** The chart in the lab: logical error for distances 3, 5, 7 ... up to `maxD`. */
export function distanceCurve(p: number, maxD = 15): { d: number; logical: number; qubits: number }[] {
  const out: { d: number; logical: number; qubits: number }[] = [];
  for (let d = 3; d <= maxD; d += 2) out.push({ d, logical: logicalError(p, d), qubits: physicalQubits(d) });
  return out;
}
