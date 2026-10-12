/**
 * Rydberg Blockade Lab: two neutral atoms driven by the same laser from the ground state g to a Rydberg state r. When both
 * are excited they feel an interaction V(R) = C6 / R^6 that shifts the doubly excited state out of resonance.
 *
 * Basis |gg>, |+> = (|gr> + |rg>)/sqrt(2), |rr>. In the rotating frame (hbar = 1, all in angular units of 1/us):
 *
 *   H = (Omega/2) * sqrt(2) * ( |gg><+| + |+><rr| + h.c. ) + V |rr><rr|
 *
 * Far apart (V = 0) the atoms are independent. Close together (V >> Omega) |rr> is out of reach and the pair oscillates
 * between |gg> and |+> at the enhanced rate sqrt(2) Omega. The blockade radius is where V(R_b) = Omega.
 *
 * Illustrative defaults come from Evered et al., Nature 622, 268 (2023): V/2pi = 450 MHz at 2 um and Omega/2pi = 4.6 MHz.
 * Real blockade is gradual and real atoms have more levels: the lab says so.
 */
import { Complex } from '../circuit';

/** C6 in (rad/us) um^6, from V/2pi = 450 MHz at 2 um: 2 pi * 450 * 2^6. */
export const C6_DEFAULT = 2 * Math.PI * 450 * Math.pow(2, 6);
/** Rabi frequency in rad/us for Omega/2pi = 4.6 MHz. */
export const OMEGA_DEFAULT = 2 * Math.PI * 4.6;

/** Interaction energy between two Rydberg atoms at distance R (micrometres), in rad/us. */
export const interaction = (distanceUm: number, c6 = C6_DEFAULT): number => (distanceUm > 0 ? c6 / Math.pow(distanceUm, 6) : Infinity);

/** The blockade radius in micrometres: where the interaction equals the Rabi frequency. */
export const blockadeRadius = (omega = OMEGA_DEFAULT, c6 = C6_DEFAULT): number => Math.pow(c6 / omega, 1 / 6);

export interface PairPoint {
  t: number;
  gg: number;
  plus: number;
  rr: number;
}

/** Exact evolution of the three-level pair from |gg> with Runge-Kutta, `points` samples up to tMax microseconds. */
export function pairCurve(omega: number, v: number, tMax: number, points = 150): PairPoint[] {
  const g = (omega * Math.SQRT2) / 2;
  // state = [gg, +, rr]; dpsi/dt = -i H psi
  type S = [Complex, Complex, Complex];
  const deriv = (s: S): S => {
    const [a, b, c] = s;
    const ga = Complex.mul(Complex.create(0, -g), b);
    const gb = Complex.add(Complex.mul(Complex.create(0, -g), a), Complex.mul(Complex.create(0, -g), c));
    const gc = Complex.add(Complex.mul(Complex.create(0, -g), b), Complex.mul(Complex.create(0, -v), c));
    return [ga, gb, gc];
  };
  const axpy = (s: S, k: S, h: number): S => [Complex.add(s[0], Complex.scale(k[0], h)), Complex.add(s[1], Complex.scale(k[1], h)), Complex.add(s[2], Complex.scale(k[2], h))];

  let s: S = [Complex.one(), Complex.zero(), Complex.zero()];
  const out: PairPoint[] = [{ t: 0, gg: 1, plus: 0, rr: 0 }];
  const dtSample = tMax / points;
  const rate = Math.max(g, Math.min(Math.abs(v), 50 * g), 1e-9);
  const sub = Math.max(1, Math.ceil((dtSample * rate) / 0.05));
  const h = dtSample / sub;
  for (let i = 1; i <= points; i++) {
    for (let k = 0; k < sub; k++) {
      const k1 = deriv(s);
      const k2 = deriv(axpy(s, k1, h / 2));
      const k3 = deriv(axpy(s, k2, h / 2));
      const k4 = deriv(axpy(s, k3, h));
      s = [0, 1, 2].map((j) =>
        Complex.add(s[j], Complex.scale(Complex.add(Complex.add(k1[j], Complex.scale(k2[j], 2)), Complex.add(Complex.scale(k3[j], 2), k4[j])), h / 6)),
      ) as S;
    }
    out.push({ t: i * dtSample, gg: Complex.absSq(s[0]), plus: Complex.absSq(s[1]), rr: Complex.absSq(s[2]) });
  }
  return out;
}

/** Without any interaction the two atoms are independent: each is excited with sin^2(Omega t / 2). */
export const independentRr = (omega: number, t: number): number => Math.pow(Math.sin((omega * t) / 2), 4);

/** Fully blockaded pair: the chance of |+> is sin^2(sqrt(2) Omega t / 2). */
export const blockadedPlus = (omega: number, t: number): number => Math.pow(Math.sin((omega * Math.SQRT2 * t) / 2), 2);

/** How long a pair pi-pulse takes when blockaded: pi / (sqrt(2) Omega). */
export const pairPiTime = (omega: number): number => Math.PI / (Math.SQRT2 * omega);

/** Largest chance of finding both atoms excited within the window: near zero when blockaded. */
export const peakRr = (curve: PairPoint[]): number => curve.reduce((m, p) => Math.max(m, p.rr), 0);
