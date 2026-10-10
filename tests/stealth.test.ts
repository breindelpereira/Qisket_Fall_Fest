import { describe, it, expect } from 'vitest';
import { Complex } from '../src/core/circuit';
import { MATCH_AT, PARTNER, afterScan, matchProbability, slipsThrough, slotAmplitudes } from '../src/core/games/stealth';
import type { SlotState } from '../src/core/games/stealth';
import { mulberry32 } from '../src/core/games/oracleDetective';

const INV = 1 / Math.SQRT2;
const ket = (a: number, b: number, bi = 0) => [Complex.create(a, 0), Complex.create(b, bi)] as const;

describe("Schrödinger's Stealth: the laser is a Born-rule measurement", () => {
  it('a stance that matches the slot passes for certain, and its partner never does', () => {
    for (const slot of ['0', '1', '+', '-'] as SlotState[]) {
      const [a, b] = slotAmplitudes(slot);
      expect(matchProbability(a, b, slot), slot).toBeCloseTo(1, 12);
      const [pa, pb] = slotAmplitudes(PARTNER[slot]);
      expect(matchProbability(pa, pb, slot), slot).toBeCloseTo(0, 12);
    }
  });

  it('a state in the other basis is a coin flip, and a sideways phase is too', () => {
    const [zero0, zero1] = ket(1, 0);
    expect(matchProbability(zero0, zero1, '+')).toBeCloseTo(0.5, 12);
    expect(matchProbability(zero0, zero1, '-')).toBeCloseTo(0.5, 12);
    const [plus0, plus1] = ket(INV, INV);
    expect(matchProbability(plus0, plus1, '0')).toBeCloseTo(0.5, 12);
    expect(matchProbability(plus0, plus1, '1')).toBeCloseTo(0.5, 12);
    // |+i> sits on the equator between |+> and |->, so the X-basis scanners see a fair coin
    const [i0, i1] = ket(INV, 0, INV);
    expect(matchProbability(i0, i1, '+')).toBeCloseTo(0.5, 12);
    expect(matchProbability(i0, i1, '-')).toBeCloseTo(0.5, 12);
  });

  it('the chance of a slot and of its partner add up to 1', () => {
    const [a, b] = ket(Math.cos(0.4), Math.sin(0.4), 0);
    for (const slot of ['0', '+'] as SlotState[]) {
      expect(matchProbability(a, b, slot) + matchProbability(a, b, PARTNER[slot])).toBeCloseTo(1, 12);
    }
  });

  it('a match always slips through, and anything else is a gamble with exactly that chance', () => {
    expect(slipsThrough(1, () => 0.999999)).toBe(true);
    expect(slipsThrough(MATCH_AT + 0.01, () => 0.999999)).toBe(true);
    expect(slipsThrough(0, () => 0)).toBe(false);
    expect(slipsThrough(0.5, () => 0.4)).toBe(true);
    expect(slipsThrough(0.5, () => 0.6)).toBe(false);

    const rng = mulberry32(2026);
    let through = 0;
    const trials = 20000;
    for (let i = 0; i < trials; i++) if (slipsThrough(0.5, rng)) through += 1;
    expect(through / trials).toBeGreaterThan(0.48);
    expect(through / trials).toBeLessThan(0.52);
  });

  it('afterwards the agent is in the slot state if they passed, and in its partner if they did not', () => {
    for (const slot of ['0', '1', '+', '-'] as SlotState[]) {
      const [a, b] = afterScan(slot, true);
      expect(matchProbability(a, b, slot)).toBeCloseTo(1, 12);
      const [c, d] = afterScan(slot, false);
      expect(matchProbability(c, d, slot)).toBeCloseTo(0, 12);
      expect(Complex.absSq(c) + Complex.absSq(d)).toBeCloseTo(1, 12);
    }
  });

  it('never lets a collapsed agent pass the same slot twice by luck', () => {
    // after a failed scan the agent is in the partner state, so another try at the same slot cannot succeed
    const [c, d] = afterScan('0', false);
    expect(slipsThrough(matchProbability(c, d, '0'), () => 0)).toBe(false);
  });
});
