import type { LessonRecord, MathExpr } from './types';
import { makeLesson } from './lessonText';

const X_MATRIX: MathExpr = [{ mat: [['0', '1'], ['1', '0']] }];
const H_MATRIX: MathExpr = [{ frac: ['1', '√2'] }, { mat: [['1', '1'], ['1', '−1']] }];

/** Part 3: Math Companion (Optional). Wording follows the course content in /Questions; equations come from its images. */
export const PART3_LESSONS: LessonRecord[] = [
  makeLesson({
    id: 'math_week_0',
    part: 3,
    moduleNumber: 0,
    moduleLabel: 'Week 0',
    title: 'Primer',
    linkedConceptId: 'concept_math',
    activities: [],
    references: [],
    blocks: [
      {
        type: 'bullets',
        items: [
          { label: 'Vectors', text: 'A list of numbers. Quantum states are column vectors.' },
          { label: 'Matrices', text: 'Grids of numbers used to multiply and transform vectors.' },
          {
            label: 'Complex Numbers',
            text: 'Numbers with a real and imaginary part (i = √−1), allowing for magnitude and phase.',
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
    activities: [],
    references: [],
    blocks: [
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
    activities: [],
    references: [],
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
    activities: [],
    references: [],
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
    activities: [],
    references: [],
    blocks: [
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
    activities: [],
    references: [],
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
        ],
      },
    ],
  }),
];
