import { Complex } from '../circuit/complex';
import { parseComplex } from './expression';

/**
 * Checks a learner's answer to a practice problem. Answers are one number, a column vector, or a matrix; every cell is typed
 * as an expression and compared as a number (so 1/√2, 0.707 and sqrt(2)/2 are all the same answer).
 */

export const DEFAULT_TOLERANCE = 0.005;

export type Verdict =
  /** Right. */
  | { kind: 'right' }
  /** Right up to an overall phase, which the problem does not accept. */
  | { kind: 'phase' }
  /** A cell is empty or cannot be read. `cell` is its position. */
  | { kind: 'unreadable'; cell: number }
  /** Not the answer. */
  | { kind: 'wrong' };

export interface CheckOptions {
  /** How close each part of each number must be. */
  tolerance?: number;
  /** Accept the expected answer multiplied by any number of size 1 (an overall phase). */
  upToGlobalPhase?: boolean;
}

const close = (a: Complex, b: Complex, tol: number): boolean => Math.abs(a.re - b.re) <= tol && Math.abs(a.im - b.im) <= tol;

/** Parses every cell. Returns the first unreadable position when there is one. */
function parseAll(cells: string[]): { values: Complex[] } | { bad: number } {
  const values: Complex[] = [];
  for (let k = 0; k < cells.length; k++) {
    const v = parseComplex(cells[k] ?? '');
    if (!v) return { bad: k };
    values.push(v);
  }
  return { values };
}

/** Is `given` equal to `expected` times some number of size 1? (Both are lists of the same length.) */
function equalUpToPhase(given: Complex[], expected: Complex[], tol: number): boolean {
  // the phase is fixed by the largest expected entry
  let pivot = 0;
  for (let k = 1; k < expected.length; k++) if (Complex.abs(expected[k]) > Complex.abs(expected[pivot])) pivot = k;
  const e = expected[pivot];
  const g = given[pivot];
  if (Complex.abs(e) < 1e-9 || Math.abs(Complex.abs(g) - Complex.abs(e)) > tol) return false;
  const phase = Complex.div(g, e);
  const unit = Complex.abs(phase);
  if (unit === 0) return false;
  const p = Complex.scale(phase, 1 / unit);
  return given.every((v, k) => close(v, mul(expected[k], p), tol));
}

const mul = Complex.mul;

/**
 * `given` and `expected` are the cells of the answer in reading order (a number is one cell, a vector is its entries from
 * top to bottom, a matrix is its rows left to right). `expected` are expressions too.
 */
export function checkCells(given: string[], expected: string[], options: CheckOptions = {}): Verdict {
  const tol = options.tolerance ?? DEFAULT_TOLERANCE;
  const want = parseAll(expected);
  if ('bad' in want) throw new Error(`The expected answer cell ${want.bad} cannot be read: "${expected[want.bad]}"`);
  if (given.length !== expected.length) return { kind: 'wrong' };
  const have = parseAll(given);
  if ('bad' in have) return { kind: 'unreadable', cell: have.bad };
  if (have.values.every((v, k) => close(v, want.values[k], tol))) return { kind: 'right' };
  if (equalUpToPhase(have.values, want.values, tol)) return options.upToGlobalPhase ? { kind: 'right' } : { kind: 'phase' };
  return { kind: 'wrong' };
}

/** Do these two answers (cell lists) mean the same thing? Used to match a learner's answer against listed wrong answers. */
export function sameAnswer(a: string[], b: string[], tolerance = DEFAULT_TOLERANCE): boolean {
  if (a.length !== b.length) return false;
  const pa = parseAll(a);
  const pb = parseAll(b);
  if ('bad' in pa || 'bad' in pb) return false;
  return pa.values.every((v, k) => close(v, pb.values[k], tolerance));
}

/** Shows a number the way a learner would expect to read it. */
export function formatNumber(z: Complex): string {
  const f = (x: number) => (Math.abs(x) < 1e-9 ? '0' : String(Math.round(x * 1e4) / 1e4));
  if (Math.abs(z.im) < 1e-9) return f(z.re);
  if (Math.abs(z.re) < 1e-9) return `${f(z.im)}i`;
  return `${f(z.re)}${z.im < 0 ? '−' : '+'}${f(Math.abs(z.im))}i`;
}
