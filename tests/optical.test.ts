import { describe, it, expect } from 'vitest';
import { simulate, fireOnePhoton, beamSplitterMatrix, phaseShifterMatrix } from '../src/core/optical/interferometer';
import type { OpticalElement } from '../src/core/optical/interferometer';
import { LEVELS, findSolution, levelSolved, defaultPicks, buildLayout } from '../src/core/games/photonEscape';
import { QuantumStateVector, Complex, Gates } from '../src/core/circuit';

const BS: OpticalElement = { type: 'bs' };
const ph = (phi: number): OpticalElement => ({ type: 'phase', phi });

describe('Optical / interferometer engine', () => {
  it('one beam splitter gives 50/50', () => {
    const r = simulate([BS]);
    expect(r.out[0]).toBeCloseTo(0.5, 9);
    expect(r.out[1]).toBeCloseTo(0.5, 9);
  });

  it('Mach-Zehnder: output ports follow sin^2(phi/2) and cos^2(phi/2)', () => {
    for (const phi of [0, 0.3, Math.PI / 2, 1.9, Math.PI, 4.4, 2 * Math.PI]) {
      const r = simulate([BS, ph(phi), BS]);
      expect(r.out[0]).toBeCloseTo(Math.sin(phi / 2) ** 2, 9);
      expect(r.out[1]).toBeCloseTo(Math.cos(phi / 2) ** 2, 9);
    }
  });

  it('with zero phase the bright port is 1 and the dark port is 0', () => {
    const r = simulate([BS, ph(0), BS]);
    expect(r.out[0]).toBeCloseTo(0, 9);
    expect(r.out[1]).toBeCloseTo(1, 9);
  });

  it('agrees with the circuit core when the same matrices are applied to a state vector', () => {
    const phi = 1.1;
    const sv = new QuantumStateVector(1)
      .applyGate(beamSplitterMatrix(), 0)
      .applyGate(phaseShifterMatrix(phi), 0)
      .applyGate(beamSplitterMatrix(), 0);
    const r = simulate([BS, ph(phi), BS]);
    expect(r.out[0]).toBeCloseTo(sv.getProbabilities()[0], 9);
    expect(r.out[1]).toBeCloseTo(sv.getProbabilities()[1], 9);
  });

  it('beam splitter is unitary', () => {
    const m = beamSplitterMatrix();
    const dag = [
      [Complex.conj(m[0][0]), Complex.conj(m[1][0])],
      [Complex.conj(m[0][1]), Complex.conj(m[1][1])],
    ] as ReturnType<typeof Gates.H>;
    expect(Gates.equals2x2(Gates.multiply2x2(m, dag), Gates.I(), 1e-9)).toBe(true);
  });

  it('total probability is conserved including absorption', () => {
    const r = simulate([BS, ph(0.7), { type: 'block', path: 1 }, BS]);
    expect(r.out[0] + r.out[1] + r.absorbed).toBeCloseTo(1, 9);
  });

  it('Elitzur-Vaidman: a blocker in a dark interferometer makes the dark port click 25% of the time', () => {
    const clear = simulate([BS, ph(0), BS]);
    const blocked = simulate([BS, ph(0), { type: 'block', path: 1 }, BS]);
    expect(clear.out[0]).toBeCloseTo(0, 9);
    expect(blocked.out[0]).toBeCloseTo(0.25, 9);
    expect(blocked.absorbed).toBeCloseTo(0.5, 9);
  });

  it('sampling a single photon respects the probabilities', () => {
    const r = simulate([BS]);
    expect(fireOnePhoton(r, () => 0.1)).toBe(0);
    expect(fireOnePhoton(r, () => 0.9)).toBe(1);
    const dark = simulate([BS, { type: 'block', path: 0 }]);
    expect(fireOnePhoton(dark, () => 0.2)).toBe(1); // 50% bottom port
    expect(fireOnePhoton(dark, () => 0.7)).toBe('absorbed'); // other 50% absorbed
  });
});

describe('Photon Escape Room levels', () => {
  it('every level has a solution', () => {
    for (const level of LEVELS) {
      const sol = findSolution(level);
      expect(sol, `level ${level.id}`).not.toBeNull();
      expect(levelSolved(level, sol!)).toBe(true);
    }
  });

  it('no level is solved by the starting layout', () => {
    for (const level of LEVELS) {
      expect(levelSolved(level, defaultPicks(level)), `level ${level.id}`).toBe(false);
    }
  });

  it('level 2 is the guaranteed-path surprise: two splitters exit bottom with certainty', () => {
    const level = LEVELS[1];
    expect(levelSolved(level, [{ type: 'bs' }, { type: 'bs' }])).toBe(true);
  });

  it('doing nothing never solves the interference levels (splitters are required)', () => {
    expect(levelSolved(LEVELS[2], [{ type: 'empty' }, { type: 'phase', phi: 0 }, { type: 'empty' }])).toBe(false);
    expect(levelSolved(LEVELS[2], [BS, ph(Math.PI), BS])).toBe(true);
  });

  it('level 4 needs real interference: one splitter alone is not accepted', () => {
    const e = { type: 'empty' } as const;
    expect(levelSolved(LEVELS[3], [e, ph(0), BS])).toBe(false);
    expect(levelSolved(LEVELS[3], [BS, ph(Math.PI / 2), BS])).toBe(true);
  });

  it('level 5 places the saboteur right after the chosen slot', () => {
    const layout = buildLayout([BS, ph(0), BS], { slot: 1, path: 1 });
    expect(layout.map((e) => e.type)).toEqual(['bs', 'phase', 'block', 'bs']);
  });
});
