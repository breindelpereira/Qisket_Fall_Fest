import { exchangeMHz, swapChance, swapTimeNs, entanglementAfter } from '../hardware/exchange';

/**
 * Dot Tuner: a silicon spin-qubit device is not ready to use. Every dot is a little different, so before a gate can run
 * you have to set each dot's gate voltage so it holds exactly one electron, and set the barrier between the dots so the
 * exchange coupling gives the pulse you want.
 *
 *   dot occupation   0 electrons below its window, 1 inside it, 2 above it (windows differ per dot and per device)
 *   exchange J       J = J0 exp(-k (B + offset))      the device has its own offset, hidden from the player
 *   gate quality     1 - mean |swap chance - wanted|, averaged over a wobble of the barrier (charge noise)
 *
 * Simplified: two dots, a textbook exchange law, and a three-point average for noise. The device offsets are the point:
 * the same settings do not work on two devices, which is why tuning is the hard part of scaling this approach.
 */
export type GateKind = 'swap' | 'sqrt';

export interface DotLevel {
  id: string;
  title: string;
  story: string;
  /** Voltage windows (in mV) in which each dot holds one electron. */
  window1: [number, number];
  window2: [number, number];
  /** This device's barrier offset, added to the barrier setting. */
  offset: number;
  /** Barrier wobble (charge noise), in barrier units. */
  noise: number;
  /** A fixed pulse length in ns, if the electronics only make one; otherwise the player sets it. */
  fixedPulseNs: number | null;
  gate: GateKind;
  /** The quality the gate must reach. */
  quality: number;
}

export const VOLTAGE_MAX = 100;
export const BARRIER_MAX = 8;
export const PULSE_MIN = 2;
export const PULSE_MAX = 400;

export const wantedSwap = (gate: GateKind): number => (gate === 'swap' ? 1 : 0.5);

/** How many electrons a dot holds at a gate voltage, given its window. */
export function occupation(voltage: number, window: [number, number]): 0 | 1 | 2 {
  if (voltage < window[0]) return 0;
  return voltage <= window[1] ? 1 : 2;
}

export interface Settings {
  v1: number;
  v2: number;
  barrier: number;
  pulseNs: number;
}

export const couplingMHz = (level: DotLevel, barrier: number): number => exchangeMHz(Math.max(0, barrier + level.offset));

/** Gate quality at these settings: 1 is perfect, and a wobbling barrier pulls it down. */
export function quality(level: DotLevel, s: Settings): number {
  const wanted = wantedSwap(level.gate);
  const pulse = level.fixedPulseNs ?? s.pulseNs;
  const samples = [-level.noise, 0, level.noise].map((d) => swapChance(couplingMHz(level, s.barrier + d), pulse));
  return 1 - samples.reduce((sum, v) => sum + Math.abs(v - wanted), 0) / samples.length;
}

export interface TunerResult {
  occupancy: [number, number];
  charged: boolean;
  quality: number;
  /** Entanglement the pulse leaves (relevant for the square root of SWAP). */
  entanglement: number;
  passed: boolean;
}

export function evaluate(level: DotLevel, s: Settings): TunerResult {
  const occupancy: [number, number] = [occupation(s.v1, level.window1), occupation(s.v2, level.window2)];
  const charged = occupancy[0] === 1 && occupancy[1] === 1;
  const q = quality(level, s);
  const pulse = level.fixedPulseNs ?? s.pulseNs;
  return {
    occupancy,
    charged,
    quality: q,
    entanglement: entanglementAfter(couplingMHz(level, s.barrier), pulse),
    passed: charged && q >= level.quality,
  };
}

/** The barrier setting that gives the wanted gate for a pulse length, with no noise (null if it is out of reach). */
export function idealBarrier(level: DotLevel, pulseNs: number): number | null {
  // a full swap takes t = 1000 / (2 J) ns, so J = 500 / t; the square root of SWAP takes half as long, so J = 250 / t
  const j = (level.gate === 'swap' ? 500 : 250) / pulseNs;
  const barrier = Math.log(50 / j) / 0.9 - level.offset;
  return barrier >= 0 && barrier <= BARRIER_MAX ? barrier : null;
}

/** A pulse and a barrier that clear the quality bar with the dots charged, found by scanning (the tests use it). */
export function solve(level: DotLevel): Settings | null {
  const pulses = level.fixedPulseNs !== null ? [level.fixedPulseNs] : [5, 10, 20, 40, 80, 160];
  let best: { s: Settings; q: number } | null = null;
  for (const pulseNs of pulses) {
    for (let b = 0; b <= BARRIER_MAX + 1e-9; b += 0.02) {
      const s: Settings = { v1: (level.window1[0] + level.window1[1]) / 2, v2: (level.window2[0] + level.window2[1]) / 2, barrier: b, pulseNs };
      if (!evaluate(level, s).passed) continue;
      const q = quality(level, s);
      if (!best || q > best.q) best = { s, q };
    }
  }
  return best ? best.s : null;
}

/** 3 stars for a quality above 0.99, 2 above 0.97, 1 for a pass. */
export function stars(_level: DotLevel, r: TunerResult): 0 | 1 | 2 | 3 {
  if (!r.passed) return 0;
  return r.quality >= 0.99 ? 3 : r.quality >= 0.97 ? 2 : 1;
}

export const LEVELS: DotLevel[] = [
  {
    id: 'charge', title: 'One electron each', story: 'Find the voltages where each dot holds a single electron, then let the spins swap.',
    window1: [30, 45], window2: [55, 72], offset: 0, noise: 0, fixedPulseNs: null, gate: 'swap', quality: 0.95,
  },
  {
    id: 'entangle', title: 'Half a swap', story: 'A new device with its own offsets. This time the pulse has to be the square root of SWAP, which entangles.',
    window1: [18, 31], window2: [40, 58], offset: 0.6, noise: 0, fixedPulseNs: null, gate: 'sqrt', quality: 0.95,
  },
  {
    id: 'fixed_pulse', title: 'One fixed pulse', story: 'The control electronics only make a 20 ns pulse. Tune the barrier until a full swap fits in it.',
    window1: [42, 58], window2: [26, 40], offset: -0.4, noise: 0, fixedPulseNs: 20, gate: 'swap', quality: 0.97,
  },
  {
    id: 'slow_pulse', title: 'A slow pulse', story: 'Only a 50 ns pulse is available, so the coupling has to be small. A small coupling means a high barrier.',
    window1: [10, 22], window2: [62, 78], offset: 0.9, noise: 0, fixedPulseNs: 50, gate: 'sqrt', quality: 0.97,
  },
  {
    id: 'noisy', title: 'A noisy barrier', story: 'The barrier wobbles. The best settings are not exactly the ideal ones: look at the quality, not only at J.',
    window1: [34, 48], window2: [48, 60], offset: 0.2, noise: 0.08, fixedPulseNs: 30, gate: 'swap', quality: 0.93,
  },
];

export const fullSwapNs = swapTimeNs;
