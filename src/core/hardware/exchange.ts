import { Complex, QuantumStateVector } from '../circuit';
import { concurrence } from '../labs/twoQubit';

/**
 * Exchange-Coupling Lab: two electron spins in neighbouring quantum dots. Lowering the barrier between the dots lets
 * their wave functions overlap, which switches on an exchange coupling J. Starting from the opposite-spin state |01>, an
 * exchange pulse of length t rotates it into |10>:
 *
 *   |psi(t)> = cos(phi) |01> - i sin(phi) |10>,     phi = pi * (J/h) * t
 *
 * so the chance of a swap is sin^2(phi). Half of a full swap leaves the pair maximally entangled: the square root of SWAP,
 * an entangling gate. J falls roughly exponentially as the barrier is raised, which is why the barrier is the control
 * knob (and why tiny barrier errors move J a lot). The numbers J0 and `decay` below are illustrative, not from a device.
 * Real devices also have charge noise and valley effects, which this model leaves out.
 */
export const J0_MHZ = 50;
export const BARRIER_DECAY = 0.9;

/** Exchange coupling J/h in MHz for a barrier setting (0 = barrier fully down, 10 = barrier high). */
export const exchangeMHz = (barrier: number, j0 = J0_MHZ, decay = BARRIER_DECAY): number => j0 * Math.exp(-decay * Math.max(0, barrier));

/** Rotation angle of the pulse: phi = pi * (J/h) * t, with J/h in MHz and t in nanoseconds. */
export const pulseAngle = (jMHz: number, tNs: number): number => Math.PI * jMHz * (tNs / 1000);

/** Chance that the two spins have swapped after the pulse. */
export const swapChance = (jMHz: number, tNs: number): number => Math.pow(Math.sin(pulseAngle(jMHz, tNs)), 2);

/** Pulse length of a full swap (phi = pi/2): t = 1 / (2 J/h). In nanoseconds. */
export const swapTimeNs = (jMHz: number): number => (jMHz > 0 ? 1000 / (2 * jMHz) : Infinity);

/** Half of that: the square root of SWAP, which entangles. */
export const sqrtSwapTimeNs = (jMHz: number): number => swapTimeNs(jMHz) / 2;

/** The two-spin state after the pulse, as a state vector on two qubits (index bits: |q1 q0>). */
export function pulseState(jMHz: number, tNs: number): QuantumStateVector {
  const phi = pulseAngle(jMHz, tNs);
  return QuantumStateVector.fromAmplitudes([
    Complex.zero(),
    Complex.create(Math.cos(phi), 0),
    Complex.create(0, -Math.sin(phi)),
    Complex.zero(),
  ]);
}

/** How entangled the pair is after the pulse: 0 (product) to 1 (maximally entangled). */
export const entanglementAfter = (jMHz: number, tNs: number): number => concurrence(pulseState(jMHz, tNs));

export interface PulsePoint {
  t: number;
  swap: number;
  entanglement: number;
}

/** The curve for the chart: swap chance and entanglement against pulse length, up to tMaxNs. */
export function pulseCurve(jMHz: number, tMaxNs: number, points = 100): PulsePoint[] {
  return Array.from({ length: points + 1 }, (_, i) => {
    const t = (i / points) * tMaxNs;
    return { t, swap: swapChance(jMHz, t), entanglement: entanglementAfter(jMHz, t) };
  });
}
