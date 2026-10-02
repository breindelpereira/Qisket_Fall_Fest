import { Complex } from './complex';

export interface BlochCoordinates {
  x: number;
  y: number;
  z: number;
  theta: number; // in radians [0, pi]
  phi: number;   // in radians [-pi, pi]
}

export function computeBlochCoordinates(alpha: Complex, beta: Complex): BlochCoordinates {
  // Normalize if not perfectly normalized
  const normSq = Complex.absSq(alpha) + Complex.absSq(beta);
  if (normSq === 0) {
    return { x: 0, y: 0, z: 1, theta: 0, phi: 0 };
  }
  const norm = Math.sqrt(normSq);
  const a = Complex.scale(alpha, 1 / norm);
  const b = Complex.scale(beta, 1 / norm);

  // x = 2 * Re(a* * b)
  // a* = (a.re, -a.im)
  // a* * b = (a.re * b.re + a.im * b.im) + i*(a.re * b.im - a.im * b.re)
  const aStarTimesB = Complex.mul(Complex.conj(a), b);
  const x = 2 * aStarTimesB.re;
  const y = 2 * aStarTimesB.im;
  const z = Complex.absSq(a) - Complex.absSq(b);

  // Clamp z to [-1, 1] to prevent NaN from floating point error in acos
  const clampedZ = Math.max(-1, Math.min(1, z));
  const theta = Math.acos(clampedZ);
  const phi = Math.atan2(y, x);

  return {
    x: Number(x.toFixed(6)),
    y: Number(y.toFixed(6)),
    z: Number(z.toFixed(6)),
    theta: Number(theta.toFixed(6)),
    phi: Number(phi.toFixed(6)),
  };
}

/**
 * Creates state amplitudes from spherical Bloch angles theta and phi:
 * |psi> = cos(theta / 2)|0> + e^(i phi) * sin(theta / 2)|1>
 */
export function stateFromBlochAngles(theta: number, phi: number): [Complex, Complex] {
  const alpha = Complex.create(Math.cos(theta / 2), 0);
  const sinHalf = Math.sin(theta / 2);
  const beta = Complex.create(
    sinHalf * Math.cos(phi),
    sinHalf * Math.sin(phi)
  );
  return [alpha, beta];
}
