import type { LessonRecord } from './types';
import { game, makeLesson, reading, sim, video } from './lessonText';

/** Part 1: Concepts Through Games and Simulations. Wording follows the course content in /Questions. */
export const PART1_LESSONS: LessonRecord[] = [
  makeLesson({
    id: 'module_0',
    part: 1,
    moduleNumber: 0,
    title: 'Why Quantum? (Orientation)',
    ahaMoment: 'A quantum computer is a specialist tool, not just a faster laptop.',
    misconceptionToFix: 'A quantum computer does NOT try every answer at once.',
    linkedConceptId: 'concept_why_quantum',
    quizId: 'quiz_module_0',
    activities: [game('hype_check')],
    blocks: [
      {
        type: 'paragraph',
        text: "Quantum computers aren't here to replace your smartphone, make your internet browser faster, or run spreadsheets. Instead, they are highly specialized machines designed to solve specific types of problems that classical computers struggle with.",
      },
      {
        type: 'bullets',
        items: [
          {
            label: 'Where they might help',
            text: 'Simulating quantum systems (like complex molecules for drug discovery or new battery materials), certain optimization and sampling problems, and specific cryptography tasks.',
          },
          { label: "Where they won't help", text: 'Everyday computing tasks.' },
          {
            label: 'The Secret Sauce',
            text: `Quantum computers don't just "try every answer at once." They rely on superposition, entanglement, and above all interference (arranging amplitudes so wrong answers cancel out and right answers are amplified), followed by a final measurement.`,
          },
        ],
      },
    ],
    references: [
      video('The Map of Quantum Computing - Quantum Computing Explained', 'Domain of Science', '-UlxHPIEVqA'),
    ],
  }),

  makeLesson({
    id: 'module_1',
    part: 1,
    moduleNumber: 1,
    title: 'Qubits & Superposition',
    ahaMoment: `A qubit state is a point on a sphere, not "0 and 1 at the same time."`,
    misconceptionToFix: `A qubit isn't "both at once."`,
    linkedConceptId: 'concept_qubits',
    quizId: 'quiz_module_1',
    activities: [game('quantum_heist'), game('coin_flip'), sim('single_qubit_lab')],
    blocks: [
      {
        type: 'paragraph',
        text: "Classical computers use bits, which are strictly 0 or 1. Quantum computers use qubits. A qubit's state is described by amplitudes over the outcomes 0 and 1.",
      },
      {
        type: 'bullets',
        items: [
          {
            label: 'Superposition',
            text: `When a qubit is in a superposition, it isn't "0 and 1 at the same time." Rather, it has a probability of being measured as 0, and a probability of being measured as 1.`,
          },
          {
            label: 'The Bloch Sphere',
            text: "Imagine a 3D globe. The North Pole is the state |0⟩, and the South Pole is |1⟩. The equator represents equal-weight superpositions (like |+⟩ and |−⟩), where there is a 50/50 chance of measuring 0 or 1. A qubit's state is just a point on this sphere!",
          },
        ],
      },
    ],
    references: [
      video('Quantum Computing in 5 Levels', 'WIRED', 'OWJCfOvochA', 138, 375),
    ],
  }),

  makeLesson({
    id: 'module_2',
    part: 1,
    moduleNumber: 2,
    title: 'Measurement',
    ahaMoment: 'One run is random; thousands of runs reveal the weights.',
    misconceptionToFix: 'The value is not pre-determined. The act of measurement forces the qubit to choose.',
    linkedConceptId: 'concept_measurement',
    quizId: 'quiz_module_2',
    activities: [game('schrodingers_stealth'), sim('shots_histogram_lab')],
    blocks: [
      {
        type: 'paragraph',
        text: 'Measurement is the most aggressive action in quantum mechanics. When you measure a qubit in superposition, its state collapses to a single definite outcome (0 or 1).',
      },
      {
        type: 'bullets',
        items: [
          { label: 'The Born Rule', text: 'The probability of an outcome is the squared magnitude of its amplitude.' },
          {
            label: 'Shots & Histograms',
            text: 'Because one measurement gives a random result, quantum computers run the same circuit thousands of times (called "shots"). The results are plotted on a histogram to reveal the true probability weights.',
          },
          {
            label: 'Measurement Bases',
            text: "You can look at a qubit from different angles. Measuring in the standard (Z) basis checks if it's North or South. Measuring in the X basis checks the equator. A state that is 100% certain in one basis might be 50/50 random in another!",
          },
        ],
      },
    ],
    references: [
      video(
        "But what is quantum computing? (Grover's Algorithm), first part: state vectors & measurement",
        '3Blue1Brown',
        'RQWpF2Gb-gU',
        0,
        952,
      ),
    ],
  }),

  makeLesson({
    id: 'module_3',
    part: 1,
    moduleNumber: 3,
    title: 'Gates',
    ahaMoment: 'H, Z, H in sequence equals X.',
    misconceptionToFix: `People think Z "does nothing" because the probabilities don't change, but it changes the phase.`,
    linkedConceptId: 'concept_gates',
    quizId: 'quiz_module_3',
    activities: [game('bloch_runner'), game('gate_deck'), sim('circuit_lab')],
    blocks: [
      {
        type: 'paragraph',
        text: "Classical computers use logic gates (AND, OR, NOT). Quantum computers use quantum gates, which are essentially rotations of the qubit's point around the Bloch sphere.",
      },
      {
        type: 'bullets',
        items: [
          { label: 'X Gate', text: 'A bit-flip (rotates North to South, like a classical NOT).' },
          {
            label: 'Z Gate',
            text: 'A phase-flip (a half-turn around the vertical Z axis: |0⟩ and |1⟩ stay where they are, while |+⟩ swings around the equator to |−⟩).',
          },
          {
            label: 'H Gate (Hadamard)',
            text: 'Moves a state from the poles to the equator (creates a superposition) and vice versa.',
          },
          { label: 'Reversibility', text: 'Every quantum gate can be undone by applying its inverse.' },
          {
            label: 'Phase',
            text: "Rotating around the equator changes a qubit's relative phase. This doesn't change the probability of measuring 0 or 1 right away, but it is the secret ingredient for interference.",
          },
        ],
      },
    ],
    references: [
      reading('Quantum computing for the very curious (interactive essay)', 'Quantum Country', 'https://quantum.country/qcvc'),
      reading(
        'Bits, gates, and circuits',
        'IBM Quantum Learning',
        'https://quantum.cloud.ibm.com/learning/en/courses/utility-scale-quantum-computing/bits-gates-and-circuits',
      ),
    ],
  }),

  makeLesson({
    id: 'module_4',
    part: 1,
    moduleNumber: 4,
    title: 'Phase & Interference',
    ahaMoment: 'A "guaranteed" path can go dark due to cancellation.',
    misconceptionToFix: "Probabilities don't just add up. Amplitudes add up first.",
    linkedConceptId: 'concept_interference',
    quizId: 'quiz_module_4',
    activities: [game('photon_escape_room'), sim('mach_zehnder_lab')],
    blocks: [
      {
        type: 'paragraph',
        text: 'This is where quantum computing gets its power. Because quantum states are described by amplitudes (which can be positive, negative, or complex numbers), they can add together like waves.',
      },
      {
        type: 'bullets',
        items: [
          {
            label: 'Constructive Interference',
            text: 'Amplitudes with the same sign add up, making an outcome more likely.',
          },
          {
            label: 'Destructive Interference',
            text: 'Amplitudes with opposite signs cancel each other out, making an outcome less likely, or completely impossible when they cancel exactly.',
          },
          {
            label: 'The Mach-Zehnder Interferometer',
            text: "If you split a photon's path (putting it in superposition), change its phase, and recombine it, you can direct 100% of the photon to a specific detector. If you block one path, the interference is destroyed, and the photons that get through reach either detector with 50/50 odds.",
          },
        ],
      },
    ],
    references: [video('Single Photon Interference', 'Veritasium', 'GzbKb59my3U')],
  }),

  makeLesson({
    id: 'module_5a',
    part: 1,
    moduleNumber: 5,
    moduleLabel: '5A',
    title: 'Entanglement & Bell Tests',
    ahaMoment: 'Correlations that no classical strategy can match.',
    misconceptionToFix: 'You cannot use entanglement to send an instant text message.',
    linkedConceptId: 'concept_entanglement',
    quizId: 'quiz_module_5a',
    activities: [game('alice_and_bob'), sim('two_qubit_lab'), sim('bell_chsh_explorer')],
    blocks: [
      {
        type: 'paragraph',
        text: 'When two qubits interact (using a two-qubit gate like a CNOT), their states can become linked. This is entanglement.',
      },
      {
        type: 'bullets',
        items: [
          {
            label: 'Exponential Space',
            text: '1 qubit has 2 amplitudes. 2 qubits have 4. 10 qubits have 1024. The state space doubles with every added qubit!',
          },
          {
            label: 'Correlations',
            text: 'Measuring one entangled qubit instantly tells you the state of the other, no matter how far apart they are. But each individual result is still random, so this cannot be used to send a message.',
          },
          {
            label: "Bell's Inequality & CHSH",
            text: `Einstein suspected the correlations came from hidden classical instructions ("local hidden variables"). The CHSH game tests this: any classical strategy wins at most 75% of the time, while players sharing entanglement can reach about 85% (cos²(π/8) ≈ 85.4%). Real experiments, recognized by the 2022 Nobel Prize in Physics, beat the classical limit.`,
          },
        ],
      },
    ],
    references: [video("Bell's Theorem: The Quantum Venn Diagram Paradox", 'MinutePhysics', 'zcqZHYo7ONs')],
  }),

  makeLesson({
    id: 'module_5b',
    part: 1,
    moduleNumber: 5,
    moduleLabel: '5B',
    title: 'Entanglement as a Resource (Teleportation)',
    ahaMoment: 'You can move a quantum state without copying it.',
    linkedConceptId: 'concept_teleportation',
    quizId: 'quiz_module_5b',
    activities: [game('teleport_relay'), sim('teleportation_lab')],
    blocks: [
      {
        type: 'bullets',
        items: [
          {
            label: 'No-Cloning Theorem',
            text: 'It is physically impossible to make an exact copy of an unknown quantum state. If you try to measure it to copy it, you destroy the superposition.',
          },
          {
            label: 'Quantum Teleportation',
            text: "How do we move a qubit if we can't copy it? Teleportation! By consuming a shared pair of entangled qubits and sending two classical bits of information, Alice can destroy a quantum state on her end and make it perfectly reconstruct on Bob's end. Bob cannot recover the state until the two classical bits arrive, so teleportation is never faster than light.",
          },
        ],
      },
    ],
    references: [
      reading(
        'Basics of Quantum Information (see the "Entanglement in action" lesson for teleportation)',
        'IBM Quantum Learning',
        'https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information',
      ),
    ],
  }),

  makeLesson({
    id: 'module_6',
    part: 1,
    moduleNumber: 6,
    moduleLabel: '6A & 6B',
    title: 'Circuits, Oracles, and Search',
    ahaMoment: 'Algorithms arrange interference so wrong answers cancel.',
    linkedConceptId: 'concept_algorithms',
    quizId: 'quiz_module_6',
    activities: [game('gate_deck'), game('oracle_detective'), sim('deutsch_jozsa_explorer'), sim('grover_explorer')],
    blocks: [
      {
        type: 'bullets',
        items: [
          {
            label: 'Reading Circuits',
            text: 'Quantum circuits are read left to right. Lines are qubits, boxes are gates.',
          },
          { label: 'Oracles', text: 'Think of an oracle as a "black box" puzzle.' },
          {
            label: 'Deutsch-Jozsa',
            text: 'Proves that a quantum computer can solve a specific puzzle (is a hidden function constant or balanced?) in exactly one query using interference, while a deterministic classical computer may need up to 2ⁿ⁻¹ + 1 queries in the worst case.',
          },
          {
            label: "Grover's Algorithm",
            text: `Used for searching. It uses "amplitude amplification"—the oracle flips the sign of the right answer's amplitude, then a diffusion step (a reflection about the average) amplifies it. Repeating this about (π/4)√N times makes the right answer the most probable outcome.`,
          },
        ],
      },
    ],
    references: [
      video("But what is quantum computing? (Grover's Algorithm), the search part", '3Blue1Brown', 'RQWpF2Gb-gU', 952, 1770),
      reading(
        'Deutsch-Jozsa algorithm',
        'IBM Quantum Learning',
        'https://quantum.cloud.ibm.com/learning/en/courses/fundamentals-of-quantum-algorithms/quantum-query-algorithms/deutsch-jozsa-algorithm',
      ),
    ],
  }),

  makeLesson({
    id: 'module_7',
    part: 1,
    moduleNumber: 7,
    title: 'Noise & Error Correction',
    ahaMoment: 'You can find an error without looking at the data.',
    misconceptionToFix: 'Measuring the data directly ruins the quantum state.',
    linkedConceptId: 'concept_error_correction',
    quizId: 'quiz_module_7',
    activities: [game('qubit_surgeon'), sim('noise_lab')],
    blocks: [
      {
        type: 'paragraph',
        text: 'Physical qubits are fragile. Heat, radiation, and vibrations cause decoherence (losing their quantum state) and errors (unwanted bit-flips or phase-flips).',
      },
      {
        type: 'bullets',
        items: [
          { text: "Since we can't copy qubits (No-Cloning), how do we do error correction?" },
          {
            label: 'Parity Checks',
            text: 'We use extra qubits (ancilla qubits) to check the relationship between data qubits without actually measuring the data itself. Measuring the ancillas gives an error "syndrome" that shows which qubit flipped, without revealing the encoded information.',
          },
          {
            label: 'Logical Qubits',
            text: 'By grouping many noisy "physical" qubits together with error correction codes, we create one far more reliable "logical" qubit. In the 3-qubit repetition code, if each qubit flips with probability p, the logical error rate is 3p² − 2p³, which is smaller than p whenever p is below 50%.',
          },
        ],
      },
    ],
    references: [
      reading(
        'Foundations of Quantum Error Correction',
        'IBM Quantum Learning',
        'https://quantum.cloud.ibm.com/learning/en/courses/foundations-of-quantum-error-correction',
      ),
    ],
  }),
];
