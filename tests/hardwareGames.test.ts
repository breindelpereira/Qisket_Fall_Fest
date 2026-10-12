import { describe, it, expect } from 'vitest';
import { mulberry32 } from '../src/core/games/oracleDetective';
import * as Race from '../src/core/games/coherenceRace';
import * as Cool from '../src/core/games/coolDown';
import * as Ions from '../src/core/games/ionChain';
import * as Tweezers from '../src/core/games/tweezers';
import * as Photons from '../src/core/games/photonFactory';
import * as Dots from '../src/core/games/dotTuner';
import * as Valley from '../src/core/games/valleyRoll';
import * as Builder from '../src/core/games/logicalBuilder';
import * as Architect from '../src/core/games/architect';
import { HARDWARE } from '../src/content/hardwareData';
import { THRESHOLD } from '../src/core/hardware/overhead';

describe('Coherence Race', () => {
  it('every level has a winning speed, and the best one is the sweet spot between sloppy and slow', () => {
    for (const level of Race.LEVELS) {
      const best = Race.best(level);
      expect(best.passed, level.id).toBe(true);
      expect(Race.stars(level, best), level.id).toBe(3);
      // a middle setting beats the sloppiest one
      expect(Race.run(level, best.t).success).toBeGreaterThan(Race.run(level, level.options[0]).success);
    }
  });

  it('the gate error falls and then rises as gates slow down, with a minimum in between', () => {
    const errors = Race.OPTIONS.map((t) => Race.gateError(t, 300, 3.4));
    const min = errors.indexOf(Math.min(...errors));
    expect(min).toBeGreaterThan(0);
    expect(min).toBeLessThan(errors.length - 1);
  });

  it('a circuit that does not fit inside T2 never succeeds, however good the gates are', () => {
    const level = Race.LEVELS.find((l) => l.id === 'long_haul')!;
    const slow = Race.run(level, 640);
    expect(slow.fits).toBe(false);
    expect(slow.success).toBe(0);
    expect(slow.passed).toBe(false);
    expect(Race.stars(level, slow)).toBe(0);
  });

  it('only some settings pass each level, so picking at random is not enough', () => {
    for (const level of Race.LEVELS) {
      const passing = level.options.filter((t) => Race.run(level, t).passed).length;
      expect(passing, level.id).toBeGreaterThanOrEqual(1);
      expect(passing, level.id).toBeLessThanOrEqual(3);
    }
  });
});

describe('Cool Down', () => {
  const [first, bigger, hundreds, old, thousand] = Cool.LEVELS;

  it('every level has at least one wiring that reaches the target, and the first one is only coax', () => {
    for (const level of Cool.LEVELS) expect(Cool.solutions(level).length, level.id).toBeGreaterThanOrEqual(1);
    expect(Cool.solutions(first).map((p) => p.wiring)).toEqual(['coax']);
  });

  it('plain coax is not enough once the target grows', () => {
    for (const level of [hundreds, old, thousand]) {
      expect(Cool.works({ qubits: level.target, wiring: 'coax', readout: 'dedicated' }, level.fridge), level.id).toBe(false);
    }
  });

  it('the coldest stage limits coax, and the 4 K plate limits the control chip', () => {
    expect(Cool.limitingStage({ qubits: 150, wiring: 'coax', readout: 'dedicated' }, bigger.fridge).stage.id).toBe('mxc');
    expect(Cool.limitingStage({ qubits: 600, wiring: 'cmos', readout: 'dedicated' }, hundreds.fridge).stage.id).toBe('k4');
  });

  it('sharing readout never adds heat, and heat grows in proportion to the qubit count', () => {
    for (const stage of Cool.STAGES) {
      const dedicated = Cool.loads({ qubits: 100, wiring: 'flex', readout: 'dedicated' }, bigger.fridge).find((l) => l.stage.id === stage.id)!;
      const shared = Cool.loads({ qubits: 100, wiring: 'flex', readout: 'shared' }, bigger.fridge).find((l) => l.stage.id === stage.id)!;
      expect(shared.heat, stage.id).toBeLessThanOrEqual(dedicated.heat);
    }
    const heat = (q: number) => Cool.loads({ qubits: q, wiring: 'coax', readout: 'dedicated' }, first.fridge)[4].heat;
    expect(heat(200)).toBeCloseTo(2 * heat(100), 12);
  });

  it('stars: a plan that fails or falls short earns nothing, and a plan with margin earns three', () => {
    expect(Cool.stars(first, { qubits: 20, wiring: 'coax', readout: 'dedicated' })).toBe(0); // below the target
    expect(Cool.stars(thousand, { qubits: 1000, wiring: 'coax', readout: 'dedicated' })).toBe(0); // too hot
    expect(Cool.stars(bigger, { qubits: 150, wiring: 'flex', readout: 'shared' })).toBe(3);
    expect(Cool.stars(thousand, { qubits: 1000, wiring: 'flex', readout: 'shared' })).toBeGreaterThanOrEqual(1);
  });
});

describe('Ion Chain Conductor', () => {
  it('the fewest moves for each level, by exhaustive search', () => {
    expect(Ions.LEVELS.map((l) => Ions.par(l))).toEqual([2, 3, 5, 5, 5]);
  });

  it('a move into a full trap or onto the same trap is refused, and gates run as soon as their ions meet', () => {
    const level = Ions.LEVELS[0];
    const s = Ions.initial(level);
    expect(s.done).toBe(0);
    expect(Ions.move(level, s, 0, 0)).toBeNull();
    const a = Ions.move(level, s, 2, 0)!; // ion 2 joins ions 0 and 1
    expect(a.done).toBe(1);
    expect(a.assign[2]).toBe(0);
    expect(Ions.moveProblem(level, a, 3, 0)).toMatch(/full/); // trap 0 now holds three
    const b = Ions.move(level, a, 1, 1)!; // ion 1 goes to the trap holding ion 3
    expect(Ions.finished(level, b)).toBe(true);
  });

  it('gates run in order: a later pair meeting early waits its turn', () => {
    const level = { ...Ions.LEVELS[0], gates: [[0, 2], [1, 3]] as Ions.Gate[], start: [0, 1, 1, 0] };
    expect(Ions.initial(level).done).toBe(0);
    const s = Ions.move(level, Ions.initial(level), 3, 1)!; // ions 1 and 3 meet, but the gate on 0 and 2 comes first
    expect(s.done).toBe(0);
  });

  it('stars follow the number of moves against par', () => {
    expect(Ions.stars(5, 5)).toBe(3);
    expect(Ions.stars(5, 7)).toBe(2);
    expect(Ions.stars(5, 9)).toBe(1);
  });
});

describe('Tweezer Shuffle', () => {
  it('the fewest moves for each level, by exhaustive search', () => {
    expect(Tweezers.LEVELS.map((l) => Tweezers.par(l))).toEqual([6, 4, 6, 6, 8]);
  });

  it('only one step into a free, unblocked neighbouring site is allowed', () => {
    const level = Tweezers.LEVELS[2];
    const at = Tweezers.startSites(level);
    const from = Tweezers.siteIndex(level, 1, 2);
    expect(Tweezers.moveProblem(level, at, from, Tweezers.siteIndex(level, 2, 2))).toMatch(/blocked/);
    expect(Tweezers.moveProblem(level, at, from, Tweezers.siteIndex(level, 1, 3))).toMatch(/already holds/);
    expect(Tweezers.moveProblem(level, at, from, Tweezers.siteIndex(level, 3, 2))).toMatch(/next site/);
    expect(Tweezers.moveProblem(level, at, Tweezers.siteIndex(level, 0, 0), Tweezers.siteIndex(level, 1, 0))).toMatch(/no atom/);
    expect(Tweezers.move(level, at, from, Tweezers.siteIndex(level, 0, 2))).not.toBeNull();
  });

  it('atoms are identical, so only the pattern counts, and it must match exactly', () => {
    const level = Tweezers.LEVELS[0];
    expect(Tweezers.solved(level, Tweezers.targetSites(level))).toBe(true);
    expect(Tweezers.solved(level, Tweezers.startSites(level))).toBe(false);
    expect(Tweezers.neighbourPairs(level, Tweezers.targetSites(level)).length).toBe(2);
  });

  it('stars follow the number of moves against par', () => {
    expect(Tweezers.stars(6, 6)).toBe(3);
    expect(Tweezers.stars(6, 9)).toBe(2);
    expect(Tweezers.stars(6, 10)).toBe(1);
  });
});

describe('Photon Factory', () => {
  it('one attempt works with its own chance, and with no switch loss more copies only help', () => {
    expect(Photons.stageSuccess(0.3, 1, 2)).toBeCloseTo(0.3, 12);
    const chances = Photons.COPIES.map((m) => Photons.stageSuccess(0.3, m, 0));
    for (let i = 1; i < chances.length; i++) expect(chances[i]).toBeGreaterThan(chances[i - 1]);
    expect(chances[chances.length - 1]).toBeGreaterThan(0.99);
  });

  it('with very lossy switches every extra copy makes a step worse: more is not always better', () => {
    const chances = Photons.COPIES.map((m) => Photons.stageSuccess(0.5, m, 3.5));
    for (let i = 1; i < chances.length; i++) expect(chances[i]).toBeLessThan(chances[i - 1]);
  });

  it('each level can be passed, and the cheapest passing plan costs this many sources', () => {
    expect(Photons.LEVELS.map((l) => Photons.cheapestPass(l))).toEqual([12, 24, 32, 4, 32]);
  });

  it('the do-nothing plan fails every level except the one about lossy switches', () => {
    for (const level of Photons.LEVELS) {
      const plain = Photons.evaluate(level, level.stages.map(() => 1));
      expect(plain.passed, level.id).toBe(level.id === 'too_lossy');
    }
  });

  it('a plan over the budget does not pass even if it would succeed', () => {
    const level = Photons.LEVELS[0];
    const lots = Photons.evaluate(level, [16, 16, 16]);
    expect(lots.success).toBeGreaterThan(0.99);
    expect(lots.withinBudget).toBe(false);
    expect(lots.passed).toBe(false);
    expect(Photons.stars(level, lots)).toBe(0);
  });

  it('stars reward the cheaper passing plans', () => {
    const level = Photons.LEVELS[0];
    expect(Photons.stars(level, Photons.evaluate(level, [4, 4, 4]))).toBe(3);
    expect(Photons.stars(level, Photons.evaluate(level, [8, 8, 2]))).toBeLessThan(3);
  });
});

describe('Dot Tuner', () => {
  it('a dot holds one electron only inside its voltage window', () => {
    expect(Dots.occupation(10, [30, 45])).toBe(0);
    expect(Dots.occupation(30, [30, 45])).toBe(1);
    expect(Dots.occupation(45, [30, 45])).toBe(1);
    expect(Dots.occupation(60, [30, 45])).toBe(2);
  });

  it('every level can be solved, and the solution is a charged pair with a clean gate', () => {
    for (const level of Dots.LEVELS) {
      const s = Dots.solve(level);
      expect(s, level.id).not.toBeNull();
      const r = Dots.evaluate(level, s!);
      expect(r.charged).toBe(true);
      expect(r.passed, level.id).toBe(true);
    }
  });

  it('the settings that work on one device do not work on another: the offsets differ', () => {
    const [charge, entangle] = Dots.LEVELS;
    const s = Dots.solve(charge)!;
    expect(Dots.evaluate(entangle, s).passed).toBe(false);
  });

  it('the ideal barrier for a fixed pulse matches what the scan finds', () => {
    for (const level of Dots.LEVELS.filter((l) => l.fixedPulseNs !== null && l.noise === 0)) {
      const ideal = Dots.idealBarrier(level, level.fixedPulseNs!)!;
      const found = Dots.solve(level)!;
      expect(Math.abs(ideal - found.barrier), level.id).toBeLessThan(0.15);
    }
  });

  it('noise lowers the gate quality, and a gate with an uncharged dot never passes', () => {
    const noisy = Dots.LEVELS.find((l) => l.id === 'noisy')!;
    const calm = { ...noisy, noise: 0 };
    const s = Dots.solve(calm)!;
    expect(Dots.quality(noisy, s)).toBeLessThan(Dots.quality(calm, s));
    const uncharged = { ...s, v1: 0 };
    expect(Dots.evaluate(calm, uncharged).passed).toBe(false);
    expect(Dots.stars(calm, Dots.evaluate(calm, uncharged))).toBe(0);
  });
});

describe('Valley Roll', () => {
  const hard = Valley.LEVELS.find((l) => l.id === 'hard')!;

  it('slower runs are more likely to find the lowest valley, and the slowest is almost certain', () => {
    const p = Valley.TIMES.map((T) => Valley.runChance(hard.problem, T));
    for (let i = 1; i < p.length; i++) expect(p[i]).toBeGreaterThan(p[i - 1]);
    expect(p[p.length - 1]).toBeGreaterThan(0.95);
    expect(p[0]).toBeLessThan(0.15);
  });

  it('the cheapest way to find the best answer is neither the quickest nor the slowest run', () => {
    for (const level of Valley.LEVELS) {
      const t = Valley.bestTime(level.problem);
      expect(t, level.id).toBeGreaterThan(Valley.TIMES[0]);
      expect(t, level.id).toBeLessThan(Valley.TIMES[Valley.TIMES.length - 1]);
    }
  });

  it('a run is a fair random draw from the simulated outcome', () => {
    const rng = mulberry32(21);
    const T = 10;
    let best = 0;
    const n = 3000;
    for (let i = 0; i < n; i++) if (Valley.draw(hard.problem, T, rng).isBest) best++;
    expect(best / n).toBeCloseTo(Valley.runChance(hard.problem, T), 1);
  });

  it('the budget is real: a run costs its time plus the readout, and a run that does not fit cannot be made', () => {
    expect(Valley.runCost(10)).toBe(10 + Valley.READOUT);
    expect(Valley.chanceWithin(hard.problem, 100, Valley.runCost(100) - 1)).toBe(0);
    expect(Valley.chanceWithin(hard.problem, 10, hard.budget)).toBeGreaterThan(Valley.chanceWithin(hard.problem, 1, hard.budget));
  });

  it('the landscape lists every state once, in an order where neighbours differ by one spin', () => {
    const land = Valley.landscape(hard.problem, 10);
    expect(land.length).toBe(32);
    expect(new Set(land.map((l) => l.state)).size).toBe(32);
    for (let i = 1; i < land.length; i++) {
      const diff = land[i].state ^ land[i - 1].state;
      expect(diff & (diff - 1), `step ${i}`).toBe(0); // exactly one bit
    }
    expect(land.reduce((s, l) => s + l.probability, 0)).toBeCloseTo(1, 6);
  });

  it('stars: not finding the best, or going over budget, earns nothing', () => {
    expect(Valley.stars(hard, 10, false)).toBe(0);
    expect(Valley.stars(hard, hard.budget + 1, true)).toBe(0);
    expect(Valley.stars(hard, 20, true)).toBe(3);
  });
});

describe('Logical Qubit Builder', () => {
  it('the cheapest build for each level', () => {
    const got = Builder.LEVELS.map((l) => {
      const b = Builder.cheapestBuild(l)!;
      return [b.distance, b.improvements];
    });
    expect(got).toEqual([[11, 0], [21, 1], [23, 1], [27, 2], [11, 5]]);
  });

  it('above the threshold a bigger code is worse, and only better hardware helps', () => {
    const level = Builder.LEVELS.find((l) => l.id === 'too_noisy')!;
    expect(level.p).toBeGreaterThan(THRESHOLD);
    const small = Builder.evaluate(level, { distance: 5, improvements: 0 });
    const big = Builder.evaluate(level, { distance: 21, improvements: 0 });
    expect(big.logical).toBeGreaterThanOrEqual(small.logical);
    expect(big.below).toBe(false);
    expect(Builder.evaluate(level, { distance: 27, improvements: 2 }).passed).toBe(true);
  });

  it('distance 1 is no code, so the logical error is the physical error', () => {
    const level = Builder.LEVELS[0];
    const o = Builder.evaluate(level, { distance: 1, improvements: 0 });
    expect(o.logical).toBeCloseTo(level.p, 12);
    expect(o.qubits).toBe(1);
  });

  it('a build over the qubit budget does not pass, however good the logical error', () => {
    const level = Builder.LEVELS.find((l) => l.id === 'tiny_budget')!;
    const o = Builder.evaluate(level, { distance: 31, improvements: 0 });
    expect(o.logical).toBeLessThan(level.target);
    expect(o.withinBudget).toBe(false);
    expect(o.passed).toBe(false);
  });

  it('stars favour fewer improvements and a small code', () => {
    const level = Builder.LEVELS[1];
    const best = { distance: 21, improvements: 1 };
    expect(Builder.stars(level, best, Builder.evaluate(level, best))).toBe(3);
    const wasteful = { distance: 25, improvements: 3 };
    const w = Builder.evaluate(level, wasteful);
    expect(w.passed).toBe(true);
    expect(Builder.stars(level, wasteful, w)).toBe(1);
    const small = { distance: 5, improvements: 0 };
    expect(Builder.stars(level, small, Builder.evaluate(level, small))).toBe(0);
  });
});

describe('Quantum Architect', () => {
  it('rates every machine on every criterion with a sentence of explanation', () => {
    for (const m of Architect.MODALITIES) {
      for (const c of Architect.CRITERIA) {
        const r = m.ratings[c.id];
        expect(r.value, `${m.id} ${c.id}`).toBeGreaterThanOrEqual(0);
        expect(r.value).toBeLessThanOrEqual(3);
        expect(r.why.length, `${m.id} ${c.id}`).toBeGreaterThan(20);
      }
    }
    expect(new Set(Architect.MODALITIES.map((m) => m.id)).size).toBe(6);
  });

  it('the machines match the hardware data file', () => {
    const ids = new Set(HARDWARE.map((r) => r.modality));
    for (const m of Architect.MODALITIES) expect(ids.has(m.id), m.id).toBe(true);
  });

  it('every brief has a close fit, and the annealer is the honest answer for the optimisation brief only', () => {
    for (const brief of Architect.BRIEFS) {
      const scored = Architect.assess(brief);
      expect(scored.some((s) => s.reasonable), brief.id).toBe(true);
      expect(scored.filter((s) => s.best).length, brief.id).toBeGreaterThanOrEqual(1);
      const annealer = scored.find((s) => s.modality.id === 'annealing')!;
      if (brief.task === 'circuit') expect(annealer.eligible, brief.id).toBe(false);
      else expect(annealer.reasonable && annealer.best, brief.id).toBe(true);
    }
  });

  it('some briefs have one close fit and the long-term one has several', () => {
    const count = (id: string) => Architect.assess(Architect.BRIEFS.find((b) => b.id === id)!).filter((s) => s.reasonable).length;
    expect(count('routes')).toBe(1);
    expect(count('shor')).toBeGreaterThanOrEqual(2);
  });

  it('every defence has exactly one true reason and two false ones, and no false reason is one of the true sentences', () => {
    const truths = new Set(Architect.MODALITIES.flatMap((m) => Architect.CRITERIA.map((c) => m.ratings[c.id].why)));
    for (const brief of Architect.BRIEFS) {
      for (const m of Architect.MODALITIES) {
        const { options } = Architect.reasonsFor(brief, m.id);
        expect(options.length).toBe(3);
        expect(options.filter((o) => o.true).length, `${brief.id} ${m.id}`).toBe(1);
        for (const o of options.filter((x) => !x.true)) expect(truths.has(o.text), o.text).toBe(false);
        const truth = options.find((o) => o.true)!;
        expect(Architect.CRITERIA.some((c) => m.ratings[c.id].why === truth.text), `${m.id} true reason is one of its own`).toBe(true);
      }
    }
  });

  it('a machine that cannot run circuits earns nothing for a circuit brief, and reasoning matters for the rest', () => {
    const shor = Architect.BRIEFS.find((b) => b.id === 'shor')!;
    expect(Architect.stars(shor, 'annealing', true)).toBe(0);
    const good = Architect.assess(shor).find((s) => s.reasonable && s.modality.id !== 'annealing')!;
    expect(Architect.stars(shor, good.modality.id, true)).toBe(3);
    expect(Architect.stars(shor, good.modality.id, false)).toBe(2);
    const poor = Architect.assess(shor).find((s) => s.eligible && !s.reasonable)!;
    expect(Architect.stars(shor, poor.modality.id, true)).toBe(1);
  });
});
