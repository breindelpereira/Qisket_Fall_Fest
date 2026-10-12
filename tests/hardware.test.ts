import { describe, it, expect } from 'vitest';
import { Complex } from '../src/core/circuit';
import { HARDWARE, HARDWARE_BY_ID, MODALITIES } from '../src/content/hardwareData';
import { LESSON_BY_ID } from '../src/content/lessons';
import { MAX_COMPARED, NOT_GIVEN, cardFor, formatError, formatQubits, formatT1, sortRecords, toggleSelection } from '../src/core/hardware/comparison';
import { budget, clampT2, cleanChance, depthByError, depthByTime, maxT2 } from '../src/core/hardware/metrics';
import { allSurvive, chainLossDb, expectedAttempts, lossDb, maxComponents, photonSurvival, transmission } from '../src/core/hardware/loss';
import {
  MAX_DISTANCE, PREFACTOR, THRESHOLD, belowThreshold, distanceCurve, logicalError, physicalQubits, plan, suppressionFactor,
} from '../src/core/hardware/overhead';
import { logicalErrorRate } from '../src/core/labs/errorCorrection';
import { decayTime, idealP1, peakP1, piPulseTime, rabiCurve, settlesAt } from '../src/core/hardware/transmon';
import {
  C6_DEFAULT, OMEGA_DEFAULT, blockadeRadius, blockadedPlus, independentRr, interaction, pairCurve, pairPiTime, peakRr,
} from '../src/core/hardware/rydberg';
import { entanglementAfter, exchangeMHz, pulseCurve, pulseState, sqrtSwapTimeNs, swapChance, swapTimeNs } from '../src/core/hardware/exchange';
import { CIRCUITS, TOPOLOGIES, circuitById, naiveSwaps, route, shortestPath, topologyById } from '../src/core/hardware/routing';
import {
  PROBLEMS, anneal, diagonalise, energies, exactEvolution, gapAt, gapCurve, groundEnergy, groundStates, hamiltonian, minimumGap,
  problemById, runnerUp, steppedEvolution,
} from '../src/core/hardware/annealing';

describe('Hardware data: every figure has a source and a date', () => {
  it('has a source, a link, a date and a caveat on every record', () => {
    expect(HARDWARE.length).toBeGreaterThanOrEqual(6);
    for (const r of HARDWARE) {
      expect(r.source.length, r.id).toBeGreaterThan(10);
      expect(r.url, r.id).toMatch(/^https:\/\//);
      expect(r.asOf, r.id).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
      expect(r.caveat.length, r.id).toBeGreaterThan(20);
      expect(r.shows.length, r.id).toBeGreaterThan(20);
    }
  });

  it('keeps figures in range, with unique ids and a lesson and a record for every modality', () => {
    expect(new Set(HARDWARE.map((r) => r.id)).size).toBe(HARDWARE.length);
    for (const r of HARDWARE) {
      if (r.twoQubitError !== undefined) {
        expect(r.twoQubitError, r.id).toBeGreaterThan(0);
        expect(r.twoQubitError, r.id).toBeLessThan(0.1);
        expect(r.errorNote, `${r.id} says what the error figure is`).toBeTruthy();
      }
      if (r.qubits !== undefined) expect(Number.isInteger(r.qubits), r.id).toBe(true);
      expect(MODALITIES.some((m) => m.id === r.modality), r.id).toBe(true);
    }
    for (const m of MODALITIES) {
      expect(LESSON_BY_ID[m.lessonId], m.id).toBeDefined();
      expect(HARDWARE.some((r) => r.modality === m.id), `${m.id} has a record`).toBe(true);
    }
    expect(HARDWARE_BY_ID.google_willow.twoQubitError).toBe(0.0033);
  });
});

describe('Comparison Dashboard: the data file, side by side', () => {
  it('sorting never drops, adds or changes a record, and puts missing figures last in both directions', () => {
    for (const key of ['qubits', 'twoQubitError', 'asOf'] as const) {
      for (const dir of ['asc', 'desc'] as const) {
        const sorted = sortRecords(HARDWARE, key, dir);
        expect(sorted.map((r) => r.id).sort(), `${key} ${dir}`).toEqual(HARDWARE.map((r) => r.id).sort());
        const firstMissing = sorted.findIndex((r) => r[key] === undefined);
        if (firstMissing >= 0) expect(sorted.slice(firstMissing).every((r) => r[key] === undefined), `${key} ${dir}`).toBe(true);
      }
    }
    const byError = sortRecords(HARDWARE, 'twoQubitError', 'asc').filter((r) => r.twoQubitError !== undefined);
    for (let i = 1; i < byError.length; i++) expect(byError[i].twoQubitError as number).toBeGreaterThanOrEqual(byError[i - 1].twoQubitError as number);
  });

  it('keeps at most three records selected, dropping the oldest choice', () => {
    expect(toggleSelection([], 'a')).toEqual(['a']);
    expect(toggleSelection(['a', 'b'], 'a')).toEqual(['b']);
    expect(toggleSelection(['a', 'b', 'c'], 'd')).toEqual(['b', 'c', 'd']);
    expect(MAX_COMPARED).toBe(3);
  });

  it('writes a missing figure as not given, never as a number, and every card carries its source and date', () => {
    const aurora = HARDWARE_BY_ID.xanadu_aurora;
    expect(formatError(aurora)).toBe(NOT_GIVEN);
    expect(formatT1(aurora)).toBe(NOT_GIVEN);
    expect(formatQubits(HARDWARE_BY_ID.dwave_advantage2)).toBe('more than 4,400');
    expect(formatError(HARDWARE_BY_ID.google_willow)).toBe('0.33%');
    expect(formatError(HARDWARE_BY_ID.quantinuum_h2)).toBe('0.16%');
    for (const r of HARDWARE) {
      const card = cardFor(r);
      expect(card.asOf, r.id).toMatch(/^\d{4}-\d{2}/);
      expect(card.url, r.id).toMatch(/^https:/);
      expect(card.caveat.length, r.id).toBeGreaterThan(10);
      for (const row of card.rows) if (row.missing) expect(row.value, `${r.id} ${row.label}`).toBe(NOT_GIVEN);
    }
  });
});

describe('Qubit Metrics: the coherence budget', () => {
  it("the lesson's example: T2 = 100 us and 50 ns gates give 2,000 gates", () => {
    expect(depthByTime(100, 50)).toBe(2000);
  });

  it('error limits depth too, and the smaller limit is the budget', () => {
    expect(depthByError(0.001)).toBe(1000);
    expect(budget(100, 50, 0.001)).toMatchObject({ byTime: 2000, byError: 1000, usable: 1000, limit: 'error' });
    expect(budget(10, 50, 0.0001)).toMatchObject({ byTime: 200, byError: 10000, usable: 200, limit: 'time' });
  });

  it('raising the error never raises the budget, and a shorter T2 never raises it either', () => {
    let last = Infinity;
    for (const e of [0.0001, 0.001, 0.01, 0.1]) {
      const u = budget(100, 50, e).usable;
      expect(u).toBeLessThanOrEqual(last);
      last = u;
    }
    expect(budget(50, 50, 0.0001).usable).toBeLessThan(budget(100, 50, 0.0001).usable);
  });

  it('T2 cannot be more than twice T1', () => {
    expect(maxT2(50)).toBe(100);
    expect(clampT2(300, 50)).toBe(100);
    expect(clampT2(40, 50)).toBe(40);
  });

  it('a circuit as long as the error budget runs cleanly only about 37% of the time', () => {
    expect(cleanChance(1000, 0.001)).toBeCloseTo(Math.exp(-1), 2);
    expect(cleanChance(0, 0.5)).toBe(1);
    expect(depthByTime(0, 50)).toBe(0);
  });
});

describe('Loss Budget: photons are lost, not flipped', () => {
  it('3 dB is about one half and 10 dB is one tenth', () => {
    expect(transmission(3)).toBeCloseTo(0.501, 3);
    expect(transmission(10)).toBeCloseTo(0.1, 12);
    expect(transmission(0)).toBe(1);
    expect(lossDb(0.5)).toBeCloseTo(3.0103, 3);
  });

  it('decibels add along a chain, and fractions multiply', () => {
    expect(chainLossDb(0.5, 6)).toBe(3);
    expect(photonSurvival(0.5, 6)).toBeCloseTo(transmission(0.5) ** 6, 12);
  });

  it('success falls exponentially as components are added: each one multiplies by the same factor', () => {
    const s = (k: number) => allSurvive(0.4, k, 4);
    expect(s(2) / s(1)).toBeCloseTo(s(8) / s(7), 10);
    expect(s(2) / s(1)).toBeLessThan(1);
    expect(s(40)).toBeLessThan(s(10));
  });

  it('more photons are harder, and the number of tries is one over the chance', () => {
    expect(allSurvive(0.3, 5, 8)).toBeLessThan(allSurvive(0.3, 5, 2));
    expect(allSurvive(0.3, 5, 0)).toBe(1);
    expect(expectedAttempts(0.25)).toBe(4);
    expect(expectedAttempts(0)).toBe(Infinity);
  });

  it('the component budget keeps the chance at or above the target and one more breaks it', () => {
    const k = maxComponents(0.5, 4, 0.5);
    expect(allSurvive(0.5, k, 4)).toBeGreaterThanOrEqual(0.5);
    expect(allSurvive(0.5, k + 1, 4)).toBeLessThan(0.5);
  });
});

describe('Overhead Calculator: the surface code trade-off', () => {
  it('uses the published constants: threshold 0.57%, prefactor 0.03, (2d-1)^2 qubits', () => {
    expect(THRESHOLD).toBe(0.0057);
    expect(PREFACTOR).toBe(0.03);
    expect(physicalQubits(3)).toBe(25);
    expect(physicalQubits(5)).toBe(81);
    expect(logicalError(THRESHOLD, 7)).toBeCloseTo(0.03, 12);
  });

  it('below threshold a bigger code helps, above it a bigger code hurts', () => {
    const below = distanceCurve(THRESHOLD / 4).map((c) => c.logical);
    for (let i = 1; i < below.length; i++) expect(below[i]).toBeLessThan(below[i - 1]);
    const above = distanceCurve(THRESHOLD * 1.5, 11).map((c) => c.logical);
    for (let i = 1; i < above.length; i++) expect(above[i]).toBeGreaterThanOrEqual(above[i - 1]);
    expect(belowThreshold(0.001)).toBe(true);
    expect(belowThreshold(0.01)).toBe(false);
  });

  it('each step of +2 in distance divides the error by p_th / p', () => {
    const p = 0.001;
    expect(logicalError(p, 5) / logicalError(p, 7)).toBeCloseTo(suppressionFactor(p), 9);
  });

  it('plans the smallest odd distance that reaches the target, and refuses at or above threshold', () => {
    const pl = plan(THRESHOLD / 10, 1e-14);
    expect(pl.distance).toBe(25);
    expect(pl.qubits).toBe(physicalQubits(25));
    expect(pl.logicalError as number).toBeLessThanOrEqual(1e-14);
    expect(logicalError(THRESHOLD / 10, 23)).toBeGreaterThan(1e-14);
    expect(plan(THRESHOLD, 1e-6).distance).toBeNull();
    expect(plan(0.02, 1e-6).qubits).toBeNull();
    expect(MAX_DISTANCE).toBeGreaterThan(25);
  });

  it('a worse physical error costs many more qubits for the same target', () => {
    const good = plan(0.0005, 1e-9).qubits as number;
    const bad = plan(0.004, 1e-9).qubits as number;
    expect(bad).toBeGreaterThan(10 * good);
  });

  it('shares its exponent with the repetition code of Module 7: the error falls with the same power of p', () => {
    // distance d fails when (d+1)/2 flips happen, for the repetition code and for the surface-code fit alike
    const slope = (f: (p: number) => number) => Math.log(f(0.002) / f(0.001)) / Math.log(2);
    expect(slope((p) => logicalErrorRate(p, 5))).toBeCloseTo(3, 1);
    expect(slope((p) => logicalError(p, 5))).toBeCloseTo(3, 9);
  });
});

describe('Transmon Lab: Rabi oscillation with decay', () => {
  it('without noise the curve is exactly sin^2(Omega t / 2) and a pi pulse flips the qubit', () => {
    const omega = 2 * Math.PI * 5; // 5 MHz
    const curve = rabiCurve({ omega, t1: Infinity, t2: Infinity }, 0.4, 80);
    for (const c of curve) expect(c.p1).toBeCloseTo(idealP1(omega, c.t), 6);
    expect(idealP1(omega, piPulseTime(omega))).toBeCloseTo(1, 12);
    expect(peakP1(curve)).toBeGreaterThan(0.999);
  });

  it('with noise the peaks shrink towards a half and the decay time is 2 / (1/T1 + 1/T2)', () => {
    const omega = 2 * Math.PI * 5;
    const curve = rabiCurve({ omega, t1: 4, t2: 4 }, 20, 400);
    expect(peakP1(curve.slice(0, 40))).toBeGreaterThan(0.9);
    const late = peakP1(curve.slice(-40));
    expect(late).toBeLessThan(0.6);
    expect(late).toBeGreaterThan(0.45);
    expect(decayTime(4, 4)).toBe(4);
    expect(settlesAt({ omega, t1: 4, t2: 4 })).toBeCloseTo(0.5, 2);
  });

  it('a stronger drive finishes the flip sooner, which beats the noise', () => {
    const slow = rabiCurve({ omega: 2 * Math.PI * 1, t1: 5, t2: 5 }, 1, 200);
    const fast = rabiCurve({ omega: 2 * Math.PI * 10, t1: 5, t2: 5 }, 1, 200);
    expect(peakP1(fast)).toBeGreaterThan(peakP1(slow));
  });

  it('a T2 above 2 T1 is not allowed and is pulled back', () => {
    const a = rabiCurve({ omega: 3, t1: 2, t2: 100 }, 5, 50);
    const b = rabiCurve({ omega: 3, t1: 2, t2: 4 }, 5, 50);
    a.forEach((c, i) => expect(c.p1).toBeCloseTo(b[i].p1, 9));
  });
});

describe('Rydberg Blockade Lab', () => {
  it('uses the published interaction strength: 450 MHz at 2 um gives a blockade radius of about 4.3 um', () => {
    expect(interaction(2) / (2 * Math.PI)).toBeCloseTo(450, 6);
    expect(blockadeRadius()).toBeCloseTo(4.29, 1);
    expect(interaction(blockadeRadius())).toBeCloseTo(OMEGA_DEFAULT, 6);
    expect(C6_DEFAULT).toBeGreaterThan(0);
  });

  it('with no interaction the two atoms are independent: P(rr) = sin^4(Omega t / 2)', () => {
    const omega = OMEGA_DEFAULT;
    for (const c of pairCurve(omega, 0, 0.3, 60)) expect(c.rr).toBeCloseTo(independentRr(omega, c.t), 5);
  });

  it('blockaded, the double excitation is suppressed and the pair swings at sqrt(2) times the rate', () => {
    const omega = OMEGA_DEFAULT;
    const curve = pairCurve(omega, interaction(2), 0.3, 120);
    expect(peakRr(curve)).toBeLessThan(0.01);
    const at = curve.find((c) => c.t >= pairPiTime(omega)) as (typeof curve)[number];
    expect(at.plus).toBeGreaterThan(0.98);
    for (const c of curve) expect(c.plus).toBeCloseTo(blockadedPlus(omega, c.t), 2);
  });

  it('probability is conserved, and a closer pair is more blockaded than a farther one', () => {
    const omega = OMEGA_DEFAULT;
    for (const c of pairCurve(omega, interaction(3), 0.3, 40)) expect(c.gg + c.plus + c.rr).toBeCloseTo(1, 6);
    const near = peakRr(pairCurve(omega, interaction(2), 0.3, 100));
    const far = peakRr(pairCurve(omega, interaction(8), 0.3, 100));
    expect(far).toBeGreaterThan(near);
    expect(far).toBeGreaterThan(0.9);
  });
});

describe('Exchange-Coupling Lab', () => {
  it('a full swap happens at t = 1 / (2 J/h) and half of that is the square root of SWAP', () => {
    const j = 20; // MHz
    expect(swapTimeNs(j)).toBeCloseTo(25, 9);
    expect(swapChance(j, swapTimeNs(j))).toBeCloseTo(1, 12);
    expect(swapChance(j, sqrtSwapTimeNs(j))).toBeCloseTo(0.5, 12);
    expect(swapChance(j, 0)).toBe(0);
  });

  it('the half swap is maximally entangled and the full swap is not entangled at all', () => {
    const j = 20;
    expect(entanglementAfter(j, sqrtSwapTimeNs(j))).toBeCloseTo(1, 9);
    expect(entanglementAfter(j, swapTimeNs(j))).toBeCloseTo(0, 9);
    expect(entanglementAfter(j, 0)).toBeCloseTo(0, 9);
    expect(pulseState(j, 7).isNormalized()).toBe(true);
  });

  it('raising the barrier makes J smaller and the swap slower', () => {
    expect(exchangeMHz(6)).toBeLessThan(exchangeMHz(3));
    expect(swapTimeNs(exchangeMHz(6))).toBeGreaterThan(swapTimeNs(exchangeMHz(3)));
    // exponential: equal steps in barrier divide J by the same factor
    expect(exchangeMHz(2) / exchangeMHz(3)).toBeCloseTo(exchangeMHz(5) / exchangeMHz(6), 9);
  });

  it('the curve starts at zero and peaks at the full swap time', () => {
    const j = 10;
    const curve = pulseCurve(j, 2 * swapTimeNs(j), 200);
    expect(curve[0].swap).toBe(0);
    const top = curve.reduce((m, c) => (c.swap > m.swap ? c : m), curve[0]);
    expect(top.t).toBeCloseTo(swapTimeNs(j), 0);
  });
});

describe('Topology Compiler: connectivity has a price', () => {
  it('everyone-to-everyone needs no SWAPs for any circuit', () => {
    for (const c of CIRCUITS) expect(route(c, 'all').swaps, c.id).toBe(0);
  });

  it('on a line, a gate between qubits 0 and 3 needs two SWAPs, and between neighbours none', () => {
    expect(route({ id: 'x', name: 'x', qubits: 4, gates: [[0, 3]], about: '' }, 'line').swaps).toBe(2);
    expect(route({ id: 'x', name: 'x', qubits: 4, gates: [[1, 2]], about: '' }, 'line').swaps).toBe(0);
    expect(route(circuitById('far'), 'line').swaps).toBe(4);
  });

  it('which of the grid and the line is better depends on the circuit, but all-to-all is never beaten', () => {
    // a neighbour chain 0-1-2-3 fits a line exactly; on a 2 x 2 grid qubits 1 and 2 sit on a diagonal
    expect(route(circuitById('chain'), 'line').swaps).toBe(0);
    expect(route(circuitById('chain'), 'grid').swaps).toBeGreaterThan(0);
    // a gate across a long line is far cheaper on a grid, and a fully connected circuit is cheaper too
    expect(route(circuitById('far'), 'grid').swaps).toBeLessThan(route(circuitById('far'), 'line').swaps);
    expect(route(circuitById('all_pairs'), 'grid').swaps).toBeLessThan(route(circuitById('all_pairs'), 'line').swaps);
    for (const c of CIRCUITS) {
      for (const t of TOPOLOGIES) expect(route(c, 'all').swaps, `${c.id} on ${t.id}`).toBeLessThanOrEqual(route(c, t.id).swaps);
    }
  });

  it('is never worse than a router that swaps in and out again, and counts CNOTs as gates plus three per SWAP', () => {
    for (const c of CIRCUITS) {
      for (const t of TOPOLOGIES) {
        const r = route(c, t.id);
        expect(r.swaps, `${c.id} on ${t.id}`).toBeLessThanOrEqual(naiveSwaps(c, t.id));
        expect(r.cnots).toBe(r.gates + 3 * r.swaps);
      }
    }
  });

  it('finds shortest paths and reports a missing route as empty', () => {
    const adj = topologyById('line').neighbours(5);
    expect(shortestPath(adj, 0, 4)).toEqual([0, 1, 2, 3, 4]);
    expect(shortestPath(adj, 2, 2)).toEqual([2]);
    expect(shortestPath([[], []], 0, 1)).toEqual([]);
  });
});

describe('Annealing Lab: a few spins, exactly', () => {
  const easy = problemById('easy');

  it('finds the energies and the ground state by brute force', () => {
    expect(energies(easy)).toHaveLength(16);
    expect(groundEnergy(easy)).toBeCloseTo(-2.8, 9);
    expect(groundStates(easy)).toEqual([5]);
    for (const p of PROBLEMS) expect(groundStates(p), p.id).toHaveLength(1);
  });

  it('exact diagonalisation: a 2 x 2 case matches the formula, and the eigenvectors rebuild the matrix', () => {
    const e = diagonalise([[2, 1], [1, 2]]);
    expect(e.values[0]).toBeCloseTo(1, 12);
    expect(e.values[1]).toBeCloseTo(3, 12);
    const h = hamiltonian(problemById('ring'), 0.4);
    const { values, vectors } = diagonalise(h);
    for (let a = 0; a < h.length; a += 3) {
      for (let b = 0; b < h.length; b += 5) {
        const rebuilt = values.reduce((sum, v, k) => sum + v * vectors[k][a] * vectors[k][b], 0);
        expect(rebuilt).toBeCloseTo(h[a][b], 9);
      }
    }
  });

  it('the time-stepper matches exact diagonalisation for a two-spin problem', () => {
    const two = { id: 't', name: 't', about: '', spins: 2, h: [0.7, -0.3], couplings: [[0, 1, 1.1]] as [number, number, number][] };
    const H = hamiltonian(two, 0.6);
    const psi0 = [0.5, 0.5, 0.5, 0.5].map((v) => Complex.create(v, 0));
    const exact = exactEvolution(H, psi0, 3.7);
    const stepped = steppedEvolution(H, psi0, 3.7, 0.005);
    exact.forEach((c, i) => {
      expect(stepped[i].re).toBeCloseTo(c.re, 6);
      expect(stepped[i].im).toBeCloseTo(c.im, 6);
    });
    expect(exact.reduce((s, c) => s + Complex.absSq(c), 0)).toBeCloseTo(1, 9);
  });

  it('a slow anneal finds the ground state with a chance near 1', () => {
    for (const p of PROBLEMS) expect(anneal(p, 100).success, p.id).toBeGreaterThan(0.95);
  });

  it('a very fast anneal does not, and success rises with time on the hard problem', () => {
    const hard = problemById('hard');
    const fast = anneal(hard, 1).success;
    const mid = anneal(hard, 10).success;
    const slow = anneal(hard, 60).success;
    expect(fast).toBeLessThan(0.2);
    expect(mid).toBeGreaterThan(fast);
    expect(slow).toBeGreaterThan(mid);
  });

  it('probabilities add up to 1', () => {
    const r = anneal(problemById('ring'), 8);
    expect(r.probabilities.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });

  it('the gap closes more on the harder problems, and the runner-up has a higher energy', () => {
    const gap = (id: string) => minimumGap(gapCurve(problemById(id), 20)).gap;
    expect(gap('easy')).toBeGreaterThan(gap('hard'));
    expect(gapAt(problemById('hard'), 0)).toBeGreaterThan(1);
    expect(runnerUp(problemById('hard')).flips).toBeGreaterThanOrEqual(1);
    expect(runnerUp(problemById('hard')).energy).toBeGreaterThan(groundEnergy(problemById('hard')));
  });
});
