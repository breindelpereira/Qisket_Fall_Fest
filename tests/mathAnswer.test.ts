import { describe, it, expect } from 'vitest';
import { parseComplex } from '../src/core/math/expression';
import { checkCells, sameAnswer, formatNumber } from '../src/core/math/answer';

const val = (s: string) => {
  const z = parseComplex(s);
  if (!z) throw new Error(`could not read "${s}"`);
  return z;
};
const S = 1 / Math.SQRT2;

describe('Reading what a learner types', () => {
  it('reads plain numbers, fractions and decimals', () => {
    expect(val('3').re).toBe(3);
    expect(val('0.25').re).toBe(0.25);
    expect(val('.5').re).toBe(0.5);
    expect(val('3/5').re).toBeCloseTo(0.6, 12);
    expect(val('-2').re).toBe(-2);
    expect(val('1,5').re).toBe(1.5);
    expect(val('1e-3').re).toBeCloseTo(0.001, 12);
  });

  it('reads square roots in every way people write them', () => {
    for (const s of ['1/sqrt(2)', '1/√2', '1/√(2)', 'sqrt(2)/2', '√2/2', '1/sqrt2', '0.70710678']) {
      expect(val(s).re, s).toBeCloseTo(S, 6);
      expect(val(s).im, s).toBe(0);
    }
    expect(val('√(2/3)').re).toBeCloseTo(Math.sqrt(2 / 3), 12);
    expect(val('sqrt(1/2)').re).toBeCloseTo(S, 12);
  });

  it('reads i and complex numbers, with implicit multiplication', () => {
    expect(val('i')).toEqual({ re: 0, im: 1 });
    expect(val('-i')).toEqual({ re: -0, im: -1 });
    expect(val('2i')).toEqual({ re: 0, im: 2 });
    expect(val('i/√2').im).toBeCloseTo(S, 12);
    expect(val('1/√2 i').im).toBeCloseTo(S, 12);
    expect(val('(1+i)/2')).toEqual({ re: 0.5, im: 0.5 });
    expect(val('(1+i)(1-i)').re).toBeCloseTo(2, 12);
    expect(val('i*i').re).toBeCloseTo(-1, 12);
    expect(val('i^2').re).toBeCloseTo(-1, 12);
    expect(val('3(1+i)')).toEqual({ re: 3, im: 3 });
  });

  it('reads pi, e and the phase e^(i phi)', () => {
    expect(val('pi').re).toBeCloseTo(Math.PI, 12);
    expect(val('π/2').re).toBeCloseTo(Math.PI / 2, 12);
    const z = val('e^(i*pi/4)');
    expect(z.re).toBeCloseTo(S, 12);
    expect(z.im).toBeCloseTo(S, 12);
    expect(val('e^(iπ)').re).toBeCloseTo(-1, 12);
    expect(val('exp(i*pi/2)').im).toBeCloseTo(1, 12);
    expect(val('cos(pi/3)').re).toBeCloseTo(0.5, 12);
  });

  it('reads the symbols a phone or a document produces', () => {
    expect(val('−1/√2').re).toBeCloseTo(-S, 12);
    expect(val('1÷2').re).toBe(0.5);
    expect(val('2·3').re).toBe(6);
    expect(val('3²').re).toBe(9);
    expect(val('  1 / 2  ').re).toBe(0.5);
    expect(val('SQRT(2)').re).toBeCloseTo(Math.SQRT2, 12);
  });

  it('gives up cleanly, and never throws, on anything it cannot read', () => {
    for (const bad of ['', '   ', 'abc', '1/', '(1+2', '1+*2', '1/0', 'sqrt', '2^', '))', 'alert(1)', 'a+b', '1..2', '1/(1-1)', '0^-1']) {
      expect(parseComplex(bad), JSON.stringify(bad)).toBeNull();
    }
    expect(parseComplex('9'.repeat(500))).toBeNull();
    expect(parseComplex('('.repeat(200) + '1' + ')'.repeat(200))).toBeNull();
    expect(parseComplex('10^10^10')).toBeNull();
  });
});

describe('Checking an answer', () => {
  it('accepts every way of writing the same number', () => {
    for (const s of ['1/√2', '0.707', 'sqrt(2)/2', '0.71', '√2/2']) {
      expect(checkCells([s], ['1/sqrt(2)']), s).toEqual({ kind: 'right' });
    }
  });

  it('rejects a near miss and a wrong number', () => {
    expect(checkCells(['0.75'], ['1/√2']).kind).toBe('wrong');
    expect(checkCells(['1/2'], ['1/√2']).kind).toBe('wrong');
    expect(checkCells(['0.7'], ['1/√2']).kind).toBe('wrong');
  });

  it('checks vectors cell by cell, with the right length', () => {
    const want = ['1/√2', '-1/√2'];
    expect(checkCells(['0.707', '-0.707'], want).kind).toBe('right');
    expect(checkCells(['1/√2', '1/√2'], want).kind).toBe('wrong');
    expect(checkCells(['-1/√2', '1/√2'], want).kind).toBe('phase');
    expect(checkCells(['1'], want).kind).toBe('wrong');
  });

  it('says which cell it could not read', () => {
    expect(checkCells(['1/√2', 'banana'], ['1/√2', '0'])).toEqual({ kind: 'unreadable', cell: 1 });
    expect(checkCells(['', '0'], ['1', '0'])).toEqual({ kind: 'unreadable', cell: 0 });
  });

  it('accepts an overall phase only where the problem allows it', () => {
    const want = ['1/√2', 'i/√2'];
    const times_i = ['i/√2', '-1/√2'];
    expect(checkCells(times_i, want).kind).toBe('phase');
    expect(checkCells(times_i, want, { upToGlobalPhase: true }).kind).toBe('right');
    expect(checkCells(['1/√2', '-i/√2'], want, { upToGlobalPhase: true }).kind).toBe('wrong');
  });

  it('works for matrices read row by row, and respects a custom tolerance', () => {
    const hx = ['1/√2', '1/√2', '-1/√2', '1/√2'];
    expect(checkCells(['0.707', '0.707', '-0.707', '0.707'], hx).kind).toBe('right');
    // XH: the gates in the other order is a different matrix (not just a sign away)
    expect(checkCells(['1/√2', '-1/√2', '1/√2', '1/√2'], hx).kind).toBe('wrong');
    // X·Z is exactly −1 times Z·X: only an overall sign apart, which is reported as such
    expect(checkCells(['0', '-1', '1', '0'], ['0', '1', '-1', '0']).kind).toBe('phase');
    expect(checkCells(['14.4'], ['14.5'], { tolerance: 0.6 }).kind).toBe('right');
    expect(checkCells(['13'], ['14.5'], { tolerance: 0.6 }).kind).toBe('wrong');
  });

  it('throws only when a problem itself is written wrongly', () => {
    expect(() => checkCells(['1'], ['not a number'])).toThrow();
  });

  it('compares answers to listed wrong answers, and shows numbers readably', () => {
    expect(sameAnswer(['0.5', '1/√2'], ['1/2', '0.707'])).toBe(true);
    expect(sameAnswer(['0.5'], ['0.6'])).toBe(false);
    expect(sameAnswer(['x'], ['x'])).toBe(false);
    expect(formatNumber({ re: S, im: 0 })).toBe('0.7071');
    expect(formatNumber({ re: 0, im: -1 })).toBe('-1i');
    expect(formatNumber({ re: 1, im: 1 })).toBe('1+1i');
  });
});
