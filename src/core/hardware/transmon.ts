/**
 * Transmon Lab: a driven two-level qubit with relaxation. The drive turns the qubit about the x axis at Rabi rate Omega;
 * T1 pulls it back to the ground state and T2 shrinks the sideways part. This is the Bloch equations in the rotating
 * frame, resonant drive, stepped with fourth-order Runge-Kutta:
 *
 *   dx/dt = -x / T2
 *   dy/dt = -y / T2 - Omega * z
 *   dz/dt =  Omega * y - (z - 1) / T1          (z = +1 is the ground state)
 *
 * P(1) = (1 - z) / 2. With no noise this is exactly sin^2(Omega t / 2). A real transmon has more than two levels (it can
 * leak out of the pair), which this model leaves out.
 */
export interface RabiParams {
  /** Rabi frequency in radians per microsecond. */
  omega: number;
  /** T1 and T2 in microseconds; Infinity switches that noise off. T2 is limited to 2 T1. */
  t1: number;
  t2: number;
}

export interface RabiPoint {
  /** Time in microseconds. */
  t: number;
  /** Chance of finding the qubit in |1>. */
  p1: number;
}

/** The ideal curve: no noise at all. */
export const idealP1 = (omega: number, t: number): number => Math.pow(Math.sin((omega * t) / 2), 2);

/** Time of a pi pulse (a full flip from |0> to |1>) in microseconds. */
export const piPulseTime = (omega: number): number => (omega > 0 ? Math.PI / omega : Infinity);

/** How fast the oscillation dies away: the amplitude shrinks with time constant 2 / (1/T1 + 1/T2). */
export const decayTime = (t1: number, t2: number): number => 2 / (1 / t1 + 1 / t2);

/** The chance the curve settles at when driven forever: 1/2 for a strong drive, smaller for a weak one. */
export const settlesAt = ({ omega, t1, t2 }: RabiParams): number => {
  const k = omega * omega * t1 * t2;
  return 0.5 * (k / (1 + k));
};

/** Steps the Bloch equations from the ground state; returns `points` samples from 0 to `tMax` (inclusive). */
export function rabiCurve(params: RabiParams, tMax: number, points = 120): RabiPoint[] {
  const { omega } = params;
  const t1 = Math.max(1e-9, params.t1);
  const t2 = Math.min(Math.max(1e-9, params.t2), 2 * t1);
  const gT1 = Number.isFinite(t1) ? 1 / t1 : 0;
  const gT2 = Number.isFinite(t2) ? 1 / t2 : 0;
  const f = (x: number, y: number, z: number): [number, number, number] => [-gT2 * x, -gT2 * y - omega * z, omega * y - gT1 * (z - 1)];

  const out: RabiPoint[] = [{ t: 0, p1: 0 }];
  let x = 0;
  let y = 0;
  let z = 1;
  const dtSample = tMax / points;
  const sub = Math.max(1, Math.ceil(dtSample * Math.max(Math.abs(omega), gT1, gT2, 1e-9) / 0.05));
  const h = dtSample / sub;
  for (let i = 1; i <= points; i++) {
    for (let s = 0; s < sub; s++) {
      const k1 = f(x, y, z);
      const k2 = f(x + (h / 2) * k1[0], y + (h / 2) * k1[1], z + (h / 2) * k1[2]);
      const k3 = f(x + (h / 2) * k2[0], y + (h / 2) * k2[1], z + (h / 2) * k2[2]);
      const k4 = f(x + h * k3[0], y + h * k3[1], z + h * k3[2]);
      x += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      y += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      z += (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    }
    out.push({ t: i * dtSample, p1: (1 - z) / 2 });
  }
  return out;
}

/** The best chance of ending in |1> within the window, which is the size of the first peak (about 1 with no noise). */
export const peakP1 = (curve: RabiPoint[]): number => curve.reduce((m, c) => Math.max(m, c.p1), 0);
