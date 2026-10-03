import { Gates, QuantumStateVector } from '../circuit';

/** Shots + Histogram lab: sample a known state many times and compare what we see with what the maths predicts. */
export type ShotsPreset = 'tilted' | 'bell' | 'uniform3';

export const PRESET_QUBITS: Record<ShotsPreset, number> = { tilted: 1, bell: 2, uniform3: 3 };

/** `tilted` is Ry(theta)|0>, which gives P(1) = sin^2(theta/2); the others ignore theta. */
export function buildState(preset: ShotsPreset, theta = Math.PI / 2): QuantumStateVector {
  if (preset === 'tilted') return new QuantumStateVector(1).applyGate(Gates.Ry(theta), 0);
  if (preset === 'bell') return new QuantumStateVector(2).applyH(0).applyCNOT(0, 1);
  return new QuantumStateVector(3).applyH(0).applyH(1).applyH(2);
}

export interface HistogramRow {
  outcome: string;
  expected: number;
  count: number;
  observed: number;
}

/** One row per possible outcome (including ones never seen), in binary order. */
export function histogramRows(state: QuantumStateVector, counts: Record<string, number>): HistogramRow[] {
  const shots = Object.values(counts).reduce((a, b) => a + b, 0);
  return state.getProbabilities().map((expected, i) => {
    const outcome = i.toString(2).padStart(state.numQubits, '0');
    const count = counts[outcome] ?? 0;
    return { outcome, expected, count, observed: shots === 0 ? 0 : count / shots };
  });
}

export const addCounts = (a: Record<string, number>, b: Record<string, number>): Record<string, number> => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] ?? 0) + v;
  return out;
};

export const totalShots = (counts: Record<string, number>): number => Object.values(counts).reduce((a, b) => a + b, 0);

/** Typical size of the statistical wobble in a frequency estimated from n shots: sqrt(p(1-p)/n). */
export const standardError = (p: number, n: number): number => (n <= 0 ? 1 : Math.sqrt((p * (1 - p)) / n));

/** Largest gap between a seen frequency and its predicted probability. */
export const maxDeviation = (rows: HistogramRow[]): number => rows.reduce((m, r) => Math.max(m, Math.abs(r.observed - r.expected)), 0);

/** Shots needed so the typical wobble of a 50/50 outcome falls to `target` (e.g. 0.01 needs 2500). */
export const shotsForPrecision = (target: number): number => Math.ceil(0.25 / (target * target));
