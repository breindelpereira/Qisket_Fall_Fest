import { describe, it, expect } from 'vitest';
import { QuantumStateVector, Gates } from '../src/core/circuit';
import { PRESETS, emptyCircuit, placeCnot, placeGate, runCircuit } from '../src/core/labs/circuitBuilder';
import type { Circuit } from '../src/core/labs/circuitBuilder';
import { toQiskit } from '../src/core/labs/qiskitExport';

/** Replays the generated Qiskit lines on our own engine, so the export is checked against the real circuit. */
function replay(code: string, numQubits: number): QuantumStateVector {
  const state = new QuantumStateVector(numQubits);
  const gate: Record<string, () => ReturnType<typeof Gates.H>> = {
    h: Gates.H, x: Gates.X, y: Gates.Y, z: Gates.Z, s: Gates.S, t: Gates.T,
  };
  for (const line of code.split('\n')) {
    const one = /^qc\.([hxyzst])\((\d+)\)$/.exec(line);
    if (one) { state.applyGate(gate[one[1]](), Number(one[2])); continue; }
    const cx = /^qc\.cx\((\d+), (\d+)\)$/.exec(line);
    if (cx) state.applyCNOT(Number(cx[1]), Number(cx[2]));
  }
  return state;
}

const samePlaces = (a: number[], b: number[]) => a.every((p, i) => Math.abs(p - b[i]) < 1e-9);

describe('Qiskit export of a Circuit Lab circuit', () => {
  it('writes the Bell pair the way Qiskit users write it', () => {
    const bell = PRESETS.find((p) => p.id === 'bell')!.circuit;
    const code = toQiskit(bell);
    expect(code).toContain('qc = QuantumCircuit(2)');
    expect(code.indexOf('qc.h(0)')).toBeGreaterThan(-1);
    expect(code.indexOf('qc.cx(0, 1)')).toBeGreaterThan(code.indexOf('qc.h(0)'));
    expect(code).toContain('Statevector(qc).probabilities_dict()');
  });

  it('every preset replays to the same probabilities as the lab', () => {
    for (const p of PRESETS) {
      const code = toQiskit(p.circuit);
      expect(samePlaces(replay(code, p.circuit.numQubits).getProbabilities(), runCircuit(p.circuit).getProbabilities()), p.id).toBe(true);
    }
  });

  it('keeps gate order, a reversed CNOT and phase gates exactly', () => {
    let c: Circuit = emptyCircuit(3);
    c = placeGate(c, 0, 2, 'H');
    c = placeGate(c, 0, 0, 'T');
    c = placeCnot(c, 1, 2, 0);
    c = placeGate(c, 2, 1, 'Y');
    c = placeGate(c, 2, 2, 'S');
    c = placeGate(c, 3, 0, 'H');
    const code = toQiskit(c);
    expect(code).toContain('qc.cx(2, 0)');
    expect(samePlaces(replay(code, 3).getProbabilities(), runCircuit(c).getProbabilities())).toBe(true);
  });

  it('says so when the circuit is empty and still gives runnable code', () => {
    const code = toQiskit(emptyCircuit(2));
    expect(code).toContain('QuantumCircuit(2)');
    expect(code).toContain('empty');
    expect(code).not.toMatch(/^qc\.[a-z]+\(/m);
  });
});
