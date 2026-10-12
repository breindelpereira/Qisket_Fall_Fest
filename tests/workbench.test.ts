import { describe, it, expect } from 'vitest';
import { Complex } from '../src/core/circuit';
import { parseComplex } from '../src/core/math/expression';
import {
  GATE_TABLE, apply, blochOf, chances, determinant, equalUpToPhase, identify, isUnitary, multiply, normalise, readMatrix, readState,
  show, showExact,
} from '../src/core/math/workbench';
import type { Matrix, Pair } from '../src/core/math/workbench';

const c = (re: number, im = 0) => Complex.create(re, im);
const S = Math.SQRT1_2;
const gate = (name: string): Matrix => GATE_TABLE.find((g) => g.name === name)!.matrix;

describe('Maths Workbench: reading what is typed', () => {
  it('reads a state in any of the forms the practice answers accept', () => {
    const r = readState('1/√2', 'i/√2');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.amplitudes[0].re).toBeCloseTo(S, 9);
      expect(r.amplitudes[1].im).toBeCloseTo(S, 9);
      expect(r.normalised).toBe(true);
    }
    const dec = readState('0.7071', '0.7071');
    if (dec.ok) expect(dec.normSquared).toBeCloseTo(1, 3);
  });

  it('says which entry could not be read, and never throws', () => {
    expect(readState('1', 'banana')).toEqual({ ok: false, cell: 1 });
    expect(readState('((', '1')).toEqual({ ok: false, cell: 0 });
    expect(readState('', '')).toEqual({ ok: false, cell: 0 });
    expect(readMatrix(['1', '0', 'x', '1'])).toEqual({ ok: false, cell: 2 });
    expect(readMatrix(['1', '0'])).toEqual({ ok: false, cell: 2 });
  });

  it('knows a state that is not normalised, and normalising fixes it without changing the chances', () => {
    const r = readState('3', '4');
    expect(r.ok && r.normSquared).toBeCloseTo(25, 9);
    expect(r.ok && r.normalised).toBe(false);
    const n = normalise([c(3), c(4)]);
    expect(n[0].re).toBeCloseTo(0.6, 9);
    expect(n[1].re).toBeCloseTo(0.8, 9);
    expect(chances([c(3), c(4)]).p0).toBeCloseTo(9 / 25, 9);
    expect(chances(n).p0).toBeCloseTo(9 / 25, 9);
    expect(chances([c(0), c(0)])).toEqual({ p0: 0, p1: 0 });
  });
});

describe('Maths Workbench: states and gates', () => {
  it('puts the six special states at the six ends of the Bloch sphere', () => {
    const near = (p: { x: number; y: number; z: number }, x: number, y: number, z: number) => {
      expect(p.x).toBeCloseTo(x, 6);
      expect(p.y).toBeCloseTo(y, 6);
      expect(p.z).toBeCloseTo(z, 6);
    };
    near(blochOf([c(1), c(0)]), 0, 0, 1);
    near(blochOf([c(0), c(1)]), 0, 0, -1);
    near(blochOf([c(S), c(S)]), 1, 0, 0);
    near(blochOf([c(S), c(-S)]), -1, 0, 0);
    near(blochOf([c(S), c(0, S)]), 0, 1, 0);
    near(blochOf([c(S), c(0, -S)]), 0, -1, 0);
  });

  it('gates act as the textbook says: H|0> = |+>, X|0> = |1>, Z|+> = |->, S|+> = |+i>', () => {
    const zero: Pair = [c(1), c(0)];
    const plus: Pair = [c(S), c(S)];
    const h = apply(gate('H'), zero);
    expect(h[0].re).toBeCloseTo(S, 9);
    expect(h[1].re).toBeCloseTo(S, 9);
    expect(apply(gate('X'), zero)[1].re).toBeCloseTo(1, 9);
    expect(apply(gate('Z'), plus)[1].re).toBeCloseTo(-S, 9);
    expect(apply(gate('S'), plus)[1].im).toBeCloseTo(S, 9);
  });

  it('H X H is Z, and applying a gate keeps a state normalised', () => {
    const hxh = multiply(gate('H'), multiply(gate('X'), gate('H')));
    expect(equalUpToPhase(hxh, gate('Z'), 1e-9)).toBe(true);
    expect(identify(hxh)?.gate.name).toBe('Z');
    for (const g of GATE_TABLE) {
      const out = apply(g.matrix, [c(0.6), c(0, 0.8)]);
      expect(Complex.absSq(out[0]) + Complex.absSq(out[1]), g.name).toBeCloseTo(1, 9);
    }
  });
});

describe('Maths Workbench: is this matrix a gate?', () => {
  it('every named gate is unitary and has a determinant of size 1', () => {
    for (const g of GATE_TABLE) {
      expect(isUnitary(g.matrix), g.name).toBe(true);
      expect(Complex.abs(determinant(g.matrix)), g.name).toBeCloseTo(1, 9);
    }
  });

  it('refuses matrices that change the total chance', () => {
    expect(isUnitary([[c(1), c(1)], [c(1), c(1)]])).toBe(false);
    expect(isUnitary([[c(2), c(0)], [c(0), c(1)]])).toBe(false);
    expect(isUnitary([[c(1), c(0)], [c(0), c(0)]])).toBe(false);
    expect(isUnitary([[c(S), c(S)], [c(-S), c(S)]])).toBe(true);
  });

  it('names a gate exactly, or up to a global phase, or not at all', () => {
    expect(identify(gate('X'))).toMatchObject({ exact: true, gate: { name: 'X' } });
    const minusX: Matrix = [[c(0), c(-1)], [c(-1), c(0)]];
    expect(identify(minusX)).toMatchObject({ exact: false, gate: { name: 'X' } });
    const iH: Matrix = gate('H').map((row) => row.map((z) => Complex.mul(z, c(0, 1)))) as Matrix;
    expect(identify(iH)).toMatchObject({ exact: false, gate: { name: 'H' } });
    expect(identify([[c(0.6), c(0.8)], [c(-0.8), c(0.6)]])).toBeNull();
  });

  it('reads a typed matrix in reading order', () => {
    const r = readMatrix(['1/√2', '1/√2', '1/√2', '-1/√2']);
    expect(r.ok && identify(r.matrix)?.gate.name).toBe('H');
    const y = readMatrix(['0', '-i', 'i', '0']);
    expect(y.ok && identify(y.matrix)?.gate.name).toBe('Y');
  });
});

describe('Maths Workbench: writing numbers back', () => {
  it('shows the special numbers exactly, and what it shows reads back to the same value', () => {
    const values = [c(0), c(1), c(-1), c(S), c(-S), c(0.5), c(0, S), c(0, -S), c(0, 1), c(0, -1), c(0, 0.5), c(S, S), c(0.3, -0.4), c(Math.sqrt(3) / 2)];
    for (const z of values) {
      const text = showExact(z);
      const back = parseComplex(text);
      expect(back, `"${text}"`).not.toBeNull();
      expect(back!.re, `"${text}" re`).toBeCloseTo(z.re, 3);
      expect(back!.im, `"${text}" im`).toBeCloseTo(z.im, 3);
    }
    expect(showExact(c(S))).toBe('1/√2');
    expect(showExact(c(0, -S))).toBe('-i/√2');
  });

  it('shows rounded numbers with i in the right place', () => {
    expect(show(c(0.70711))).toBe('0.707');
    expect(show(c(0, 0.70711))).toBe('0.707i');
    expect(show(c(0, 0.71))).toBe('0.71i');
    expect(show(c(0, 1))).toBe('i');
    expect(show(c(0, -1))).toBe('−i');
    expect(show(c(-0.5, 0.5))).toBe('−0.5+0.5i');
    expect(show(c(1e-12, 0))).toBe('0');
  });
});
