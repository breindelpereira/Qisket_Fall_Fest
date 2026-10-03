import { Complex, QuantumStateVector } from '../circuit';

/** Two-Qubit lab helpers: how entangled is a pure two-qubit state, and what does each half look like on its own? */

/** Concurrence 2|a00 a11 - a01 a10| of a pure two-qubit state: 0 for a product state, 1 for a Bell state. */
export function concurrence(state: QuantumStateVector): number {
  const [a00, a01, a10, a11] = state.amplitudes;
  const cross = Complex.sub(Complex.mul(a00, a11), Complex.mul(a01, a10));
  return Math.min(1, 2 * Complex.abs(cross));
}

export interface ReducedQubit {
  /** Bloch vector of the qubit on its own, with the other qubit ignored. */
  x: number;
  y: number;
  z: number;
  /** Length of that vector: 1 when the qubit is in a definite state, 0 when it is maximally mixed. */
  length: number;
  /** Chance of reading 0 and 1 on this qubit alone. */
  p0: number;
  p1: number;
}

/** Reduced state of one qubit (partial trace over the other), as a Bloch vector. */
export function reducedQubit(state: QuantumStateVector, qubit: 0 | 1): ReducedQubit {
  const bit = 1 << qubit;
  let r00 = 0;
  let r11 = 0;
  let r01: Complex = Complex.zero();
  for (let i = 0; i < state.dim; i++) {
    if ((i & bit) !== 0) continue;
    const a0 = state.amplitudes[i];
    const a1 = state.amplitudes[i | bit];
    r00 += Complex.absSq(a0);
    r11 += Complex.absSq(a1);
    r01 = Complex.add(r01, Complex.mul(a0, Complex.conj(a1)));
  }
  const x = 2 * r01.re;
  const y = -2 * r01.im;
  const z = r00 - r11;
  return { x, y, z, length: Math.sqrt(x * x + y * y + z * z), p0: r00, p1: r11 };
}

/** Chance that both qubits give the same answer when measured in the 0/1 basis. */
export function agreement(state: QuantumStateVector): number {
  const p = state.getProbabilities();
  return p[0] + p[3];
}

export function describeEntanglement(c: number): string {
  if (c < 0.02) return 'Not entangled: each qubit has a state of its own.';
  if (c > 0.98) return 'Maximally entangled: the pair has a state, but neither qubit does.';
  return 'Partly entangled: each qubit is only partly defined on its own.';
}
