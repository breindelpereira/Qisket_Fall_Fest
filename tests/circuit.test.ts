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
