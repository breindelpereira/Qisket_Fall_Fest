import type { LessonRecord } from './types';
import { game, makeLesson, sim, video } from './lessonText';

/** Shown on the Part 2 overview and at the top of its first module. */
export const HARDWARE_SNAPSHOT_NOTE =
  'All hardware metrics (qubit counts, fidelity) represent the current landscape and are subject to rapid change. Every physical modality represents a different engineering trade-off.';

/**
 * Part 2: Types of Quantum Computers (Hardware). The bullets that came from the course content in /Questions are kept as
 * written; the extra paragraphs and points explain them. Numbers are given as orders of magnitude or as "typically", because
 * hardware figures change every year: exact figures belong in a dated, sourced data file (see Plan/Parts_2_and_3_Build_Plan.md).
 */
export const PART2_LESSONS: LessonRecord[] = [
  makeLesson({
    id: 'hw_module_0',
    part: 2,
    moduleNumber: 0,
    title: 'What Makes a Good Qubit?',
    linkedConceptId: 'concept_hardware',
    ahaMoment: 'A good qubit is not just one that works: it is one you can do many accurate operations on before it forgets.',
    misconceptionToFix: 'More qubits does not automatically mean a better quantum computer. A few excellent qubits can beat many poor ones.',
    activities: [game('coherence_race'), sim('qubit_metrics_lab')],
    references: [
      video('Measuring decoherence', 'QuTech Academy', 'RRvzE_430DY', 0, 355),
      video('What is Gate Fidelity', 'QuEra Computing', 'ehDUE0SdcTE', 0, 148),
    ],
    blocks: [
      { type: 'note', text: HARDWARE_SNAPSHOT_NOTE },
      { type: 'paragraph', text: 'To build a quantum computer, we need a budget.' },
      {
        type: 'paragraph',
        text: 'Every physical qubit is a delicate thing that is slowly disturbed by its surroundings. A quantum program is a race: do as many useful operations as you can before the qubit forgets what it was holding. Part 2 compares the different ways people build qubits, and every comparison comes back to this race.',
      },
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
          {
            label: 'Why T2 is the stricter one',
            text: 'A superposition can be spoiled without the qubit losing any energy, so the phase usually fades before the energy does. T2 is therefore never longer than twice T1, and it is the number that limits most algorithms.',
          },
          {
            label: 'Fidelity',
            text: 'Fidelity says how close an operation came to the ideal one. A gate fidelity of 99.9% means about one gate in a thousand goes wrong. Errors add up: after a thousand such gates, a mistake somewhere is quite likely.',
          },
          {
            label: 'Two budgets, not one',
            text: 'Time sets one limit (how many gates fit before the qubit forgets) and accuracy sets another (how many gates before the errors pile up). The usable depth is whichever limit you hit first.',
          },
          {
            label: 'Other things that matter',
            text: 'How many qubits there are, which pairs of qubits can interact directly (connectivity), how well the qubits can be read out, and how many can be controlled at once. A good machine balances all of them.',
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
    ahaMoment: 'A superconducting qubit is a tiny electrical circuit that behaves like a single atom, so it can be made with chip-making tools.',
    misconceptionToFix: 'The qubit itself is not the hot or large part: the refrigerator, wiring and control electronics around it are what make the machine big.',
    activities: [game('cool_down'), sim('transmon_lab')],
    references: [
      video('The transmon qubit', 'QuTech Academy', 'cb_f9KpYipk', 0, 363),
      video('Building a quantum computer with superconducting qubits (QuantumCasts)', 'Google Quantum AI', 'uPw9nkJAwDY', 0, 646),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'A superconducting qubit is built from loops of superconducting metal and one special component, a Josephson junction, which makes the circuit behave like an atom with well-separated energy levels. The two lowest levels are used as |0⟩ and |1⟩. The most common design is called the transmon.',
      },
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
          {
            label: 'Why so cold',
            text: 'The metal only superconducts when cold, and heat would otherwise knock the qubit between its levels. At these temperatures the thermal energy is far smaller than the energy gap between |0⟩ and |1⟩.',
          },
          {
            label: 'Control and readout',
            text: 'Short microwave pulses sent down cables rotate the qubit. To read it out, a second circuit coupled to the qubit shifts its frequency depending on whether the qubit is in |0⟩ or |1⟩.',
          },
          {
            label: 'Why the fridge is a bottleneck',
            text: 'Every control line carries a little heat into the fridge, and the cooling power at the coldest stage is tiny. More qubits need more lines, more electronics and more cooling, which is why wiring and control are as hard as the qubits themselves.',
          },
          {
            label: 'Speed',
            text: 'Gates typically take tens of nanoseconds, among the fastest of any approach. Coherence times are typically tens to a few hundred microseconds in recent devices, and they vary by chip and year.',
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
    ahaMoment: 'Every ion of one element is identical, because nature made them, so ions start with nearly perfect qubits.',
    misconceptionToFix: 'All-to-all connectivity does not mean unlimited size: it holds inside one chain, and a bigger machine needs ions moved or traps linked.',
    activities: [game('ion_chain_conductor'), sim('topology_compiler')],
    references: [
      video('How Trapped-Ion Quantum Computers Work', 'Quantinuum', 'ec3Bs6Wam8w', 0, 122),
      video('Learn Quantum: What is Trapped Ion Quantum Computing?', 'IonQ', 'f80y85GGyfE', 0, 520),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Instead of building a qubit, trapped-ion machines use one that nature already made. An ion is an atom with an electric charge, held in place by electric fields. Two of its internal energy levels serve as |0⟩ and |1⟩, and every ion of the same element is exactly alike.',
      },
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
          {
            label: 'How two ions interact',
            text: 'Ions in a chain repel each other, so they share collective motion like beads on a spring. A laser pulse can use that shared motion to link the states of two chosen ions, which makes an entangling gate.',
          },
          {
            label: 'Why connectivity helps',
            text: 'On a chip where only neighbours interact, a gate between distant qubits needs a chain of SWAP operations that each add error. In a chain of ions any pair can be addressed directly, so fewer operations are needed.',
          },
          {
            label: 'Why gates are slower',
            text: 'Laser operations on ions typically take microseconds to hundreds of microseconds, much slower than superconducting gates. The long coherence times make up for much of this.',
          },
          {
            label: 'Growing the machine',
            text: 'A single chain gets harder to control as it gets longer. Designs therefore move ions between zones on a chip, or link several traps, for example with photons.',
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
    ahaMoment: 'Light itself can hold atoms in a grid, and moving the light moves the atoms, so the layout of the computer can be rearranged.',
    misconceptionToFix: 'The Rydberg blockade is not a property each qubit has alone: it is an interaction between two nearby atoms, and it is what makes entangling gates possible.',
    activities: [game('tweezer_shuffle'), sim('rydberg_blockade_lab')],
    references: [
      video('Neutral Atom Quantum Computers - Concept of Operation', 'QuEra Computing', 'JmnZVhQc-H8', 0, 196),
      video('The 2018 Physics Nobel Prize: What ARE Optical Tweezers?', 'Atoms and Sporks', 'UAmdoOX3870', 0, 521),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Neutral atoms have no electric charge, so they are not held by electric fields. They are held by focused laser light instead. A tightly focused beam is a trap for a single atom, and many beams make an array: a grid of atoms, each one a qubit.',
      },
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
          {
            label: 'The qubit',
            text: 'Two long-lived internal states of each atom, for example two hyperfine levels, act as |0⟩ and |1⟩. Single-qubit gates use laser or microwave pulses.',
          },
          {
            label: 'What a Rydberg state is',
            text: 'An atom with one electron lifted into a very large orbit. Such an atom is huge and strongly affected by its neighbours, which is exactly what is needed for a two-qubit interaction.',
          },
          {
            label: 'The blockade in one sentence',
            text: 'If two atoms are closer than a certain distance, only one of them can be excited to the Rydberg state at a time, so the state of one atom decides what the laser does to the other. That conditional behaviour is the basis of an entangling gate.',
          },
          {
            label: 'Rearranging',
            text: 'Tweezers can be moved, so atoms can be rearranged after loading to fill gaps in the array and to bring chosen atoms close together. This gives a flexible connectivity that a fixed chip does not have.',
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
    ahaMoment: 'Photons barely interact with their surroundings, which makes them great messengers and hard to make interact with each other.',
    misconceptionToFix: 'Photonic does not mean "no cooling at all": the light can travel at room temperature, but the detectors usually need to be cold.',
    activities: [game('photon_factory'), sim('loss_budget_lab')],
    references: [
      video('How Xanadu’s Photonic Quantum Computers Work', 'Xanadu', 'v7iAqcFCTQQ', 0, 142),
      video('Introduction to Photonic Quantum Computing', 'Quantum Source', 'ustVvxJ8t-s', 0, 134),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Here the qubit is light. A photon is hard to disturb, which is why it carries quantum information so well, and also why it is hard to make two photons interact. The machine is a network of beam splitters and phase shifters, the same pieces as the interferometer you used in Module 4, built into a chip.',
      },
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
          {
            label: 'Ways to encode a qubit',
            text: 'One common way is to use which of two paths a photon takes (the same two-path idea as the Mach-Zehnder lab). Others use properties such as polarisation or the time a photon arrives. Some designs use squeezed states of light instead of single photons.',
          },
          {
            label: 'Why loss is so costly',
            text: 'A lost photon is lost information. If each component lets a photon through with some probability, the chance that all of them work is those probabilities multiplied together, so it falls exponentially as a circuit grows. Reducing loss in every component is a central goal.',
          },
          {
            label: 'Probabilistic gates',
            text: 'Photons do not interact easily, so a two-photon gate built from linear optics works only some of the time, and a detector announces when it worked. Designs therefore use many attempts, spare photons and clever routing to make the overall result reliable.',
          },
          {
            label: 'Detectors',
            text: 'Detecting single photons well usually needs superconducting detectors that run at very low temperatures. Light can travel on chip at room temperature, but the full system still has cooling.',
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
    ahaMoment: 'If qubits can be built with the same tools as ordinary chips, the factories that already exist could build quantum computers.',
    misconceptionToFix: 'Manufacturability is a promise, not a finished result: today each dot still needs careful individual tuning.',
    activities: [game('dot_tuner'), sim('exchange_coupling_lab')],
    references: [
      video('Spin qubits', 'QuTech Academy', 'y9dt5uTvsEM', 0, 631),
      video('Quantum Dot Qubits', 'QuTech Academy', 'vQnA05VnGis', 0, 342),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'An electron has a spin, a tiny magnetic direction that can point up or down. A quantum dot is a small region on a chip that can trap a single electron. Spin up and spin down are |0⟩ and |1⟩, and the qubit is only a few tens of nanometres across.',
      },
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
          {
            label: 'Why silicon',
            text: 'Natural silicon contains an isotope with a nuclear spin that disturbs the electron. Purified silicon with almost none of it gives the electron spin a very quiet environment and long coherence times.',
          },
          {
            label: 'The two-qubit gate',
            text: 'Voltages on tiny gate electrodes decide where each electron sits. Lowering the barrier between two neighbouring dots lets the electrons overlap, which creates an exchange coupling that swaps their spins. Timing this swap precisely gives an entangling gate.',
          },
          {
            label: 'Temperature',
            text: 'These qubits typically run at around a kelvin or below, much warmer than superconducting qubits, which makes cooling a little easier, but they still need a refrigerator.',
          },
          {
            label: 'The hard part',
            text: 'Every dot is slightly different, so each needs its own voltages and calibration. Making millions of dots behave is a control and tuning problem as much as a physics one.',
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
    ahaMoment: 'An annealer does not run a circuit: it lets a physical system settle, and the settled state is the answer.',
    misconceptionToFix: 'A quantum annealer is not a faster general-purpose quantum computer, and it cannot run Shor\'s or Grover\'s algorithm.',
    activities: [game('valley_roll'), sim('annealing_lab')],
    references: [
      video('What is Quantum Annealing?', 'D-Wave', 'zvfkXjzzYOo', 0, 358),
      video('How The Quantum Annealing Process Works', 'D-Wave', 'UV_RlCAc5Zs', 0, 356),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Think of a ball rolling on a hilly landscape that settles in a valley. If you can describe a problem as a landscape where the best answer is the lowest valley, letting a physical system settle can solve it. An annealer is a machine built to do exactly that.',
      },
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
          {
            label: 'How the problem is written',
            text: 'The problem is turned into an Ising model: a set of spins that each prefer up or down, with couplings that reward or punish pairs for agreeing. The lowest energy arrangement of the spins is the best answer.',
          },
          {
            label: 'What the quantum part does',
            text: 'The machine starts with a strong quantum "transverse field" that puts every spin in an equal superposition, and slowly turns it down while turning the problem on. Quantum tunnelling can let the system pass through a barrier instead of having to climb over it.',
          },
          {
            label: 'Why it can fail',
            text: 'If the schedule is too fast, or the system is disturbed, it can settle in a valley that is not the lowest one. Runs are repeated many times and the best result is kept.',
          },
          {
            label: 'Honest status',
            text: 'Annealers are real, large machines that people use. Whether they give a speed-up over the best classical methods on practical problems is an open and actively debated question.',
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
    ahaMoment: 'Instead of fixing errors after they happen, these ideas try to build qubits that are hard to disturb in the first place.',
    misconceptionToFix: 'A promising idea is not a working computer: each of these approaches is still being proven, and claims are debated.',
    activities: [],
    references: [
      video('Majorana fermions and where to find them (topological qubits)', 'QuTech Academy', '_otDRv7IN28', 0, 388),
      video('Cat Qubits and LDPC Codes, a New Step Towards Quantum Error Correction', 'Alice & Bob', 'nI0Yg-QRAns', 0, 289),
      video('A Multinode Quantum Network explained (networked machines)', 'QuTech', 'DRGT5ZgGrEc', 0, 162),
    ],
    blocks: [
      {
        type: 'note',
        text: 'Honesty tag: Experimental/Contested. These approaches are promising but not yet proven at scale.',
      },
      {
        type: 'paragraph',
        text: 'The approaches in this module have one thing in common: they try to reduce the amount of error correction that is needed, by making the physical qubits more robust or by linking smaller machines. Read each one as a research direction with a possible payoff, not as a product.',
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
          {
            label: 'What they share',
            text: 'Each trades one hard problem for another: topological qubits need exotic materials, cat qubits need a very well controlled resonator, and networks need efficient links between machines.',
          },
          {
            label: 'How to read news about them',
            text: 'Look for what was actually measured, whether it was repeated by others, and whether the result is about one qubit or a whole machine. A single promising measurement is the start of a long path, not the end of it.',
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
    ahaMoment: 'A reliable qubit is not found, it is built: many imperfect qubits, constantly checked, act as one good one.',
    misconceptionToFix: 'A logical qubit is not a software trick that replaces hardware. It is made of real physical qubits and needs a lot of them.',
    activities: [game('logical_qubit_builder'), game('quantum_architect'), sim('overhead_calculator'), sim('comparison_dashboard')],
    references: [
      video('Quantum error correction codes', 'QuTech Academy', '4hWUIGZh6WE', 0, 320),
      video('Demonstrating Quantum Error Correction', 'Google Quantum AI', '_ugJLuJ1_gM', 0, 239),
    ],
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
          {
            label: 'Physical vs logical',
            text: 'A physical qubit is a real device with errors. A logical qubit is information spread across many physical qubits in a pattern that lets errors be detected and corrected, so it fails far less often than any single physical qubit.',
          },
          {
            label: 'The surface code idea',
            text: 'Qubits are laid out in a grid. Some hold data and others are repeatedly measured to check whether neighbours agree, as in Module 7 but in two dimensions so it catches both kinds of error. The results point to where something went wrong without reading the data.',
          },
          {
            label: 'The threshold',
            text: 'Error correction only helps when the physical error rate is below a threshold, often quoted as about one percent per operation for the surface code. Below it, a bigger grid gives a better logical qubit. Above it, a bigger grid makes things worse.',
          },
          {
            label: 'The overhead',
            text: 'The better you need the logical qubit to be, the larger the grid must be. That is why useful algorithms are expected to need very many physical qubits for each logical one.',
          },
          {
            label: 'Putting it together',
            text: 'To choose hardware for a task, ask what the task needs: depth (coherence and gate speed), connectivity, the number of qubits, the error rate, and how the machine can be scaled and cooled. No modality wins on all of them.',
          },
        ],
      },
    ],
  }),
];
