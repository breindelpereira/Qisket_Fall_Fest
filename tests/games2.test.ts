import { describe, it, expect } from 'vitest';
import { Complex } from '../src/core/circuit';
import {
  LEVELS as DECK, cardLabel, checkInputs, equalUpToPhase, isSolved as deckSolved, parFor as deckPar, shortestSolution as deckShortest,
  starRating as deckStars, testInputs, unitaryOf,
} from '../src/core/games/gateDeck';
import type { Placed } from '../src/core/labs/circuitBuilder';
import {
  RELAY_LEVELS, describeFix, messageFromBloch, relayHop, rightFix, starRating as relayStars,
} from '../src/core/games/teleportRelay';
import type { FixGate } from '../src/core/games/teleportRelay';
import { messageVector } from '../src/core/labs/teleport';
import type { Bit } from '../src/core/labs/teleport';
import {
  CASES, askInformant, classicalCertainty, makeOracle, mulberry32, scoreCase,
} from '../src/core/games/oracleDetective';
import { classify } from '../src/core/labs/deutschJozsa';
import type { Bit as FBit } from '../src/core/labs/deutschJozsa';

const gate = (g: 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T', qubit = 0): Placed => ({ kind: 'gate', gate: g, qubit });
const cnot = (control: number, target: number): Placed => ({ kind: 'cnot', control, target });
const ALL_BITS: [Bit, Bit][] = [[0, 0], [0, 1], [1, 0], [1, 1]];

describe('Gate Deck', () => {
  it('textbook identities hold up to a global phase', () => {
    const same = (a: Placed[], b: Placed[], n = 1) => equalUpToPhase(unitaryOf(n, a), unitaryOf(n, b));
    expect(same([gate('H'), gate('X'), gate('H')], [gate('Z')])).toBe(true);
    expect(same([gate('H'), gate('Z'), gate('H')], [gate('X')])).toBe(true);
    expect(same([gate('T'), gate('T')], [gate('S')])).toBe(true);
    expect(same([gate('S'), gate('S')], [gate('Z')])).toBe(true);
    expect(same([gate('X'), gate('Z')], [gate('Y')])).toBe(true);
    expect(same([gate('Z'), gate('S')], [gate('S'), gate('S'), gate('S')])).toBe(true);
    expect(same([gate('H')], [gate('X')])).toBe(false);
    expect(same([gate('S')], [gate('T')])).toBe(false);
    expect(same([gate('H', 0), gate('H', 1), cnot(0, 1), gate('H', 0), gate('H', 1)], [cnot(1, 0)], 2)).toBe(true);
    expect(same([cnot(0, 1), cnot(1, 0), cnot(0, 1)], [cnot(1, 0), cnot(0, 1), cnot(1, 0)], 2)).toBe(true);
    expect(same([gate('H', 1), cnot(0, 1), gate('H', 1)], [gate('H', 0), cnot(1, 0), gate('H', 0)], 2)).toBe(true); // CZ is symmetric
    expect(same([cnot(0, 1)], [cnot(1, 0)], 2)).toBe(false);
  });

  it('a unitary built from cards is unitary (columns are orthonormal)', () => {
    const u = unitaryOf(2, [gate('H', 0), cnot(0, 1), gate('T', 1), gate('S', 0)]);
    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        let re = 0;
        let im = 0;
        for (let r = 0; r < 4; r++) {
          const p = Complex.mul(Complex.conj(u[r][a]), u[r][b]);
          re += p.re;
          im += p.im;
        }
        expect(re).toBeCloseTo(a === b ? 1 : 0, 9);
        expect(im).toBeCloseTo(0, 9);
      }
    }
  });

  it('every level can be solved, has a par that is at most the hand size, and the empty circuit never solves it', () => {
    for (const level of DECK) {
      const sol = deckShortest(level);
      expect(sol, `level ${level.id}`).not.toBeNull();
      expect(deckSolved(level, sol!)).toBe(true);
      expect(deckPar(level)).toBeLessThanOrEqual(level.hand.length);
      expect(deckSolved(level, [])).toBe(false);
      expect(level.hand.length).toBeLessThanOrEqual(6);
    }
  });

  it('known pars, including the shortcut on level 5', () => {
    expect(DECK.map(deckPar)).toEqual([3, 3, 2, 2, 2, 2, 5, 3, 3]);
  });

  it('decoys do not solve a level and the full hand in the wrong order usually does not either', () => {
    expect(deckSolved(DECK[0], [0, 1])).toBe(false); // H then X is not Z
    expect(deckSolved(DECK[0], [0, 1, 2])).toBe(true);
    expect(deckSolved(DECK[6], [0, 1, 2])).toBe(false);
  });

  it('input checks agree with the full check: all green exactly when solved', () => {
    for (const level of DECK) {
      const sol = deckShortest(level)!;
      expect(checkInputs(level, sol).every((c) => c.ok)).toBe(true);
      expect(checkInputs(level, []).every((c) => c.ok)).toBe(false);
      for (let i = 0; i < level.hand.length; i++) {
        const picks = [i];
        expect(checkInputs(level, picks).every((c) => c.ok)).toBe(deckSolved(level, picks));
      }
    }
    expect(testInputs(1)).toHaveLength(3);
    expect(testInputs(2)).toHaveLength(7);
  });

  it('labels and stars', () => {
    expect(cardLabel(cnot(0, 1))).toBe('CNOT 0→1');
    expect(cardLabel(gate('H', 1))).toBe('H q1');
    expect([deckStars(3, 3), deckStars(4, 3), deckStars(6, 3)]).toEqual([3, 2, 1]);
  });
});

describe('Teleport Relay', () => {
  it('the right fix teleports perfectly for every pair of bits and every level message', () => {
    for (const level of RELAY_LEVELS) {
      for (const bits of ALL_BITS) {
        const r = relayHop(level.message, bits, rightFix(bits));
        expect(r.fidelity).toBeCloseTo(1, 6);
        expect(r.correct).toBe(true);
      }
    }
  });

  it('a wrong or missing fix is caught (except when the bits are 00 and no fix is the right one)', () => {
    const m = RELAY_LEVELS[2].message;
    expect(relayHop(m, [0, 1], []).correct).toBe(false);
    expect(relayHop(m, [0, 1], ['Z']).correct).toBe(false);
    expect(relayHop(m, [1, 1], ['X']).correct).toBe(false);
    expect(relayHop(m, [1, 0], ['H']).correct).toBe(false);
    expect(relayHop(m, [0, 0], []).correct).toBe(true);
    expect(relayHop(m, [0, 0], ['X']).correct).toBe(false);
  });

  it('either order of X and Z works (they differ by a global phase only)', () => {
    const m = RELAY_LEVELS[2].message;
    expect(relayHop(m, [1, 1], ['X', 'Z']).correct).toBe(true);
    expect(relayHop(m, [1, 1], ['Z', 'X']).correct).toBe(true);
  });

  it('no level can be passed by skipping a fix that is needed: every needed gate really moves the message', () => {
    for (const level of RELAY_LEVELS) {
      let current = level.message;
      for (const bits of level.hops) {
        const needed = rightFix(bits);
        expect(relayHop(current, bits, []).correct, `level ${level.id} bits ${bits}`).toBe(needed.length === 0);
        // dropping any one of the needed gates must fail too
        needed.forEach((_, i) => {
          expect(relayHop(current, bits, needed.filter((__, k) => k !== i)).correct).toBe(false);
        });
        current = relayHop(current, bits, needed).next;
      }
    }
  });

  it('the received qubit becomes the next message, hop after hop, with the original preserved', () => {
    for (const level of RELAY_LEVELS) {
      const original = messageVector(level.message);
      let current = level.message;
      for (const bits of level.hops) {
        const hop = relayHop(current, bits, rightFix(bits));
        expect(hop.correct).toBe(true);
        current = hop.next;
      }
      const end = messageVector(current);
      for (let i = 0; i < 3; i++) expect(end[i]).toBeCloseTo(original[i], 5);
    }
  });

  it('a wrong hop sends a different qubit onward', () => {
    const level = RELAY_LEVELS[3];
    const wrong = relayHop(level.message, level.hops[0], []);
    expect(wrong.correct).toBe(false);
    const after = messageVector(wrong.next);
    const orig = messageVector(level.message);
    expect(Math.abs(after[0] - orig[0]) + Math.abs(after[1] - orig[1]) + Math.abs(after[2] - orig[2])).toBeGreaterThan(0.1);
  });

  it('level data is consistent and the Bloch round trip works', () => {
    for (const level of RELAY_LEVELS) {
      expect(level.hops.length).toBeGreaterThan(0);
      expect(level.allowed).toContain('X');
      expect(level.allowed).toContain('Z');
    }
    const m = messageFromBloch(0, 1, 0);
    expect(m.theta).toBeCloseTo(Math.PI / 2, 9);
    expect(m.phi).toBeCloseTo(Math.PI / 2, 9);
    expect(describeFix([])).toBe('no gates');
    expect(describeFix(['X', 'Z'] as FixGate[])).toBe('X then Z');
    expect([relayStars(0), relayStars(2), relayStars(3)]).toEqual([3, 2, 1]);
  });

  it('all four bit pairs appear across the levels', () => {
    const seen = new Set(RELAY_LEVELS.flatMap((l) => l.hops.map((h) => `${h[0]}${h[1]}`)));
    expect([...seen].sort()).toEqual(['00', '01', '10', '11']);
  });
});

describe('Oracle Detective', () => {
  it('each case file is what it says: right size, right kind, same every time', () => {
    for (const c of CASES) {
      const f = makeOracle(c.n, c.truth, c.seed);
      expect(f).toHaveLength(1 << c.n);
      expect(classify(f)).toBe(c.truth);
      expect(makeOracle(c.n, c.truth, c.seed)).toEqual(f);
    }
    expect(mulberry32(1)()).toBe(mulberry32(1)());
  });

  it('opening lockers: two different values prove balanced, more than half equal proves constant', () => {
    expect(classicalCertainty(2, {})).toBeNull();
    expect(classicalCertainty(2, { 0: 1 })).toBeNull();
    expect(classicalCertainty(2, { 0: 1, 3: 1 })).toBeNull(); // half of four: a balanced function could still do this
    expect(classicalCertainty(2, { 0: 1, 3: 1, 1: 1 })).toBe('constant');
    expect(classicalCertainty(3, { 0: 0, 1: 0, 2: 0, 3: 0 })).toBeNull();
    expect(classicalCertainty(3, { 0: 0, 1: 0, 2: 0, 3: 0, 5: 0 })).toBe('constant');
    expect(classicalCertainty(3, { 0: 0, 6: 1 })).toBe('balanced');
  });

  it('the worst case really needs 2^(n-1) + 1 lockers: a balanced function can show equal values for half of them', () => {
    for (const n of [2, 3, 4]) {
      const f = makeOracle(n, 'balanced', 5);
      const zeros = f.map((v, i) => [v, i] as const).filter(([v]) => v === 0).map(([, i]) => i);
      const seen: Record<number, FBit> = {};
      zeros.forEach((i) => { seen[i] = 0; });
      expect(Object.keys(seen)).toHaveLength(1 << (n - 1));
      expect(classicalCertainty(n, seen)).toBeNull();
    }
  });

  it('the informant is always right about constant and balanced files', () => {
    for (const c of CASES) {
      for (let s = 1; s <= 12; s++) {
        for (const truth of ['constant', 'balanced'] as const) {
          const f = makeOracle(c.n, truth, s + c.seed);
          const report = askInformant(f, c.n, mulberry32(s));
          expect(report.verdict).toBe(truth);
          expect(report.readout === 0).toBe(truth === 'constant');
        }
      }
    }
  });

  it('scoring rewards proof and few queries', () => {
    expect(scoreCase('constant', 'balanced', true, 1).stars).toBe(0);
    expect(scoreCase('constant', 'constant', false, 1)).toEqual({ correct: true, proven: false, stars: 1 });
    expect(scoreCase('balanced', 'balanced', true, 1).stars).toBe(3);
    expect(scoreCase('balanced', 'balanced', true, 2).stars).toBe(3);
    expect(scoreCase('balanced', 'balanced', true, 5).stars).toBe(2);
  });

  it('the first two cases have no informant, the rest do', () => {
    expect(CASES.map((c) => c.informant)).toEqual([false, false, true, true, true, true]);
  });
});
