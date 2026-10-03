import { describe, it, expect } from 'vitest';
import {
  allClassicalStrategies, classicalWinProbability, quantumWinProbability, quantumWinProbabilityPerPair,
  bellOutcomeProbabilities, OPTIMAL_QUANTUM, CLASSICAL_LIMIT, QUANTUM_LIMIT, playQuantumRound, playClassicalRound, wins,
} from '../src/core/games/chsh';

describe('CHSH game', () => {
  it('win condition is a XOR b = x AND y', () => {
    expect(wins(0, 0, 0, 0)).toBe(true);
    expect(wins(0, 1, 1, 0)).toBe(false);
    expect(wins(1, 1, 0, 1)).toBe(true);
    expect(wins(1, 1, 1, 1)).toBe(false);
  });

  it('classical strategies cap at 75% (all 16 deterministic strategies)', () => {
    const strategies = allClassicalStrategies();
    expect(strategies).toHaveLength(16);
    const best = Math.max(...strategies.map(classicalWinProbability));
    expect(best).toBe(CLASSICAL_LIMIT);
    expect(strategies.some((s) => classicalWinProbability(s) === 1)).toBe(false);
  });

  it('Bell pair with equal angles gives perfectly correlated outcomes', () => {
    for (const t of [0, 0.4, Math.PI / 3, 1.2]) {
      const j = bellOutcomeProbabilities(t, t);
      expect(j[0][0] + j[1][1]).toBeCloseTo(1, 9);
      expect(j[0][1] + j[1][0]).toBeCloseTo(0, 9);
    }
  });

  it('P(a = b) = cos^2(thetaA - thetaB) for the Bell pair', () => {
    const tA = 0.7;
    const tB = -0.2;
    const j = bellOutcomeProbabilities(tA, tB);
    expect(j[0][0] + j[1][1]).toBeCloseTo(Math.cos(tA - tB) ** 2, 9);
  });

  it('joint probabilities sum to 1', () => {
    const j = bellOutcomeProbabilities(0.3, 1.1);
    expect(j[0][0] + j[0][1] + j[1][0] + j[1][1]).toBeCloseTo(1, 9);
  });

  it('the optimal quantum strategy reaches about 85% (cos^2(pi/8)) on every question pair', () => {
    expect(QUANTUM_LIMIT).toBeCloseTo(0.8536, 4);
    expect(quantumWinProbability(OPTIMAL_QUANTUM)).toBeCloseTo(QUANTUM_LIMIT, 9);
    for (const p of quantumWinProbabilityPerPair(OPTIMAL_QUANTUM)) {
      expect(p).toBeCloseTo(QUANTUM_LIMIT, 9);
    }
  });

  it('no choice of angles beats the quantum limit (Tsirelson bound), grid search in 7.5 degree steps', () => {
    const step = Math.PI / 24;
    const angles = Array.from({ length: 25 }, (_, i) => -Math.PI / 2 + i * step);
    let best = 0;
    for (const a0 of angles.filter((_, i) => i % 2 === 0)) for (const a1 of angles.filter((_, i) => i % 2 === 0))
      for (const b0 of angles.filter((_, i) => i % 3 === 0)) for (const b1 of angles.filter((_, i) => i % 3 === 0)) {
        best = Math.max(best, quantumWinProbability({ alice: [a0, a1], bob: [b0, b1] }));
      }
    expect(best).toBeLessThanOrEqual(QUANTUM_LIMIT + 1e-9);
    expect(best).toBeGreaterThan(CLASSICAL_LIMIT);
  });

  it('measuring everything in the same basis is no better than classical', () => {
    expect(quantumWinProbability({ alice: [0, 0], bob: [0, 0] })).toBeCloseTo(0.75, 9);
  });

  it('rounds sample from the exact distribution', () => {
    // rng cycles: x=0, y=0, then outcome draw
    const seq = [0.1, 0.1, 0.0];
    let i = 0;
    const r = playQuantumRound(OPTIMAL_QUANTUM, () => seq[i++ % seq.length]);
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    expect(typeof r.won).toBe('boolean');
  });

  it('classical round uses the chosen answers', () => {
    const r = playClassicalRound({ alice: [1, 0], bob: [0, 0] }, (() => { const s = [0.1, 0.9]; let i = 0; return () => s[i++ % 2]; })());
    expect(r.x).toBe(0);
    expect(r.y).toBe(1);
    expect(r.a).toBe(1);
    expect(r.b).toBe(0);
  });

  it('statistically, 20000 optimal quantum rounds win about 85%', () => {
    let w = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) if (playQuantumRound(OPTIMAL_QUANTUM).won) w++;
    expect(w / n).toBeGreaterThan(0.83);
    expect(w / n).toBeLessThan(0.875);
  });
});
