import { cleanChance } from '../hardware/metrics';

/**
 * Coherence Race: pick how fast to run the gates of a circuit. Slow gates give the qubit time to forget (decoherence error
 * grows with the gate time); very fast gates are driven hard and are less accurate (a control error that grows as the
 * gate gets shorter). The sum has a sweet spot, and the qubit's T2 is a hard wall on the whole circuit.
 *
 *   error per gate  e(t) = (t / T2) / 2  +  c / t^2        t in nanoseconds, T2 in microseconds
 *   circuit length  N * t   must be at most T2 (the state is gone after that)
 *   success         (1 - e(t))^N
 *
 * The two terms are an illustrative model, not a fit to a device: real errors have more causes (see the Qubit Metrics Lab).
 */
export interface RaceLevel {
  id: string;
  title: string;
  story: string;
  /** How many gates the circuit has. */
  gates: number;
  /** The qubit's phase memory in microseconds. */
  t2Us: number;
  /** Strength of the control error: c in c / t^2 (with t in ns). */
  control: number;
  /** The chance the whole circuit must run clean to count. */
  target: number;
  /** The gate times on offer, in nanoseconds. */
  options: number[];
}

export const OPTIONS = [10, 20, 40, 80, 160, 320, 640, 1280];

export const LEVELS: RaceLevel[] = [
  {
    id: 'warm_up', title: 'Warm-up lap', story: 'A short circuit on a decent qubit. Several speeds clear the bar: find the one that wins by the most.',
    gates: 50, t2Us: 100, control: 10, target: 0.88, options: OPTIONS,
  },
  {
    id: 'long_haul', title: 'The long haul', story: 'Twenty times as many gates. Going slow now runs out of qubit lifetime, going fast is too sloppy.',
    gates: 1000, t2Us: 300, control: 3.4, target: 0.6, options: OPTIONS,
  },
  {
    id: 'short_memory', title: 'Short memory', story: 'A qubit that forgets within 20 microseconds. The slowest settings cannot even finish the circuit.',
    gates: 100, t2Us: 20, control: 6.4, target: 0.7, options: OPTIONS,
  },
  {
    id: 'sloppy_control', title: 'Sloppy control', story: "This machine's fast gates are very inaccurate. Slow down, but not so far that the qubit fades.",
    gates: 300, t2Us: 500, control: 131, target: 0.7, options: OPTIONS,
  },
  {
    id: 'squeezed', title: 'Squeezed', story: 'A lot of gates, a medium lifetime and a high bar. Only one setting clears it.',
    gates: 2000, t2Us: 800, control: 10.2, target: 0.5, options: OPTIONS,
  },
];

/** Error of one gate that lasts `tNs` nanoseconds. */
export function gateError(tNs: number, t2Us: number, control: number): number {
  const decoherence = tNs / (t2Us * 1000) / 2;
  return Math.min(1, decoherence + control / (tNs * tNs));
}

export interface RaceResult {
  /** Gate time chosen, ns. */
  t: number;
  error: number;
  /** Total circuit time in microseconds. */
  totalUs: number;
  /** True when the circuit fits inside T2. */
  fits: boolean;
  /** The chance the whole circuit runs without an error (0 if it does not fit). */
  success: number;
  passed: boolean;
}

export function run(level: RaceLevel, tNs: number): RaceResult {
  const error = gateError(tNs, level.t2Us, level.control);
  const totalUs = (level.gates * tNs) / 1000;
  const fits = totalUs <= level.t2Us;
  const success = fits ? cleanChance(level.gates, error) : 0;
  return { t: tNs, error, totalUs, fits, success, passed: fits && success >= level.target };
}

/** The best option on offer and its result. */
export function best(level: RaceLevel): RaceResult {
  return level.options.map((t) => run(level, t)).reduce((a, b) => (b.success > a.success ? b : a));
}

/** 3 stars for the best setting (or within a hair of it), 2 for a pass, 1 for a pass that barely made it. */
export function stars(level: RaceLevel, result: RaceResult): 0 | 1 | 2 | 3 {
  if (!result.passed) return 0;
  const top = best(level).success;
  if (result.success >= top - 1e-9) return 3;
  if (result.success >= top * 0.85) return 2;
  return 1;
}
