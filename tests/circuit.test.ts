import { describe, it, expect } from 'vitest';
import { Complex, Gates, QuantumStateVector, computeBlochCoordinates } from '../src/core/circuit';

describe('Phase 1 Circuit Core Test Gate', () => {
  it('verifies that H * X * H = Z as 2x2 unitary matrices', () => {
    const H = Gates.H();
    const X = Gates.X();
    const Z = Gates.Z();

    // Compute H * X
    const HX = Gates.multiply2x2(H, X);
    // Compute (H * X) * H
    const HXH = Gates.multiply2x2(HX, H);

    expect(Gates.equals2x2(HXH, Z, 1e-6)).toBe(true);
  });

  it('verifies H * X * H equals Z when applied to an arbitrary state vector', () => {
    // Test on |0>
    const state1 = new QuantumStateVector(1);
    state1.applyH(0).applyX(0).applyH(0);

    const stateZ = new QuantumStateVector(1);
    stateZ.applyZ(0);

    // Z|0> = |0>
    expect(Complex.equals(state1.amplitudes[0], stateZ.amplitudes[0])).toBe(true);
    expect(Complex.equals(state1.amplitudes[1], stateZ.amplitudes[1])).toBe(true);

    // Test on |1>: X|0> = |1>
    const state2 = new QuantumStateVector(1);
    state2.applyX(0).applyH(0).applyX(0).applyH(0);

    const stateZ1 = new QuantumStateVector(1);
    stateZ1.applyX(0).applyZ(0);

    // Z|1> = -|1>
    expect(Complex.equals(state2.amplitudes[1], stateZ1.amplitudes[1])).toBe(true);
  });

  it('prepares Bell state (|00> + |11>)/sqrt(2) and verifies exact 50/50 probabilities with zero cross-terms', () => {
    const state = new QuantumStateVector(2); // Initialized to |00>

    // Prepare Bell state: H on qubit 0, then CNOT(0 -> 1)
    state.applyH(0);
    state.applyCNOT(0, 1);

    expect(state.isNormalized()).toBe(true);

    const probs = state.getProbabilityMap();
    expect(probs['00']).toBeCloseTo(0.5, 5);
    expect(probs['11']).toBeCloseTo(0.5, 5);
    expect(probs['01']).toBeUndefined();
    expect(probs['10']).toBeUndefined();
  });

  it('ensures state vectors remain normalized after a sequence of arbitrary gates', () => {
    const state = new QuantumStateVector(3); // 3 qubits, 8 states
    expect(state.isNormalized()).toBe(true);

    state.applyH(0);
    expect(state.isNormalized()).toBe(true);

    state.applyH(1);
    state.applyX(2);
    expect(state.isNormalized()).toBe(true);

    state.applyCNOT(0, 1);
    state.applyCNOT(1, 2);
    expect(state.isNormalized()).toBe(true);

    state.applyS(0);
    state.applyT(1);
    state.applyRz(Math.PI / 3, 2);
    expect(state.isNormalized()).toBe(true);

    // Total probability sum must strictly equal 1
    const totalProb = state.getProbabilities().reduce((a, b) => a + b, 0);
    expect(totalProb).toBeCloseTo(1.0, 6);
  });

  it('computes accurate Bloch sphere coordinates for canonical states', () => {
    // |0>
    const bloch0 = computeBlochCoordinates(Complex.one(), Complex.zero());
    expect(bloch0.x).toBeCloseTo(0, 5);
    expect(bloch0.y).toBeCloseTo(0, 5);
    expect(bloch0.z).toBeCloseTo(1, 5);
    expect(bloch0.theta).toBeCloseTo(0, 5);

    // |1>
    const bloch1 = computeBlochCoordinates(Complex.zero(), Complex.one());
    expect(bloch1.x).toBeCloseTo(0, 5);
    expect(bloch1.y).toBeCloseTo(0, 5);
    expect(bloch1.z).toBeCloseTo(-1, 5);
    expect(bloch1.theta).toBeCloseTo(Math.PI, 5);

    // |+> = (|0> + |1>)/sqrt(2)
    const invSqrt2 = 1 / Math.SQRT2;
    const blochPlus = computeBlochCoordinates(Complex.create(invSqrt2), Complex.create(invSqrt2));
    expect(blochPlus.x).toBeCloseTo(1, 5);
    expect(blochPlus.y).toBeCloseTo(0, 5);
    expect(blochPlus.z).toBeCloseTo(0, 5);
    expect(blochPlus.theta).toBeCloseTo(Math.PI / 2, 5);
    expect(blochPlus.phi).toBeCloseTo(0, 5);

    // |-> = (|0> - |1>)/sqrt(2)
    const blochMinus = computeBlochCoordinates(Complex.create(invSqrt2), Complex.create(-invSqrt2));
    expect(blochMinus.x).toBeCloseTo(-1, 5);
    expect(blochMinus.y).toBeCloseTo(0, 5);
    expect(blochMinus.z).toBeCloseTo(0, 5);
    expect(blochMinus.theta).toBeCloseTo(Math.PI / 2, 5);
  });
});

describe('Circuit core: sampling, measurement and rotations', () => {
  const seeded = (values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length];
  };

  it('sampleCounts follows the Born rule for |+> with an injected RNG', () => {
    const state = new QuantumStateVector(1).applyH(0);
    const counts = state.sampleCounts(4, seeded([0.1, 0.4, 0.6, 0.9]));
    expect(counts).toEqual({ '0': 2, '1': 2 });
  });

  it('sampleCounts never returns an outcome with zero probability, even at r ~ 1', () => {
    const state = new QuantumStateVector(2); // |00>
    const counts = state.sampleCounts(3, seeded([0, 0.5, 0.999999999]));
    expect(counts).toEqual({ '00': 3 });
  });

  it('sampleCounts matches 50/50 statistically for |+> with the real RNG', () => {
    const counts = new QuantumStateVector(1).applyH(0).sampleCounts(20000);
    expect((counts['0'] ?? 0) / 20000).toBeCloseTo(0.5, 1);
  });

  it('measureQubit collapses a Bell pair to perfectly correlated outcomes', () => {
    for (const r of [0.1, 0.9]) {
      const state = new QuantumStateVector(2).applyH(0).applyCNOT(0, 1);
      const first = state.measureQubit(0, () => r);
      expect(first).toBe(r < 0.5 ? 0 : 1);
      expect(state.isNormalized()).toBe(true);
      expect(state.measureQubit(1)).toBe(first);
    }
  });

  it('CNOT works on non-adjacent qubits', () => {
    const state = new QuantumStateVector(3).applyX(0).applyCNOT(0, 2);
    expect(state.getProbabilityMap()).toEqual({ '101': 1 });
  });

  it('Rx(pi) acts as X and Ry(pi/2) on |0> gives |+> (up to phase)', () => {
    const rx = new QuantumStateVector(1).applyGate(Gates.Rx(Math.PI), 0);
    expect(rx.getProbabilities()[1]).toBeCloseTo(1, 6);

    const ry = new QuantumStateVector(1).applyGate(Gates.Ry(Math.PI / 2), 0);
    const b = ry.getBlochCoordinates();
    expect(b.x).toBeCloseTo(1, 5);
    expect(b.z).toBeCloseTo(0, 5);
  });

  it('every standard gate is unitary (U * U-dagger = I)', () => {
    const dagger = (m: ReturnType<typeof Gates.H>) =>
      [
        [Complex.conj(m[0][0]), Complex.conj(m[1][0])],
        [Complex.conj(m[0][1]), Complex.conj(m[1][1])],
      ] as ReturnType<typeof Gates.H>;
    const all = [Gates.I(), Gates.X(), Gates.Y(), Gates.Z(), Gates.H(), Gates.S(), Gates.T(),
      Gates.Rx(0.7), Gates.Ry(1.3), Gates.Rz(2.1)];
    for (const g of all) {
      expect(Gates.equals2x2(Gates.multiply2x2(g, dagger(g)), Gates.I(), 1e-9)).toBe(true);
    }
  });
});
