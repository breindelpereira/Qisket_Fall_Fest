import { Gates, QuantumStateVector } from '../circuit';

/**
 * The CHSH game. A referee sends Alice a bit x and Bob a bit y. Without communicating they reply a and b.
 * They win when a XOR b equals x AND y.
 */
export type Bit = 0 | 1;

export const QUESTION_PAIRS: [Bit, Bit][] = [[0, 0], [0, 1], [1, 0], [1, 1]];

export const wins = (x: Bit, y: Bit, a: Bit, b: Bit): boolean => ((a ^ b) as Bit) === ((x & y) as Bit);

/** A deterministic classical strategy: Alice's answer to x=0,1 and Bob's answer to y=0,1. */
export interface ClassicalStrategy {
  alice: [Bit, Bit];
  bob: [Bit, Bit];
}

export function classicalWinsPerPair(s: ClassicalStrategy): boolean[] {
  return QUESTION_PAIRS.map(([x, y]) => wins(x, y, s.alice[x], s.bob[y]));
}

export function classicalWinProbability(s: ClassicalStrategy): number {
  return classicalWinsPerPair(s).filter(Boolean).length / 4;
}

export function allClassicalStrategies(): ClassicalStrategy[] {
  const bits: Bit[] = [0, 1];
  const out: ClassicalStrategy[] = [];
  for (const a0 of bits) for (const a1 of bits) for (const b0 of bits) for (const b1 of bits) {
    out.push({ alice: [a0, a1], bob: [b0, b1] });
  }
  return out;
}

/**
 * Quantum strategy with a shared Bell pair (|00> + |11>)/sqrt(2).
 * Each measurement angle theta (radians) means: measure along cos(theta)|0> + sin(theta)|1>.
 */
export interface QuantumStrategy {
  alice: [number, number];
  bob: [number, number];
}

/** Joint outcome probabilities, indexed [a][b], for Alice's and Bob's chosen angles on the Bell pair. */
export function bellOutcomeProbabilities(thetaA: number, thetaB: number): [[number, number], [number, number]] {
  const state = new QuantumStateVector(2).applyH(0).applyCNOT(0, 1); // Alice = qubit 0, Bob = qubit 1
  // Rotating by Ry(-2*theta) then measuring in the computational basis measures along the angle theta.
  state.applyGate(Gates.Ry(-2 * thetaA), 0);
  state.applyGate(Gates.Ry(-2 * thetaB), 1);
  const p = state.getProbabilities(); // index = b*2 + a
  return [
    [p[0], p[2]],
    [p[1], p[3]],
  ];
}

export function quantumWinProbabilityPerPair(s: QuantumStrategy): number[] {
  return QUESTION_PAIRS.map(([x, y]) => {
    const joint = bellOutcomeProbabilities(s.alice[x], s.bob[y]);
    let p = 0;
    for (const a of [0, 1] as Bit[]) for (const b of [0, 1] as Bit[]) {
      if (wins(x, y, a, b)) p += joint[a][b];
    }
    return p;
  });
}

export function quantumWinProbability(s: QuantumStrategy): number {
  const per = quantumWinProbabilityPerPair(s);
  return per.reduce((a, b) => a + b, 0) / per.length;
}

export const CLASSICAL_LIMIT = 0.75;
/** Tsirelson's bound for this game: cos^2(pi/8). */
export const QUANTUM_LIMIT = Math.cos(Math.PI / 8) ** 2;

export const OPTIMAL_QUANTUM: QuantumStrategy = {
  alice: [0, Math.PI / 4],
  bob: [Math.PI / 8, -Math.PI / 8],
};

export interface RoundResult {
  x: Bit;
  y: Bit;
  a: Bit;
  b: Bit;
  won: boolean;
}

/** Plays one quantum round with random questions, sampling the outcomes from the exact joint distribution. */
export function playQuantumRound(s: QuantumStrategy, rng: () => number = Math.random): RoundResult {
  const x = (rng() < 0.5 ? 0 : 1) as Bit;
  const y = (rng() < 0.5 ? 0 : 1) as Bit;
  const joint = bellOutcomeProbabilities(s.alice[x], s.bob[y]);
  const r = rng();
  let acc = 0;
  let a: Bit = 1;
  let b: Bit = 1;
  outer: for (const ai of [0, 1] as Bit[]) for (const bi of [0, 1] as Bit[]) {
    acc += joint[ai][bi];
    if (r < acc) { a = ai; b = bi; break outer; }
  }
  return { x, y, a, b, won: wins(x, y, a, b) };
}

export function playClassicalRound(s: ClassicalStrategy, rng: () => number = Math.random): RoundResult {
  const x = (rng() < 0.5 ? 0 : 1) as Bit;
  const y = (rng() < 0.5 ? 0 : 1) as Bit;
  const a = s.alice[x];
  const b = s.bob[y];
  return { x, y, a, b, won: wins(x, y, a, b) };
}
