import { describe, it, expect } from 'vitest';
import { QuantumStateVector } from '../src/core/circuit';
import { reducedQubit } from '../src/core/labs/twoQubit';
import {
  NAMED_MESSAGES, STEP_COUNT, bobFidelity, bobWithoutMessageLength, correctionFor, messageVector, outcomeProbabilities, teleportUpTo,
} from '../src/core/labs/teleport';
import type { Bit, Message } from '../src/core/labs/teleport';
import {
  analyticAllZero, applyOracle, classicalWorstCase, classify, constantOracle, inputDistribution, parityOracle, randomBalanced,
  runDeutschJozsa,
} from '../src/core/labs/deutschJozsa';
import type { Bit as FBit } from '../src/core/labs/deutschJozsa';
import {
  applyDiffusion, classicalExpectedGuesses, optimalIterations, runGrover, successProbability, theoreticalProbability, uniformState,
} from '../src/core/labs/grover';

const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const ALL_BITS: [Bit, Bit][] = [[0, 0], [0, 1], [1, 0], [1, 1]];
const MESSAGES: Message[] = [...NAMED_MESSAGES.map((n) => n.message), { theta: 0, phi: 0 }, { theta: 2.4, phi: -1.2 }];

describe('Teleportation', () => {
  it('the message starts on q0 and Bob starts with nothing', () => {
    for (const m of MESSAGES) {
      const { state } = teleportUpTo(m, 0);
      const r = reducedQubit(state, 0);
      const v = messageVector(m);
      expect([r.x, r.y, r.z].map((n) => +n.toFixed(6))).toEqual(v.map((n) => +n.toFixed(6)));
      expect(reducedQubit(state, 2).z).toBeCloseTo(1, 9);
    }
  });

  it('with the right correction Bob ends up with the message for every outcome', () => {
    for (const m of MESSAGES) {
      for (const bits of ALL_BITS) {
        const { state, m0, m1 } = teleportUpTo(m, 5, { forceBits: bits });
        expect([m0, m1]).toEqual(bits);
        expect(bobFidelity(m, state)).toBeCloseTo(1, 6);
        expect(state.isNormalized()).toBe(true);
      }
    }
  });

  it('all four outcomes are equally likely whatever the message is', () => {
    for (const m of MESSAGES) {
      for (const p of outcomeProbabilities(m)) expect(p).toBeCloseTo(0.25, 9);
    }
  });

  it('without the correction Bob is only right when the bits happen to be 00 (for a tilted message)', () => {
    const m = NAMED_MESSAGES[3].message;
    expect(bobFidelity(m, teleportUpTo(m, 5, { forceBits: [0, 0], correct: false }).state)).toBeCloseTo(1, 6);
    for (const bits of ALL_BITS.slice(1)) {
      expect(bobFidelity(m, teleportUpTo(m, 5, { forceBits: bits, correct: false }).state)).toBeLessThan(0.99);
    }
  });

  it('if the bits never arrive Bob holds a completely random qubit: averaged, nothing is there', () => {
    for (const m of MESSAGES) expect(bobWithoutMessageLength(m)).toBeCloseTo(0, 9);
  });

  it('Alice keeps no copy: after measuring, her qubits are plain bits that do not depend on the message', () => {
    const a = teleportUpTo({ theta: 0.4, phi: 0.2 }, 4, { forceBits: [1, 0] }).state;
    const b = teleportUpTo({ theta: 2.5, phi: 1.9 }, 4, { forceBits: [1, 0] }).state;
    for (const q of [0, 1]) {
      const ra = reducedQubit(a, q);
      const rb = reducedQubit(b, q);
      expect(ra.length).toBeCloseTo(1, 9);
      expect(ra.z).toBeCloseTo(rb.z, 9);
    }
  });

  it('random measurements also teleport perfectly and the correction table is X then Z', () => {
    const rng = seeded(5);
    for (let i = 0; i < 20; i++) {
      const m = { theta: rng() * Math.PI, phi: rng() * 2 * Math.PI - Math.PI };
      expect(bobFidelity(m, teleportUpTo(m, STEP_COUNT, { rng }).state)).toBeCloseTo(1, 6);
    }
    expect(correctionFor(0, 0)).toEqual([]);
    expect(correctionFor(0, 1)).toEqual(['X']);
    expect(correctionFor(1, 0)).toEqual(['Z']);
    expect(correctionFor(1, 1)).toEqual(['X', 'Z']);
  });
});

describe('Deutsch-Jozsa', () => {
  it('classifies functions', () => {
    expect(classify(constantOracle(2, 0))).toBe('constant');
    expect(classify(constantOracle(2, 1))).toBe('constant');
    expect(classify(parityOracle(2, 1))).toBe('balanced');
    expect(classify([1, 0, 0, 0])).toBe('neither');
    expect(classify(randomBalanced(3, seeded(2)))).toBe('balanced');
  });

  it('constant oracles always give all zeros, balanced ones never do (n = 1, 2, 3)', () => {
    for (const n of [1, 2, 3]) {
      for (const v of [0, 1] as const) expect(runDeutschJozsa(constantOracle(n, v), n).probAllZero).toBeCloseTo(1, 9);
      for (let mask = 1; mask < 1 << n; mask++) expect(runDeutschJozsa(parityOracle(n, mask), n).probAllZero).toBeCloseTo(0, 9);
      for (let seed = 1; seed <= 5; seed++) expect(runDeutschJozsa(randomBalanced(n, seeded(seed)), n).probAllZero).toBeCloseTo(0, 9);
    }
  });

  it('matches the closed form even when the promise is broken', () => {
    const tables: FBit[][] = [[1, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0]];
    for (const f of tables) {
      const n = Math.log2(f.length);
      expect(runDeutschJozsa(f, n).probAllZero).toBeCloseTo(analyticAllZero(f), 9);
    }
  });

  it('the oracle flips the ancilla only where f = 1 and keeps the state normalised', () => {
    const s = new QuantumStateVector(3).applyX(0); // x = 01, ancilla 0
    applyOracle(s, [0, 0, 0, 0], 2);
    expect(s.getProbabilityMap()).toEqual({ '001': 1 });
    const u = new QuantumStateVector(3).applyX(0);
    applyOracle(u, [0, 1, 0, 0], 2); // f(01) = 1 flips the ancilla
    expect(u.getProbabilityMap()).toEqual({ '101': 1 });
    expect(runDeutschJozsa(randomBalanced(3, seeded(9)), 3).final.isNormalized()).toBe(true);
  });

  it('a balanced result is never all zeros and the input distribution adds up to 1', () => {
    const dist = inputDistribution(runDeutschJozsa(parityOracle(2, 3), 2).final, 2);
    expect(dist[0]).toBeCloseTo(0, 9);
    expect(dist.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });

  it('classical worst case is 2^(n-1) + 1 queries', () => {
    expect([1, 2, 3, 4].map(classicalWorstCase)).toEqual([2, 3, 5, 9]);
  });
});

describe('Grover', () => {
  it('simulation matches sin^2((2k+1) theta) for several sizes and mark counts', () => {
    for (const [n, marked] of [[2, [1]], [3, [5]], [3, [1, 6]], [4, [9]], [4, [0, 3, 12]]] as [number, number[]][]) {
      for (let k = 0; k <= 6; k++) {
        const p = successProbability(runGrover(n, marked, k), marked);
        expect(p).toBeCloseTo(theoreticalProbability(n, marked.length, k), 9);
      }
    }
  });

  it('two qubits and one marked item are found with certainty after one iteration', () => {
    expect(successProbability(runGrover(2, [2], 1), [2])).toBeCloseTo(1, 9);
  });

  it('eight items: two iterations are best (94.5%), a third overshoots to 33%', () => {
    expect(optimalIterations(3, 1)).toBe(2);
    expect(successProbability(runGrover(3, [4], 2), [4])).toBeCloseTo(0.9453, 3);
    expect(successProbability(runGrover(3, [4], 3), [4])).toBeCloseTo(0.3301, 3);
  });

  it('the best iteration count grows like the square root of N', () => {
    expect([2, 3, 4].map((n) => optimalIterations(n, 1))).toEqual([1, 2, 3]);
    expect(optimalIterations(4, 4)).toBe(1);
  });

  it('the state stays normalised and the mean inversion equals the gate version up to a global sign', () => {
    expect(runGrover(4, [3, 8], 2).isNormalized()).toBe(true);
    const a = uniformState(3);
    a.amplitudes[2] = { re: -a.amplitudes[2].re, im: 0 };
    const viaMean = a.clone();
    applyDiffusion(viaMean);
    // gate version: H^n, flip every state except |0..0>, H^n  ==  inversion about the mean (up to a global sign)
    const viaGates = a.clone();
    for (let q = 0; q < 3; q++) viaGates.applyH(q);
    viaGates.amplitudes = viaGates.amplitudes.map((c, i) => (i === 0 ? c : { re: -c.re, im: -c.im }));
    for (let q = 0; q < 3; q++) viaGates.applyH(q);
    const sign = Math.sign(viaMean.amplitudes[0].re * viaGates.amplitudes[0].re) || 1;
    viaMean.amplitudes.forEach((c, i) => {
      expect(c.re).toBeCloseTo(sign * viaGates.amplitudes[i].re, 9);
    });
  });

  it('classical search needs about N/2 guesses', () => {
    expect(classicalExpectedGuesses(4, 1)).toBeCloseTo(8.5, 9);
  });
});
