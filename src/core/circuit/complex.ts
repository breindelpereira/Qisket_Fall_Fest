/**
 * Complex number implementation for quantum state vectors and matrix operations.
 */
export interface Complex {
  re: number;
  im: number;
}

export const Complex = {
  create: (re: number, im = 0): Complex => ({ re, im }),

  zero: (): Complex => ({ re: 0, im: 0 }),
  one: (): Complex => ({ re: 1, im: 0 }),
  i: (): Complex => ({ re: 0, im: 1 }),

  add: (a: Complex, b: Complex): Complex => ({
    re: a.re + b.re,
    im: a.im + b.im,
  }),

  sub: (a: Complex, b: Complex): Complex => ({
    re: a.re - b.re,
    im: a.im - b.im,
  }),

  mul: (a: Complex, b: Complex): Complex => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  }),

  scale: (a: Complex, scalar: number): Complex => ({
    re: a.re * scalar,
    im: a.im * scalar,
  }),

  div: (a: Complex, b: Complex): Complex => {
    const denom = b.re * b.re + b.im * b.im;
    if (denom === 0) throw new Error('Division by zero in Complex numbers');
    return {
      re: (a.re * b.re + a.im * b.im) / denom,
      im: (a.im * b.re - a.re * b.im) / denom,
    };
  },

  conj: (a: Complex): Complex => ({
    re: a.re,
    im: -a.im,
  }),

  absSq: (a: Complex): number => a.re * a.re + a.im * a.im,

  abs: (a: Complex): number => Math.sqrt(a.re * a.re + a.im * a.im),

  phase: (a: Complex): number => Math.atan2(a.im, a.re),

  exp: (theta: number): Complex => ({
    re: Math.cos(theta),
    im: Math.sin(theta),
  }),

  equals: (a: Complex, b: Complex, epsilon = 1e-6): boolean =>
    Math.abs(a.re - b.re) < epsilon && Math.abs(a.im - b.im) < epsilon,
};
