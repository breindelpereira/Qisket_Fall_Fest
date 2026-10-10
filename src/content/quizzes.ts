import type { QuizRecord } from './types';

/**
 * Quizzes from the course content in /Questions (the cleaned PDF), one per module plus the Part 2 and Part 3 quizzes.
 * Every quiz uses the same passing score: 70% (the team's decision; it was 80% at first). In practice a 3-question quiz
 * needs every answer right, a 4- or 5-question quiz allows one miss for 4 and 5 questions respectively, and so on.
 */
export const QUIZ_PASS_SCORE = 0.7;

export const QUIZZES: Record<string, QuizRecord> = {
  quiz_module_0: {
    id: 'quiz_module_0',
    lessonId: 'module_0',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'Which of the following is a task a quantum computer is expected to excel at?',
        options: [
          'Simulating the behavior of a complex molecule',
          'Making video streaming faster',
          'Running everyday word processing software faster',
          'Storing standard digital photos more efficiently',
        ],
        correctIndex: 0,
        explanation: 'Quantum computers are specialist tools. Because molecules operate on quantum rules, quantum computers are uniquely suited to simulate them. They will not speed up everyday classical tasks like video streaming.',
      },
      {
        prompt: 'How does a quantum computer find the correct answer to a complex problem?',
        options: [
          'It tries every single possible answer at the exact same time and picks the best one.',
          'It runs at a much higher clock speed than a regular computer.',
          'It uses interference to cancel out wrong answers and amplify the probability of the right answer.',
          'It asks an AI to predict the outcome.',
        ],
        correctIndex: 2,
        explanation: 'A quantum computer does NOT try every answer at once. Instead, quantum algorithms use interference—much like noise-canceling headphones—to make the wrong answers cancel each other out, so the right answer is very likely to appear when measured.',
        misconceptionTag: 'quantum-tries-every-answer',
      },
      {
        prompt: 'Which statement about quantum computers today is most accurate?',
        options: [
          'They have already replaced supercomputers for most scientific work.',
          'They can already break all internet encryption.',
          'Real machines exist, but they are still noisy; many promising applications need larger, error-corrected machines.',
          'They are only a theoretical idea and have never been built.',
        ],
        correctIndex: 2,
        explanation: 'You can run circuits on real quantum hardware over the cloud today, but current devices are noisy. Breaking widely used encryption with Shor\'s algorithm would need far larger, error-corrected machines that do not exist yet.',
        misconceptionTag: 'quantum-computers-today',
      },
    ],
  },
  quiz_module_1: {
    id: 'quiz_module_1',
    lessonId: 'module_1',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'If a qubit is in the |+⟩ state (on the equator of the Bloch sphere), what does this mean?',
        options: [
          'It is exactly equal to 0.5.',
          'It is both 0 and 1 at the exact same time.',
          'The qubit is broken.',
          'It has equal amplitudes, meaning a 50% chance of being measured as 0 and a 50% chance of being measured as 1.',
        ],
        correctIndex: 3,
        explanation: 'A qubit isn\'t "both at once." Its state is described by amplitudes, and those amplitudes set the probability of each outcome when it is measured.',
        misconceptionTag: 'qubit-both-at-once',
      },
      {
        prompt: 'On the Bloch sphere, where do the classical states 0 and 1 live?',
        options: [
          'At the North and South poles (|0⟩ and |1⟩).',
          'On the equator.',
          'Inside the center of the sphere.',
          'They constantly orbit the sphere.',
        ],
        correctIndex: 0,
        explanation: 'The poles represent the classical, definite states of |0⟩ and |1⟩.',
      },
      {
        prompt: 'A qubit has a 90% chance of being measured as 0. Where is it on the Bloch sphere?',
        options: [
          'In the northern hemisphere, close to (but not at) the North Pole.',
          'On the equator.',
          'At the South Pole.',
          'Exactly at the North Pole.',
        ],
        correctIndex: 0,
        explanation: 'The closer a state is to the North Pole, the more likely the outcome 0. Only a state exactly at the pole gives 0 with certainty; 90% means close to the pole but not on it.',
      },
      {
        prompt: '|+⟩ and |−⟩ both give 0 or 1 with 50/50 odds when measured in the standard basis. Are they the same state?',
        options: [
          'Yes, they are identical.',
          'No, because |−⟩ has a negative probability.',
          'No. They sit at opposite points on the equator and differ in relative phase.',
          'Yes, the minus sign is just notation.',
        ],
        correctIndex: 2,
        explanation: 'The same probabilities do not mean the same state. The minus sign is a relative phase: probabilities can never be negative, but amplitudes can. You can tell |+⟩ and |−⟩ apart perfectly by measuring in the X basis (Module 2) or by applying an H gate first (Module 3).',
        misconceptionTag: 'same-odds-same-state',
      },
    ],
  },
  quiz_module_2: {
    id: 'quiz_module_2',
    lessonId: 'module_2',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'What happens if you prepare a qubit in the exact same superposition state and measure it just once?',
        options: [
          'You will get a fraction, like 0.7.',
          'You will get 0 and 1 simultaneously.',
          'You will get either a 0 or a 1, randomly determined by its probability weights.',
          'It reveals the hidden value it always had.',
        ],
        correctIndex: 2,
        explanation: 'You only ever get one definite outcome per measurement. To see the probability distribution, you must run the experiment many times (shots).',
      },
      {
        prompt: 'True or False: Measurement simply reveals a value that was already hidden inside the qubit.',
        options: [
          'True',
          'False',
        ],
        correctIndex: 1,
        explanation: 'The value is not pre-determined. For example, if you measure the |0⟩ state using an X-basis flashlight, the result is completely 50/50 random. The act of measurement forces the qubit to choose.',
        misconceptionTag: 'measurement-reveals-hidden-value',
      },
      {
        prompt: 'A qubit has amplitude 0.6 for |0⟩ and 0.8 for |1⟩. If you run 1,000 shots, roughly how many times will you see 1?',
        options: [
          'About 800',
          'About 360',
          'About 640',
          'About 500',
        ],
        correctIndex: 2,
        explanation: 'Born rule: the probability is the amplitude squared, so P(1) = 0.8² = 0.64, or about 640 out of 1,000. (Check: 0.6² + 0.8² = 0.36 + 0.64 = 1.) The exact count changes a little every run; this random spread is called shot noise.',
      },
      {
        prompt: 'You measure a qubit and get 1. You immediately measure it again in the same basis. What do you get?',
        options: [
          '0 or 1, with 50/50 odds',
          'Always 0',
          'Nothing, because a qubit can only be measured once',
          '1, with certainty',
        ],
        correctIndex: 3,
        explanation: 'The first measurement collapsed the state to |1⟩. Repeating the same measurement straight away gives the same answer (on an ideal, noise-free qubit).',
      },
      {
        prompt: 'A qubit in the |+⟩ state is measured in the X basis. What happens?',
        options: [
          'The result is 50/50 random.',
          'You always get 0.',
          'The qubit is destroyed.',
          'You get the "+" outcome every time.',
        ],
        correctIndex: 3,
        explanation: '|+⟩ is one of the X basis\'s own states, so measuring it in that basis gives a certain result. The same state measured in the Z basis is 50/50. Randomness depends on the basis you choose to measure in.',
      },
    ],
  },
  quiz_module_3: {
    id: 'quiz_module_3',
    lessonId: 'module_3',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'If a qubit is at the North Pole (|0⟩) and you apply an X gate, where does it end up?',
        options: [
          'The equator',
          'It stays at the North Pole',
          'The South Pole (|1⟩)',
          'It collapses',
        ],
        correctIndex: 2,
        explanation: 'The X gate is a bit-flip. It rotates the state 180 degrees from |0⟩ to |1⟩.',
      },
      {
        prompt: 'Why does the Z gate seem to "do nothing" to the probabilities of a |+⟩ state?',
        options: [
          'Because the Z gate is broken.',
          'Because Z gates only work on |0⟩.',
          'Because it only changes the relative phase, moving the state to |−⟩, which still has a 50/50 probability.',
          'Because quantum gates aren\'t real.',
        ],
        correctIndex: 2,
        explanation: 'People think Z does nothing because the probabilities don\'t change. But it changes the phase (turning |+⟩ into |−⟩). As we will see in the next module, phase is critical for interference!',
        misconceptionTag: 'z-does-nothing',
      },
      {
        prompt: 'What do you get if you apply H twice in a row to |0⟩?',
        options: [
          '|0⟩',
          '|1⟩',
          '|+⟩',
          'A random result',
        ],
        correctIndex: 0,
        explanation: 'H is its own inverse (H·H = I). The first H moves |0⟩ to |+⟩ on the equator; the second H brings it back to |0⟩. This is reversibility in action.',
      },
      {
        prompt: 'Starting from |0⟩, you apply H, then Z, then H. What state do you end up in?',
        options: [
          '|0⟩',
          '|+⟩',
          '|1⟩',
          '|−⟩',
        ],
        correctIndex: 2,
        explanation: 'Step by step: H takes |0⟩ to |+⟩, Z takes |+⟩ to |−⟩, and H takes |−⟩ to |1⟩. The whole sequence acts like an X gate (H·Z·H = X), the module\'s "Aha!" moment. A phase change becomes a bit flip when you sandwich it between two H gates.',
      },
    ],
  },
  quiz_module_4: {
    id: 'quiz_module_4',
    lessonId: 'module_4',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'In a quantum circuit, how do probabilities combine?',
        options: [
          'Amplitudes add together first (allowing for cancellation), and then the probability is calculated.',
          'Probabilities simply add up (e.g., 50% + 50% = 100%).',
          'They multiply together.',
          'They average out.',
        ],
        correctIndex: 0,
        explanation: 'Probabilities don\'t just add up. Amplitudes add up first. A positive amplitude and a negative amplitude can cancel out to zero, meaning a seemingly possible outcome becomes impossible (destructive interference).',
        misconceptionTag: 'probabilities-just-add',
      },
      {
        prompt: 'In a balanced Mach-Zehnder interferometer, one detector never clicks. What happens when you block one of the two arms?',
        options: [
          'The dark detector stays dark.',
          'No photons reach either detector.',
          'Each photon splits into two half-photons.',
          'The dark detector starts clicking. Photons that get past the block reach either detector with 50/50 odds.',
        ],
        correctIndex: 3,
        explanation: 'Blocking a path removes one of the two amplitudes, so there is nothing left to cancel against. Blocking a path makes a "forbidden" outcome possible, which is a clear sign that interference, not simple probability, was at work.',
      },
      {
        prompt: 'Two paths lead to the same detector, each with amplitude of size 1/2. In Case 1 both amplitudes are +1/2. In Case 2 one is +1/2 and the other is −1/2. What is the probability of reaching the detector in each case?',
        options: [
          '0.5 in both cases (0.25 + 0.25)',
          'Case 1: 1 (100%); Case 2: 0',
          '0.25 in both cases',
          'Case 1: 1; Case 2: 0.5',
        ],
        correctIndex: 1,
        explanation: 'Add the amplitudes first, then square. Case 1: 1/2 + 1/2 = 1, so the probability is 1² = 1. Case 2: 1/2 − 1/2 = 0, so the probability is 0. Adding probabilities instead (0.25 + 0.25) gives the classical answer of 0.5, which experiments contradict.',
      },
    ],
  },
  quiz_module_5a: {
    id: 'quiz_module_5a',
    lessonId: 'module_5a',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'Does quantum entanglement allow us to send messages faster than light?',
        options: [
          'Yes, because the other qubit reacts instantly.',
          'Yes, but only in a vacuum.',
          'No, because entanglement is an illusion.',
          'No, because of the no-signaling principle; the outcomes are correlated, but random, so no actual information is transmitted.',
        ],
        correctIndex: 3,
        explanation: 'You cannot use entanglement to send an instant text message. The results you get are random. You only see the correlation after comparing notes with the other person using a slow, classical channel.',
        misconceptionTag: 'entanglement-faster-than-light',
      },
      {
        prompt: 'Two qubits start in |00⟩. You apply H to the first qubit, then a CNOT. What do you see when you measure both qubits many times?',
        options: [
          'Always 00',
          'All four outcomes, each about 25% of the time',
          '00 or 11, each about 50% of the time; the two qubits always match',
          'Only 01 or 10',
        ],
        correctIndex: 2,
        explanation: 'H and CNOT create the Bell state (|00⟩ + |11⟩)/√2. Each qubit on its own looks completely random, but the two results always agree. This combination of perfect correlation and individual randomness is the signature of entanglement.',
      },
      {
        prompt: 'In the CHSH game, what is the best win rate for a classical strategy, compared with a strategy that uses shared entanglement?',
        options: [
          '50% vs 100%',
          '85% vs 75%',
          '75% vs about 85%',
          '75% vs 100%',
        ],
        correctIndex: 2,
        explanation: 'No classical strategy can beat 75%. Entanglement raises the maximum to cos²(π/8) ≈ 85.4% (the Tsirelson bound). Entanglement is powerful but not magic: it does not let you win 100% of the time.',
      },
      {
        prompt: 'In general, how many amplitudes do you need to describe the state of 10 qubits?',
        options: [
          '1,024',
          '10',
          '20',
          '100',
        ],
        correctIndex: 0,
        explanation: 'n qubits need 2ⁿ amplitudes, and 2¹⁰ = 1,024. The count doubles with every added qubit, which is why simulating around 50 or more qubits on a classical computer becomes extremely hard.',
      },
    ],
  },
  quiz_module_5b: {
    id: 'quiz_module_5b',
    lessonId: 'module_5b',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'Why can\'t we just copy a qubit to back up our quantum data?',
        options: [
          'Our hard drives aren\'t big enough.',
          'The No-Cloning Theorem states that unknown quantum states cannot be perfectly copied.',
          'It requires too much electricity.',
          'Quantum companies patent their qubits so copying is illegal.',
        ],
        correctIndex: 1,
        explanation: 'To copy a state, you\'d have to measure it to know what to copy. But measuring collapses the superposition, destroying the very state you wanted to copy.',
      },
      {
        prompt: 'In quantum teleportation, what must Alice send to Bob over a normal (classical) channel?',
        options: [
          'Nothing; the state jumps across instantly.',
          'The original qubit itself.',
          'A complete list of the state\'s amplitudes.',
          'Two classical bits: the results of her measurements.',
        ],
        correctIndex: 3,
        explanation: 'Bob uses the two bits to choose his correction (an X and/or Z gate). Without them, his qubit looks completely random, which is why teleportation cannot send information faster than light. Note that only two bits are sent, not the amplitudes, which could need infinite precision to write down.',
      },
      {
        prompt: 'After teleportation is complete, what has happened to Alice\'s original qubit state?',
        options: [
          'She still has an identical copy.',
          'It stays entangled with Bob\'s qubit forever.',
          'It physically travelled through space to Bob.',
          'It was destroyed by her measurement; only Bob now has the state.',
        ],
        correctIndex: 3,
        explanation: 'Teleportation moves a state; it does not copy it. Alice\'s measurement destroys her copy, so at the end only one copy exists, exactly as the No-Cloning Theorem requires.',
      },
    ],
  },
  quiz_module_6: {
    id: 'quiz_module_6',
    lessonId: 'module_6',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'How does Grover\'s Algorithm find the right answer in an unsorted database?',
        options: [
          'It scans every item at the exact same time.',
          'It uses interference to incrementally amplify the amplitude of the correct answer while shrinking the wrong ones.',
          'It randomly guesses until it gets it right.',
          'It asks the oracle for the address of the answer.',
        ],
        correctIndex: 1,
        explanation: 'Quantum algorithms don\'t just "try everything." They meticulously arrange interference over several steps (iterations) to make the correct answer stand out.',
      },
      {
        prompt: 'In Deutsch-Jozsa, a hidden function is promised to be either constant (the same output for every input) or balanced (0 for exactly half the inputs, 1 for the other half). How many queries does the quantum algorithm need?',
        options: [
          'Two',
          'Half the inputs plus one',
          'Every input',
          'One',
        ],
        correctIndex: 3,
        explanation: 'One query plus interference is enough: the amplitudes of the wrong answers cancel. A deterministic classical algorithm may need 2ⁿ⁻¹ + 1 queries in the worst case. To be honest about it, a randomized classical algorithm can usually guess correctly with only a few queries, so Deutsch-Jozsa mainly demonstrates interference rather than offering a practical speed-up.',
      },
      {
        prompt: 'For a search over N = 16 items, about how many Grover iterations give the best chance of success?',
        options: [
          '1',
          '3',
          '8',
          '16',
        ],
        correctIndex: 1,
        explanation: 'The optimal number is about (π/4)√N = (π/4)·4 ≈ 3.14, so 3 iterations. That gives about a 96% chance of finding the marked item. A classical search would need about 8 checks on average.',
      },
      {
        prompt: 'What happens if you run more Grover iterations than the optimal number?',
        options: [
          'The success probability falls again (the algorithm overshoots).',
          'The success probability keeps rising toward 100%.',
          'The algorithm crashes.',
          'Nothing changes after the peak.',
        ],
        correctIndex: 0,
        explanation: 'Each iteration rotates the state by a fixed angle toward the answer. Past the target it rotates away again, so success rises, peaks, and then falls. The Grover explorer shows exactly this rise and overshoot.',
      },
    ],
  },
  quiz_module_7: {
    id: 'quiz_module_7',
    lessonId: 'module_7',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'In quantum error correction, why don\'t we just measure the data qubit to see if it flipped?',
        options: [
          'Measuring is too expensive.',
          'Measuring the data qubit collapses its superposition, destroying the calculation.',
          'The data qubit is invisible.',
          'We do measure it, just very quickly.',
        ],
        correctIndex: 1,
        explanation: 'Measuring the data directly ruins the quantum state. We have to use clever parity checks to infer errors without looking directly at the data.',
        misconceptionTag: 'just-measure-the-data',
      },
      {
        prompt: 'In the 3-qubit repetition (bit-flip) code, the parity checks show that qubit 1 disagrees with qubits 2 and 3, which agree with each other. What should you do?',
        options: [
          'Flip qubits 2 and 3.',
          'Flip qubit 1 back.',
          'Measure all three qubits directly.',
          'Throw the result away and start over.',
        ],
        correctIndex: 1,
        explanation: 'The syndrome points to the most likely single error: the majority wins. Flipping qubit 1 back restores the encoded state, and you never learn (or disturb) the logical value itself.',
      },
      {
        prompt: 'Each physical qubit flips with probability p = 0.01. With the 3-qubit repetition code, the logical error rate is 3p² − 2p³. Roughly what is it?',
        options: [
          'About 0.0003',
          '0.01',
          '0.03',
          'Exactly 0',
        ],
        correctIndex: 0,
        explanation: '3(0.01)² − 2(0.01)³ = 0.0003 − 0.000002 ≈ 0.0003, about 33 times better than a single qubit. A logical error now needs two or more flips. The code only helps when p is below 50%, and real codes such as the surface code must also handle phase flips. PART 2: Types of Quantum Computers (Hardware) Note: All hardware metrics (qubit counts, fidelity) represent the current landscape and are subject to rapid change. Every physical modality represents a different engineering trade-off. Module 0: What Makes a Good Qubit? To build a quantum computer, we need a budget. ● T1 & T2 Times: T1 is how long a qubit holds its energy before relaxing from |1⟩ to |0⟩; T2 is how long it keeps a stable phase (its superposition). Together they set the coherence time. ● Gate Speed & Fidelity: How fast we can do operations, and how accurately. ● The Budget: The number of operations you can do is roughly the coherence time divided by the gate time. For example, T2 = 100 µs with 50 ns gates gives a budget of about 2,000 operations, and fewer once gate errors are counted. Module 1: Superconducting Qubits ● Who uses them: IBM, Google, Rigetti. ● How they work: Microchips made of superconducting metals (like niobium) cooled to near absolute zero (10-20 millikelvin) in giant dilution refrigerators. They are controlled by microwave pulses. ● Trade-offs: Very fast gates, but highly susceptible to noise. The cryogenics are a massive scaling bottleneck. Module 2: Trapped Ions ● Who uses them: IonQ, Quantinuum. ● How they work: Individual charged atoms (ions) suspended in a vacuum by electromagnetic fields, controlled by precision lasers. ● Trade-offs: Incredible coherence times and all-to-all connectivity within a chain (any ion can interact directly with any other ion in the same trap), but gate speeds are slower than superconducting, and scaling beyond one chain requires shuttling ions or linking separate traps. Module 3: Neutral Atoms ● Who uses them: QuEra, Pasqal, Atom Computing. ● How they work: Uncharged atoms gripped by optical tweezers (lasers). Lasers excite them to high-energy Rydberg states; when two atoms are close, an excited atom blocks its neighbor from being excited (the "Rydberg blockade"), which is used to build entangling gates. ● Trade-offs: Can pack massive amounts of qubits into tiny arrays, but controlling them accurately at scale is an ongoing physics challenge. Module 4: Photonic Qubits ● Who uses them: PsiQuantum, Xanadu. ● How they work: Information is stored in properties of light (photons) traveling through waveguides. ● Trade-offs: The waveguides and routing can operate near room temperature (though detectors often need cooling). The main enemy is loss (photons escaping or being absorbed) and the probabilistic nature of photon interactions. Module 5: Silicon Spin Qubits ● Who uses them: Intel, Diraq. ● How they work: Storing quantum information in the spin of a single electron trapped in a quantum dot on a silicon chip. ● Trade-offs: Massive scaling potential because they can be manufactured using existing global semiconductor fab infrastructure. However, tuning millions of microscopic dots perfectly is incredibly difficult. Module 6: Quantum Annealing ● Who uses them: D-Wave. ● How they work: Not a "universal" gate-model computer. Instead, you map an optimization problem into a physical energy landscape, let it cool down (anneal), and the system settles into the lowest energy state (the answer). ● Trade-offs: Great for specific optimization problems, but cannot run general algorithms like Shor\'s or Grover\'s. Whether annealers beat the best classical methods on real problems is still debated. Module 7: Frontier Ideas ● Honesty tag: Experimental/Contested. These approaches are promising but not yet proven at scale. ● Topological qubits: Store information in collective properties of exotic materials, so local noise should not easily disturb it. Microsoft is pursuing this approach; early experimental claims are still debated by physicists. ● Cat (bosonic) qubits: Encode a qubit in states of a microwave resonator that naturally resist bit-flips, so less error correction is needed (explored by AWS and the startup Alice & Bob). ● Modular / networked machines: Link several smaller quantum processors with photons, instead of building one giant chip. Module 8 & 9: Physical to Logical / Capstone No physical qubit is perfect. To run deep algorithms, we group hundreds or thousands of noisy physical qubits into one Logical Qubit using surface codes. ● Trade-off Capstone: If a client asks you to simulate a molecule deeply, you need high fidelity and logical qubits. If they want to solve a routing puzzle quickly, annealing might work. Architecture is about balancing cooling, speed, noise, and connectivity!',
      },
    ],
  },
  quiz_hardware: {
    id: 'quiz_hardware',
    lessonId: 'hw_module_8_9',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'Which hardware modality relies heavily on operating near absolute zero using dilution refrigerators?',
        options: [
          'Photonic',
          'Superconducting',
          'Trapped Ions',
          'Neutral atoms',
        ],
        correctIndex: 1,
        explanation: 'Superconducting circuits need millikelvin temperatures to stay superconducting and to keep thermal noise from disturbing the qubits.',
      },
      {
        prompt: 'What is the main advantage of Silicon Spin qubits?',
        options: [
          'They don\'t experience decoherence.',
          'They run on light.',
          'They need no cooling at all.',
          'They can be manufactured using the same semiconductor facilities used for standard computer chips.',
        ],
        correctIndex: 3,
        explanation: 'Silicon spin qubits can reuse the chip-making (CMOS) factories behind ordinary processors, which could make scaling to millions of qubits easier. They still need cooling (around 1 kelvin or below) and careful tuning of every quantum dot.',
      },
      {
        prompt: 'What is the main difference between a physical qubit and a logical qubit?',
        options: [
          'Physical qubits are real; logical qubits are software simulations.',
          'A logical qubit is just a faster physical qubit.',
          'A logical qubit is made up of many physical qubits working together via error correction to act as one much more reliable qubit.',
          'There is no difference; the terms mean the same thing.',
        ],
        correctIndex: 2,
        explanation: 'Error correction spreads one qubit\'s information across many physical qubits so errors can be detected and fixed. Logical qubits are real, built from real hardware, and they are much more reliable but never perfectly error-free.',
      },
      {
        prompt: 'A qubit has T2 = 100 µs and each gate takes 50 ns. Ignoring gate errors, roughly how many gates fit in its coherence budget?',
        options: [
          '20',
          '2,000',
          '200',
          '2,000,000',
        ],
        correctIndex: 1,
        explanation: '100 µs ÷ 50 ns = 100,000 ns ÷ 50 ns = 2,000 gates. The real budget is smaller because every gate also adds a little error, which is what the qubit metrics lab lets you explore.',
      },
      {
        prompt: 'What is a key strength of trapped-ion qubits?',
        options: [
          'Long coherence times and all-to-all connectivity within a chain.',
          'They have the fastest gates of any modality.',
          'They run at room temperature without lasers.',
          'They are the easiest to manufacture in standard chip factories.',
        ],
        correctIndex: 0,
        explanation: 'Any ion in a chain can interact directly with any other, so fewer SWAP operations are needed. The trade-offs are slower gates than superconducting qubits, and scaling beyond a single chain requires moving ions or linking traps.',
      },
      {
        prompt: 'In a neutral-atom quantum computer, what lets two atoms interact to perform an entangling gate?',
        options: [
          'Their electric charge',
          'Superconducting wires between them',
          'The Rydberg blockade',
          'A fiber-optic cable',
        ],
        correctIndex: 2,
        explanation: 'The atoms are neutral (charge is what trapped ions use). Lasers excite an atom to a high-energy Rydberg state, and a nearby atom then cannot be excited. This conditional behavior is the basis of the entangling gate.',
      },
      {
        prompt: 'What is the main enemy of photonic quantum computers?',
        options: [
          'Heat inside the waveguides',
          'Photon loss',
          'Stray magnetic fields',
          'Slow gate speeds',
        ],
        correctIndex: 1,
        explanation: 'Every lost photon is lost information, and the chance that everything works falls exponentially with the number of lossy components (see the loss-budget lab). Honesty note: the waveguides can run near room temperature, but the single- photon detectors usually need cryogenic cooling.',
      },
      {
        prompt: 'Which statement about quantum annealers is correct?',
        options: [
          'They are universal gate-model quantum computers.',
          'They are specialized for optimization problems and cannot run general gate-model algorithms like Shor\'s.',
          'They have proven exponential speed-ups for all optimization problems.',
          'They do not use any quantum effects.',
        ],
        correctIndex: 1,
        explanation: 'An annealer maps a problem onto an energy landscape and lets the system settle toward the lowest-energy state. It is a different kind of machine from gate-model computers, and whether it beats the best classical methods is still an open debate.',
      },
      {
        prompt: 'Which honesty tag best fits topological qubits today?',
        options: [
          'Experimental/Contested',
          'Accurate',
          'Analogy',
          'Simplified model',
        ],
        correctIndex: 0,
        explanation: 'Topological qubits promise built-in protection from noise, but the experimental evidence is still debated, so they belong under Experimental/Contested.',
      },
    ],
  },
  quiz_math: {
    id: 'quiz_math',
    lessonId: 'math_lesson_5',
    passingScore: QUIZ_PASS_SCORE,
    questions: [
      {
        prompt: 'If a quantum state vector is the column (α, β), what must be true for it to be a valid, normalized state?',
        options: [
          'α + β = 1',
          '|α|² + |β|² = 1',
          'α = β',
        ],
        correctIndex: 1,
        explanation: 'The sum of the squared magnitudes of the amplitudes must equal 1, representing 100% total probability.',
      },
      {
        prompt: 'If you apply the X gate matrix to the column vector (1, 0), what is the result?',
        options: [
          '(0, 1)',
          '(1, 1)',
        ],
        correctIndex: 0,
        explanation: 'The matrix multiplication flips the top and bottom values, turning |0⟩ into |1⟩.',
      },
      {
        prompt: 'A qubit is in the state (1/√2)|0⟩ + (i/√2)|1⟩. What is the probability of measuring 1? (Lesson 1)',
        options: [
          '1/2',
          'i/√2',
          '−1/2',
          '0',
        ],
        correctIndex: 0,
        explanation: 'Probability is the squared magnitude: |i/√2|² = |i|²/2 = 1/2. A complex phase like i changes the state but not this probability, and a probability can never be complex or negative.',
      },
      {
        prompt: 'Using the H gate matrix (1/√2)[[1, 1], [1, −1]], what is H applied to |0⟩ = (1, 0)? (Lesson 2)',
        options: [
          '(1/√2)(1, −1), which is |−⟩',
          '(0, 1), which is |1⟩',
          '(1, 0), which is |0⟩',
          '(1/√2)(1, 1), which is |+⟩',
        ],
        correctIndex: 3,
        explanation: 'Multiplying a matrix by (1, 0) picks out its first column: (1/√2)(1, 1) = |+⟩. Try H on (0, 1) yourself: you should get |−⟩.',
      },
      {
        prompt: 'Which property must every quantum gate matrix U have? (Lesson 2)',
        options: [
          'All of its entries are real numbers.',
          'Its determinant is zero.',
          'It is symmetric.',
          'It is unitary: U†U = I.',
        ],
        correctIndex: 3,
        explanation: 'Unitarity keeps every state normalized (total probability stays 1) and guarantees the gate can be undone by U†. Entries may be complex (for example, the S gate contains i), and a zero determinant would make the gate irreversible.',
      },
      {
        prompt: 'Using the order |00⟩, |01⟩, |10⟩, |11⟩, what is the 4-amplitude vector for the two-qubit state |01⟩? (Lesson 3)',
        options: [
          '(1, 0, 0, 0)',
          '(0, 1, 0, 0)',
          '(0, 0, 1, 0)',
          '(0, 0, 0, 1)',
        ],
        correctIndex: 1,
        explanation: 'Tensor product: |0⟩ ⊗ |1⟩ = (1, 0) ⊗ (0, 1) = (1·0, 1·1, 0·0, 0·1) = (0, 1, 0, 0). The single 1 sits in the |01⟩ slot.',
      },
      {
        prompt: 'In the Mach-Zehnder model H · Phase · H with phase φ = 0, a photon enters in |0⟩. Where does it exit? (Lesson 4)',
        options: [
          'Port |1⟩, with certainty',
          'Either port, 50/50',
          'Port |0⟩, with certainty',
          'It is absorbed',
        ],
        correctIndex: 2,
        explanation: 'With φ = 0 the phase gate is the identity, so H · H = I and the photon always leaves through port |0⟩; the other detector stays completely dark. With φ = π the phase gate becomes Z, and H · Z · H = X sends every photon to port |1⟩ instead.',
      },
      {
        prompt: 'About how many Grover iterations are needed to search N = 100 items? (Lesson 5)',
        options: [
          '3',
          '50',
          '100',
          '8',
        ],
        correctIndex: 3,
        explanation: '(π/4)√100 = (π/4)·10 ≈ 7.85, so about 8 iterations. A classical search needs about 50 checks on average, which shows Grover\'s quadratic speed-up.',
      },
    ],
  },
};
