import { bellOutcomeProbabilities } from '../games/chsh';
import type { QuantumStrategy } from '../games/chsh';

/** Bell & CHSH explorer: correlations of the Bell pair as the two measurement angles change. */

/** E = P(same answer) - P(different answer), from -1 (always differ) to +1 (always agree). */
export function correlation(thetaA: number, thetaB: number): number {
  const [[p00, p01], [p10, p11]] = bellOutcomeProbabilities(thetaA, thetaB);
  return p00 + p11 - p01 - p10;
}

export const CLASSICAL_S = 2;
export const QUANTUM_S = 2 * Math.SQRT2;

/** CHSH value S = E(a0,b0) + E(a0,b1) + E(a1,b0) - E(a1,b1). Local hidden variables cap |S| at 2. */
export function chshValue(s: QuantumStrategy): number {
  return correlation(s.alice[0], s.bob[0]) + correlation(s.alice[0], s.bob[1]) + correlation(s.alice[1], s.bob[0]) - correlation(s.alice[1], s.bob[1]);
}

/** Win probability of the CHSH game for a given S: 1/2 + S/8. */
export const winFromS = (s: number): number => 0.5 + s / 8;

export type Verdict = 'classical' | 'beyond';

export function verdict(s: number): Verdict {
  return Math.abs(s) > CLASSICAL_S + 1e-9 ? 'beyond' : 'classical';
}

/** E as the angle difference (Bob minus Alice) goes round a half turn, for drawing the cosine curve. */
export function correlationCurve(points = 61): { delta: number; e: number }[] {
  const out: { delta: number; e: number }[] = [];
  for (let i = 0; i < points; i++) {
    const delta = -Math.PI / 2 + (Math.PI * i) / (points - 1);
    out.push({ delta, e: correlation(0, delta) });
  }
  return out;
}
