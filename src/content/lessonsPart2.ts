import type { LessonRecord } from './types';
import { game, makeLesson, sim } from './lessonText';

/** Shown on the Part 2 overview and at the top of its first module. */
export const HARDWARE_SNAPSHOT_NOTE =
  'All hardware metrics (qubit counts, fidelity) represent the current landscape and are subject to rapid change. Every physical modality represents a different engineering trade-off.';

/** Part 2: Types of Quantum Computers (Hardware). Wording follows the course content in /Questions. */
export const PART2_LESSONS: LessonRecord[] = [
  makeLesson({
    id: 'hw_module_0',
    part: 2,
    moduleNumber: 0,
    title: 'What Makes a Good Qubit?',
    linkedConceptId: 'concept_hardware',
    activities: [game('coherence_race'), sim('qubit_metrics_lab')],
    references: [],
    blocks: [
      { type: 'note', text: HARDWARE_SNAPSHOT_NOTE },
      { type: 'paragraph', text: 'To build a quantum computer, we need a budget.' },
      {
        type: 'bullets',
        items: [
          {
            label: 'T1 & T2 Times',
            text: 'T1 is how long a qubit holds its energy before relaxing from |1⟩ to |0⟩; T2 is how long it keeps a stable phase (its superposition). Together they set the coherence time.',
          },
          { label: 'Gate Speed & Fidelity', text: 'How fast we can do operations, and how accurately.' },
          {
            label: 'The Budget',
            text: 'The number of operations you can do is roughly the coherence time divided by the gate time. For example, T2 = 100 µs with 50 ns gates gives a budget of about 2,000 operations, and fewer once gate errors are counted.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_1',
    part: 2,
    moduleNumber: 1,
    title: 'Superconducting Qubits',
    linkedConceptId: 'concept_hardware',
    activities: [game('cool_down'), sim('transmon_lab')],
    references: [],
    blocks: [
      {
        type: 'bullets',
        items: [
          { label: 'Who uses them', text: 'IBM, Google, Rigetti.' },
          {
            label: 'How they work',
            text: 'Microchips made of superconducting metals (like niobium) cooled to near absolute zero (10-20 millikelvin) in giant dilution refrigerators. They are controlled by microwave pulses.',
          },
          {
            label: 'Trade-offs',
            text: 'Very fast gates, but highly susceptible to noise. The cryogenics are a massive scaling bottleneck.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_2',
    part: 2,
    moduleNumber: 2,
    title: 'Trapped Ions',
    linkedConceptId: 'concept_hardware',
    activities: [game('ion_chain_conductor'), sim('topology_compiler')],
    references: [],
    blocks: [
      {
        type: 'bullets',
        items: [
          { label: 'Who uses them', text: 'IonQ, Quantinuum.' },
          {
            label: 'How they work',
            text: 'Individual charged atoms (ions) suspended in a vacuum by electromagnetic fields, controlled by precision lasers.',
          },
          {
            label: 'Trade-offs',
            text: 'Incredible coherence times and all-to-all connectivity within a chain (any ion can interact directly with any other ion in the same trap), but gate speeds are slower than superconducting, and scaling beyond one chain requires shuttling ions or linking separate traps.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_3',
    part: 2,
    moduleNumber: 3,
    title: 'Neutral Atoms',
    linkedConceptId: 'concept_hardware',
    activities: [game('tweezer_shuffle'), sim('rydberg_blockade_lab')],
    references: [],
    blocks: [
      {
        type: 'bullets',
        items: [
          { label: 'Who uses them', text: 'QuEra, Pasqal, Atom Computing.' },
          {
            label: 'How they work',
            text: 'Uncharged atoms gripped by optical tweezers (lasers). Lasers excite them to high-energy Rydberg states; when two atoms are close, an excited atom blocks its neighbor from being excited (the "Rydberg blockade"), which is used to build entangling gates.',
          },
          {
            label: 'Trade-offs',
            text: 'Can pack massive amounts of qubits into tiny arrays, but controlling them accurately at scale is an ongoing physics challenge.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_4',
    part: 2,
    moduleNumber: 4,
    title: 'Photonic Qubits',
    linkedConceptId: 'concept_hardware',
    activities: [game('photon_factory'), sim('loss_budget_lab')],
    references: [],
    blocks: [
      {
        type: 'bullets',
        items: [
          { label: 'Who uses them', text: 'PsiQuantum, Xanadu.' },
          {
            label: 'How they work',
            text: 'Information is stored in properties of light (photons) traveling through waveguides.',
          },
          {
            label: 'Trade-offs',
            text: 'The waveguides and routing can operate near room temperature (though detectors often need cooling). The main enemy is loss (photons escaping or being absorbed) and the probabilistic nature of photon interactions.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_5',
    part: 2,
    moduleNumber: 5,
    title: 'Silicon Spin Qubits',
    linkedConceptId: 'concept_hardware',
    activities: [game('dot_tuner'), sim('exchange_coupling_lab')],
    references: [],
    blocks: [
      {
        type: 'bullets',
        items: [
          { label: 'Who uses them', text: 'Intel, Diraq.' },
          {
            label: 'How they work',
            text: 'Storing quantum information in the spin of a single electron trapped in a quantum dot on a silicon chip.',
          },
          {
            label: 'Trade-offs',
            text: 'Massive scaling potential because they can be manufactured using existing global semiconductor fab infrastructure. However, tuning millions of microscopic dots perfectly is incredibly difficult.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_6',
    part: 2,
    moduleNumber: 6,
    title: 'Quantum Annealing',
    linkedConceptId: 'concept_hardware',
    activities: [game('valley_roll'), sim('annealing_lab')],
    references: [],
    blocks: [
      {
        type: 'bullets',
        items: [
          { label: 'Who uses them', text: 'D-Wave.' },
          {
            label: 'How they work',
            text: 'Not a "universal" gate-model computer. Instead, you map an optimization problem into a physical energy landscape, let it cool down (anneal), and the system settles into the lowest energy state (the answer).',
          },
          {
            label: 'Trade-offs',
            text: "Great for specific optimization problems, but cannot run general algorithms like Shor's or Grover's. Whether annealers beat the best classical methods on real problems is still debated.",
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_7',
    part: 2,
    moduleNumber: 7,
    title: 'Frontier Ideas',
    linkedConceptId: 'concept_hardware',
    honestyTag: 'Experimental/Contested',
    activities: [],
    references: [],
    blocks: [
      {
        type: 'note',
        text: 'Honesty tag: Experimental/Contested. These approaches are promising but not yet proven at scale.',
      },
      {
        type: 'bullets',
        items: [
          {
            label: 'Topological qubits',
            text: 'Store information in collective properties of exotic materials, so local noise should not easily disturb it. Microsoft is pursuing this approach; early experimental claims are still debated by physicists.',
          },
          {
            label: 'Cat (bosonic) qubits',
            text: 'Encode a qubit in states of a microwave resonator that naturally resist bit-flips, so less error correction is needed (explored by AWS and the startup Alice & Bob).',
          },
          {
            label: 'Modular / networked machines',
            text: 'Link several smaller quantum processors with photons, instead of building one giant chip.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'hw_module_8_9',
    part: 2,
    moduleNumber: 8,
    moduleLabel: '8 & 9',
    title: 'Physical to Logical & Capstone',
    linkedConceptId: 'concept_hardware',
    quizId: 'quiz_hardware',
    activities: [game('logical_qubit_builder'), game('quantum_architect'), sim('overhead_calculator'), sim('comparison_dashboard')],
    references: [],
    blocks: [
      {
        type: 'paragraph',
        text: 'No physical qubit is perfect. To run deep algorithms, we group hundreds or thousands of noisy physical qubits into one Logical Qubit using surface codes.',
      },
      {
        type: 'bullets',
        items: [
          {
            label: 'Trade-off Capstone',
            text: 'If a client asks you to simulate a molecule deeply, you need high fidelity and logical qubits. If they want to solve a routing puzzle quickly, annealing might work. Architecture is about balancing cooling, speed, noise, and connectivity!',
          },
        ],
      },
    ],
  }),
];
