import { Complex, Gates, computeBlochCoordinates } from '../circuit';
import type { Matrix2x2 } from '../circuit';
import { parseComplex } from './expression';

/**
 * Maths Workbench: type a qubit state or a 2 x 2 matrix, as you would write it on paper, and see what it means. Pure
 * functions on top of the same expression parser the practice answers use, so `1/√2`, `0.7071`, `(1+i)/2` and `e^(i*pi/4)`
 * all work. Nothing is evaluated as code.
 */
export type Pair = [Complex, Complex];

export interface StateReading {
  ok: true;
  amplitudes: Pair;
  /** |a|² + |b|²: 1 for a valid state. */
  normSquared: number;
  normalised: boolean;
}

export interface Unreadable {
  ok: false;
  /** Which entry could not be read (0-based), so the screen can mark it. */
  cell: number;
}

/** Reads the two amplitudes of a state from what was typed. */
export function readState(a: string, b: string): StateReading | Unreadable {
  const za = parseComplex(a);
  if (!za) return { ok: false, cell: 0 };
  const zb = parseComplex(b);
  if (!zb) return { ok: false, cell: 1 };
  const normSquared = Complex.absSq(za) + Complex.absSq(zb);
  return { ok: true, amplitudes: [za, zb], normSquared, normalised: Math.abs(normSquared - 1) < 1e-6 };
}

/** The state divided by its size, so the chances add to 1 (a zero state is returned unchanged). */
export function normalise([a, b]: Pair): Pair {
  const n = Math.sqrt(Complex.absSq(a) + Complex.absSq(b));
  return n === 0 ? [a, b] : [Complex.scale(a, 1 / n), Complex.scale(b, 1 / n)];
}

/** Chance of 0 and of 1, from the squared sizes (divided by the total, so an unnormalised state still gives chances). */
export function chances([a, b]: Pair): { p0: number; p1: number } {
  const total = Complex.absSq(a) + Complex.absSq(b);
  return total === 0 ? { p0: 0, p1: 0 } : { p0: Complex.absSq(a) / total, p1: Complex.absSq(b) / total };
}

/** The point on the Bloch sphere that the state sits at. */
export function blochOf(state: Pair): { x: number; y: number; z: number } {
  const { x, y, z } = computeBlochCoordinates(state[0], state[1]);
  return { x, y, z };
}

export type Matrix = Matrix2x2;

export const apply = (m: Matrix, [a, b]: Pair): Pair => [
  Complex.add(Complex.mul(m[0][0], a), Complex.mul(m[0][1], b)),
  Complex.add(Complex.mul(m[1][0], a), Complex.mul(m[1][1], b)),
];

export const multiply = (a: Matrix, b: Matrix): Matrix =>
  [0, 1].map((r) => [0, 1].map((c) => Complex.add(Complex.mul(a[r][0], b[0][c]), Complex.mul(a[r][1], b[1][c])))) as Matrix;

/** The conjugate transpose (dagger). */
export const dagger = (m: Matrix): Matrix => [
  [Complex.conj(m[0][0]), Complex.conj(m[1][0])],
  [Complex.conj(m[0][1]), Complex.conj(m[1][1])],
];

export const IDENTITY: Matrix = [[Complex.one(), Complex.zero()], [Complex.zero(), Complex.one()]];

/** U†U = I within a tolerance: the test for "this matrix is a legal quantum gate". */
export function isUnitary(m: Matrix, tolerance = 1e-6): boolean {
  const p = multiply(dagger(m), m);
  return [0, 1].every((r) => [0, 1].every((c) => Complex.abs(Complex.sub(p[r][c], IDENTITY[r][c])) < tolerance));
}

export const determinant = (m: Matrix): Complex => Complex.sub(Complex.mul(m[0][0], m[1][1]), Complex.mul(m[0][1], m[1][0]));

export interface NamedGate {
  name: string;
  matrix: Matrix;
  /** One line on what it does to a state. */
  does: string;
}

export const GATE_TABLE: NamedGate[] = [
  { name: 'I', matrix: Gates.I(), does: 'does nothing' },
  { name: 'X', matrix: Gates.X(), does: 'swaps the amplitudes of 0 and 1 (a bit flip)' },
  { name: 'Y', matrix: Gates.Y(), does: 'a bit flip and a phase flip together' },
  { name: 'Z', matrix: Gates.Z(), does: 'flips the sign of the 1 amplitude (a phase flip)' },
  { name: 'H', matrix: Gates.H(), does: 'turns 0 and 1 into the equal superpositions |+⟩ and |−⟩' },
  { name: 'S', matrix: Gates.S(), does: 'multiplies the 1 amplitude by i (a quarter turn of phase)' },
  { name: 'T', matrix: Gates.T(), does: 'multiplies the 1 amplitude by e^(iπ/4) (an eighth turn of phase)' },
];

/** True when two matrices agree up to one overall factor of size 1, which no measurement can tell apart. */
export function equalUpToPhase(a: Matrix, b: Matrix, tolerance = 1e-6): boolean {
  // find the largest entry of b to read the factor from
  let best = { r: 0, c: 0, size: -1 };
  for (const r of [0, 1]) for (const c of [0, 1]) if (Complex.abs(b[r][c]) > best.size) best = { r, c, size: Complex.abs(b[r][c]) };
  if (best.size < 1e-9) return false;
  const factor = Complex.div(a[best.r][best.c], b[best.r][best.c]);
  if (Math.abs(Complex.abs(factor) - 1) > tolerance) return false;
  return [0, 1].every((r) => [0, 1].every((c) => Complex.abs(Complex.sub(a[r][c], Complex.mul(factor, b[r][c]))) < tolerance));
}

/** The named gate a matrix is, if it is one, and whether it matches exactly or only up to a global phase. */
export function identify(m: Matrix): { gate: NamedGate; exact: boolean } | null {
  for (const gate of GATE_TABLE) {
    if (equalUpToPhase(m, gate.matrix, 1e-9) && [0, 1].every((r) => [0, 1].every((c) => Complex.abs(Complex.sub(m[r][c], gate.matrix[r][c])) < 1e-6))) {
      return { gate, exact: true };
    }
  }
  for (const gate of GATE_TABLE) if (equalUpToPhase(m, gate.matrix)) return { gate, exact: false };
  return null;
}

export interface MatrixReading {
  ok: true;
  matrix: Matrix;
}

/** Reads a 2 x 2 matrix from four typed entries in reading order (top row first). */
export function readMatrix(cells: string[]): MatrixReading | Unreadable {
  const z: Complex[] = [];
  for (let i = 0; i < 4; i++) {
    const v = parseComplex(cells[i] ?? '');
    if (!v) return { ok: false, cell: i };
    z.push(v);
  }
  return { ok: true, matrix: [[z[0], z[1]], [z[2], z[3]]] };
}

const S2 = Math.SQRT1_2;
const S3 = Math.sqrt(3) / 2;
/** Sizes that come up all the time in this course, with the way they are written. */
const NICE: [number, string][] = [
  [0, '0'], [1, '1'], [0.5, '1/2'], [S2, '1/√2'], [S3, '√3/2'], [0.25, '1/4'], [S2 / 2, '1/(2√2)'], [S2 * S3, '√3/(2√2)'], [S2 * 0.5, '1/(2√2)'],
];

const niceSize = (n: number): string | null => {
  const hit = NICE.find(([v]) => Math.abs(v - n) < 1e-6);
  return hit ? hit[1] : null;
};

/** Writes a number in a form the parser reads back to the same value: 1/√2 rather than 0.7071 when it is that number. */
export function showExact(z: Complex): string {
  const ar = Math.abs(z.re);
  const ai = Math.abs(z.im);
  const dec = (n: number) => String(Number(n.toFixed(4)));
  if (ai < 1e-9) {
    const n = niceSize(ar) ?? dec(ar);
    return `${z.re < -1e-9 ? '-' : ''}${n}`;
  }
  if (ar < 1e-9) {
    const n = niceSize(ai);
    const body = n === '1' ? 'i' : n && n.startsWith('1/') ? `i${n.slice(1)}` : n ? `${n}*i` : `${dec(ai)}*i`;
    return `${z.im < 0 ? '-' : ''}${body}`;
  }
  return `${dec(z.re)}${z.im < 0 ? '-' : '+'}${dec(ai)}i`;
}

/** Writes a complex number the way the screen shows it: 0.71, −0.5, 0.71i, 0.5+0.5i. */
export function show(z: Complex, digits = 3): string {
  const f = (n: number) => {
    const r = Math.abs(n) < 5 * Math.pow(10, -digits - 1) ? 0 : n;
    return String(Number(r.toFixed(digits))).replace('-', '−');
  };
  if (Math.abs(z.im) < 1e-9) return f(z.re);
  if (Math.abs(z.re) < 1e-9) {
    const n = f(z.im);
    return n === '1' ? 'i' : n === '−1' ? '−i' : `${n}i`;
  }
  return `${f(z.re)}${z.im < 0 ? '−' : '+'}${f(Math.abs(z.im))}i`;
}
