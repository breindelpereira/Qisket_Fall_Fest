import type { Circuit, GateName, Placed } from './circuitBuilder';

/**
 * Turns a Circuit Lab circuit into Qiskit (Python) source, so a learner can take what they built here into IBM's
 * tools. Qubit 0 is the least significant bit in both, so the bitstrings Qiskit prints match the ones in the lab.
 * Pure text: nothing is sent anywhere and no Qiskit code runs in the app.
 */
const METHOD: Record<GateName, string> = { H: 'h', X: 'x', Y: 'y', Z: 'z', S: 's', T: 't' };

/** One column's items in the same order the engine applies them (single-qubit gates by qubit number). */
const ordered = (col: Placed[]): Placed[] =>
  [...col].sort((a, b) => (a.kind === 'gate' && b.kind === 'gate' ? a.qubit - b.qubit : 0));

export function toQiskit(c: Circuit): string {
  const lines: string[] = [
    'from qiskit import QuantumCircuit',
    'from qiskit.quantum_info import Statevector',
    '',
    `qc = QuantumCircuit(${c.numQubits})`,
  ];
  let any = false;
  c.columns.forEach((col, i) => {
    if (col.length === 0) return;
    any = true;
    lines.push(`# step ${i + 1}`);
    for (const p of ordered(col)) {
      lines.push(p.kind === 'gate' ? `qc.${METHOD[p.gate]}(${p.qubit})` : `qc.cx(${p.control}, ${p.target})`);
    }
  });
  if (!any) lines.push('# (the circuit is empty: every qubit stays at 0)');
  lines.push('', '# exact probabilities, bitstrings read q(n-1) ... q0 like the Circuit Lab',
    'print(Statevector(qc).probabilities_dict())');
  return lines.join('\n');
}
