import { describe, it, expect } from 'vitest';
import {
  LEVELS, GATE_INFO, fidelity, stateFromGates, shortestSolution, isSolved, parFor, moveLimit, starRating, levelStart,
} from '../src/core/games/blochRunner';
import type { GateName } from '../src/core/games/blochRunner';
import { Complex, Gates } from '../src/core/circuit';

describe('Bloch Runner game logic', () => {
  it('every level is solvable with its allowed gates', () => {
    for (const level of LEVELS) {
      const sol = shortestSolution(level);
      expect(sol, `level ${level.id}`).not.toBeNull();
      expect(isSolved(level, sol!)).toBe(true);
    }
  });

  it('no level is already solved at the start', () => {
    for (const level of LEVELS) {
      expect(isSolved(level, [])).toBe(false);
    }
  });

  it('known par values match textbook gate algebra', () => {
    const par = (id: number) => parFor(LEVELS.find((l) => l.id === id)!);
    expect(par(1)).toBe(1); // X
    expect(par(2)).toBe(1); // H
    expect(par(3)).toBe(2); // H then Z
    expect(par(4)).toBe(2); // H then S
    expect(par(6)).toBe(1); // Z turns +Y into -Y
    expect(par(7)).toBe(3); // H, S, S (S*S = Z)
  });

  it('fidelity ignores global phase', () => {
    const a = stateFromGates(['H', 'Z']);
    const b = stateFromGates(['H', 'Z']);
    b.amplitudes = b.amplitudes.map((c) => ({ re: -c.re, im: -c.im }));
    expect(fidelity(a, b)).toBeCloseTo(1, 9);
  });

  it('distinguishes different states: |+> vs |-> have zero overlap', () => {
    expect(fidelity(stateFromGates(['H']), stateFromGates(['H', 'Z']))).toBeCloseTo(0, 9);
  });

  it('all game gates are unitary and keep the state normalized', () => {
    expect(stateFromGates(['H', 'T', 'S', 'X', 'Y', 'Z', 'Sdg']).isNormalized()).toBe(true);
    for (const n of Object.keys(GATE_INFO) as GateName[]) {
      const m = GATE_INFO[n].matrix();
      const dag = [
        [Complex.conj(m[0][0]), Complex.conj(m[1][0])],
        [Complex.conj(m[0][1]), Complex.conj(m[1][1])],
      ] as ReturnType<typeof Gates.H>;
      expect(Gates.equals2x2(Gates.multiply2x2(m, dag), Gates.I(), 1e-9)).toBe(true);
    }
  });

  it('S-dagger undoes S', () => {
    expect(fidelity(stateFromGates(['H', 'S', 'Sdg']), stateFromGates(['H']))).toBeCloseTo(1, 9);
  });

  it('level 6 starts facing +Y', () => {
    const lvl = LEVELS.find((l) => l.id === 6)!;
    expect(fidelity(levelStart(lvl), stateFromGates(['H', 'S']))).toBeCloseTo(1, 9);
  });

  it('star rating and move limit', () => {
    expect(starRating(2, 2)).toBe(3);
    expect(starRating(3, 2)).toBe(2);
    expect(starRating(6, 2)).toBe(1);
    expect(moveLimit(LEVELS[0])).toBe(parFor(LEVELS[0]) + 3);
  });
});
