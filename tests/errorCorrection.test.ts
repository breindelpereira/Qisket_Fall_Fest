import { describe, it, expect } from 'vitest';
import {
  CODE_SIZES, PROBE_IDS, afterFix, applyFix, bestFix, checkParity, diagnose, encodeLogical, errorCurve, fixForSyndrome, injectFlips, logicalAmplitudes,
  logicalErrorRate, measureDataDirectly, outcomeOf, overlap, parityOf, simulateRepetition, surgerySucceeded, syndromeOf,
} from '../src/core/labs/errorCorrection';
import type { Flips, ProbeId } from '../src/core/labs/errorCorrection';
import { mulberry32 } from '../src/core/games/oracleDetective';

const ALL_FLIPS: Flips[] = Array.from({ length: 8 }, (_, i) => [Boolean(i & 1), Boolean(i & 2), Boolean(i & 4)] as Flips);
const single = (q: number): Flips => [q === 0, q === 1, q === 2];
const THETAS = [0, 0.7, Math.PI / 2, 2.1, Math.PI];

describe('Three-qubit repetition code: finding a flipped qubit by comparing qubits', () => {
  it('reads the syndrome off the two probes, and it points at the flipped qubit', () => {
    expect(syndromeOf([false, false, false])).toEqual([0, 0]);
    expect(syndromeOf(single(0))).toEqual([1, 0]);
    expect(syndromeOf(single(1))).toEqual([1, 1]);
    expect(syndromeOf(single(2))).toEqual([0, 1]);
    expect(fixForSyndrome([0, 0])).toBeNull();
    for (const q of [0, 1, 2] as const) expect(bestFix(single(q))).toBe(q);
    expect(bestFix([false, false, false])).toBeNull();
  });

  it('any two probes say what all three would say (the third is the sum of the other two)', () => {
    for (const flips of ALL_FLIPS) {
      expect(parityOf(flips, 'C')).toBe((parityOf(flips, 'A') ^ parityOf(flips, 'B')) as 0 | 1);
      const pairs: ProbeId[][] = [['A', 'B'], ['A', 'C'], ['B', 'C']];
      for (const [x, y] of pairs) {
        expect(diagnose({ [x]: parityOf(flips, x), [y]: parityOf(flips, y) }), `${flips} via ${x}${y}`).toBe(bestFix(flips));
      }
    }
  });

  it('cannot say anything from fewer than two different probes', () => {
    expect(diagnose({})).toBe('unknown');
    expect(diagnose({ A: 1 })).toBe('unknown');
    expect(diagnose({ C: 0 })).toBe('unknown');
  });

  it('saves the qubit when one qubit flipped, and loses it when two or three did', () => {
    for (const flips of ALL_FLIPS) {
      const errors = flips.filter(Boolean).length;
      expect(surgerySucceeded(flips, bestFix(flips)), `${flips}`).toBe(errors <= 1);
    }
    // two flips: the probes point at the third qubit, and "fixing" it flips all three
    expect(outcomeOf(afterFix([true, true, false], bestFix([true, true, false])))).toBe('logical-flip');
    // three flips look like no error at all
    expect(bestFix([true, true, true])).toBeNull();
    expect(outcomeOf([true, true, true])).toBe('logical-flip');
    expect(outcomeOf([true, false, false])).toBe('corrupted');
    // "fixing" a healthy qubit breaks it
    expect(surgerySucceeded([false, false, false], 1)).toBe(false);
  });
});

describe('The same code with real amplitudes (state-vector engine)', () => {
  it('encodes alpha|0> + beta|1> as alpha|000> + beta|111>, which is not three copies', () => {
    for (const theta of THETAS) {
      const state = encodeLogical(theta, 0.4);
      expect(state.isNormalized()).toBe(true);
      const { zero, one } = logicalAmplitudes(state);
      expect(Math.hypot(zero.re, zero.im)).toBeCloseTo(Math.cos(theta / 2), 9);
      expect(Math.hypot(one.re, one.im)).toBeCloseTo(Math.abs(Math.sin(theta / 2)), 9);
      const others = state.amplitudes.filter((_, i) => i !== 0b0000 && i !== 0b0111);
      expect(others.every((a) => Math.hypot(a.re, a.im) < 1e-9)).toBe(true);
    }
  });

  it('the helper qubit reads the same syndrome as the table, for every single flip and every state', () => {
    for (const theta of THETAS) {
      for (const flips of [[false, false, false] as Flips, single(0), single(1), single(2)]) {
        const state = injectFlips(encodeLogical(theta, 1.1), flips);
        const rng = mulberry32(7);
        const a = checkParity(state, 'A', rng);
        const b = checkParity(state, 'B', rng);
        expect([a, b], `${flips} at ${theta}`).toEqual(syndromeOf(flips));
      }
    }
  });

  it('checking parity does not touch the data: the amplitudes before and after are identical', () => {
    for (const theta of THETAS) {
      for (const flips of ALL_FLIPS) {
        const state = injectFlips(encodeLogical(theta, 0.9), flips);
        const before = state.amplitudes.map((a) => ({ ...a }));
        const rng = mulberry32(3);
        for (const probe of PROBE_IDS) checkParity(state, probe, rng);
        state.amplitudes.forEach((a, i) => {
          expect(a.re, `${flips} amplitude ${i}`).toBeCloseTo(before[i].re, 9);
          expect(a.im, `${flips} amplitude ${i}`).toBeCloseTo(before[i].im, 9);
        });
      }
    }
  });

  it('one flip is repaired exactly: the state is the original again, whatever it was', () => {
    for (const theta of THETAS) {
      const ideal = encodeLogical(theta, 1.1);
      for (const q of [0, 1, 2]) {
        const state = injectFlips(encodeLogical(theta, 1.1), single(q));
        // a single flip moves the state to basis states the original never had, so it is completely damaged until repaired
        expect(overlap(ideal, state)).toBeCloseTo(0, 9);
        const rng = mulberry32(5);
        const fix = diagnose({ A: checkParity(state, 'A', rng), B: checkParity(state, 'B', rng) });
        expect(fix).toBe(q);
        applyFix(state, fix === 'unknown' ? null : fix);
        expect(overlap(ideal, state), `flip ${q} at ${theta}`).toBeCloseTo(1, 9);
      }
    }
  });

  it('two flips fool it: the "repair" turns |0> into |1> (a logical error), and three flips cannot be seen at all', () => {
    const ideal = encodeLogical(0);
    const two = injectFlips(encodeLogical(0), [true, true, false]);
    const rng = mulberry32(9);
    const fix = diagnose({ A: checkParity(two, 'A', rng), B: checkParity(two, 'B', rng) });
    expect(fix).toBe(2);
    applyFix(two, 2);
    expect(overlap(ideal, two)).toBeCloseTo(0, 9);

    const three = injectFlips(encodeLogical(0), [true, true, true]);
    expect([checkParity(three, 'A', rng), checkParity(three, 'B', rng)]).toEqual([0, 0]);
    expect(overlap(ideal, three)).toBeCloseTo(0, 9);
  });

  it('measuring a data qubit directly destroys the superposition, which is exactly what the probes avoid', () => {
    const ideal = encodeLogical(Math.PI / 2);
    for (const roll of [0.1, 0.9]) {
      const state = encodeLogical(Math.PI / 2);
      const bit = measureDataDirectly(state, () => roll);
      const { zero, one } = logicalAmplitudes(state);
      // one of the two amplitudes is gone, so the blend is lost
      expect(Math.min(Math.hypot(zero.re, zero.im), Math.hypot(one.re, one.im))).toBeCloseTo(0, 9);
      expect(Math.hypot(bit === 0 ? zero.re : one.re, bit === 0 ? zero.im : one.im)).toBeCloseTo(1, 9);
      expect(overlap(ideal, state)).toBeCloseTo(0.5, 9);
    }
  });
});

describe('How often the code fails', () => {
  it('for three qubits the chance of failing is 3p² − 2p³, and for one qubit (no code) it is p', () => {
    for (const p of [0, 0.01, 0.05, 0.1, 0.25, 0.4, 0.5, 0.7, 1]) {
      expect(logicalErrorRate(p, 3)).toBeCloseTo(3 * p ** 2 - 2 * p ** 3, 12);
      expect(logicalErrorRate(p, 1)).toBeCloseTo(p, 12);
    }
    expect(logicalErrorRate(0.01, 3)).toBeCloseTo(0.000298, 6);
    expect(logicalErrorRate(0.1, 3)).toBeCloseTo(0.028, 9);
  });

  it('helps below 50% and hurts above it, and more qubits help more', () => {
    for (const n of [3, 5, 7]) {
      for (const p of [0.01, 0.1, 0.3, 0.45]) expect(logicalErrorRate(p, n), `n=${n} p=${p}`).toBeLessThan(p);
      for (const p of [0.55, 0.7, 0.9]) expect(logicalErrorRate(p, n), `n=${n} p=${p}`).toBeGreaterThan(p);
      expect(logicalErrorRate(0.5, n)).toBeCloseTo(0.5, 12);
    }
    for (const p of [0.05, 0.1, 0.2, 0.3]) {
      expect(logicalErrorRate(p, 5)).toBeLessThan(logicalErrorRate(p, 3));
      expect(logicalErrorRate(p, 7)).toBeLessThan(logicalErrorRate(p, 5));
    }
  });

  it('only odd numbers of qubits make sense, because the majority must be able to win', () => {
    expect(() => logicalErrorRate(0.1, 4)).toThrow();
    expect(() => logicalErrorRate(0.1, 0)).toThrow();
    expect(CODE_SIZES.every((n) => n % 2 === 1)).toBe(true);
  });

  it('a simulation agrees with the formula, and its tallies add up', () => {
    for (const [p, n] of [[0.1, 3], [0.2, 3], [0.3, 5], [0.1, 1]] as const) {
      const trials = 40000;
      const r = simulateRepetition(p, n, trials, mulberry32(11 + n));
      const expected = logicalErrorRate(p, n);
      const sigma = Math.sqrt((expected * (1 - expected)) / trials);
      expect(Math.abs(r.rate - expected), `p=${p} n=${n}`).toBeLessThan(5 * sigma);
      expect(r.flipCounts.reduce((a, b) => a + b, 0)).toBe(trials);
      expect(r.flipCounts.slice(Math.floor(n / 2) + 1).reduce((a, b) => a + b, 0)).toBe(r.failures);
    }
    expect(simulateRepetition(0, 3, 100).failures).toBe(0);
    expect(simulateRepetition(1, 3, 100).failures).toBe(100);
    expect(simulateRepetition(0.3, 3, 0).rate).toBe(0);
  });

  it('the curve starts at nothing, passes through (50%, 50%), and has the right number of points', () => {
    const c = errorCurve(3, 0.6, 60);
    expect(c).toHaveLength(61);
    expect(c[0]).toEqual({ p: 0, logical: 0 });
    const half = c.find((pt) => Math.abs(pt.p - 0.5) < 1e-9);
    expect(half?.logical).toBeCloseTo(0.5, 12);
    expect(c.every((pt, i) => i === 0 || pt.logical >= c[i - 1].logical)).toBe(true);
  });
});
