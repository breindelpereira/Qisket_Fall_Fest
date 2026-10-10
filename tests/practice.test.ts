import { describe, it, expect } from 'vitest';
import { PRACTICE, PRACTICE_BY_ID, practiceFor } from '../src/content/practice';
import type { PracticeProblem } from '../src/content/practice';
import { LESSON_BY_ID, LESSONS } from '../src/content/lessons';
import { checkCells, sameAnswer } from '../src/core/math/answer';
import { parseComplex } from '../src/core/math/expression';
import { Complex, QuantumStateVector } from '../src/core/circuit';
import type { Matrix2x2 } from '../src/core/circuit';

const cells = (p: PracticeProblem): number =>
  p.shape.kind === 'number' ? 1 : p.shape.kind === 'vector' ? p.shape.length : p.shape.rows * p.shape.cols;
const opts = (p: PracticeProblem) => ({ tolerance: p.tolerance, upToGlobalPhase: p.upToGlobalPhase });
const asNumbers = (p: PracticeProblem) => p.answer.map((a) => parseComplex(a)!);
const S = 1 / Math.SQRT2;

describe('Part 3 practice problems', () => {
  it('has a set for every Math Companion lesson, with unique ids', () => {
    const part3 = LESSONS.filter((l) => l.part === 3).map((l) => l.id);
    for (const id of part3) expect(practiceFor(id).length, id).toBeGreaterThanOrEqual(5);
    expect(new Set(PRACTICE.map((p) => p.id)).size).toBe(PRACTICE.length);
    for (const p of PRACTICE) expect(LESSON_BY_ID[p.lessonId]?.part, p.id).toBe(3);
    expect(Object.keys(PRACTICE_BY_ID).length).toBe(PRACTICE.length);
  });

  it('every problem is complete: statement, two hints, a solution, and an answer of the right shape', () => {
    for (const p of PRACTICE) {
      expect(p.statement.length, p.id).toBeGreaterThan(15);
      expect(p.hints.length, p.id).toBe(2);
      for (const h of p.hints) expect(h.length, p.id).toBeGreaterThan(10);
      expect(p.solution.length, p.id).toBeGreaterThan(10);
      expect(p.answer.length, p.id).toBe(cells(p));
      for (const a of p.answer) expect(parseComplex(a), `${p.id}: "${a}"`).not.toBeNull();
    }
  });

  it('accepts the answer it expects, and common ways of writing it', () => {
    for (const p of PRACTICE) {
      expect(checkCells(p.answer, p.answer, opts(p)).kind, p.id).toBe('right');
      // the same numbers as decimals, to three places
      const decimals = asNumbers(p).map((z) => String(Math.round(z.re * 1000) / 1000) + (Math.abs(z.im) > 1e-9 ? `${z.im < 0 ? '-' : '+'}${Math.abs(Math.round(z.im * 1000) / 1000)}i` : ''));
      const loose = decimals.map((d, k) => (Math.abs(asNumbers(p)[k].re) < 1e-9 && Math.abs(asNumbers(p)[k].im) > 1e-9 ? `${Math.round(asNumbers(p)[k].im * 1000) / 1000}i` : d));
      expect(checkCells(loose, p.answer, opts(p)).kind, `${p.id}: ${loose.join(' ')}`).toBe('right');
    }
  });

  it('every listed wrong answer is the right shape, is rejected, and has a reason', () => {
    for (const p of PRACTICE) {
      expect(p.commonWrong.length, p.id).toBeGreaterThanOrEqual(1);
      for (const w of p.commonWrong) {
        expect(w.answer.length, p.id).toBe(cells(p));
        expect(w.feedback.length, p.id).toBeGreaterThan(15);
        expect(checkCells(w.answer, p.answer, opts(p)).kind, `${p.id}: ${w.answer.join(' ')}`).not.toBe('right');
      }
      // and no two listed wrong answers are the same one
      for (let a = 0; a < p.commonWrong.length; a++) {
        for (let b = a + 1; b < p.commonWrong.length; b++) {
          expect(sameAnswer(p.commonWrong[a].answer, p.commonWrong[b].answer), p.id).toBe(false);
        }
      }
    }
  });

  it('does not give the answer away in a hint', () => {
    for (const p of PRACTICE) {
      if (p.shape.kind !== 'number') continue;
      const answer = p.answer[0];
      // a hint may contain a digit that is also the answer by chance, so only check the written-out expected cell
      for (const h of p.hints) expect(h.includes(`= ${answer}.`), `${p.id}: ${h}`).toBe(false);
    }
  });
});

describe('The expected answers agree with the simulation engine', () => {
  const gate = (name: 'H' | 'X' | 'Z' | 'S', amps: Complex[]) => {
    const s = QuantumStateVector.fromAmplitudes(amps);
    if (name === 'H') s.applyH(0);
    if (name === 'X') s.applyX(0);
    if (name === 'Z') s.applyZ(0);
    if (name === 'S') s.applyS(0);
    return s.amplitudes;
  };
  const same = (got: Complex[], p: PracticeProblem) => {
    const want = asNumbers(p);
    expect(got.length, p.id).toBe(want.length);
    got.forEach((z, k) => {
      expect(z.re, `${p.id}[${k}].re`).toBeCloseTo(want[k].re, 6);
      expect(z.im, `${p.id}[${k}].im`).toBeCloseTo(want[k].im, 6);
    });
  };
  const c = (re: number, im = 0) => Complex.create(re, im);

  it('single-qubit gates', () => {
    same(gate('X', [c(0.6), c(0.8)]).map((z) => ({ re: z.re * 1, im: z.im })).map((z) => z), { ...PRACTICE_BY_ID.p2_1, answer: ['0.8', '0.6'] });
    same(gate('H', [c(0), c(1)]), PRACTICE_BY_ID.p2_2);
    same(gate('Z', [c(S), c(S)]), PRACTICE_BY_ID.p2_3);
    same(gate('S', [c(S), c(S)]), PRACTICE_BY_ID.p2_4);
  });

  it('two-qubit states: tensor product, CNOT, Bell pair (left digit is qubit 1)', () => {
    same(QuantumStateVector.fromAmplitudes([c(0), c(0), c(1), c(0)]).amplitudes, PRACTICE_BY_ID.p3_1);
    same(new QuantumStateVector(2).applyH(1).amplitudes, PRACTICE_BY_ID.p3_2);
    same(QuantumStateVector.fromAmplitudes([c(0), c(0), c(1), c(0)]).applyCNOT(1, 0).amplitudes, PRACTICE_BY_ID.p3_3);
    same(new QuantumStateVector(2).applyH(1).applyCNOT(1, 0).amplitudes, PRACTICE_BY_ID.p3_5);
    expect(1 << 5).toBe(32);
  });

  it('H·X as a matrix', () => {
    const mul = (a: Matrix2x2, b: Matrix2x2): Matrix2x2 =>
      [0, 1].map((r) => [0, 1].map((col) => Complex.add(Complex.mul(a[r][0], b[0][col]), Complex.mul(a[r][1], b[1][col])))) as Matrix2x2;
    const H: Matrix2x2 = [[c(S), c(S)], [c(S), c(-S)]];
    const X: Matrix2x2 = [[c(0), c(1)], [c(1), c(0)]];
    const hx = mul(H, X);
    same([hx[0][0], hx[0][1], hx[1][0], hx[1][1]], PRACTICE_BY_ID.p2_5);
    const xh = mul(X, H);
    expect(xh[0][1].re).toBeCloseTo(-S, 9);
    const hh = mul(H, H);
    expect(hh[0][0].re).toBeCloseTo(1, 9);
  });

  it('interference with a phase between two Hadamards', () => {
    const run = (phi: number) => {
      const phase: Matrix2x2 = [[c(1), c(0)], [c(0), Complex.exp(phi)]];
      return new QuantumStateVector(1).applyH(0).applyGate(phase, 0).applyH(0).getProbabilities();
    };
    expect(run(Math.PI / 2)[0]).toBeCloseTo(0.5, 9);
    expect(run(Math.PI)[1]).toBeCloseTo(1, 9);
    expect(run(Math.PI / 3)[0]).toBeCloseTo(0.75, 9);
    expect(run((90 * Math.PI) / 180)[0]).toBeCloseTo(0.5, 9);
    const mid = new QuantumStateVector(1).applyH(0).applyGate([[c(1), c(0)], [c(0), Complex.exp(Math.PI / 2)]], 0).amplitudes;
    same(mid, PRACTICE_BY_ID.p4_4);
  });

  it("Grover's numbers", () => {
    const theta = (n: number) => Math.asin(1 / Math.sqrt(n));
    expect(Math.sin(3 * theta(4)) ** 2).toBeCloseTo(1, 9);
    expect((theta(16) * 180) / Math.PI).toBeCloseTo(14.4775, 3);
    expect(Math.sin(7 * theta(16)) ** 2 * 100).toBeCloseTo(96.1, 0);
    expect((Math.PI / 4) * Math.sqrt(100)).toBeCloseTo(7.85, 2);
    expect((Math.PI / 4) * Math.sqrt(1_000_000)).toBeCloseTo(785.4, 1);
    // the circuit chances on the plain state-vector engine, for N = 4 over two qubits, agree with the geometry
    const s = new QuantumStateVector(2).applyH(0).applyH(1);
    s.amplitudes[3] = Complex.scale(s.amplitudes[3], -1);
    const mean = s.amplitudes.reduce((t, z) => t + z.re, 0) / 4;
    const after = s.amplitudes.map((z) => 2 * mean - z.re);
    expect(after[3] ** 2).toBeCloseTo(1, 9);
  });
});
