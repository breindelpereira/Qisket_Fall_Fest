import { Complex } from './complex';
import { Gates } from './gates';
import type { Matrix2x2 } from './gates';
import { computeBlochCoordinates } from './bloch';
import type { BlochCoordinates } from './bloch';


export class QuantumStateVector {
  readonly numQubits: number;
  readonly dim: number;
  amplitudes: Complex[];

  constructor(numQubits: number) {
    if (numQubits < 1 || numQubits > 10) {
      throw new Error(`Number of qubits must be between 1 and 10, got ${numQubits}`);
    }
    this.numQubits = numQubits;
    this.dim = 1 << numQubits; // 2^n
    this.amplitudes = new Array(this.dim).fill(null).map(() => Complex.zero());
    // Initialized to |0...0>
    this.amplitudes[0] = Complex.one();
  }

  static fromAmplitudes(amplitudes: Complex[]): QuantumStateVector {
    const dim = amplitudes.length;
    const numQubits = Math.round(Math.log2(dim));
    if ((1 << numQubits) !== dim) {
      throw new Error('Amplitude vector dimension must be a power of 2');
    }
    const state = new QuantumStateVector(numQubits);
    state.amplitudes = amplitudes.map((a) => ({ ...a }));
    return state;
  }

  clone(): QuantumStateVector {
    const copy = new QuantumStateVector(this.numQubits);
    copy.amplitudes = this.amplitudes.map((c) => ({ ...c }));
    return copy;
  }

  reset(): void {
    for (let i = 0; i < this.dim; i++) {
      this.amplitudes[i] = Complex.zero();
    }
    this.amplitudes[0] = Complex.one();
  }

  isNormalized(epsilon = 1e-6): boolean {
    const totalProb = this.amplitudes.reduce((sum, amp) => sum + Complex.absSq(amp), 0);
    return Math.abs(totalProb - 1.0) < epsilon;
  }

  normalize(): void {
    const normSq = this.amplitudes.reduce((sum, amp) => sum + Complex.absSq(amp), 0);
    if (normSq === 0) return;
    const factor = 1 / Math.sqrt(normSq);
    this.amplitudes = this.amplitudes.map((amp) => Complex.scale(amp, factor));
  }

  /**
   * Applies a single-qubit 2x2 unitary matrix to the specified target qubit (0-indexed).
   * In binary indexing: bit 0 is the least significant bit (qubit 0).
   */
  applyGate(gate: Matrix2x2, targetQubit: number): this {
    if (targetQubit < 0 || targetQubit >= this.numQubits) {
      throw new Error(`Invalid target qubit ${targetQubit} for ${this.numQubits}-qubit state`);
    }

    const bitMask = 1 << targetQubit;
    const u00 = gate[0][0];
    const u01 = gate[0][1];
    const u10 = gate[1][0];
    const u11 = gate[1][1];

    for (let i = 0; i < this.dim; i++) {
      // Process each pair (i0, i1) where bit at targetQubit is 0 vs 1
      if ((i & bitMask) === 0) {
        const j = i | bitMask;
        const a0 = this.amplitudes[i];
        const a1 = this.amplitudes[j];

        // new a0 = u00 * a0 + u01 * a1
        // new a1 = u10 * a0 + u11 * a1
        this.amplitudes[i] = Complex.add(Complex.mul(u00, a0), Complex.mul(u01, a1));
        this.amplitudes[j] = Complex.add(Complex.mul(u10, a0), Complex.mul(u11, a1));
      }
    }
    return this;
  }

  applyH(targetQubit: number): this {
    return this.applyGate(Gates.H(), targetQubit);
  }

  applyX(targetQubit: number): this {
    return this.applyGate(Gates.X(), targetQubit);
  }

  applyY(targetQubit: number): this {
    return this.applyGate(Gates.Y(), targetQubit);
  }

  applyZ(targetQubit: number): this {
    return this.applyGate(Gates.Z(), targetQubit);
  }

  applyS(targetQubit: number): this {
    return this.applyGate(Gates.S(), targetQubit);
  }

  applyT(targetQubit: number): this {
    return this.applyGate(Gates.T(), targetQubit);
  }

  applyRz(theta: number, targetQubit: number): this {
    return this.applyGate(Gates.Rz(theta), targetQubit);
  }

  /**
   * Controlled-NOT (CNOT) gate between control and target qubits.
   */
  applyCNOT(controlQubit: number, targetQubit: number): this {
    if (controlQubit === targetQubit) {
      throw new Error('Control and target qubits cannot be identical');
    }
    if (
      controlQubit < 0 || controlQubit >= this.numQubits ||
      targetQubit < 0 || targetQubit >= this.numQubits
    ) {
      throw new Error(`Qubit index out of bounds for ${this.numQubits} qubits`);
    }

    const controlMask = 1 << controlQubit;
    const targetMask = 1 << targetQubit;

    for (let i = 0; i < this.dim; i++) {
      // Only swap amplitudes when control bit is 1 and target bit is 0
      if ((i & controlMask) !== 0 && (i & targetMask) === 0) {
        const j = i | targetMask;
        const temp = this.amplitudes[i];
        this.amplitudes[i] = this.amplitudes[j];
        this.amplitudes[j] = temp;
      }
    }
    return this;
  }

  /**
   * Returns outcome probabilities for each computational basis state |0...0> to |1...1>.
   */
  getProbabilities(): number[] {
    return this.amplitudes.map((a) => Complex.absSq(a));
  }

  /**
   * Probability dictionary keyed by bitstring, e.g. { "00": 0.5, "11": 0.5 }
   */
  getProbabilityMap(): Record<string, number> {
    const map: Record<string, number> = {};
    for (let i = 0; i < this.dim; i++) {
      const bitstring = i.toString(2).padStart(this.numQubits, '0');
      const prob = Complex.absSq(this.amplitudes[i]);
      if (prob > 1e-9) {
        map[bitstring] = Number(prob.toFixed(6));
      }
    }
    return map;
  }

  /**
   * Samples outcomes using Monte-Carlo sampling based on Born rule probabilities.
   */
  sampleCounts(shots = 1024, rng: () => number = Math.random): Record<string, number> {
    const probs = this.getProbabilities();
    const cumulative: number[] = new Array(this.dim);
    let sum = 0;
    for (let i = 0; i < this.dim; i++) {
      sum += probs[i];
      cumulative[i] = sum;
    }

    const counts: Record<string, number> = {};
    for (let s = 0; s < shots; s++) {
      const r = rng();
      // Default to the last outcome so float rounding (sum slightly < 1) can't bias towards |0...0>
      let outcomeIndex = this.dim - 1;
      for (let i = 0; i < this.dim; i++) {
        if (r <= cumulative[i]) {
          outcomeIndex = i;
          break;
        }
      }
      const bitstring = outcomeIndex.toString(2).padStart(this.numQubits, '0');
      counts[bitstring] = (counts[bitstring] || 0) + 1;
    }
    return counts;
  }

  /**
   * Performs a single projective measurement on a specified qubit, collapsing the state.
   * Returns 0 or 1.
   */
  measureQubit(qubit: number, rng: () => number = Math.random): 0 | 1 {
    if (qubit < 0 || qubit >= this.numQubits) {
      throw new Error(`Invalid qubit index ${qubit}`);
    }
    const bitMask = 1 << qubit;
    let prob0 = 0;

    for (let i = 0; i < this.dim; i++) {
      if ((i & bitMask) === 0) {
        prob0 += Complex.absSq(this.amplitudes[i]);
      }
    }

    const outcome: 0 | 1 = rng() < prob0 ? 0 : 1;
    const normFactor = 1 / Math.sqrt(outcome === 0 ? prob0 : 1 - prob0);

    for (let i = 0; i < this.dim; i++) {
      const bitIsZero = (i & bitMask) === 0;
      if ((outcome === 0 && bitIsZero) || (outcome === 1 && !bitIsZero)) {
        this.amplitudes[i] = Complex.scale(this.amplitudes[i], normFactor);
      } else {
        this.amplitudes[i] = Complex.zero();
      }
    }

    return outcome;
  }

  /**
   * For single-qubit systems, returns its Bloch sphere coordinates.
   */
  getBlochCoordinates(): BlochCoordinates {
    if (this.numQubits !== 1) {
      throw new Error('Bloch sphere coordinates are only uniquely defined for a 1-qubit state');
    }
    return computeBlochCoordinates(this.amplitudes[0], this.amplitudes[1]);
  }
}
