import { describe, it, expect } from 'vitest';
import { PRACTICE_BY_ID } from '../src/content/practice';
import type { PracticeProblem } from '../src/content/practice';
import { VARIANT_IDS, hasVariants, nextSeed, variantOf } from '../src/content/practiceVariants';
import { checkCells, sameAnswer } from '../src/core/math/answer';
import { parseComplex } from '../src/core/math/expression';
import { Complex, QuantumStateVector } from '../src/core/circuit';
import { optimalIterations, runGrover, successProbability } from '../src/core/labs/grover';

const SEEDS = Array.from({ length: 61 }, (_, i) => i);
/** Seed 0 is the original problem, written in its own words, so the number-reading checks start at 1. */
const VARIANT_SEEDS = SEEDS.slice(1);
const cells = (p: PracticeProblem): number =>
  p.shape.kind === 'number' ? 1 : p.shape.kind === 'vector' ? p.shape.length : p.shape.rows * p.shape.cols;
const opts = (p: PracticeProblem) => ({ tolerance: p.tolerance, upToGlobalPhase: p.upToGlobalPhase });
const num = (s: string): number => (parseComplex(s) as Complex).re;
const ints = (s: string): number[] => (s.replace(/−/g, '-').match(/-?\d+/g) ?? []).map(Number);

describe('Practice variants: "New numbers"', () => {
  it('covers ten of the problems, all real, and the original is seed 0', () => {
    expect(VARIANT_IDS.length).toBe(10);
    for (const id of VARIANT_IDS) {
      expect(PRACTICE_BY_ID[id], id).toBeDefined();
      expect(hasVariants(id)).toBe(true);
      expect(variantOf(id, 0)).toBe(PRACTICE_BY_ID[id]);
    }
    expect(hasVariants('p2_1')).toBe(false);
    expect(variantOf('p2_1', 5)).toBe(PRACTICE_BY_ID.p2_1);
  });

  it('every variant keeps the id, the lesson and the shape, and is complete', () => {
    for (const id of VARIANT_IDS) {
      const base = PRACTICE_BY_ID[id];
      for (const seed of SEEDS) {
        const v = variantOf(id, seed);
        const where = `${id} seed ${seed}`;
        expect(v.id, where).toBe(id);
        expect(v.lessonId, where).toBe(base.lessonId);
        expect(v.shape, where).toEqual(base.shape);
        expect(v.answer.length, where).toBe(cells(v));
        for (const a of v.answer) expect(parseComplex(a), `${where}: "${a}"`).not.toBeNull();
        expect(v.hints.length, where).toBe(2);
        expect(v.solution.length, where).toBeGreaterThan(10);
      }
    }
  });

  it('every variant accepts its own answer and rejects each listed wrong answer', () => {
    for (const id of VARIANT_IDS) {
      for (const seed of SEEDS) {
        const v = variantOf(id, seed);
        const where = `${id} seed ${seed}`;
        expect(checkCells(v.answer, v.answer, opts(v)).kind, where).toBe('right');
        expect(v.commonWrong.length, where).toBeGreaterThanOrEqual(1);
        for (const w of v.commonWrong) {
          expect(w.answer.length, where).toBe(cells(v));
          expect(checkCells(w.answer, v.answer, opts(v)).kind, `${where}: ${w.answer.join(' ')}`).not.toBe('right');
        }
        for (let a = 0; a < v.commonWrong.length; a++) {
          for (let b = a + 1; b < v.commonWrong.length; b++) {
            expect(sameAnswer(v.commonWrong[a].answer, v.commonWrong[b].answer, v.tolerance), where).toBe(false);
          }
        }
      }
    }
  });

  it('never gives the answer away in a hint', () => {
    for (const id of VARIANT_IDS) {
      for (const seed of SEEDS) {
        const v = variantOf(id, seed);
        if (v.shape.kind !== 'number') continue;
        for (const h of v.hints) expect(h.includes(`= ${v.answer[0]}.`), `${id} seed ${seed}: ${h}`).toBe(false);
      }
    }
  });

  it('is repeatable: the same seed always gives the same problem', () => {
    for (const id of VARIANT_IDS) {
      for (const seed of [1, 7, 33]) expect(variantOf(id, seed)).toEqual(variantOf(id, seed));
    }
  });

  it('"New numbers" always changes what is asked, and the seeds soon give several different questions', () => {
    for (const id of VARIANT_IDS) {
      let seed = 0;
      const seen = new Set<string>();
      for (let i = 0; i < 12; i++) {
        const before = variantOf(id, seed);
        seed = nextSeed(id, seed);
        const after = variantOf(id, seed);
        expect(after.statement + JSON.stringify(after.math ?? null), `${id} step ${i}`).not.toBe(before.statement + JSON.stringify(before.math ?? null));
        seen.add(after.statement + JSON.stringify(after.math ?? null));
      }
      expect(seen.size, id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('Variant answers agree with an independent calculation', () => {
  it('p0_1: (a + bi)(a - bi) by complex multiplication', () => {
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p0_1', seed);
      const [a, b] = ints(v.statement.match(/\((\d+) \+ (\d+)i\)/)!.slice(1).join(' '));
      const z = Complex.mul(Complex.create(a, b), Complex.create(a, -b));
      expect(num(v.answer[0]), `seed ${seed}`).toBeCloseTo(z.re, 9);
      expect(z.im).toBeCloseTo(0, 9);
    }
  });

  it('p0_2: the size of a + bi', () => {
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p0_2', seed);
      const [a, b] = ints(v.statement.match(/of (\d+) \+ (\d+)i/)!.slice(1).join(' '));
      expect(num(v.answer[0]), `seed ${seed}`).toBeCloseTo(Complex.abs(Complex.create(a, b)), 9);
    }
  });

  it('p0_3: the sum of two columns', () => {
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p0_3', seed);
      const m = v.statement.match(/\((−?\d+), (−?\d+)\) and \((−?\d+), (−?\d+)\)/)!;
      const [a, b, c, d] = ints(m.slice(1).join(' '));
      expect(num(v.answer[0]), `seed ${seed}`).toBe(a + c);
      expect(num(v.answer[1]), `seed ${seed}`).toBe(b + d);
    }
  });

  it('p0_4: a matrix times a column, row by row', () => {
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p0_4', seed);
      const parts = v.math as unknown as { mat?: string[][]; vec?: string[] }[];
      const m = parts[0].mat!.map((r) => r.map(Number));
      const x = parts[1].vec!.map(Number);
      expect(num(v.answer[0]), `seed ${seed}`).toBe(m[0][0] * x[0] + m[0][1] * x[1]);
      expect(num(v.answer[1]), `seed ${seed}`).toBe(m[1][0] * x[0] + m[1][1] * x[1]);
    }
  });

  it('p1_1: the completed state is normalised', () => {
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p1_1', seed);
      const alpha = num(v.statement.match(/\(([^)]+)\)\|0⟩/)![1]);
      expect(alpha * alpha + num(v.answer[0]) ** 2, `seed ${seed}`).toBeCloseTo(1, 9);
    }
  });

  it('p1_2: the chance of 0 is the squared size, and the two amplitudes are normalised', () => {
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p1_2', seed);
      const m = v.statement.match(/\(([^)]+)\)\|0⟩ \+ \(([^)]+)\)\|1⟩/)!;
      const a = num(m[1]);
      const b = num(m[2]);
      expect(a * a + b * b, `seed ${seed}`).toBeCloseTo(1, 9);
      expect(num(v.answer[0]), `seed ${seed}`).toBeCloseTo(a * a, 9);
    }
  });

  it('p4_3: H, then a phase, then H, on the engine', () => {
    const angles: Record<string, number> = { 'π/3': Math.PI / 3, '2π/3': (2 * Math.PI) / 3, π: Math.PI, '0': 0 };
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p4_3', seed);
      const phi = angles[v.statement.match(/φ = (\S+)\./)![1]];
      expect(phi, `seed ${seed}`).toBeDefined();
      const state = new QuantumStateVector(1);
      state.applyH(0);
      state.applyGate([[Complex.one(), Complex.zero()], [Complex.zero(), Complex.exp(phi)]], 0);
      state.applyH(0);
      expect(num(v.answer[0]), `seed ${seed}`).toBeCloseTo(state.getProbabilities()[0], 9);
    }
  });

  it("p5_2 and p5_4: Grover's starting angle and best number of rounds", () => {
    for (const seed of VARIANT_SEEDS) {
      const a = variantOf('p5_2', seed);
      const n = Number(a.statement.match(/N = (\d+)/)![1]);
      expect(Math.sin((num(a.answer[0]) * Math.PI) / 180), `p5_2 seed ${seed}`).toBeCloseTo(1 / Math.sqrt(n), 2);
      const r = variantOf('p5_4', seed);
      const m = Number(r.statement.match(/N = (\d+)/)![1]);
      expect(num(r.answer[0]), `p5_4 seed ${seed}`).toBe(Math.round((Math.PI / 4) * Math.sqrt(m)));
      // where the list is a power of two the engine's own rule agrees
      const qubits = Math.log2(m);
      if (Number.isInteger(qubits)) expect(num(r.answer[0]), `p5_4 N=${m}`).toBe(optimalIterations(qubits, 1));
    }
  });

  it('p5_3: the angle after k rounds gives the chance the simulation reports (N = 4)', () => {
    for (const seed of VARIANT_SEEDS) {
      const v = variantOf('p5_3', seed);
      const n = Number(v.statement.match(/N = (\d+)/)![1]);
      const k = Number(v.statement.match(/k = (\d+)/)![1]);
      const chance = Math.pow(Math.sin((num(v.answer[0]) * Math.PI) / 180), 2);
      if (n === 4) expect(successProbability(runGrover(2, [0], k), [0]), `seed ${seed}`).toBeCloseTo(chance, 6);
      else expect(chance).toBeCloseTo(Math.pow(Math.sin((2 * k + 1) * (Math.PI / 4)), 2), 9);
    }
  });
});
