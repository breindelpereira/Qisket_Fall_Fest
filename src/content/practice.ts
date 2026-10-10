import type { MathExpr } from './types';

/**
 * Practice problems for the Math Companion (Part 3). Each lesson has a set; the answers are typed and checked by
 * `core/math/answer.ts`, so any equivalent form is accepted (1/√2, 0.707, sqrt(2)/2 ...).
 *
 * Writing rules:
 *  - `answer` holds the cells in reading order (a vector top to bottom, a matrix row by row), written as expressions.
 *  - `commonWrong` lists answers a learner is likely to give, with a hint about the slip. A test checks that each one is
 *    rejected, so a listed "wrong" answer can never also be a right one.
 *  - Two hints, from a nudge to almost the answer. `solution` is shown only after an attempt or after the hints.
 *  - Qubit order: in a two-qubit label the left digit is qubit 1 and the right digit is qubit 0, as in the app.
 */
export type AnswerShape =
  | { kind: 'number' }
  | { kind: 'vector'; length: number }
  | { kind: 'matrix'; rows: number; cols: number };

export interface WrongAnswer {
  answer: string[];
  feedback: string;
}

export interface PracticeProblem {
  id: string;
  lessonId: string;
  title: string;
  statement: string;
  /** An equation to show under the statement. */
  math?: MathExpr;
  shape: AnswerShape;
  answer: string[];
  /** Absolute tolerance for each part of each number (default 0.005). */
  tolerance?: number;
  /** Accept the answer times any number of size 1. */
  upToGlobalPhase?: boolean;
  /** Shown after the input, for example "degrees". */
  unit?: string;
  commonWrong: WrongAnswer[];
  hints: [string, string];
  solution: string;
}

const num = (): AnswerShape => ({ kind: 'number' });
const vec = (length: number): AnswerShape => ({ kind: 'vector', length });
const mat = (rows: number, cols: number): AnswerShape => ({ kind: 'matrix', rows, cols });

export const PRACTICE: PracticeProblem[] = [
  // ---- Primer -----------------------------------------------------------------------------------------------------
  {
    id: 'p0_1', lessonId: 'math_week_0', title: 'Multiply complex numbers',
    statement: 'Work out (1 + i)(1 − i). Give a single number.',
    shape: num(), answer: ['2'],
    commonWrong: [
      { answer: ['0'], feedback: 'Remember i² = −1, so the last term −i·i is +1, not −1.' },
      { answer: ['1'], feedback: 'Expand all four terms: 1·1, 1·(−i), i·1 and i·(−i). The two with i cancel, and the last one is +1.' },
    ],
    hints: ['Multiply each term of the first bracket by each term of the second.', 'The i terms cancel. What is −i · i, given that i·i = −1?'],
    solution: '(1 + i)(1 − i) = 1 − i + i − i² = 1 − (−1) = 2.',
  },
  {
    id: 'p0_2', lessonId: 'math_week_0', title: 'The size of a complex number',
    statement: 'Find the size (modulus) of 3 + 4i.',
    shape: num(), answer: ['5'],
    commonWrong: [
      { answer: ['7'], feedback: 'You added the parts. The size is the square root of (3² + 4²).' },
      { answer: ['25'], feedback: 'That is the size squared. Take the square root as the last step.' },
    ],
    hints: ['Treat the real part and the imaginary part like the two sides of a right-angled triangle.', 'Size = √(3² + 4²) = √(9 + 16).'],
    solution: '|3 + 4i| = √(3² + 4²) = √25 = 5.',
  },
  {
    id: 'p0_3', lessonId: 'math_week_0', title: 'Add two vectors',
    statement: 'Add the column vectors (1, 2) and (3, −1). Enter the result as a column.',
    shape: vec(2), answer: ['4', '1'],
    commonWrong: [
      { answer: ['3', '-2'], feedback: 'That multiplies entry by entry. To add, add the top entries and add the bottom entries.' },
    ],
    hints: ['Add the top numbers together, then the bottom numbers.', 'Top: 1 + 3. Bottom: 2 + (−1).'],
    solution: 'Top: 1 + 3 = 4. Bottom: 2 + (−1) = 1. The result is the column (4, 1).',
  },
  {
    id: 'p0_4', lessonId: 'math_week_0', title: 'Matrix times vector',
    statement: 'Multiply the matrix by the column and enter the result as a column.',
    math: [{ mat: [['1', '2'], ['3', '4']] }, { vec: ['1', '1'] }, ' = ?'],
    shape: vec(2), answer: ['3', '7'],
    commonWrong: [
      { answer: ['4', '6'], feedback: 'You combined the columns of the matrix with the entries. Use each ROW of the matrix with the column.' },
      { answer: ['1', '7'], feedback: 'The top answer uses the whole first row: 1·1 + 2·1.' },
    ],
    hints: ['Top entry: multiply the first row (1, 2) by the column (1, 1) entry by entry and add.', 'Top: 1·1 + 2·1. Bottom: 3·1 + 4·1.'],
    solution: 'Top: 1·1 + 2·1 = 3. Bottom: 3·1 + 4·1 = 7. The result is (3, 7).',
  },
  {
    id: 'p0_5', lessonId: 'math_week_0', title: 'A number you will see everywhere',
    statement: 'What is (1/√2)²?',
    shape: num(), answer: ['1/2'],
    commonWrong: [
      { answer: ['1/√2'], feedback: 'That is the number itself. The question asks for its square.' },
      { answer: ['1'], feedback: 'Squaring √2 gives 2, so the 1 on top stays over 2.' },
    ],
    hints: ['Square the top and the bottom separately.', '1² = 1 and (√2)² = 2.'],
    solution: '(1/√2)² = 1²/(√2)² = 1/2.',
  },

  // ---- Lesson 1: state vectors ------------------------------------------------------------------------------------
  {
    id: 'p1_1', lessonId: 'math_lesson_1', title: 'Fill in the missing amplitude',
    statement: 'A qubit is in the state (3/5)|0⟩ + β|1⟩, where β is a positive real number. Find β.',
    shape: num(), answer: ['4/5'],
    commonWrong: [
      { answer: ['2/5'], feedback: 'You subtracted the amplitudes (1 − 3/5). The rule is about the squared sizes: |α|² + |β|² = 1.' },
      { answer: ['16/25'], feedback: 'That is |β|². The question asks for β itself, so take the square root.' },
    ],
    hints: ['Use |α|² + |β|² = 1 with α = 3/5.', '|β|² = 1 − 9/25 = 16/25. What number squared is 16/25?'],
    solution: '|β|² = 1 − (3/5)² = 1 − 9/25 = 16/25, so β = 4/5.',
  },
  {
    id: 'p1_2', lessonId: 'math_lesson_1', title: 'From amplitude to chance',
    statement: 'A qubit is in the state (1/2)|0⟩ + (√3/2)|1⟩. What is the chance of measuring 0?',
    shape: num(), answer: ['1/4'],
    commonWrong: [
      { answer: ['1/2'], feedback: 'That is the amplitude. The chance is its squared size.' },
      { answer: ['3/4'], feedback: 'That is the chance of measuring 1. The question asks for 0.' },
    ],
    hints: ['The chance of 0 comes from the amplitude of |0⟩.', 'Square the size of 1/2.'],
    solution: 'P(0) = |1/2|² = 1/4. (And P(1) = (√3/2)² = 3/4, so they add to 1.)',
  },
  {
    id: 'p1_3', lessonId: 'math_lesson_1', title: 'Write |+⟩ as a vector',
    statement: 'Write the state |+⟩, an equal superposition with both amplitudes positive, as a column vector.',
    shape: vec(2), answer: ['1/√2', '1/√2'],
    commonWrong: [
      { answer: ['1', '1'], feedback: 'That is not normalised: its squared sizes add up to 2. Divide each entry by √2.' },
      { answer: ['1/2', '1/2'], feedback: 'The squares of these add up to 1/2, not 1. Each amplitude must have squared size 1/2.' },
    ],
    hints: ['Both amplitudes are equal, and their squared sizes must add up to 1.', 'Each squared size is 1/2, so each amplitude is 1/√2.'],
    solution: '|+⟩ = (1/√2)(1, 1) = (1/√2, 1/√2). Check: (1/√2)² + (1/√2)² = 1/2 + 1/2 = 1.',
  },
  {
    id: 'p1_4', lessonId: 'math_lesson_1', title: 'Two probabilities',
    statement: 'A qubit has amplitudes (0.6, 0.8i). Enter the chances of measuring 0 and 1 as a column (p₀, p₁).',
    shape: vec(2), answer: ['0.36', '0.64'],
    commonWrong: [
      { answer: ['0.6', '0.8'], feedback: 'Those are the amplitudes. Square the size of each.' },
      { answer: ['0.36', '-0.64'], feedback: 'A probability is never negative: |0.8i|² = 0.64, because |i| = 1.' },
    ],
    hints: ['The chance is the squared size of the amplitude.', '|0.8i|² = 0.8² × |i|² = 0.64 × 1.'],
    solution: 'p₀ = 0.6² = 0.36. p₁ = |0.8i|² = 0.64. They add to 1, as they must.',
  },
  {
    id: 'p1_5', lessonId: 'math_lesson_1', title: 'A less friendly amplitude',
    statement: 'A qubit is in the state (1/√3)|0⟩ + β|1⟩, where β is a positive real number. Find β.',
    shape: num(), answer: ['√(2/3)'],
    commonWrong: [
      { answer: ['2/3'], feedback: 'That is |β|². Take the square root to get β.' },
      { answer: ['1/√3'], feedback: 'That is α. The two amplitudes are not equal here, because |α|² is only 1/3.' },
    ],
    hints: ['|α|² = 1/3, so |β|² is what is left over.', '|β|² = 2/3. Take the square root.'],
    solution: '|β|² = 1 − 1/3 = 2/3, so β = √(2/3), about 0.816.',
  },

  // ---- Lesson 2: gates as matrices -------------------------------------------------------------------------------
  {
    id: 'p2_1', lessonId: 'math_lesson_2', title: 'Apply X',
    statement: 'Apply the X gate to the state (3/5, 4/5). Enter the new vector.',
    shape: vec(2), answer: ['4/5', '3/5'],
    commonWrong: [
      { answer: ['3/5', '4/5'], feedback: 'That is the original state. X swaps the top and bottom entries.' },
      { answer: ['3/5', '-4/5'], feedback: 'That is what Z does. X swaps the two entries and changes no signs.' },
    ],
    hints: ['X has rows (0, 1) and (1, 0).', 'Each row picks out one entry: the first row picks the bottom entry, the second picks the top.'],
    solution: 'X (a, b) = (b, a), so the result is (4/5, 3/5).',
  },
  {
    id: 'p2_2', lessonId: 'math_lesson_2', title: 'Hadamard on |1⟩',
    statement: 'Apply H to |1⟩ = (0, 1). Enter the new vector.',
    math: ['H = ', { frac: ['1', '√2'] }, { mat: [['1', '1'], ['1', '−1']] }],
    shape: vec(2), answer: ['1/√2', '-1/√2'],
    commonWrong: [
      { answer: ['1/√2', '1/√2'], feedback: 'That is H on |0⟩. With (0, 1) you pick out the second column, which has a minus sign.' },
      { answer: ['0', '1'], feedback: 'H does change |1⟩: it makes an equal superposition.' },
    ],
    hints: ['Multiplying a matrix by (0, 1) picks out its second column.', 'The second column of H is (1, −1), times 1/√2.'],
    solution: 'The second column of H is (1/√2, −1/√2). That is the state |−⟩.',
  },
  {
    id: 'p2_3', lessonId: 'math_lesson_2', title: 'Z on |+⟩',
    statement: 'Apply Z to |+⟩ = (1/√2, 1/√2). Enter the new vector.',
    math: ['Z = ', { mat: [['1', '0'], ['0', '−1']] }],
    shape: vec(2), answer: ['1/√2', '-1/√2'],
    commonWrong: [
      { answer: ['-1/√2', '-1/√2'], feedback: 'Z leaves the top entry alone and flips only the sign of the bottom one.' },
      { answer: ['1/√2', '1/√2'], feedback: 'Z does change this state: it flips the sign of the bottom entry, turning |+⟩ into |−⟩.' },
    ],
    hints: ['Z multiplies the bottom entry by −1 and leaves the top entry as it is.', 'Top stays 1/√2. Bottom becomes −1/√2.'],
    solution: 'Z (a, b) = (a, −b), so (1/√2, 1/√2) becomes (1/√2, −1/√2), which is |−⟩.',
  },
  {
    id: 'p2_4', lessonId: 'math_lesson_2', title: 'Apply S',
    statement: 'Apply S to (1/√2, 1/√2). Enter the new vector.',
    math: ['S = ', { mat: [['1', '0'], ['0', 'i']] }],
    shape: vec(2), answer: ['1/√2', 'i/√2'],
    commonWrong: [
      { answer: ['1/√2', '-1/√2'], feedback: 'That is Z, which multiplies by −1. S multiplies the bottom entry by i.' },
      { answer: ['1/√2', '1/√2'], feedback: 'S changes the bottom entry: it multiplies it by i, a quarter turn of phase.' },
    ],
    hints: ['S leaves the top entry alone and multiplies the bottom entry by i.', 'Bottom: i × 1/√2.'],
    solution: 'S (a, b) = (a, ib), so the result is (1/√2, i/√2). This state is |+i⟩.',
  },
  {
    id: 'p2_5', lessonId: 'math_lesson_2', title: 'Order of gates',
    statement: 'Gate X is applied first, then gate H. Enter the single matrix H·X, row by row (top row first).',
    math: ['H = ', { frac: ['1', '√2'] }, { mat: [['1', '1'], ['1', '−1']] }, ',  X = ', { mat: [['0', '1'], ['1', '0']] }],
    shape: mat(2, 2), answer: ['1/√2', '1/√2', '-1/√2', '1/√2'],
    commonWrong: [
      { answer: ['1/√2', '-1/√2', '1/√2', '1/√2'], feedback: 'That is X·H, the gates in the other order. The first gate applied sits next to the state, on the right.' },
    ],
    hints: ['Multiply H by X: the columns of X are (0, 1) and (1, 0), so X swaps the columns of H.', 'Swap the two columns of H: (1, 1) and (1, −1) become (1, −1) and (1, 1). Do not forget the 1/√2.'],
    solution: 'H·X swaps the columns of H, giving (1/√2) × [[1, 1], [−1, 1]]. The order matters: X·H = (1/√2) × [[1, −1], [1, 1]] is a different matrix.',
  },
  {
    id: 'p2_6', lessonId: 'math_lesson_2', title: 'Hadamard twice',
    statement: 'What is the top-left entry of the matrix H·H?',
    shape: num(), answer: ['1'],
    commonWrong: [
      { answer: ['1/2'], feedback: 'That is only one of the two terms. The entry is (1/√2)(1/√2) + (1/√2)(1/√2). Add both.' },
    ],
    hints: ['Top-left of a product: first row of the left matrix times first column of the right one.', '(1/√2)(1/√2) + (1/√2)(1/√2) = 1/2 + 1/2.'],
    solution: 'The entry is 1/2 + 1/2 = 1. In fact H·H is the identity matrix: applying H twice does nothing.',
  },

  // ---- Lesson 3: multiple qubits ---------------------------------------------------------------------------------
  {
    id: 'p3_1', lessonId: 'math_lesson_3', title: 'A product state',
    statement: 'Write |1⟩ ⊗ |0⟩ as a vector of four amplitudes, in the order |00⟩, |01⟩, |10⟩, |11⟩.',
    shape: vec(4), answer: ['0', '0', '1', '0'],
    commonWrong: [
      { answer: ['0', '1', '0', '0'], feedback: 'That is |0⟩ ⊗ |1⟩ = |01⟩. Here the first qubit is 1 and the second is 0, which is |10⟩.' },
    ],
    hints: ['|1⟩ ⊗ |0⟩ is the basis state |10⟩.', 'The order is |00⟩, |01⟩, |10⟩, |11⟩. Which place is |10⟩?'],
    solution: '|1⟩ ⊗ |0⟩ = |10⟩, the third basis state, so the vector is (0, 0, 1, 0).',
  },
  {
    id: 'p3_2', lessonId: 'math_lesson_3', title: 'Plus on the left',
    statement: 'Write |+⟩ ⊗ |0⟩ with |+⟩ = (1/√2, 1/√2). Enter the four amplitudes in the order |00⟩, |01⟩, |10⟩, |11⟩.',
    shape: vec(4), answer: ['1/√2', '0', '1/√2', '0'],
    commonWrong: [
      { answer: ['1/√2', '1/√2', '0', '0'], feedback: 'That is |0⟩ ⊗ |+⟩. The qubit in superposition is the left one here, so the 1s go in |00⟩ and |10⟩.' },
    ],
    hints: ['Use (a, b) ⊗ (c, d) = (ac, ad, bc, bd) with (a, b) = (1/√2, 1/√2) and (c, d) = (1, 0).', 'ac = 1/√2, ad = 0, bc = 1/√2, bd = 0.'],
    solution: '(a, b) ⊗ (c, d) = (ac, ad, bc, bd) = (1/√2, 0, 1/√2, 0).',
  },
  {
    id: 'p3_3', lessonId: 'math_lesson_3', title: 'A CNOT',
    statement: 'Apply CNOT (the left qubit is the control) to |10⟩ = (0, 0, 1, 0). Enter the new vector.',
    shape: vec(4), answer: ['0', '0', '0', '1'],
    commonWrong: [
      { answer: ['0', '0', '1', '0'], feedback: 'The control is 1, so the target flips: |10⟩ becomes |11⟩.' },
    ],
    hints: ['The control (left) qubit is 1, so the target (right) qubit is flipped.', '|10⟩ becomes |11⟩. Which place is |11⟩?'],
    solution: 'CNOT flips the right qubit when the left one is 1: |10⟩ → |11⟩, so the vector is (0, 0, 0, 1).',
  },
  {
    id: 'p3_4', lessonId: 'math_lesson_3', title: 'How many amplitudes?',
    statement: 'How many amplitudes does a state of 5 qubits have?',
    shape: num(), answer: ['32'],
    commonWrong: [
      { answer: ['10'], feedback: 'The count doubles with every qubit, it does not add 2: two qubits have 4 amplitudes.' },
      { answer: ['25'], feedback: 'The count is 2 multiplied by itself 5 times, not 5 squared.' },
    ],
    hints: ['One qubit has 2 amplitudes, two qubits have 4, three have 8.', 'The count is 2ⁿ.'],
    solution: '2⁵ = 32 amplitudes.',
  },
  {
    id: 'p3_5', lessonId: 'math_lesson_3', title: 'Make a Bell state',
    statement: 'Start with |00⟩. Apply H to the left qubit, then CNOT with the left qubit as control. Enter the four amplitudes in the order |00⟩, |01⟩, |10⟩, |11⟩.',
    shape: vec(4), answer: ['1/√2', '0', '0', '1/√2'],
    commonWrong: [
      { answer: ['1/√2', '0', '1/√2', '0'], feedback: 'That is the state after H but before the CNOT. The CNOT swaps the |10⟩ and |11⟩ amplitudes.' },
      { answer: ['1/√2', '1/√2', '0', '0'], feedback: 'That would be H on the right qubit. Here H acts on the left qubit, so the 1s are in |00⟩ and |10⟩ first.' },
    ],
    hints: ['After H on the left qubit the state is |+⟩ ⊗ |0⟩ = (1/√2, 0, 1/√2, 0).', 'CNOT swaps the amplitudes of |10⟩ and |11⟩.'],
    solution: 'After H: (1/√2, 0, 1/√2, 0). CNOT swaps the last two entries: (1/√2, 0, 0, 1/√2), the Bell state (|00⟩ + |11⟩)/√2.',
  },

  // ---- Lesson 4: measurement, phase, interference ----------------------------------------------------------------
  {
    id: 'p4_1', lessonId: 'math_lesson_4', title: 'Special case: a quarter turn',
    statement: 'Apply H, then a phase of φ = π/2, then H again, to |0⟩. What is the chance of measuring 0?',
    shape: num(), answer: ['1/2'],
    commonWrong: [
      { answer: ['1'], feedback: 'The chance is 1 only for φ = 0. Use cos²(φ/2) with φ = π/2.' },
      { answer: ['0'], feedback: 'The chance is 0 only for φ = π. Use cos²(φ/2) with φ = π/2.' },
    ],
    hints: ['For this circuit the chance of 0 is cos²(φ/2).', 'φ/2 = π/4, and cos(π/4) = 1/√2.'],
    solution: 'P(0) = cos²(π/4) = (1/√2)² = 1/2. A quarter turn of phase gives a 50/50 result.',
  },
  {
    id: 'p4_2', lessonId: 'math_lesson_4', title: 'Special case: a half turn',
    statement: 'The same circuit with φ = π. What is the chance of measuring 1?',
    shape: num(), answer: ['1'],
    commonWrong: [
      { answer: ['0'], feedback: 'That is the chance of 0. With φ = π the two paths cancel for the result 0, so 1 is certain.' },
      { answer: ['1/2'], feedback: 'The chance of 1 is sin²(φ/2). With φ = π that is sin²(π/2), which is 1.' },
    ],
    hints: ['The chance of 1 is sin²(φ/2).', 'With φ = π, φ/2 is a right angle. What is the sine of a right angle?'],
    solution: 'P(1) = sin²(π/2) = 1. The amplitudes for 0 cancel exactly (1 + e^(iπ) = 0), so the result is always 1.',
  },
  {
    id: 'p4_3', lessonId: 'math_lesson_4', title: 'In between',
    statement: 'The same circuit with φ = π/3. What is the chance of measuring 0? Give a fraction or a decimal.',
    shape: num(), answer: ['3/4'],
    commonWrong: [
      { answer: ['1/4'], feedback: 'That is the chance of 1. The chance of 0 is cos²(φ/2).' },
      { answer: ['1/2'], feedback: 'That would be φ = π/2. Here φ/2 = π/6, and cos(π/6) = √3/2.' },
    ],
    hints: ['P(0) = cos²(φ/2) with φ/2 = π/6.', 'cos(π/6) = √3/2, so its square is 3/4.'],
    solution: 'P(0) = cos²(π/6) = (√3/2)² = 3/4, and P(1) = 1/4.',
  },
  {
    id: 'p4_4', lessonId: 'math_lesson_4', title: 'Between the gates',
    statement: 'After the first H and the phase gate with φ = π/2, but before the second H, what is the state vector?',
    shape: vec(2), answer: ['1/√2', 'i/√2'],
    commonWrong: [
      { answer: ['1/√2', '1/√2'], feedback: 'That is the state after the first H only. The phase gate multiplies the bottom entry by e^(iφ) = i.' },
      { answer: ['1/√2', '-1/√2'], feedback: 'That would be φ = π. For φ = π/2, e^(iφ) = i.' },
    ],
    hints: ['After H the state is (1/√2, 1/√2). The phase gate multiplies the bottom entry by e^(iφ).', 'e^(iπ/2) = i.'],
    solution: 'The bottom entry is multiplied by e^(iπ/2) = i: the state is (1/√2, i/√2).',
  },
  {
    id: 'p4_5', lessonId: 'math_lesson_4', title: 'Find the phase',
    statement: 'For which phase φ between 0 and 180 degrees does the circuit give exactly 50% for each result?',
    shape: num(), answer: ['90'], unit: 'degrees', tolerance: 0.5,
    commonWrong: [
      { answer: ['45'], feedback: 'That is φ/2. You need cos²(φ/2) = 1/2, so φ/2 = 45 degrees and φ is twice that.' },
      { answer: ['180'], feedback: 'At 180 degrees the result is certain (always 1), not 50/50.' },
    ],
    hints: ['You need cos²(φ/2) = 1/2, so cos(φ/2) = 1/√2.', 'cos(45°) = 1/√2, so φ/2 = 45°.'],
    solution: 'cos(φ/2) = 1/√2 gives φ/2 = 45°, so φ = 90°.',
  },

  // ---- Lesson 5: Grover's algorithm in 2D -----------------------------------------------------------------------
  {
    id: 'p5_1', lessonId: 'math_lesson_5', title: 'The smallest search',
    statement: 'A list has N = 4 items and one is marked. What is the chance of finding it after one Grover round?',
    shape: num(), answer: ['1'],
    commonWrong: [
      { answer: ['1/4'], feedback: 'That is the chance of a single random guess. One Grover round does much better here.' },
      { answer: ['1/2'], feedback: 'Use sin²(3θ) with sin θ = 1/2, so θ = 30° and 3θ = 90°.' },
    ],
    hints: ['sin θ = 1/√N = 1/2, so θ = 30 degrees.', 'After one round the angle is 3θ. What is sin²(90°)?'],
    solution: 'θ = 30°, so after one round the angle is 3θ = 90° and the chance is sin²(90°) = 1.',
  },
  {
    id: 'p5_2', lessonId: 'math_lesson_5', title: 'The starting angle',
    statement: 'For N = 16 with one marked item, sin θ = 1/√16 = 1/4. What is θ, to the nearest degree?',
    shape: num(), answer: ['14.5'], unit: 'degrees', tolerance: 0.6,
    commonWrong: [
      { answer: ['25'], feedback: 'That would give sin θ = 0.42. Check: sin(14.5°) is about 0.25.' },
    ],
    hints: ['You need the angle whose sine is 0.25. Use the inverse sine (arcsin) on a calculator.', 'arcsin(0.25) is about 14.5 degrees.'],
    solution: 'θ = arcsin(1/4) ≈ 14.5°.',
  },
  {
    id: 'p5_3', lessonId: 'math_lesson_5', title: 'The angle after a round',
    statement: 'For N = 4 (θ = 30°), what is the angle (2k + 1)θ after k = 1 round?',
    shape: num(), answer: ['90'], unit: 'degrees', tolerance: 0.5,
    commonWrong: [
      { answer: ['60'], feedback: 'That is 2θ, the turn made by one round. The angle from the start is (2k + 1)θ, which includes the starting θ.' },
      { answer: ['30'], feedback: 'That is the starting angle. After one round it is (2·1 + 1)θ.' },
    ],
    hints: ['Put k = 1 into (2k + 1)θ.', '(2·1 + 1) = 3, and 3 × 30° = ?'],
    solution: '(2·1 + 1) × 30° = 90°.',
  },
  {
    id: 'p5_4', lessonId: 'math_lesson_5', title: 'How many rounds?',
    statement: 'For N = 100 with one marked item, about how many Grover rounds are best? Use (π/4)√N and give a whole number.',
    shape: num(), answer: ['8'], tolerance: 0.5,
    commonWrong: [
      { answer: ['50'], feedback: 'That is N/2, the classical average. Grover needs about (π/4)√N rounds.' },
      { answer: ['10'], feedback: '√100 = 10, but you also need the factor π/4 (about 0.785).' },
    ],
    hints: ['First find the square root of 100, which is 10.', 'π/4 is about 0.785, so (π/4) × 10 is about 7.85.'],
    solution: '(π/4)√100 = (π/4) × 10 ≈ 7.85, so about 8 rounds.',
  },
  {
    id: 'p5_5', lessonId: 'math_lesson_5', title: 'Chance after three rounds',
    statement: 'For N = 16 (θ ≈ 14.48°) after k = 3 rounds, the chance is sin²(7θ). Give it as a percentage, to the nearest whole number.',
    shape: num(), answer: ['96'], unit: '%', tolerance: 1,
    commonWrong: [
      { answer: ['100'], feedback: 'It is very high but not exactly 100%: 7θ is about 101 degrees, a little past 90.' },
      { answer: ['50'], feedback: 'Compute 7 × 14.48° ≈ 101.4° and take the sine, then square.' },
    ],
    hints: ['7 × 14.48° ≈ 101.4°.', 'sin(101.4°) ≈ 0.980. Square it.'],
    solution: '7θ ≈ 101.4°, sin(101.4°) ≈ 0.980, and its square is about 0.96, so 96%.',
  },
  {
    id: 'p5_6', lessonId: 'math_lesson_5', title: 'A big list',
    statement: 'A list has N = 1,000,000 items. About how many Grover rounds are best? Use (π/4)√N and give a whole number.',
    shape: num(), answer: ['785'], tolerance: 1,
    commonWrong: [
      { answer: ['500000'], feedback: 'That is the classical average, N/2. Grover needs only about (π/4)√N.' },
      { answer: ['1000'], feedback: '√N = 1000, but multiply by π/4 (about 0.785).' },
    ],
    hints: ['√1,000,000 = 1000.', '(π/4) × 1000 is about 785.4.'],
    solution: '(π/4) × 1000 ≈ 785 rounds, against about 500,000 guesses for a classical search on average.',
  },
];

/** The problems of one lesson, in order. */
export const practiceFor = (lessonId: string): PracticeProblem[] => PRACTICE.filter((p) => p.lessonId === lessonId);

export const PRACTICE_BY_ID: Record<string, PracticeProblem> = Object.fromEntries(PRACTICE.map((p) => [p.id, p]));
