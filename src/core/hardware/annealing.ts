import { Complex } from '../circuit';

/**
 * Annealing Lab: a closed-system simulation of a few spins. The problem is an Ising energy
 *
 *   E(z) = sum_i h_i z_i + sum_(i<j) J_ij z_i z_j,     z_i = +1 (bit 0) or -1 (bit 1)
 *
 * and the anneal sweeps H(s) = -(1 - s) * sum_i X_i + s * E from a transverse field (s = 0, ground state: every spin in
 * |+>, all answers at once) to the problem (s = 1, ground state: the best answer). It is evolved with the Schrodinger
 * equation by a fourth-order Runge-Kutta time-stepper, because the state-vector engine only does gates. Slow enough and
 * the state follows the ground state (the adiabatic theorem); too fast and it is left behind.
 *
 * This is NOT a model of a real annealer: those are open, noisy systems with thousands of qubits, and whether they beat
 * the best classical methods is still debated. Four to six spins are as far as an exact simulation goes on a phone.
 */
export interface IsingProblem {
  id: string;
  name: string;
  /** What makes this problem easy or hard, in one sentence. */
  about: string;
  spins: number;
  h: number[];
  /** Couplings as [i, j, J]. */
  couplings: [number, number, number][];
}

/** Energy of every bit string x (bit i of x is spin i; 0 means z = +1). */
export function energies(p: IsingProblem): number[] {
  const out: number[] = [];
  for (let x = 0; x < 1 << p.spins; x++) {
    const z = (i: number) => (((x >> i) & 1) === 0 ? 1 : -1);
    let e = 0;
    for (let i = 0; i < p.spins; i++) e += p.h[i] * z(i);
    for (const [i, j, c] of p.couplings) e += c * z(i) * z(j);
    out.push(e);
  }
  return out;
}

export const groundEnergy = (p: IsingProblem): number => Math.min(...energies(p));

/** The bit strings with the lowest energy (more than one when the problem has a symmetry). */
export function groundStates(p: IsingProblem): number[] {
  const e = energies(p);
  const m = Math.min(...e);
  return e.flatMap((v, x) => (Math.abs(v - m) < 1e-9 ? [x] : []));
}

export interface AnnealResult {
  /** Chance of ending in a lowest-energy state. */
  success: number;
  /** Final chance of every bit string. */
  probabilities: number[];
}

/** Evolves from the uniform state for total time `T` (in units of 1 / transverse field) with a linear schedule. */
export function anneal(p: IsingProblem, T: number, dt = 0.04): AnnealResult {
  const N = 1 << p.spins;
  const e = energies(p);
  let re = new Array<number>(N).fill(1 / Math.sqrt(N));
  let im = new Array<number>(N).fill(0);
  const steps = Math.max(1, Math.ceil(T / dt));
  const h = T / steps;

  // d(psi)/dt = -i H(s) psi, with H psi (x) = -(1-s) * sum_i psi(x ^ bit_i) + s * E(x) * psi(x)
  const deriv = (r: number[], m: number[], s: number): [number[], number[]] => {
    const dr = new Array<number>(N);
    const di = new Array<number>(N);
    for (let x = 0; x < N; x++) {
      let hr = s * e[x] * r[x];
      let hi = s * e[x] * m[x];
      for (let i = 0; i < p.spins; i++) {
        hr -= (1 - s) * r[x ^ (1 << i)];
        hi -= (1 - s) * m[x ^ (1 << i)];
      }
      // -i * (hr + i hi) = hi - i hr
      dr[x] = hi;
      di[x] = -hr;
    }
    return [dr, di];
  };
  const add = (a: number[], k: number[], f: number) => a.map((v, i) => v + f * k[i]);

  for (let step = 0; step < steps; step++) {
    const s0 = (step * h) / T;
    const s1 = ((step + 0.5) * h) / T;
    const s2 = ((step + 1) * h) / T;
    const [r1, i1] = deriv(re, im, s0);
    const [r2, i2] = deriv(add(re, r1, h / 2), add(im, i1, h / 2), s1);
    const [r3, i3] = deriv(add(re, r2, h / 2), add(im, i2, h / 2), s1);
    const [r4, i4] = deriv(add(re, r3, h), add(im, i3, h), s2);
    re = re.map((v, x) => v + (h / 6) * (r1[x] + 2 * r2[x] + 2 * r3[x] + r4[x]));
    im = im.map((v, x) => v + (h / 6) * (i1[x] + 2 * i2[x] + 2 * i3[x] + i4[x]));
  }

  const probabilities = re.map((v, x) => v * v + im[x] * im[x]);
  const norm = probabilities.reduce((a, b) => a + b, 0);
  const ground = new Set(groundStates(p));
  const success = probabilities.reduce((a, v, x) => a + (ground.has(x) ? v : 0), 0) / norm;
  return { success, probabilities: probabilities.map((v) => v / norm) };
}

const problem = (id: string, name: string, about: string, h: number[], couplings: [number, number, number][]): IsingProblem => ({
  id, name, about, spins: h.length, h, couplings,
});

export const PROBLEMS: IsingProblem[] = [
  problem(
    'easy',
    'Four independent spins',
    'Each spin just follows its own field. The valley is wide, so even a quick anneal does well.',
    [0.8, -0.6, 0.5, -0.9],
    [],
  ),
  problem(
    'ring',
    'A frustrated ring',
    'Four spins that each want to point opposite their neighbours, with a small nudge to pick one answer. The gap is narrower.',
    [0.3, 0, 0, 0],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]],
  ),
  problem(
    'hard',
    'A tangled five',
    'Five spins with mixed couplings. The best answer and the runner-up differ in several spins, so the anneal has to squeeze through a small gap.',
    [0, 0, 0, 0, 0.5],
    [[0, 1, -1], [0, 2, 1], [0, 3, -1], [1, 2, -2], [1, 3, -1], [2, 3, -1], [2, 4, 2], [3, 4, -1]],
  ),
];

export const problemById = (id: string): IsingProblem => PROBLEMS.find((p) => p.id === id) ?? PROBLEMS[0];

/** The lowest-energy bit string that is not a ground state, and how many spins it differs from the best answer by. */
export function runnerUp(p: IsingProblem): { x: number; energy: number; flips: number } {
  const e = energies(p);
  const ground = groundStates(p);
  let best = -1;
  for (let x = 0; x < e.length; x++) {
    if (ground.includes(x)) continue;
    if (best === -1 || e[x] < e[best]) best = x;
  }
  let diff = ground[0] ^ best;
  let flips = 0;
  while (diff) {
    flips += diff & 1;
    diff >>= 1;
  }
  return { x: best, energy: e[best], flips };
}

/** The full Hamiltonian H(s) as a real symmetric matrix (it has no imaginary part). */
export function hamiltonian(p: IsingProblem, s: number): number[][] {
  const N = 1 << p.spins;
  const e = energies(p);
  const m = Array.from({ length: N }, () => new Array<number>(N).fill(0));
  for (let x = 0; x < N; x++) {
    m[x][x] = s * e[x];
    for (let i = 0; i < p.spins; i++) m[x][x ^ (1 << i)] -= 1 - s;
  }
  return m;
}

export interface Eigen {
  /** Eigenvalues in increasing order. */
  values: number[];
  /** vectors[k] is the unit eigenvector of values[k]. */
  vectors: number[][];
}

/** Exact diagonalisation of a real symmetric matrix by cyclic Jacobi rotations (fine for up to 64 x 64). */
export function diagonalise(matrix: number[][]): Eigen {
  const n = matrix.length;
  const a = matrix.map((row) => row.slice());
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
    if (off < 1e-22) break;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p];
          const vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => a[x][x] - a[y][y]);
  return {
    values: order.map((i) => a[i][i]),
    vectors: order.map((i) => v.map((row) => row[i])),
  };
}

/** The gap between the lowest two energies of H(s). It is the thing the anneal must not squeeze through too fast. */
export function gapAt(p: IsingProblem, s: number): number {
  const { values } = diagonalise(hamiltonian(p, s));
  return values[1] - values[0];
}

export interface GapPoint {
  s: number;
  gap: number;
}

export function gapCurve(p: IsingProblem, points = 20): GapPoint[] {
  return Array.from({ length: points + 1 }, (_, i) => ({ s: i / points, gap: gapAt(p, i / points) }));
}

/** The smallest gap on the curve and where it sits. */
export function minimumGap(curve: GapPoint[]): GapPoint {
  return curve.reduce((m, c) => (c.gap < m.gap ? c : m), curve[0]);
}

/** A rule of thumb from the adiabatic theorem: the anneal needs a time of order 1 / gap^2. */
export const roughSlowTime = (gap: number): number => (gap > 0 ? 1 / (gap * gap) : Infinity);

/** Evolves any constant real Hamiltonian exactly by its eigenvectors (used to check the time-stepper). */
export function exactEvolution(matrix: number[][], psi0: Complex[], t: number): Complex[] {
  const { values, vectors } = diagonalise(matrix);
  const n = matrix.length;
  const out = Array.from({ length: n }, () => Complex.zero());
  values.forEach((value, k) => {
    const overlap = vectors[k].reduce((acc, vk, i) => Complex.add(acc, Complex.scale(psi0[i], vk)), Complex.zero());
    const phase = Complex.mul(overlap, Complex.exp(-value * t));
    for (let i = 0; i < n; i++) out[i] = Complex.add(out[i], Complex.scale(phase, vectors[k][i]));
  });
  return out;
}

/** The same evolution by the Runge-Kutta stepper the anneal uses, for a constant Hamiltonian (s fixed). */
export function steppedEvolution(matrix: number[][], psi0: Complex[], t: number, dt = 0.01): Complex[] {
  const n = matrix.length;
  let re = psi0.map((c) => c.re);
  let im = psi0.map((c) => c.im);
  const deriv = (r: number[], m: number[]): [number[], number[]] => {
    const dr = new Array<number>(n);
    const di = new Array<number>(n);
    for (let x = 0; x < n; x++) {
      let hr = 0;
      let hi = 0;
      for (let y = 0; y < n; y++) {
        hr += matrix[x][y] * r[y];
        hi += matrix[x][y] * m[y];
      }
      dr[x] = hi;
      di[x] = -hr;
    }
    return [dr, di];
  };
  const add = (a: number[], k: number[], f: number) => a.map((v, i) => v + f * k[i]);
  const steps = Math.max(1, Math.ceil(t / dt));
  const h = t / steps;
  for (let s = 0; s < steps; s++) {
    const [r1, i1] = deriv(re, im);
    const [r2, i2] = deriv(add(re, r1, h / 2), add(im, i1, h / 2));
    const [r3, i3] = deriv(add(re, r2, h / 2), add(im, i2, h / 2));
    const [r4, i4] = deriv(add(re, r3, h), add(im, i3, h));
    re = re.map((v, x) => v + (h / 6) * (r1[x] + 2 * r2[x] + 2 * r3[x] + r4[x]));
    im = im.map((v, x) => v + (h / 6) * (i1[x] + 2 * i2[x] + 2 * i3[x] + i4[x]));
  }
  return re.map((r, x) => Complex.create(r, im[x]));
}
