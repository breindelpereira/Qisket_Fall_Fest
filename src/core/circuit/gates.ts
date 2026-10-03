import { Complex } from './complex';

export type Matrix2x2 = [
  [Complex, Complex],
  [Complex, Complex]
];

const INV_SQRT2 = 1 / Math.SQRT2;

export const Gates = {
  // Identity Gate
  I: (): Matrix2x2 => [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.one()],
  ],

  // Pauli X (NOT / bit flip)
  X: (): Matrix2x2 => [
    [Complex.zero(), Complex.one()],
    [Complex.one(), Complex.zero()],
  ],

  // Pauli Y
  Y: (): Matrix2x2 => [
    [Complex.zero(), Complex.create(0, -1)],
    [Complex.create(0, 1), Complex.zero()],
  ],

  // Pauli Z (phase flip)
  Z: (): Matrix2x2 => [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.create(-1, 0)],
  ],

  // Hadamard Gate H
  H: (): Matrix2x2 => [
    [Complex.create(INV_SQRT2, 0), Complex.create(INV_SQRT2, 0)],
    [Complex.create(INV_SQRT2, 0), Complex.create(-INV_SQRT2, 0)],
  ],

  // Phase Gate S (Z^1/2)
  S: (): Matrix2x2 => [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.i()],
  ],

  // T Gate (Z^1/4, pi/8 gate)
  T: (): Matrix2x2 => [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.create(INV_SQRT2, INV_SQRT2)],
  ],

  // Rotation around Z axis: Rz(theta) = diag(e^(-i theta/2), e^(i theta/2))
  Rz: (theta: number): Matrix2x2 => [
    [Complex.exp(-theta / 2), Complex.zero()],
    [Complex.zero(), Complex.exp(theta / 2)],
  ],

  // Rotation around X axis: Rx(theta)
  Rx: (theta: number): Matrix2x2 => [
    [Complex.create(Math.cos(theta / 2), 0), Complex.create(0, -Math.sin(theta / 2))],
    [Complex.create(0, -Math.sin(theta / 2)), Complex.create(Math.cos(theta / 2), 0)],
  ],

  // Rotation around Y axis: Ry(theta)
  Ry: (theta: number): Matrix2x2 => [
    [Complex.create(Math.cos(theta / 2), 0), Complex.create(-Math.sin(theta / 2), 0)],
    [Complex.create(Math.sin(theta / 2), 0), Complex.create(Math.cos(theta / 2), 0)],
  ],

  // Matrix multiplication of two 2x2 matrices
  multiply2x2: (A: Matrix2x2, B: Matrix2x2): Matrix2x2 => {
    const C: Matrix2x2 = [
      [Complex.zero(), Complex.zero()],
      [Complex.zero(), Complex.zero()],
    ];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const term1 = Complex.mul(A[r][0], B[0][c]);
        const term2 = Complex.mul(A[r][1], B[1][c]);
        C[r][c] = Complex.add(term1, term2);
      }
    }
    return C;
  },

  // Check if two 2x2 matrices are entrywise equal within a numerical tolerance (global phase is NOT ignored)
  equals2x2: (A: Matrix2x2, B: Matrix2x2, epsilon = 1e-6): boolean => {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        if (!Complex.equals(A[r][c], B[r][c], epsilon)) {
          return false;
        }
      }
    }
    return true;
  },
};
