import type { ConceptRecord } from './types';


export const CONCEPTS: Record<string, ConceptRecord> = {
  concept_qubits: {
    id: 'concept_qubits',
    name: 'Qubits & Superposition',
    summary: 'A qubit state is represented as complex amplitudes over outcomes |0> and |1>, mapping to a point on the Bloch sphere rather than a classical binary switch.',
    prerequisites: [],
    relatedGames: ['quantum_heist'],
    relatedSims: ['single_qubit_lab'],
    relatedLessons: ['module_1'],
    honestyTag: 'Simplified model',
  },
  concept_measurement: {
    id: 'concept_measurement',
    name: 'Quantum Measurement',
    summary: 'Measurement collapses a superposition into a definitive classical outcome with probability proportional to the squared magnitude of its amplitude (Born Rule).',
    prerequisites: ['concept_qubits'],
    relatedGames: ['schrodingers_stealth'],
    relatedSims: ['shots_histogram_lab'],
    relatedLessons: ['module_2'],
    honestyTag: 'Accurate',
  },
  concept_gates: {
    id: 'concept_gates',
    name: 'Quantum Gates as Unitary Rotations',
    summary: 'Quantum gates are reversible unitary transformations that rotate the qubit state vector on the Bloch sphere without altering state normalization.',
    prerequisites: ['concept_qubits', 'concept_measurement'],
    relatedGames: ['bloch_runner'],
    relatedSims: ['circuit_lab'],
    relatedLessons: ['module_3'],
    honestyTag: 'Accurate',
  },
  concept_entanglement: {
    id: 'concept_entanglement',
    name: 'Quantum Entanglement',
    summary: 'Non-classical correlation between two or more qubits where the composite system cannot be described as independent states of its components.',
    prerequisites: ['concept_gates'],
    relatedGames: ['alice_and_bob'],
    relatedSims: ['two_qubit_lab', 'bell_chsh_explorer'],
    relatedLessons: ['module_5a'],
    honestyTag: 'Accurate',
  },
};
