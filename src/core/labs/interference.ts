import { simulate } from '../optical/interferometer';
import type { OpticalElement, OpticalResult } from '../optical/interferometer';

/**
 * Mach-Zehnder lab: beam splitter, phase shifter on the lower arm, optional blocker in one arm, second beam splitter.
 * At phi = 0 the two paths recombine so that all light leaves by the BOTTOM port; the top port is "dark".
 */
export type Blocker = 0 | 1 | null;

export const mzElements = (phi: number, blocker: Blocker = null): OpticalElement[] => [
  { type: 'bs' },
  { type: 'phase', phi },
  ...(blocker === null ? [] : [{ type: 'block', path: blocker } as OpticalElement]),
  { type: 'bs' },
];

export const mzResult = (phi: number, blocker: Blocker = null): OpticalResult => simulate(mzElements(phi, blocker));

export interface FringePoint {
  phi: number;
  top: number;
  bottom: number;
}

/** Detector probabilities as the phase sweeps from 0 to 2 pi (the interference fringes). */
export function fringeCurve(blocker: Blocker = null, points = 73): FringePoint[] {
  const out: FringePoint[] = [];
  for (let i = 0; i < points; i++) {
    const phi = (2 * Math.PI * i) / (points - 1);
    const r = mzResult(phi, blocker);
    out.push({ phi, top: r.out[0], bottom: r.out[1] });
  }
  return out;
}

/** Fringe visibility (Pmax - Pmin) / (Pmax + Pmin) of the top detector. 1 = perfect interference, 0 = none. */
export function visibility(curve: FringePoint[]): number {
  const values = curve.map((p) => p.top);
  const hi = Math.max(...values);
  const lo = Math.min(...values);
  return hi + lo === 0 ? 0 : (hi - lo) / (hi + lo);
}

/**
 * Elitzur-Vaidman bomb test. Tuned so the TOP port is dark, a click there proves an object sat in the path,
 * even though the photon was never absorbed.
 */
export interface BombOutcome {
  /** Probability the photon is absorbed (the "bomb" goes off). */
  boom: number;
  /** Probability the dark port clicks: the bomb is found without being triggered. */
  found: number;
  /** Probability the bright port clicks: no information. */
  silent: number;
}

export function bombTest(bombPresent: boolean): BombOutcome {
  const r = mzResult(0, bombPresent ? 1 : null);
  return { boom: r.absorbed, found: r.out[0], silent: r.out[1] };
}
