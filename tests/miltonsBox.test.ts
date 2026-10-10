import { describe, it, expect } from 'vitest';
import {
  LEVELS, boxFromAmplitudes, chanceAwake, diagnoseGuess, isPrepared, judgeGuess, openMany, openOnce, parGates, prepared, reopen, starsFor,
} from '../src/core/games/miltonsBox';
import type { PredictLevel, PrepareLevel } from '../src/core/games/miltonsBox';
import { mulberry32 } from '../src/core/games/oracleDetective';

const predict = LEVELS.filter((l): l is PredictLevel => l.kind === 'predict');
const prepare = LEVELS.filter((l): l is PrepareLevel => l.kind === 'prepare');

describe("Milton's Box: the Born rule", () => {
  it('the chance of Awake is the amplitude squared, and the sign does not matter', () => {
    expect(chanceAwake(boxFromAmplitudes(0.6, 0.8))).toBeCloseTo(36, 9);
    expect(chanceAwake(boxFromAmplitudes(0.6, -0.8))).toBeCloseTo(36, 9);
    expect(chanceAwake(boxFromAmplitudes(-0.28, 0.96))).toBeCloseTo(7.84, 9);
  });

  it('a recipe whose amplitudes are not normalised is scaled so the two chances add up to 100%', () => {
    const box = boxFromAmplitudes(3, 4);
    expect(chanceAwake(box)).toBeCloseTo(36, 9);
    expect(box.getProbabilities().reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  });

  it('opening many identical boxes lands near the chance, not exactly on it', () => {
    const rng = mulberry32(7);
    const counts = openMany(boxFromAmplitudes(0.6, 0.8), 2000, rng);
    expect(counts.awake + counts.asleep).toBe(2000);
    expect(counts.awake / 2000).toBeGreaterThan(0.32);
    expect(counts.awake / 2000).toBeLessThan(0.4);
  });

  it('a small chance is not zero', () => {
    const counts = openMany(boxFromAmplitudes(0.28, -0.96), 5000, mulberry32(3));
    expect(counts.awake).toBeGreaterThan(0);
    expect(counts.asleep).toBeGreaterThan(counts.awake);
  });
});

describe("Milton's Box: levels", () => {
  it('every predict level is judged against the squared amplitude, within its tolerance', () => {
    for (const level of predict) {
      const truth = chanceAwake(boxFromAmplitudes(level.alpha, level.beta));
      expect(judgeGuess(level, truth).correct, level.id).toBe(true);
      expect(judgeGuess(level, truth + level.tolerance).correct, level.id).toBe(true);
      expect(judgeGuess(level, truth + level.tolerance + 1).correct, level.id).toBe(false);
      expect(judgeGuess(level, truth).truth).toBeCloseTo(truth, 9);
    }
  });

  it('the useful wrong answers are caught: amplitude instead of amplitude squared, and the other outcome', () => {
    const first = predict[0];
    expect(judgeGuess(first, 60).correct, 'forgot to square').toBe(false);
    expect(judgeGuess(first, 64).correct, 'gave the Asleep chance').toBe(false);
    expect(judgeGuess(first, 35).correct).toBe(true);
    const second = predict[1];
    expect(judgeGuess(second, 96).correct, 'read the Asleep amplitude').toBe(false);
    expect(judgeGuess(second, 5).correct).toBe(true);
  });

  it('H alone makes Milton 50/50', () => {
    const half = prepare.find((l) => l.id === 'half')!;
    expect(isPrepared(half, ['H'])).toBe(true);
    expect(isPrepared(half, ['X'])).toBe(false);
    expect(isPrepared(half, [])).toBe(false);
    expect(parGates(half)).toBe(1);
  });

  it('with X jammed, H then Z then H makes Milton Asleep for certain, and nothing shorter does', () => {
    const jammed = prepare.find((l) => l.id === 'jammed')!;
    expect(jammed.gates).not.toContain('X');
    expect(isPrepared(jammed, ['H', 'Z', 'H'])).toBe(true);
    expect(chanceAwake(prepared(['H', 'Z', 'H']))).toBeCloseTo(0, 9);
    expect(isPrepared(jammed, ['H'])).toBe(false);
    expect(isPrepared(jammed, ['Z'])).toBe(false);
    expect(isPrepared(jammed, ['H', 'H'])).toBe(false);
    expect(isPrepared(jammed, ['H', 'Z'])).toBe(false);
    expect(parGates(jammed)).toBe(3);
  });

  it('a sign flip on its own changes no odds, which is why Z alone never clears a level', () => {
    expect(chanceAwake(prepared(['Z']))).toBeCloseTo(100, 9);
    expect(chanceAwake(prepared(['H', 'Z']))).toBeCloseTo(50, 9);
    expect(chanceAwake(prepared(['H', 'H']))).toBeCloseTo(100, 9);
  });

  it('every prepare level can be cleared within its own gate limit', () => {
    for (const level of prepare) {
      const par = parGates(level);
      expect(par, level.id).not.toBeNull();
      expect(par as number, level.id).toBeLessThanOrEqual(level.maxGates);
    }
  });
});

describe("Milton's Box: what a wrong guess says", () => {
  it('names the two real slips and otherwise only says which way', () => {
    const [first, second] = predict;
    expect(diagnoseGuess(first, 60)).toBe('amplitude');
    expect(diagnoseGuess(first, 65)).toBe('other-outcome');
    expect(diagnoseGuess(first, 90)).toBe('too-high');
    expect(diagnoseGuess(first, 10)).toBe('too-low');
    expect(diagnoseGuess(second, 30)).toBe('amplitude');
    expect(diagnoseGuess(second, 90)).toBe('other-outcome');
  });
});

describe("Milton's Box: opening it changes it", () => {
  it('a second look always agrees with the first, for any box and any random numbers', () => {
    const rng = mulberry32(11);
    for (let trial = 0; trial < 200; trial++) {
      const { outcome, box } = openOnce(prepared(['H']), rng);
      for (let k = 0; k < 5; k++) expect(reopen(box, rng)).toBe(outcome);
    }
  });

  it('the first look is still a fair coin, and opening does not touch the original box', () => {
    const rng = mulberry32(5);
    const original = prepared(['H']);
    let awake = 0;
    for (let i = 0; i < 1000; i++) if (openOnce(original, rng).outcome === 'awake') awake++;
    expect(awake).toBeGreaterThan(450);
    expect(awake).toBeLessThan(550);
    expect(chanceAwake(original)).toBeCloseTo(50, 9);
  });
});

describe("Milton's Box: stars", () => {
  it('rewards a first try and forgives a retry', () => {
    expect(starsFor(1, 0)).toBe(3);
    expect(starsFor(2, 0)).toBe(2);
    expect(starsFor(1, 1)).toBe(2);
    expect(starsFor(3, 0)).toBe(1);
    expect(starsFor(1, 4)).toBe(1);
  });
});
