import { describe, it, expect } from 'vitest';
import { mulberry32 } from '../src/core/games/oracleDetective';
import { Complex } from '../src/core/circuit';
import * as Tilt from '../src/core/games/sensorControl';
import * as Shake from '../src/core/games/shakeMeasure';
import * as Pair from '../src/core/games/entangledPair';
import { OPTIMAL_QUANTUM } from '../src/core/games/chsh';
import { ACTIVITIES } from '../src/content/activities';
import { LESSONS } from '../src/content/lessons';
import { GAME_HELP } from '../src/content/gameHelp';
import { lessonFlow } from '../src/core/learn/flow';
import { isAppBuild } from '../src/utils/motion';

const rad = (d: number) => (d * Math.PI) / 180;
const reading = (alpha: number | null, beta: number | null, gamma: number | null): Tilt.Orientation => ({ alpha, beta, gamma });

describe('Hold the Bloch Sphere: from tilt to rotation', () => {
  it('holding the phone at the calibrated zero is no rotation, and tiny movements are ignored', () => {
    const cal = Tilt.calibrationFrom(reading(120, 35, -10));
    expect(Tilt.poseFrom(reading(120, 35, -10), cal)).toEqual(Tilt.ZERO_POSE);
    const p = Tilt.poseFrom(reading(121, 36, -9), cal);
    expect(p).toEqual(Tilt.ZERO_POSE); // a degree of wobble is inside the dead zone
  });

  it('tilts map to the three axes, with the dead zone taken off, and are limited to 90 degrees', () => {
    const p = Tilt.poseFrom(reading(0, 32, -17));
    expect(p.x).toBeCloseTo(rad(30), 9);
    expect(p.y).toBeCloseTo(rad(-15), 9);
    expect(p.z).toBe(0);
    expect(Tilt.poseFrom(reading(null, 120, null)).x).toBeCloseTo(rad(88), 9);
    expect(Tilt.poseFrom(reading(null, -150, null)).y).toBe(0);
    expect(Tilt.poseFrom(reading(null, null, null))).toEqual(Tilt.ZERO_POSE);
  });

  it('a twist takes the short way round the compass: 359 against 1 is two degrees', () => {
    expect(Tilt.angleDifference(359, 1)).toBe(-2);
    expect(Tilt.angleDifference(1, 359)).toBe(2);
    expect(Tilt.angleDifference(180, 0)).toBe(180);
    const cal = Tilt.calibrationFrom(reading(358, 0, 0));
    expect(Tilt.poseFrom(reading(10, 0, 0), cal).z).toBeCloseTo(rad(10), 9); // 12 degrees minus the dead zone
  });

  it('smoothing moves part of the way and never overshoots', () => {
    let pose = Tilt.smooth(null, { x: 0, y: 0, z: 0 });
    const target = { x: 1, y: -1, z: 0.5 };
    let last = 0;
    for (let i = 0; i < 40; i++) {
      pose = Tilt.smooth(pose, target, 0.25);
      expect(pose.x).toBeGreaterThanOrEqual(last);
      expect(pose.x).toBeLessThanOrEqual(1);
      last = pose.x;
    }
    expect(pose.x).toBeCloseTo(1, 3);
    // across the wrap the twist goes the short way, not through zero
    const across = Tilt.smooth({ x: 0, y: 0, z: rad(170) }, { x: 0, y: 0, z: rad(-170) }, 0.5);
    expect(Math.abs(across.z)).toBeGreaterThan(rad(170));
  });

  it('the rotations are the engine\'s gates: Rx(90 degrees) of the north pole lands on -y, Ry on +x', () => {
    const north = Tilt.stateAt({ theta: 0, phi: 0 });
    const viaX = Tilt.blochOf(Tilt.stateAfter(north, { x: rad(90), y: 0, z: 0 }));
    expect(viaX.y).toBeCloseTo(-1, 6);
    const viaY = Tilt.blochOf(Tilt.stateAfter(north, { x: 0, y: rad(90), z: 0 }));
    expect(viaY.x).toBeCloseTo(1, 6);
    const east = Tilt.stateAt({ theta: 90, phi: 0 });
    const viaZ = Tilt.blochOf(Tilt.stateAfter(east, { x: 0, y: 0, z: rad(90) }));
    expect(viaZ.y).toBeCloseTo(1, 6);
  });

  it('fidelity is 1 for the same state, 0 at the opposite pole, and ring and fidelity agree', () => {
    const a = Tilt.stateAt({ theta: 40, phi: 70 });
    expect(Tilt.fidelity(a, a)).toBeCloseTo(1, 9);
    expect(Tilt.fidelity(Tilt.stateAt({ theta: 0, phi: 0 }), Tilt.stateAt({ theta: 180, phi: 0 }))).toBeCloseTo(0, 9);
    const ring = 16;
    const edge = Tilt.fidelity(Tilt.stateAt({ theta: 0, phi: 0 }), Tilt.stateAt({ theta: ring, phi: 0 }));
    expect(edge).toBeCloseTo(Tilt.fidelityForRing(ring), 9);
    expect(Tilt.angleOnSphere(edge)).toBeCloseTo(ring, 6);
  });

  it('holding needs a steady stay inside the ring: leaving it starts the count again', () => {
    let h = Tilt.NOT_HELD;
    h = Tilt.updateHold(h, true, 1000);
    h = Tilt.updateHold(h, true, 1500);
    expect(h.heldMs).toBe(500);
    h = Tilt.updateHold(h, false, 1600);
    expect(h).toEqual(Tilt.NOT_HELD);
    h = Tilt.updateHold(h, true, 2000);
    expect(h.heldMs).toBe(0);
  });

  it('every level can be won with some pose, and none is already won at the start', () => {
    for (const level of Tilt.LEVELS) {
      const start = Tilt.stateAt(level.start);
      const target = Tilt.stateAt(level.target);
      const need = Tilt.fidelityForRing(level.ringDegrees);
      expect(Tilt.fidelity(start, target), level.id).toBeLessThan(need);
      // coordinate search over the three angles: the rotations reach every point on the sphere
      let pose = { x: 0, y: 0, z: 0 };
      let best = Tilt.fidelity(start, target);
      for (let sweep = 0; sweep < 6; sweep++) {
        for (const axis of ['x', 'y', 'z'] as const) {
          for (let d = -180; d <= 180; d += 3) {
            const candidate = { ...pose, [axis]: rad(d) };
            const f = Tilt.fidelity(Tilt.stateAfter(start, candidate), target);
            if (f > best) {
              best = f;
              pose = candidate;
            }
          }
        }
      }
      expect(best, level.id).toBeGreaterThan(0.999);
    }
  });
});

describe('Shake to Measure', () => {
  const sample = (t: number, x: number, y: number, z: number): Shake.Sample => ({ t, x, y, z });

  it('a phone at rest, or tilted slowly, never counts as a shake', () => {
    const d = Shake.createShakeDetector();
    for (let t = 0; t < 3000; t += 20) {
      // gravity spread over the axes as the phone is turned: the strength stays near 9.8
      const angle = (t / 3000) * Math.PI;
      expect(d.push(sample(t, 9.81 * Math.sin(angle), 9.81 * Math.cos(angle), 0))).toBe(false);
    }
  });

  it('a sharp shake is one event, and a burst of readings inside the cool-down is still one', () => {
    const d = Shake.createShakeDetector();
    expect(d.push(sample(0, 0, 0, 9.8))).toBe(false);
    expect(d.push(sample(100, 20, 5, 9.8))).toBe(true);
    expect(d.push(sample(140, -22, 8, 9.8))).toBe(false);
    expect(d.push(sample(300, 25, 0, 9.8))).toBe(false);
    expect(d.push(sample(900, 25, 0, 9.8))).toBe(true); // after the quiet time, a new shake
  });

  it('a hard shake downwards (strength below gravity) counts as well as upwards, and reset forgets the last shake', () => {
    const d = Shake.createShakeDetector({ threshold: 6, cooldownMs: 500 });
    expect(d.push(sample(0, 0, 0, 0.5))).toBe(true); // nearly free fall
    d.reset();
    expect(d.push(sample(10, 0, 0, 0.5))).toBe(true);
  });

  it('a measurement follows the Born rule, and measuring the same qubit again always repeats the answer', () => {
    const rng = mulberry32(5);
    let zeros = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (Shake.measureFresh(0.7, rng) === 0) zeros++;
    expect(zeros / n).toBeGreaterThan(0.67);
    expect(zeros / n).toBeLessThan(0.73);
    for (let trial = 0; trial < 100; trial++) {
      const state = Shake.prepare(0.5);
      const first = state.measureQubit(0, rng);
      for (let k = 0; k < 5; k++) expect(Shake.measureAgain(state, rng)).toBe(first);
    }
  });

  it('the prepared qubit has the chance asked for, and the tally gives the estimate', () => {
    for (const p of [0, 0.15, 0.5, 0.85, 1]) expect(Shake.chanceOfZero(Shake.prepare(p))).toBeCloseTo(p, 9);
    let t = Shake.EMPTY_TALLY;
    for (const o of [0, 0, 1, 0] as Shake.Outcome[]) t = Shake.addToTally(t, o);
    expect(t).toEqual({ zeros: 3, ones: 1 });
    expect(Shake.estimateOfZero(t)).toBe(0.75);
    expect(Shake.estimateOfZero(Shake.EMPTY_TALLY)).toBe(0.5);
  });

  it('more measurements give a steadier estimate: the wobble falls like one over the square root', () => {
    expect(Shake.wobble(0.5, 100) / Shake.wobble(0.5, 400)).toBeCloseTo(2, 9);
    const rng = mulberry32(9);
    const spread = (n: number) => {
      const guesses = Array.from({ length: 300 }, () => {
        let t = Shake.EMPTY_TALLY;
        for (let i = 0; i < n; i++) t = Shake.addToTally(t, Shake.measureFresh(0.7, rng));
        return Shake.estimateOfZero(t);
      });
      const m = guesses.reduce((a, b) => a + b, 0) / guesses.length;
      return Math.sqrt(guesses.reduce((a, g) => a + (g - m) ** 2, 0) / guesses.length);
    };
    expect(spread(8)).toBeGreaterThan(spread(32));
  });

  it('each estimate level is usually passable with an honest sample, so the game is fair', () => {
    const rng = mulberry32(31);
    for (const level of Shake.LEVELS) {
      if (level.kind !== 'estimate') continue;
      let passed = 0;
      const trials = 400;
      for (let k = 0; k < trials; k++) {
        const hidden = Shake.pickHidden(rng);
        let t = Shake.EMPTY_TALLY;
        for (let i = 0; i < level.shakes; i++) t = Shake.addToTally(t, Shake.measureFresh(hidden, rng));
        if (Shake.guessIsClose(Shake.estimateOfZero(t), hidden, level.tolerance)) passed++;
      }
      expect(passed / trials, level.id).toBeGreaterThan(0.8);
    }
  });

  it('guessing 50% without looking does not clear the tighter levels, so the shakes matter', () => {
    for (const level of Shake.LEVELS) {
      if (level.kind !== 'estimate') continue;
      const wrongFor = Shake.HIDDEN_CHANCES.filter((h) => !Shake.guessIsClose(0.5, h, level.tolerance));
      expect(wrongFor.length, level.id).toBe(Shake.HIDDEN_CHANCES.length);
    }
  });

  it('stars come from how close the guess is', () => {
    expect(Shake.stars(0.7, 0.7, 20)).toBe(3);
    expect(Shake.stars(0.55, 0.7, 20)).toBe(2);
    expect(Shake.stars(0.4, 0.7, 20)).toBe(0);
  });
});

describe('Entangled Pair', () => {
  it('the same angle for both players wins the "equal" questions every time and loses the 1-1 question every time', () => {
    for (const [x, y] of [[0, 0], [0, 1], [1, 0]] as [0 | 1, 0 | 1][]) expect(Pair.winChance(x, y, 30, 30)).toBeCloseTo(1, 9);
    expect(Pair.winChance(1, 1, 30, 30)).toBeCloseTo(0, 9);
  });

  it('the best angles reach the quantum value, about 85%, and two always-equal angles stay at 75%', () => {
    const q = OPTIMAL_QUANTUM;
    const per = ([0, 1] as const).flatMap((x) => ([0, 1] as const).map((y) => Pair.winChance(x, y, (q.alice[x] * 180) / Math.PI, (q.bob[y] * 180) / Math.PI)));
    const avg = per.reduce((a, b) => a + b, 0) / 4;
    expect(avg).toBeCloseTo(Pair.QUANTUM_LIMIT, 9);
    expect(avg).toBeGreaterThan(0.85);
    const flat = ([0, 1] as const).flatMap((x) => ([0, 1] as const).map((y) => Pair.winChance(x, y, 0, 0)));
    expect(flat.reduce((a, b) => a + b, 0) / 4).toBeCloseTo(0.75, 9);
    expect(Pair.CLASSICAL_LIMIT).toBe(0.75);
  });

  it('no choice of angles beats the quantum value', () => {
    let best = 0;
    for (let a0 = -90; a0 <= 90; a0 += 15) {
      for (let a1 = -90; a1 <= 90; a1 += 15) {
        for (let b0 = -90; b0 <= 90; b0 += 15) {
          for (let b1 = -90; b1 <= 90; b1 += 15) {
            const avg = (Pair.winChance(0, 0, a0, b0) + Pair.winChance(0, 1, a0, b1) + Pair.winChance(1, 0, a1, b0) + Pair.winChance(1, 1, a1, b1)) / 4;
            best = Math.max(best, avg);
          }
        }
      }
    }
    expect(best).toBeLessThanOrEqual(Pair.QUANTUM_LIMIT + 1e-9);
    expect(best).toBeGreaterThan(0.84);
  });

  it('played rounds follow the exact chance, and the questions are balanced', () => {
    const rng = mulberry32(12);
    let won = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (Pair.playRound(1, 0, 45, 22.5, rng).won) won++;
    expect(won / n).toBeCloseTo(Pair.winChance(1, 0, 45, 22.5), 1);
    const list = Pair.questionList(24, rng);
    expect(list.length).toBe(24);
    for (const [x, y] of [[0, 0], [0, 1], [1, 0], [1, 1]]) expect(list.filter((q) => q[0] === x && q[1] === y).length).toBe(6);
  });

  it('a tilt is limited to -90 to 90 degrees', () => {
    expect(Pair.angleFromTilt(37.4)).toBe(37);
    expect(Pair.angleFromTilt(-200)).toBe(-90);
    expect(Pair.angleFromTilt(400)).toBe(90);
  });

  it('the strategy the players\' choices add up to is scored exactly, not by the luck of 24 rounds', () => {
    const rounds: Pair.Played[] = [];
    const angles = { a: [0, 45], b: [22.5, -22.5] };
    for (const [x, y] of Pair.questionList(24, mulberry32(3))) {
      rounds.push({ x, y, alpha: angles.a[x], beta: angles.b[y], a: 0, b: 0, won: false });
    }
    expect(Pair.longRunWin(rounds)).toBeCloseTo(Pair.QUANTUM_LIMIT, 9);
    expect(Pair.stars(Pair.longRunWin(rounds))).toBe(3);
    const flat = rounds.map((r) => ({ ...r, alpha: 0, beta: 0 }));
    expect(Pair.longRunWin(flat)).toBeCloseTo(0.75, 9);
    expect(Pair.stars(0.75)).toBe(1);
    expect(Pair.stars(0.79)).toBe(2);
    expect(Pair.longRunWin([])).toBe(0);
  });

  it('the hints get closer to the answer, and only the last gives the angles', () => {
    expect(Pair.HINTS.length).toBe(3);
    expect(Pair.HINTS[0]).not.toMatch(/22\.5/);
    expect(Pair.HINTS[1]).not.toMatch(/22\.5/);
    expect(Pair.HINTS[2]).toMatch(/22\.5/);
    void Complex;
  });
});

describe('The three sensor games are for the installed app only', () => {
  const IDS = ['hold_bloch_sphere', 'shake_to_measure', 'entangled_pair'];

  it('are marked app-only, belong to a Part 1 lesson and have help text tagged Analogy', () => {
    for (const id of IDS) {
      expect(ACTIVITIES[id].appOnly, id).toBe(true);
      expect(LESSONS.some((l) => l.part === 1 && l.activities.some((a) => a.id === id)), id).toBe(true);
      expect(GAME_HELP[id].tag, id).toBe('Analogy');
    }
    // no other activity is app-only: the website must not lose anything else
    const others = Object.values(ACTIVITIES).filter((a) => a.appOnly).map((a) => a.id).sort();
    expect(others).toEqual([...IDS].sort());
  });

  it('are shown in the installed app and the development server, and not in the website build', () => {
    expect(isAppBuild(true, false)).toBe(true);
    expect(isAppBuild(false, true)).toBe(true);
    expect(isAppBuild(false, false)).toBe(false);
  });

  it('on the website a lesson does not list them as "coming soon", and in the app they are a stage', () => {
    for (const id of IDS) {
      const lesson = LESSONS.find((l) => l.activities.some((a) => a.id === id))!;
      const web = lessonFlow(lesson, [], []);
      expect(web.soon.map((a) => a.id), id).not.toContain(id);
      expect(web.stages.flatMap((s) => s.activities).map((a) => a.id)).not.toContain(id);
      const app = lessonFlow(lesson, [id], []);
      expect(app.stages.some((s) => s.step === 'apply' && s.activities.some((a) => a.id === id)), id).toBe(true);
    }
  });
});
