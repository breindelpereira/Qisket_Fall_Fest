import type { LessonRecord, MathExpr } from './types';
import { makeLesson, video } from './lessonText';

const X_MATRIX: MathExpr = [{ mat: [['0', '1'], ['1', '0']] }];
const H_MATRIX: MathExpr = [{ frac: ['1', '√2'] }, { mat: [['1', '1'], ['1', '−1']] }];
const Z_MATRIX: MathExpr = [{ mat: [['1', '0'], ['0', '−1']] }];
const S_MATRIX: MathExpr = [{ mat: [['1', '0'], ['0', 'i']] }];

/**
 * Part 3: Math Companion (Optional). Wording follows the course content in /Questions; equations come from its images.
 * The extra points explain the symbols and give worked examples that the practice problems (content/practice.ts) build on.
 * Qubit order follows the app: in a two-qubit label the left digit is qubit 1 and the right digit is qubit 0.
 */
export const PART3_LESSONS: LessonRecord[] = [
  makeLesson({
    id: 'math_week_0',
    part: 3,
    moduleNumber: 0,
    moduleLabel: 'Week 0',
    title: 'Primer',
    linkedConceptId: 'concept_math',
    ahaMoment: 'The maths of one qubit is only a column of two numbers and a grid of four: nothing more is needed to follow the rest.',
    misconceptionToFix: 'A complex number is not "imaginary" in the sense of unreal: it is a number with two parts, and quantum states genuinely need both.',
    activities: [],
    references: [
      video('Vectors | Essence of linear algebra, chapter 1', '3Blue1Brown', 'fNk_zzaMoSs', 0, 591),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Three tools are all you need: vectors to hold a state, matrices to act on it, and complex numbers to give each part a size and a phase. This page covers only what the next five lessons use.',
      },
      {
        type: 'bullets',
        items: [
          { label: 'Vectors', text: 'A list of numbers. Quantum states are column vectors.' },
          { label: 'Matrices', text: 'Grids of numbers used to multiply and transform vectors.' },
          {
            label: 'Complex Numbers',
            text: 'Numbers with a real and imaginary part (i = √−1), allowing for magnitude and phase.',
          },
          {
            label: 'Matrix times vector',
            text: 'Multiply each row of the matrix with the column and add the results. The first row gives the top number of the answer, the second row gives the next, and so on. For example:',
            math: [{ mat: [['1', '2'], ['3', '4']] }, { vec: ['1', '1'] }, ' = ', { vec: ['1·1 + 2·1', '3·1 + 4·1'] }, ' = ', { vec: ['3', '7'] }],
          },
          {
            label: 'Adding and scaling vectors',
            text: 'Add vectors entry by entry, and scale a vector by multiplying every entry. A superposition is exactly this: a sum of scaled basis vectors.',
          },
          {
            label: 'Working with i',
            text: 'The key rule is i² = −1. For example (1 + i)(1 − i) = 1 − i + i − i² = 1 + 1 = 2, and i · i = −1.',
          },
          {
            label: 'Size of a complex number',
            text: 'The size (modulus) of a + bi is √(a² + b²). Equivalently, |z|² = (a + bi)(a − bi), which is z multiplied by its conjugate. So |3 + 4i| = 5 and |i| = 1.',
          },
          {
            label: 'Useful numbers',
            text: '1/√2 is about 0.707, and (1/√2)² = 1/2. These show up everywhere because an equal superposition of two outcomes has amplitudes of size 1/√2.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'math_lesson_1',
    part: 3,
    moduleNumber: 1,
    moduleLabel: 'Lesson 1',
    title: 'State Vectors & Dirac Notation',
    linkedConceptId: 'concept_math',
    ahaMoment: 'A state is a list of amplitudes, and the squared size of each one is the chance of that result.',
    misconceptionToFix: 'Probabilities come from the squared size of the amplitudes, not from the amplitudes themselves, and amplitudes can be negative or complex.',
    activities: [],
    references: [
      video('But what is quantum computing? (Grover\'s Algorithm), the state vector', '3Blue1Brown', 'RQWpF2Gb-gU', 363, 720),
      video('Ch 6: What are bras and bra-ket notation?', 'Quantum Sense', 'lRR-qgjaKlg', 0, 603),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Dirac notation is a short way of writing vectors. The symbol |ψ⟩, called a ket, simply means "the column vector named ψ". The two special kets |0⟩ and |1⟩ are the basis states.',
      },
      {
        type: 'bullets',
        items: [
          { text: 'The state |0⟩ is written as the vector:', math: ['|0⟩ = ', { vec: ['1', '0'] }] },
          { text: 'The state |1⟩ is written as the vector:', math: ['|1⟩ = ', { vec: ['0', '1'] }] },
          {
            text: 'A superposition |ψ⟩ = α|0⟩ + β|1⟩ is written as:',
            math: ['|ψ⟩ = ', { vec: ['α', 'β'] }],
          },
          {
            label: 'Rule',
            text: 'To conserve 100% probability, the amplitudes must satisfy (Normalization):',
            math: ['|α|² + |β|² = 1'],
          },
          {
            label: 'Reading the symbols',
            text: 'α (alpha) and β (beta) are the amplitudes, and they may be complex. The chance of measuring 0 is |α|² and the chance of measuring 1 is |β|². The rule above says those two chances add up to 1.',
          },
          {
            label: 'Worked example',
            text: 'Is (3/5)|0⟩ + (4/5)|1⟩ a valid state? Check the rule: (3/5)² + (4/5)² = 9/25 + 16/25 = 1, so yes. The chance of 0 is 9/25 = 36%, and the chance of 1 is 16/25 = 64%.',
          },
          {
            label: 'Finding a missing amplitude',
            text: 'If α = 1/√2 then |α|² = 1/2, so |β|² must be 1/2 as well, which makes |β| = 1/√2. The rule fixes the size of β, but not its phase: β could be 1/√2, −1/√2 or i/√2.',
          },
          {
            label: 'The |+⟩ and |−⟩ states',
            text: 'Equal superpositions with different signs:',
            math: ['|+⟩ = ', { frac: ['1', '√2'] }, { vec: ['1', '1'] }, ',  |−⟩ = ', { frac: ['1', '√2'] }, { vec: ['1', '−1'] }],
          },
          {
            label: 'A common slip',
            text: 'Do not add the amplitudes to get 1 (α + β = 1 is wrong). It is the squared sizes that add to 1. And a minus sign or an i changes the state without changing |α|² or |β|².',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'math_lesson_2',
    part: 3,
    moduleNumber: 2,
    moduleLabel: 'Lesson 2',
    title: 'Gates as Matrices',
    linkedConceptId: 'concept_math',
    ahaMoment: 'Applying a gate is just multiplying a matrix by the state vector, and a valid gate is one that keeps the total probability at 1.',
    misconceptionToFix: 'When gates are written out, the first gate applied is the rightmost matrix, not the leftmost.',
    activities: [],
    references: [
      video('Single qubit and its logic gates', 'Professor Nano', 'rD_fH7O-D5Y', 0, 824),
      video('The Hadamard Gate and the +, -, i and -i States', 'Quantum Soar', 'G9d0QWM82sU', 0, 147),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Quantum gates are Unitary Matrices. When a gate acts on a qubit, you multiply the matrix by the state vector.',
      },
      {
        type: 'bullets',
        items: [
          { label: 'X Gate Matrix', text: '', math: ['X = ', ...X_MATRIX] },
          { label: 'H Gate Matrix', text: '', math: ['H = ', ...H_MATRIX] },
          {
            label: 'Challenge Check',
            text: 'If you multiply the X matrix by the |0⟩ vector, you get the |1⟩ vector!',
            math: [...X_MATRIX, { vec: ['1', '0'] }, ' = ', { vec: ['0', '1'] }],
          },
          { label: 'Z Gate Matrix', text: 'Leaves |0⟩ alone and flips the sign of |1⟩.', math: ['Z = ', ...Z_MATRIX] },
          { label: 'S Gate Matrix', text: 'A quarter turn of phase on the |1⟩ part. Applying S twice gives Z.', math: ['S = ', ...S_MATRIX] },
          {
            label: 'Worked example',
            text: 'Apply H to |1⟩ = (0, 1). The matrix picks out its second column, so the result is (1/√2)(1, −1), which is |−⟩.',
          },
          {
            label: 'What unitary means',
            text: 'A matrix U is unitary when U†U = I, where U† is the conjugate transpose. This keeps the total probability at 1 and means the gate can be undone by U†. Check X: applying X twice gives the identity, so X is its own inverse.',
          },
          {
            label: 'Order of gates',
            text: 'The first gate acts first, so it sits next to the state on the right: U₂U₁|ψ⟩ means apply U₁, then U₂. A famous example is H X H = Z: a bit flip seen through Hadamards becomes a phase flip.',
          },
          {
            label: 'A common slip',
            text: 'Matrix multiplication is not commutative: HX and XH are different matrices, so the order of gates matters.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'math_lesson_3',
    part: 3,
    moduleNumber: 3,
    moduleLabel: 'Lesson 3',
    title: 'Multiple Qubits',
    linkedConceptId: 'concept_math',
    ahaMoment: 'Every added qubit doubles the length of the vector, and a state that cannot be split into one piece per qubit is entangled.',
    misconceptionToFix: 'Two qubits are not described by two separate vectors in general: the pair has one vector of four amplitudes.',
    activities: [],
    references: [
      video('2-Qubit Computational Basis States, Tensor Products, Orthonormality, 4D Hilbert Space', 'Elucyda', 'ETkBuBdl3wc', 0, 579),
    ],
    blocks: [
      { type: 'paragraph', text: 'To combine qubits, we use the Tensor Product.' },
      {
        type: 'bullets',
        items: [
          {
            text: 'Two qubits mean a vector of 4 amplitudes, one for each of these basis states:',
            math: ['|00⟩, |01⟩, |10⟩, |11⟩'],
          },
          { text: 'A 2-qubit gate like CNOT is a 4x4 matrix.' },
          {
            label: 'The tensor product',
            text: 'To combine two single-qubit vectors, multiply every entry of the first by the whole of the second:',
            math: [{ vec: ['a', 'b'] }, ' ⊗ ', { vec: ['c', 'd'] }, ' = ', { vec: ['ac', 'ad', 'bc', 'bd'] }],
          },
          {
            label: 'Worked example',
            text: '|0⟩ ⊗ |1⟩ puts the 1 in the second position: the vector is (0, 1, 0, 0), which is the state |01⟩. In this app the left digit is qubit 1 and the right digit is qubit 0.',
          },
          {
            label: 'Counting amplitudes',
            text: 'n qubits need 2ⁿ amplitudes: 2, 4, 8, 16, and so on. This doubling is why simulating many qubits on an ordinary computer quickly becomes impossible.',
          },
          {
            label: 'CNOT as a matrix',
            text: 'With the left digit as the control, CNOT swaps |10⟩ and |11⟩ and leaves the other two alone:',
            math: ['CNOT = ', { mat: [['1', '0', '0', '0'], ['0', '1', '0', '0'], ['0', '0', '0', '1'], ['0', '0', '1', '0']] }],
          },
          {
            label: 'Entangled states',
            text: 'A product state can be split into one vector per qubit. The Bell state (|00⟩ + |11⟩)/√2, which is (1/√2)(1, 0, 0, 1), cannot: no choice of (a, b) and (c, d) gives ad = 0 and bc = 0 together with ac ≠ 0 and bd ≠ 0. That impossibility is what entanglement means.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'math_lesson_4',
    part: 3,
    moduleNumber: 4,
    moduleLabel: 'Lesson 4',
    title: 'Measurement, Phase, and Interference Math',
    linkedConceptId: 'concept_math',
    ahaMoment: 'Interference is just addition of amplitudes: equal amplitudes add up, opposite ones cancel.',
    misconceptionToFix: 'Probabilities do not add before squaring: you add the amplitudes first, and only then square.',
    activities: [],
    references: [
      video('The Born Rule', 'QuTech Academy', 'kk4gd4TIokw', 0, 194),
      video('The Born Rule', 'Looking Glass Universe', 'VHlqY44fOg0', 0, 303),
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'The Born rule says the chance of an outcome is the squared size of its amplitude. Phase is the part of an amplitude that squaring throws away, so it never shows up in a single measurement. It matters when amplitudes are added before squaring.',
      },
      {
        type: 'bullets',
        items: [
          {
            text: 'The Mach-Zehnder interferometer is represented mathematically as:',
            math: ['H · Phase · H'],
          },
          {
            text: 'If you multiply these matrices, you will see mathematically how the negative components of the matrix cancel out specific amplitudes (destructive interference), proving why one detector goes dark.',
          },
          {
            label: 'The phase gate',
            text: 'A phase of φ multiplies the |1⟩ amplitude by e^(iφ) and leaves |0⟩ alone:',
            math: ['Phase(φ) = ', { mat: [['1', '0'], ['0', 'e^(iφ)']] }],
          },
          {
            label: 'Worked example',
            text: 'Start with |0⟩. After H the state is (1/√2)(1, 1). After the phase gate it is (1/√2)(1, e^(iφ)). After the second H it is (1/2)(1 + e^(iφ), 1 − e^(iφ)). So the chance of measuring 0 is |1 + e^(iφ)|²/4 = cos²(φ/2), and the chance of measuring 1 is sin²(φ/2).',
          },
          {
            label: 'Three special cases',
            text: 'At φ = 0 the amplitudes are (1, 0): always 0. At φ = π, e^(iφ) = −1 and the amplitudes are (0, 1): always 1. At φ = π/2 the chances are 50% and 50%.',
          },
          {
            label: 'Why it is interference',
            text: 'The 0 result gets two contributions that add: 1 from one path and e^(iφ) from the other. When they are equal they reinforce, and when they are opposite (φ = π) they cancel exactly, which is why that detector goes dark.',
          },
        ],
      },
    ],
  }),

  makeLesson({
    id: 'math_lesson_5',
    part: 3,
    moduleNumber: 5,
    moduleLabel: 'Lesson 5',
    title: "Grover's Algorithm in 2D",
    linkedConceptId: 'concept_math',
    quizId: 'quiz_math',
    ahaMoment: 'Grover search is a rotation in a flat plane: each round turns the state a fixed angle closer to the answer.',
    misconceptionToFix: 'More rounds is not better: the state keeps rotating, so past the best round the chance of finding the answer goes down again.',
    activities: [],
    references: [
      video('A Visual Introduction to Grover\'s Algorithm and Reflections', 'Gordon Ma', 'c30KrWjHaw4', 0, 1126),
      video('But what is quantum computing? (Grover\'s Algorithm), why square root?', '3Blue1Brown', 'RQWpF2Gb-gU', 1887, 2041),
    ],
    blocks: [
      {
        type: 'bullets',
        items: [
          {
            text: "Grover's algorithm is just geometry! The Oracle is a reflection matrix (flipping the sign of the target state). The Diffusion operator is a reflection around the average.",
          },
          {
            label: 'Optimal iterations',
            text: 'Roughly the following, where N is the number of items:',
            math: [{ frac: ['π', '4'] }, '√N'],
          },
          {
            label: 'The 2D picture',
            text: 'All the action happens in a plane with two directions: the marked item, and the equal mix of all the other items. The starting state is almost along the second direction, tilted towards the marked one by a small angle θ with sin θ = 1/√N.',
          },
          {
            label: 'Two reflections make a rotation',
            text: 'The oracle reflects the state about the "other items" direction, and the diffusion operator reflects it about the starting state. Two reflections in a row turn the state by 2θ, so each Grover round moves the state 2θ closer to the marked item.',
          },
          {
            label: 'Success chance',
            text: 'After k rounds the state sits at an angle (2k + 1)θ from the "other items" direction, so the chance of finding the marked item is sin²((2k + 1)θ). It is largest when (2k + 1)θ is close to 90°.',
          },
          {
            label: 'Worked example, N = 4',
            text: 'sin θ = 1/2, so θ = 30°. After one round the angle is 3θ = 90°, so the chance is sin²(90°) = 100%. One round finds the item for certain.',
          },
          {
            label: 'Worked example, N = 16',
            text: 'sin θ = 1/4, so θ is about 14.5°. After 3 rounds the angle is 7θ, about 101°, and the chance is about 96%. The formula (π/4)√16 = π is about 3.1, which agrees with 3 rounds.',
          },
          {
            label: 'Overshooting',
            text: 'After the best round the rotation continues, past 90°, and the chance falls again. Knowing when to stop is part of the algorithm. The speed-up is a square root, not an exponential.',
          },
        ],
      },
    ],
  }),
];
