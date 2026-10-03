import { simulate } from '../optical/interferometer';
import type { OpticalElement, OpticalResult } from '../optical/interferometer';

const PI = Math.PI;

export type Choice = OpticalElement;

export interface Slot {
  /** What the player may place here; tapping cycles through these in order. */
  choices: Choice[];
}

export interface Goal {
  label: string;
  /** Obstacles the game adds on top of the player's layout for this check. */
  obstacle?: { slot: number; path: 0 | 1 };
  port: 0 | 1;
  min?: number;
  max?: number;
}

export interface EscapeLevel {
  id: number;
  title: string;
  story: string;
  hint: string;
  slots: Slot[];
  goals: Goal[];
  /** Beam splitters that must be placed, so that doing nothing can never count as a solution. */
  minBeamSplitters?: number;
}

const EMPTY: Choice = { type: 'empty' };
const BS: Choice = { type: 'bs' };
const phases = (...phis: number[]): Choice[] => phis.map((phi) => ({ type: 'phase', phi }));
const SHIFTER = phases(0, PI / 2, PI, (3 * PI) / 2);

export const LEVELS: EscapeLevel[] = [
  {
    id: 1,
    title: 'The Fork',
    story: 'A single photon is locked in the lab. Make it come out of BOTH doors with equal chance.',
    hint: 'A beam splitter sends the photon down both paths at once.',
    slots: [{ choices: [EMPTY, BS] }],
    goals: [
      { label: 'Top door ~50%', port: 0, min: 0.45, max: 0.55 },
      { label: 'Bottom door ~50%', port: 1, min: 0.45, max: 0.55 },
    ],
  },
  {
    id: 2,
    title: 'Guaranteed Exit',
    story: 'Send the photon out of the BOTTOM door every single time. Two forks should make it 25% each... or will they?',
    hint: 'Try a beam splitter in both slots. The two paths interfere.',
    slots: [{ choices: [EMPTY, BS] }, { choices: [EMPTY, BS] }],
    goals: [{ label: 'Bottom door 100%', port: 1, min: 0.99 }],
  },
  {
    id: 3,
    title: 'Flip the Dark Door',
    story: 'Now the TOP door must be the guaranteed exit. You may twist the phase of the lower path.',
    hint: 'Keep the two beam splitters and tune the phase shifter in the middle.',
    slots: [{ choices: [EMPTY, BS] }, { choices: SHIFTER }, { choices: [EMPTY, BS] }],
    goals: [{ label: 'Top door 100%', port: 0, min: 0.99 }],
    minBeamSplitters: 2,
  },
  {
    id: 4,
    title: 'Dial a Probability',
    story: 'The exit scanner wants a perfect coin flip: top and bottom 50% each, using interference alone.',
    hint: 'A quarter-turn of phase sits exactly between bright and dark.',
    slots: [{ choices: [EMPTY, BS] }, { choices: SHIFTER }, { choices: [EMPTY, BS] }],
    goals: [
      { label: 'Top door ~50%', port: 0, min: 0.45, max: 0.55 },
      { label: 'Bottom door ~50%', port: 1, min: 0.45, max: 0.55 },
    ],
    minBeamSplitters: 2,
  },
  {
    id: 5,
    title: 'The Saboteur',
    story: 'A saboteur may have placed a blocker in the lower arm. Tune the lab so the TOP door never clicks when the arm is clear, but can click if the arm is blocked.',
    hint: 'First make the top door dark. A blocker destroys the interference, so light leaks into it.',
    slots: [{ choices: [EMPTY, BS] }, { choices: SHIFTER }, { choices: [EMPTY, BS] }],
    goals: [
      { label: 'Clear arm: top door dark', port: 0, max: 0.01 },
      { label: 'Blocked arm: top door can click', obstacle: { slot: 1, path: 1 }, port: 0, min: 0.2 },
    ],
  },
  {
    id: 6,
    title: 'Triple Maze',
    story: 'Three splitters, two phase shifters. Make the TOP door a guaranteed exit.',
    hint: 'Think of it as two interferometers in a row. Each phase shifter can undo the last.',
    slots: [
      { choices: [EMPTY, BS] }, { choices: SHIFTER }, { choices: [EMPTY, BS] },
      { choices: SHIFTER }, { choices: [EMPTY, BS] },
    ],
    goals: [{ label: 'Top door 100%', port: 0, min: 0.99 }],
    minBeamSplitters: 3,
  },
];

/** The photon-lab layout for a level: player's picks, optionally with a saboteur's blocker spliced in. */
export function buildLayout(picks: Choice[], obstacle?: { slot: number; path: 0 | 1 }): OpticalElement[] {
  const layout: OpticalElement[] = [];
  picks.forEach((p, i) => {
    layout.push(p);
    if (obstacle && obstacle.slot === i) layout.push({ type: 'block', path: obstacle.path });
  });
  return layout;
}

/** Slot 1 with an obstacle means: the blocker sits right after the player's element in that slot. */
export function runGoal(picks: Choice[], goal: Goal): OpticalResult {
  return simulate(buildLayout(picks, goal.obstacle));
}

export function goalMet(picks: Choice[], goal: Goal): boolean {
  const p = runGoal(picks, goal).out[goal.port];
  return (goal.min === undefined || p >= goal.min) && (goal.max === undefined || p <= goal.max);
}

export function levelSolved(level: EscapeLevel, picks: Choice[]): boolean {
  const splitters = picks.filter((p) => p.type === 'bs').length;
  if (splitters < (level.minBeamSplitters ?? 0)) return false;
  return level.goals.every((g) => goalMet(picks, g));
}

export function defaultPicks(level: EscapeLevel): Choice[] {
  return level.slots.map((s) => s.choices[0]);
}

/** Exhaustive search over all layouts. Levels are tiny, so this is cheap. Returns null if unsolvable. */
export function findSolution(level: EscapeLevel): Choice[] | null {
  const walk = (i: number, acc: Choice[]): Choice[] | null => {
    if (i === level.slots.length) return levelSolved(level, acc) ? acc : null;
    for (const c of level.slots[i].choices) {
      const r = walk(i + 1, [...acc, c]);
      if (r) return r;
    }
    return null;
  };
  return walk(0, []);
}

export function describeChoice(c: Choice): string {
  switch (c.type) {
    case 'empty': return 'Empty';
    case 'bs': return 'Beam splitter';
    case 'phase': return `Phase ${Math.round((c.phi * 180) / PI)}°`;
    case 'block': return 'Blocker';
  }
}
