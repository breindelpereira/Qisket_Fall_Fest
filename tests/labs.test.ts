import { describe, it, expect } from 'vitest';
import { QuantumStateVector, Gates } from '../src/core/circuit';
import { mzResult, fringeCurve, visibility, bombTest } from '../src/core/labs/interference';
import {
  buildState, histogramRows, addCounts, totalShots, standardError, maxDeviation, shotsForPrecision, PRESET_QUBITS,
} from '../src/core/labs/shots';
import {
  emptyCircuit, placeGate, placeCnot, clearCell, itemAt, resizeCircuit, runCircuit, gateCount, PRESETS, basisLabel,
} from '../src/core/labs/circuitBuilder';
import { concurrence, reducedQubit, agreement } from '../src/core/labs/twoQubit';
import { correlation, chshValue, winFromS, verdict, CLASSICAL_S, QUANTUM_S } from '../src/core/labs/bell';
import { OPTIMAL_QUANTUM, quantumWinProbability, QUANTUM_LIMIT } from '../src/core/games/chsh';

/** Deterministic rng so sampled tests never flake. */
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

describe('Mach-Zehnder lab', () => {
  it('phase 0 sends every photon to the bottom port; phase pi to the top', () => {
    expect(mzResult(0).out[0]).toBeCloseTo(0, 9);
    expect(mzResult(0).out[1]).toBeCloseTo(1, 9);
    expect(mzResult(Math.PI).out[0]).toBeCloseTo(1, 9);
  });

  it('fringes have full visibility without a blocker and a quarter-light floor with one', () => {
    expect(visibility(fringeCurve(null))).toBeCloseTo(1, 6);
    // a blocker in one arm: no interference left, both detectors see 25% at every phase
    for (const p of fringeCurve(1)) {
      expect(p.top).toBeCloseTo(0.25, 9);
      expect(p.bottom).toBeCloseTo(0.25, 9);
    }
    expect(visibility(fringeCurve(1))).toBeCloseTo(0, 9);
  });

  it('bomb test: a live bomb is found without exploding 25% of the time, an empty arm never clicks the dark port', () => {
    const live = bombTest(true);
    expect(live.boom).toBeCloseTo(0.5, 9);
    expect(live.found).toBeCloseTo(0.25, 9);
    expect(live.silent).toBeCloseTo(0.25, 9);
    const dud = bombTest(false);
    expect(dud.found).toBeCloseTo(0, 9);
    expect(dud.boom).toBe(0);
  });
});

describe('Shots + histogram lab', () => {
  it('presets have the right size and exact probabilities', () => {
    expect(buildState('tilted', Math.PI / 2).getProbabilities()[1]).toBeCloseTo(0.5, 9);
    expect(buildState('tilted', Math.PI / 3).getProbabilities()[1]).toBeCloseTo(Math.sin(Math.PI / 6) ** 2, 9);
    expect(buildState('bell').getProbabilities()[0]).toBeCloseTo(0.5, 9);
    for (const k of Object.keys(PRESET_QUBITS) as (keyof typeof PRESET_QUBITS)[]) {
      expect(buildState(k).numQubits).toBe(PRESET_QUBITS[k]);
    }
    expect(buildState('uniform3').getProbabilities().every((p) => Math.abs(p - 0.125) < 1e-9)).toBe(true);
  });

  it('rows list every outcome, including unseen ones, and observed frequencies add up to 1', () => {
    const state = buildState('bell');
    const counts = state.sampleCounts(1000, seeded(7));
    const rows = histogramRows(state, counts);
    expect(rows.map((r) => r.outcome)).toEqual(['00', '01', '10', '11']);
    expect(rows[1].count).toBe(0);
    expect(rows.reduce((s, r) => s + r.observed, 0)).toBeCloseTo(1, 9);
  });

  it('more shots bring the histogram closer to the prediction', () => {
    const state = buildState('tilted', Math.PI / 2);
    const dev = (shots: number) => {
      const rng = seeded(11);
      let worst = 0;
      for (let trial = 0; trial < 20; trial++) worst += maxDeviation(histogramRows(state, state.sampleCounts(shots, rng)));
      return worst / 20;
    };
    expect(dev(10000)).toBeLessThan(dev(100));
    expect(dev(100)).toBeLessThan(0.15);
  });

  it('standard error and precision helpers', () => {
    expect(standardError(0.5, 100)).toBeCloseTo(0.05, 9);
    expect(standardError(0.5, 0)).toBe(1);
    expect(shotsForPrecision(0.01)).toBe(2500);
    expect(addCounts({ '0': 2 }, { '0': 3, '1': 1 })).toEqual({ '0': 5, '1': 1 });
    expect(totalShots({ '0': 5, '1': 1 })).toBe(6);
  });
});

describe('Circuit lab model', () => {
  it('H then CNOT builds a Bell state (qubit 0 controls qubit 1)', () => {
    let c = emptyCircuit(2);
    c = placeGate(c, 0, 0, 'H');
    c = placeCnot(c, 1, 0, 1);
    const p = runCircuit(c).getProbabilities();
    expect(p[0]).toBeCloseTo(0.5, 9);
    expect(p[3]).toBeCloseTo(0.5, 9);
    expect(p[1] + p[2]).toBeCloseTo(0, 9);
  });

  it('a gate on qubit 1 reads as the left bit of the bitstring', () => {
    const c = placeGate(emptyCircuit(2), 0, 1, 'X');
    expect(runCircuit(c).getProbabilityMap()).toEqual({ '10': 1 });
    expect(basisLabel(2, 2)).toBe('|10⟩');
  });

  it('placing, replacing and clearing keep columns valid', () => {
    let c = emptyCircuit(3);
    c = placeGate(c, 0, 0, 'H');
    c = placeGate(c, 0, 1, 'X');
    expect(gateCount(c)).toBe(2);
    c = placeGate(c, 0, 0, 'Z'); // replaces the H on qubit 0
    expect(itemAt(c, 0, 0)).toEqual({ kind: 'gate', gate: 'Z', qubit: 0 });
    expect(gateCount(c)).toBe(2);
    c = placeCnot(c, 0, 0, 2); // a CNOT takes over the column
    expect(c.columns[0]).toHaveLength(1);
    expect(itemAt(c, 0, 2)?.kind).toBe('cnot');
    expect(itemAt(c, 0, 1)).toBeUndefined(); // the wire in between is untouched
    c = placeGate(c, 0, 1, 'H'); // a lone gate removes the CNOT
    expect(c.columns[0].every((p) => p.kind === 'gate')).toBe(true);
    c = clearCell(c, 0, 1);
    expect(gateCount(c)).toBe(0);
  });

  it('ignores impossible placements', () => {
    const c = emptyCircuit(2);
    expect(placeGate(c, 99, 0, 'H')).toBe(c);
    expect(placeGate(c, 0, 5, 'H')).toBe(c);
    expect(placeCnot(c, 0, 1, 1)).toBe(c);
    expect(placeCnot(c, 0, 0, 7)).toBe(c);
  });

  it('shrinking the register drops gates on removed wires', () => {
    let c = emptyCircuit(3);
    c = placeGate(c, 0, 2, 'H');
    c = placeCnot(c, 1, 0, 2);
    c = placeGate(c, 2, 0, 'X');
    const small = resizeCircuit(c, 2);
    expect(small.numQubits).toBe(2);
    expect(gateCount(small)).toBe(1);
    expect(resizeCircuit(c, 9).numQubits).toBe(3);
  });

  it('textbook identities hold: HXH = Z and HZH = X', () => {
    const hxh = PRESETS.find((p) => p.id === 'hxh')!.circuit;
    expect(runCircuit(hxh).getProbabilityMap()).toEqual({ '0': 1 });
    const hzh = PRESETS.find((p) => p.id === 'hzh')!.circuit;
    expect(runCircuit(hzh).getProbabilityMap()).toEqual({ '1': 1 });
  });

  it('GHZ gives only 000 and 111', () => {
    const map = runCircuit(PRESETS.find((p) => p.id === 'ghz')!.circuit).getProbabilityMap();
    expect(Object.keys(map).sort()).toEqual(['000', '111']);
    expect(map['000']).toBeCloseTo(0.5, 5);
  });

  it('every preset runs to a normalised state', () => {
    for (const p of PRESETS) expect(runCircuit(p.circuit).isNormalized()).toBe(true);
  });
});

describe('Two-qubit helpers', () => {
  const bell = () => new QuantumStateVector(2).applyH(0).applyCNOT(0, 1);

  it('product states are not entangled, Bell states are maximally entangled', () => {
    expect(concurrence(new QuantumStateVector(2))).toBeCloseTo(0, 9);
    expect(concurrence(new QuantumStateVector(2).applyH(0).applyH(1))).toBeCloseTo(0, 9);
    expect(concurrence(bell())).toBeCloseTo(1, 9);
  });

  it('a half-prepared state sits in between', () => {
    const s = new QuantumStateVector(2).applyGate(Gates.Ry(Math.PI / 3), 0).applyCNOT(0, 1);
    const c = concurrence(s);
    expect(c).toBeGreaterThan(0.1);
    expect(c).toBeLessThan(0.99);
  });

  it('each half of a Bell pair is a maximally mixed qubit; a product qubit keeps a unit Bloch vector', () => {
    expect(reducedQubit(bell(), 0).length).toBeCloseTo(0, 9);
    expect(reducedQubit(bell(), 1).length).toBeCloseTo(0, 9);
    const plus = new QuantumStateVector(2).applyH(1);
    expect(reducedQubit(plus, 1).x).toBeCloseTo(1, 9);
    expect(reducedQubit(plus, 1).length).toBeCloseTo(1, 9);
    expect(reducedQubit(plus, 0).z).toBeCloseTo(1, 9);
  });

  it('reduced Bloch length is sqrt(1 - C^2) for any pure state', () => {
    for (const t of [0.4, 1.1, 2.0, 2.9]) {
      const s = new QuantumStateVector(2).applyGate(Gates.Ry(t), 0).applyGate(Gates.Ry(0.7), 1).applyCNOT(0, 1).applyT(1).applyH(1);
      const c = concurrence(s);
      expect(reducedQubit(s, 0).length).toBeCloseTo(Math.sqrt(1 - c * c), 6);
      expect(reducedQubit(s, 1).length).toBeCloseTo(Math.sqrt(1 - c * c), 6);
    }
  });

  it('+i state has a +y Bloch vector', () => {
    const s = new QuantumStateVector(2).applyH(0).applyS(0);
    expect(reducedQubit(s, 0).y).toBeCloseTo(1, 9);
  });

  it('Bell pair always agrees; plain |00> does too; |+>|0> half the time', () => {
    expect(agreement(bell())).toBeCloseTo(1, 9);
    expect(agreement(new QuantumStateVector(2))).toBeCloseTo(1, 9);
    expect(agreement(new QuantumStateVector(2).applyH(0))).toBeCloseTo(0.5, 9);
  });

  it('measuring one half of a Bell pair fixes the other', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const s = bell();
      const a = s.measureQubit(0, seeded(seed));
      expect(reducedQubit(s, 1).p1).toBeCloseTo(a, 9);
    }
  });
});

describe('Bell & CHSH explorer', () => {
  it('correlation of the Bell pair is cos(2 * angle difference)', () => {
    for (const [a, b] of [[0, 0], [0, Math.PI / 8], [0.3, 1.1], [Math.PI / 4, -Math.PI / 8]]) {
      expect(correlation(a, b)).toBeCloseTo(Math.cos(2 * (a - b)), 9);
    }
  });

  it('the best angles reach Tsirelson 2*sqrt(2), and the win probability follows 1/2 + S/8', () => {
    const s = chshValue(OPTIMAL_QUANTUM);
    expect(s).toBeCloseTo(QUANTUM_S, 9);
    expect(winFromS(s)).toBeCloseTo(QUANTUM_LIMIT, 9);
    expect(winFromS(s)).toBeCloseTo(quantumWinProbability(OPTIMAL_QUANTUM), 9);
  });

  it('win probability and S agree for arbitrary angles', () => {
    for (const strat of [
      { alice: [0, 0.4] as [number, number], bob: [1.0, 0.2] as [number, number] },
      { alice: [0.7, -0.9] as [number, number], bob: [0.1, 2.2] as [number, number] },
    ]) {
      expect(winFromS(chshValue(strat))).toBeCloseTo(quantumWinProbability(strat), 9);
    }
  });

  it('everyone measuring the same way stays inside the classical bound', () => {
    const s = chshValue({ alice: [0, 0], bob: [0, 0] });
    expect(s).toBeCloseTo(2, 9);
    expect(verdict(s)).toBe('classical');
    expect(verdict(chshValue(OPTIMAL_QUANTUM))).toBe('beyond');
    expect(CLASSICAL_S).toBe(2);
  });
});
