import { Complex, Gates, QuantumStateVector, computeBlochCoordinates } from '../circuit';
import type { BlochCoordinates } from '../circuit';

/**
 * Hold the Bloch Sphere: the phone's tilt is a CLASSICAL sensor, used only as a control. It is turned into three rotation
 * angles, and the qubit's state is then computed by the same state-vector engine as everywhere else: the rotations are the
 * gates Rx, Ry and Rz, which turn the Bloch vector about the three axes.
 *
 *   tilt forward or back  -> rotation about X
 *   tilt sideways         -> rotation about Y
 *   twist flat on a table -> rotation about Z
 *
 * Pure functions with no sensor access, so they are tested with made-up readings. The sensor is read in utils/motion.ts.
 */
export interface Orientation {
  /** Compass-like twist about the vertical axis, degrees (null when the sensor does not report it). */
  alpha: number | null;
  /** Front-to-back tilt, degrees. */
  beta: number | null;
  /** Left-to-right tilt, degrees. */
  gamma: number | null;
}

/** What the phone read at the moment the learner said "this is my zero". */
export interface Calibration {
  alpha: number;
  beta: number;
  gamma: number;
}

export const NO_CALIBRATION: Calibration = { alpha: 0, beta: 0, gamma: 0 };

/** Three rotation angles in radians. */
export interface Pose {
  x: number;
  y: number;
  z: number;
}

export const ZERO_POSE: Pose = { x: 0, y: 0, z: 0 };

const DEG = Math.PI / 180;
/** A tilt smaller than this is treated as holding still, so the vector does not creep. */
export const DEADZONE_DEG = 2;

export const calibrationFrom = (r: Orientation): Calibration => ({ alpha: r.alpha ?? 0, beta: r.beta ?? 0, gamma: r.gamma ?? 0 });

/** The smallest signed difference of two angles in degrees, in (-180, 180]: 359 against 1 is -2, not 358. */
export function angleDifference(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Takes a small tilt to zero (the dead zone) and keeps the rest, so there is no jump at the edge of the zone. */
function dead(deg: number): number {
  const m = Math.abs(deg);
  return m <= DEADZONE_DEG ? 0 : Math.sign(deg) * (m - DEADZONE_DEG);
}

/**
 * The three rotation angles for a reading, relative to the calibration. Tilts are limited to 90 degrees (a phone held on
 * its edge is the most it can show), and the twist can go all the way round.
 */
export function poseFrom(reading: Orientation, calibration: Calibration = NO_CALIBRATION): Pose {
  const beta = clamp(angleDifference(reading.beta ?? calibration.beta, calibration.beta), -90, 90);
  const gamma = clamp(angleDifference(reading.gamma ?? calibration.gamma, calibration.gamma), -90, 90);
  const alpha = angleDifference(reading.alpha ?? calibration.alpha, calibration.alpha);
  return { x: dead(beta) * DEG, y: dead(gamma) * DEG, z: dead(alpha) * DEG };
}

/** Low-pass filter: moves `k` of the way (0 to 1) from the previous pose to the new one. The twist takes the short way round. */
export function smooth(previous: Pose | null, next: Pose, k = 0.25): Pose {
  if (!previous) return next;
  const wrap = (a: number, b: number) => {
    let d = b - a;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return a + d * k;
  };
  return { x: previous.x + (next.x - previous.x) * k, y: previous.y + (next.y - previous.y) * k, z: wrap(previous.z, next.z) };
}

export interface BlochPoint {
  /** Angle down from the north pole, degrees. */
  theta: number;
  /** Angle round the equator, degrees. */
  phi: number;
}

/** The state at a point on the sphere: Ry(theta) then Rz(phi) applied to |0>. */
export function stateAt(point: BlochPoint): QuantumStateVector {
  const state = new QuantumStateVector(1);
  state.applyGate(Gates.Ry(point.theta * DEG), 0);
  state.applyGate(Gates.Rz(point.phi * DEG), 0);
  return state;
}

/** The state after the pose is applied to a starting state: Rx, then Ry, then Rz, all computed by the engine. */
export function stateAfter(start: QuantumStateVector, pose: Pose): QuantumStateVector {
  const state = start.clone();
  state.applyGate(Gates.Rx(pose.x), 0);
  state.applyGate(Gates.Ry(pose.y), 0);
  state.applyGate(Gates.Rz(pose.z), 0);
  return state;
}

export const blochOf = (state: QuantumStateVector): BlochCoordinates => computeBlochCoordinates(state.amplitudes[0], state.amplitudes[1]);

/** |<a|b>|^2: 1 for the same state, 0 for opposite points on the sphere. */
export function fidelity(a: QuantumStateVector, b: QuantumStateVector): number {
  let re = 0;
  let im = 0;
  for (let i = 0; i < 2; i++) {
    const p = Complex.mul(Complex.conj(a.amplitudes[i]), b.amplitudes[i]);
    re += p.re;
    im += p.im;
  }
  return Math.min(1, re * re + im * im);
}

/** The angle between two states on the sphere, in degrees (the fidelity is cos^2 of half of it). */
export const angleOnSphere = (f: number): number => 2 * Math.acos(Math.sqrt(clamp(f, 0, 1))) / DEG;

/** The fidelity that corresponds to a tolerance ring of `degrees` on the sphere. */
export const fidelityForRing = (degrees: number): number => Math.cos((degrees * DEG) / 2) ** 2;

/**
 * "Hold it there": counts how long the state has stayed inside the ring. Leaving the ring starts the count again, so
 * passing through the target by accident does not count.
 */
export interface Hold {
  since: number | null;
  /** Milliseconds held so far. */
  heldMs: number;
}

export const NOT_HELD: Hold = { since: null, heldMs: 0 };

export function updateHold(hold: Hold, inside: boolean, nowMs: number): Hold {
  if (!inside) return NOT_HELD;
  const since = hold.since ?? nowMs;
  return { since, heldMs: nowMs - since };
}

export interface TiltLevel {
  id: string;
  title: string;
  story: string;
  start: BlochPoint;
  target: BlochPoint;
  /** Radius of the tolerance ring, in degrees on the sphere. */
  ringDegrees: number;
  /** How long to hold the state in the ring, in milliseconds. */
  holdMs: number;
}

export const LEVELS: TiltLevel[] = [
  {
    id: 'tilt_forward', title: 'Tip it forward', story: 'The qubit starts at the north pole. Tilt the phone forward to bring it down to the glowing target.',
    start: { theta: 0, phi: 0 }, target: { theta: 90, phi: -90 }, ringDegrees: 18, holdMs: 800,
  },
  {
    id: 'sideways', title: 'Roll to the side', story: 'Now the qubit starts on the equator. Roll the phone sideways to swing it up towards the pole.',
    start: { theta: 90, phi: 0 }, target: { theta: 40, phi: 0 }, ringDegrees: 16, holdMs: 800,
  },
  {
    id: 'twist', title: 'A quarter turn', story: 'Staying on the equator, twist the phone flat on a table to turn the qubit a quarter of the way round.',
    start: { theta: 90, phi: 0 }, target: { theta: 90, phi: 90 }, ringDegrees: 16, holdMs: 800,
  },
  {
    id: 'other_side', title: 'The other pole', story: 'The target is on the far side of the sphere. You will need a big tilt, and a little patience.',
    start: { theta: 20, phi: 30 }, target: { theta: 160, phi: 30 }, ringDegrees: 16, holdMs: 800,
  },
  {
    id: 'two_moves', title: 'Two moves', story: 'The target needs a tilt and a twist together. Move one thing at a time and watch the ring.',
    start: { theta: 90, phi: 0 }, target: { theta: 45, phi: 135 }, ringDegrees: 14, holdMs: 900,
  },
  {
    id: 'steady_hands', title: 'Steady hands', story: 'A smaller ring and a longer hold. Small movements: let the filter settle.',
    start: { theta: 60, phi: 200 }, target: { theta: 120, phi: 20 }, ringDegrees: 10, holdMs: 1200,
  },
];
