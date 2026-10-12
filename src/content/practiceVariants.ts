import { PRACTICE_BY_ID } from './practice';
import type { PracticeProblem } from './practice';

/**
 * "New numbers": a few of the practice problems can be asked again with different numbers, so a learner who has the idea
 * can see that it was the method, not a memorised answer. A variant is the same problem (same id, same kind of slip, same
 * hints) with new numbers, built from a seed, so it is repeatable and testable.
 *
 * Rules, enforced by tests/practiceVariants.test.ts:
 *  - Seed 0 is the original problem, and a variant always keeps the original's id and shape.
 *  - Every number is chosen so the answer is checked against an independent calculation, and every listed wrong answer
 *    is rejected (a coincidence such as a = b making two answers equal is avoided when the numbers are chosen).
 *  - Hints never contain the answer.
 */
type Generator = (seed: number, base: PracticeProblem) => PracticeProblem;

/** A small seeded generator, so the same seed always gives the same numbers. */
function mulberry32(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rng: () => number, lo: number, hi: number): number => lo + Math.floor(rng() * (hi - lo + 1));
const cycle = <T,>(list: readonly T[], seed: number): T => list[(seed - 1) % list.length];
const signed = (n: number): string => (n < 0 ? `−${-n}` : String(n));
const plain = (n: number): string => (n < 0 ? `-${-n}` : String(n));

const TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [8, 6, 10], [7, 24, 25], [20, 21, 29], [9, 12, 15], [12, 5, 13], [8, 15, 17],
];

const GENERATORS: Record<string, Generator> = {
  // (a + bi)(a - bi) = a² + b²
  p0_1: (seed, base) => {
    const rng = mulberry32(seed);
    const a = between(rng, 1, 5);
    let b = between(rng, 1, 5);
    if (b === a) b = a === 5 ? 4 : a + 1; // keeps the two listed slips different from the answer
    const answer = a * a + b * b;
    return {
      ...base,
      statement: `Work out (${a} + ${b}i)(${a} − ${b}i). Give a single number.`,
      answer: [String(answer)],
      commonWrong: [
        { answer: [String(a * a - b * b)], feedback: 'Remember i² = −1, so the last term −bi·bi is +b², not −b².' },
        { answer: [String(2 * a * a)], feedback: 'The two i terms cancel, and the last term is +b² (because i² = −1), not a second a².' },
      ],
      hints: [
        'Multiply each term of the first bracket by each term of the second.',
        `The i terms cancel. What is −(${b}i)(${b}i), given that i·i = −1?`,
      ],
      solution: `(${a} + ${b}i)(${a} − ${b}i) = ${a}² − (${b}i)² = ${a * a} + ${b * b} = ${answer}.`,
    };
  },

  // the size of a + bi, from Pythagorean triples so the answer is whole
  p0_2: (seed, base) => {
    const [a, b, c] = cycle(TRIPLES, seed);
    return {
      ...base,
      statement: `Find the size (modulus) of ${a} + ${b}i.`,
      answer: [String(c)],
      commonWrong: [
        { answer: [String(a + b)], feedback: 'You added the parts. The size is the square root of (a² + b²).' },
        { answer: [String(c * c)], feedback: 'That is the size squared. Take the square root as the last step.' },
      ],
      hints: [
        'Treat the real part and the imaginary part like the two sides of a right-angled triangle.',
        `Size = √(${a}² + ${b}²) = √(${a * a} + ${b * b}).`,
      ],
      solution: `|${a} + ${b}i| = √(${a}² + ${b}²) = √${c * c} = ${c}.`,
    };
  },

  // adding two column vectors
  p0_3: (seed, base) => {
    const rng = mulberry32(seed);
    const pick = () => between(rng, -3, 6);
    let a = pick();
    let b = pick();
    let c = pick();
    let d = pick();
    // avoid the coincidences that would make the "multiplied entry by entry" slip equal to the sum
    if (a * c === a + c) c += 1;
    if (b * d === b + d) d += 1;
    return {
      ...base,
      statement: `Add the column vectors (${signed(a)}, ${signed(b)}) and (${signed(c)}, ${signed(d)}). Enter the result as a column.`,
      answer: [plain(a + c), plain(b + d)],
      commonWrong: [
        { answer: [plain(a * c), plain(b * d)], feedback: 'That multiplies entry by entry. To add, add the top entries and add the bottom entries.' },
      ],
      hints: [
        'Add the top numbers together, then the bottom numbers.',
        `Top: ${signed(a)} + (${signed(c)}). Bottom: ${signed(b)} + (${signed(d)}).`,
      ],
      solution: `Top: ${signed(a)} + (${signed(c)}) = ${signed(a + c)}. Bottom: ${signed(b)} + (${signed(d)}) = ${signed(b + d)}. The result is the column (${signed(a + c)}, ${signed(b + d)}).`,
    };
  },

  // a 2 x 2 matrix times a column
  p0_4: (seed, base) => {
    const rng = mulberry32(seed);
    let a = 0, b = 0, c = 0, d = 0, x = 0, y = 0;
    for (let tries = 0; tries < 50; tries++) {
      a = between(rng, 1, 4); b = between(rng, 1, 4); c = between(rng, 1, 4); d = between(rng, 1, 4);
      x = between(rng, 1, 3); y = between(rng, 1, 3);
      const right = [a * x + b * y, c * x + d * y];
      const wrong = [a * x + c * y, b * x + d * y];
      if (right[0] !== wrong[0] && right[1] !== wrong[1] && x !== y) break;
    }
    const top = a * x + b * y;
    const bottom = c * x + d * y;
    return {
      ...base,
      statement: 'Multiply the matrix by the column and enter the result as a column.',
      math: [{ mat: [[String(a), String(b)], [String(c), String(d)]] }, { vec: [String(x), String(y)] }, ' = ?'],
      answer: [String(top), String(bottom)],
      commonWrong: [
        { answer: [String(a * x + c * y), String(b * x + d * y)], feedback: 'You combined the columns of the matrix with the entries. Use each ROW of the matrix with the column.' },
      ],
      hints: [
        `Top entry: multiply the first row (${a}, ${b}) by the column (${x}, ${y}) entry by entry and add.`,
        `Top: ${a}·${x} + ${b}·${y}. Bottom: ${c}·${x} + ${d}·${y}.`,
      ],
      solution: `Top: ${a}·${x} + ${b}·${y} = ${top}. Bottom: ${c}·${x} + ${d}·${y} = ${bottom}. The result is (${top}, ${bottom}).`,
    };
  },

  // the missing amplitude, from Pythagorean triples
  p1_1: (seed, base) => {
    const [a, b, c] = cycle(TRIPLES, seed);
    return {
      ...base,
      statement: `A qubit is in the state (${a}/${c})|0⟩ + β|1⟩, where β is a positive real number. Find β.`,
      answer: [`${b}/${c}`],
      commonWrong: [
        { answer: [`${c - a}/${c}`], feedback: `You subtracted the amplitudes (1 − ${a}/${c}). The rule is about the squared sizes: |α|² + |β|² = 1.` },
        { answer: [`${b * b}/${c * c}`], feedback: 'That is |β|². The question asks for β itself, so take the square root.' },
      ],
      hints: [
        `Use |α|² + |β|² = 1 with α = ${a}/${c}.`,
        `|β|² = 1 − ${a * a}/${c * c} = ${b * b}/${c * c}. What number squared is ${b * b}/${c * c}?`,
      ],
      solution: `|β|² = 1 − (${a}/${c})² = 1 − ${a * a}/${c * c} = ${b * b}/${c * c}, so β = ${b}/${c}.`,
    };
  },

  // from amplitude to chance
  p1_2: (seed, base) => {
    const options = [
      { a: '1/3', p: '1/9', q: '8/9', b: '√8/3' },
      { a: '2/3', p: '4/9', q: '5/9', b: '√5/3' },
      { a: '√3/2', p: '3/4', q: '1/4', b: '1/2' },
      { a: '3/5', p: '9/25', q: '16/25', b: '4/5' },
      { a: '√5/3', p: '5/9', q: '4/9', b: '2/3' },
      { a: '3/4', p: '9/16', q: '7/16', b: '√7/4' },
    ] as const;
    const o = cycle(options, seed);
    return {
      ...base,
      statement: `A qubit is in the state (${o.a})|0⟩ + (${o.b})|1⟩. What is the chance of measuring 0?`,
      answer: [o.p],
      commonWrong: [
        { answer: [o.a], feedback: 'That is the amplitude. The chance is its squared size.' },
        { answer: [o.q], feedback: 'That is the chance of measuring 1. The question asks for 0.' },
      ],
      hints: ['The chance of 0 comes from the amplitude of |0⟩.', `Square the size of ${o.a}.`],
      solution: `P(0) = |${o.a}|² = ${o.p}. (And P(1) = (${o.b})² = ${o.q}, so they add to 1.)`,
    };
  },

  // H, phase, H: the chance of 0 is cos²(φ/2)
  p4_3: (seed, base) => {
    const options = [
      { phi: 'π/3', half: 'π/6', p: '3/4', q: '1/4', cos: '√3/2' },
      { phi: '2π/3', half: 'π/3', p: '1/4', q: '3/4', cos: '1/2' },
      { phi: 'π', half: 'π/2', p: '0', q: '1', cos: '0' },
      { phi: '0', half: '0', p: '1', q: '0', cos: '1' },
    ] as const;
    const o = cycle(options, seed);
    return {
      ...base,
      statement: `The same circuit (H, then a phase of φ, then H) with φ = ${o.phi}. What is the chance of measuring 0? Give a fraction or a decimal.`,
      answer: [o.p],
      commonWrong: [
        { answer: [o.q], feedback: 'That is the chance of 1. The chance of 0 is cos²(φ/2).' },
      ],
      hints: [
        `P(0) = cos²(φ/2) with φ/2 = ${o.half}.`,
        `Find cos(${o.half}), then square it.`,
      ],
      solution: `P(0) = cos²(${o.half}) = (${o.cos})² = ${o.p}, and P(1) = ${o.q}.`,
    };
  },

  // the starting angle of Grover's search
  p5_2: (seed, base) => {
    const sizes = [9, 25, 36, 49, 64, 100] as const;
    const n = cycle(sizes, seed);
    const root = Math.sqrt(n);
    const angle = (Math.asin(1 / root) * 180) / Math.PI;
    return {
      ...base,
      statement: `For N = ${n} with one marked item, sin θ = 1/√${n} = 1/${root}. What is θ, to the nearest degree?`,
      answer: [angle.toFixed(1)],
      tolerance: 0.6,
      commonWrong: [
        { answer: [(1 / root).toFixed(3)], feedback: 'That is sin θ itself. You want the angle whose sine it is: use the inverse sine (arcsin).' },
      ],
      hints: [
        `You need the angle whose sine is ${(1 / root).toFixed(3)}. Use the inverse sine (arcsin) on a calculator.`,
        `arcsin(${(1 / root).toFixed(3)}) is a little over ${Math.floor(angle)} degrees.`,
      ],
      solution: `θ = arcsin(1/${root}) ≈ ${angle.toFixed(1)}°.`,
    };
  },

  // the angle after k rounds
  p5_3: (seed, base) => {
    const options = [
      { n: 4, theta: 30, k: 1 },
      { n: 4, theta: 30, k: 2 },
      { n: 2, theta: 45, k: 1 },
    ] as const;
    const o = cycle(options, seed);
    const angle = (2 * o.k + 1) * o.theta;
    return {
      ...base,
      statement: `For N = ${o.n} (θ = ${o.theta}°), what is the angle (2k + 1)θ after k = ${o.k} round${o.k === 1 ? '' : 's'}?`,
      answer: [String(angle)],
      commonWrong: [
        { answer: [String(2 * o.k * o.theta)], feedback: `That is 2kθ, the turn made by the rounds alone. The angle from the start is (2k + 1)θ, which includes the starting θ.` },
        { answer: [String(o.theta)], feedback: `That is the starting angle. After ${o.k} round${o.k === 1 ? '' : 's'} it is (2·${o.k} + 1)θ.` },
      ],
      hints: [`Put k = ${o.k} into (2k + 1)θ.`, `(2·${o.k} + 1) = ${2 * o.k + 1}, and ${2 * o.k + 1} × ${o.theta}° = ?`],
      solution: `(2·${o.k} + 1) × ${o.theta}° = ${angle}°.`,
    };
  },

  // how many Grover rounds are best
  p5_4: (seed, base) => {
    const sizes = [16, 36, 64, 100, 144, 400] as const;
    const n = cycle(sizes, seed);
    const root = Math.sqrt(n);
    const rounds = Math.round((Math.PI / 4) * root);
    return {
      ...base,
      statement: `For N = ${n} with one marked item, about how many Grover rounds are best? Use (π/4)√N and give a whole number.`,
      answer: [String(rounds)],
      tolerance: 0.5,
      commonWrong: [
        { answer: [String(n / 2)], feedback: 'That is N/2, the classical average. Grover needs about (π/4)√N rounds.' },
        { answer: [String(root)], feedback: `√${n} = ${root}, but you also need the factor π/4 (about 0.785).` },
      ],
      hints: [
        `First find the square root of ${n}, which is ${root}.`,
        `π/4 is about 0.785, so (π/4) × ${root} is about ${((Math.PI / 4) * root).toFixed(2)}.`,
      ],
      solution: `(π/4)√${n} = (π/4) × ${root} ≈ ${((Math.PI / 4) * root).toFixed(2)}, so about ${rounds} rounds.`,
    };
  },
};

/** The ids of the problems that can be asked again with new numbers. */
export const VARIANT_IDS: string[] = Object.keys(GENERATORS);

export const hasVariants = (id: string): boolean => id in GENERATORS;

/** The problem with the numbers of a seed. Seed 0 is the original; an id without variants always gives the original. */
export function variantOf(id: string, seed: number): PracticeProblem {
  const base = PRACTICE_BY_ID[id];
  const make = GENERATORS[id];
  if (!base || !make || seed <= 0) return base;
  return make(seed, base);
}

/** The next seed after `seed` that asks something different from what is on screen. */
export function nextSeed(id: string, seed: number): number {
  const current = variantOf(id, seed).statement;
  const currentMath = JSON.stringify(variantOf(id, seed).math ?? null);
  for (let s = seed + 1; s <= seed + 40; s++) {
    const v = variantOf(id, s);
    if (v.statement !== current || JSON.stringify(v.math ?? null) !== currentMath) return s;
  }
  return seed + 1;
}
