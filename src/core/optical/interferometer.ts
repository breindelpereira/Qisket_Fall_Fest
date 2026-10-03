import { Complex } from '../circuit';
import type { Matrix2x2 } from '../circuit';

/**
 * Single-photon, two-path interferometer.
 * Basis states are the two spatial paths: path 0 (top arm) and path 1 (bottom arm).
 * Mirrors only redirect light and add the same phase to both arms, so they are not modelled.
 * Elements are applied left to right; the photon enters on path 0.
 */
export type OpticalElement =
  | { type: 'empty' }
  | { type: 'bs' }
  | { type: 'phase'; phi: number } // phase shifter on path 1 only
  | { type: 'block'; path: 0 | 1 }; // absorber in one arm

const INV_SQRT2 = 1 / Math.SQRT2;

/** Symmetric 50/50 beam splitter: reflection picks up a factor of i. */
export function beamSplitterMatrix(): Matrix2x2 {
  return [
    [Complex.create(INV_SQRT2, 0), Complex.create(0, INV_SQRT2)],
    [Complex.create(0, INV_SQRT2), Complex.create(INV_SQRT2, 0)],
  ];
}

export function phaseShifterMatrix(phi: number): Matrix2x2 {
  return [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.exp(phi)],
  ];
}

export interface OpticalResult {
  /** Probability of detection at each output port (after the last element). */
  out: [number, number];
  /** Probability the photon was absorbed by a blocker. */
  absorbed: number;
  /** Path probabilities after each element (index 0 = at the source). Absorbed light is not counted. */
  stages: [number, number][];
  /** Complex amplitudes after each element, for "show the math". */
  amplitudes: [Complex, Complex][];
}

function applyMatrix(m: Matrix2x2, v: [Complex, Complex]): [Complex, Complex] {
  return [
    Complex.add(Complex.mul(m[0][0], v[0]), Complex.mul(m[0][1], v[1])),
    Complex.add(Complex.mul(m[1][0], v[0]), Complex.mul(m[1][1], v[1])),
  ];
}

export function simulate(elements: OpticalElement[]): OpticalResult {
  let v: [Complex, Complex] = [Complex.one(), Complex.zero()];
  let absorbed = 0;
  const probs = (a: [Complex, Complex]): [number, number] => [Complex.absSq(a[0]), Complex.absSq(a[1])];
  const stages: [number, number][] = [probs(v)];
  const amplitudes: [Complex, Complex][] = [v];

  for (const el of elements) {
    switch (el.type) {
      case 'bs':
        v = applyMatrix(beamSplitterMatrix(), v);
        break;
      case 'phase':
        v = applyMatrix(phaseShifterMatrix(el.phi), v);
        break;
      case 'block':
        absorbed += Complex.absSq(v[el.path]);
        v = el.path === 0 ? [Complex.zero(), v[1]] : [v[0], Complex.zero()];
        break;
      case 'empty':
        break;
    }
    stages.push(probs(v));
    amplitudes.push(v);
  }

  return { out: probs(v), absorbed, stages, amplitudes };
}

/** Samples where a single photon is found: 0 or 1 for an output port, or 'absorbed'. */
export function fireOnePhoton(result: OpticalResult, rng: () => number = Math.random): 0 | 1 | 'absorbed' {
  const r = rng();
  if (r < result.out[0]) return 0;
  if (r < result.out[0] + result.out[1]) return 1;
  return 'absorbed';
}
