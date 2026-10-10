import { Complex } from '../circuit/complex';

/**
 * Reads what a learner types as an answer: `1/sqrt(2)`, `1/√2`, `0.707`, `(1+i)/2`, `-i`, `e^(i*pi/4)`, `3/5`, `√(2/3)`.
 * A small hand-written parser: it never evaluates code, never throws, and gives up (null) on anything it does not understand.
 *
 * Supported: numbers, i, pi or π, e, + - * / ^, brackets, sqrt(x) or √x, exp, cos, sin, implicit multiplication (`2i`, `1/2 i`,
 * `3(1+i)`), and the symbols − · × ÷ ² ³ that phones and documents produce.
 */

const MAX_LENGTH = 120;
const MAX_DEPTH = 40;

type Token =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' | '(' | ')' | '√' };

function tidy(text: string): string {
  return text
    .replace(/[−–—]/g, '-')
    .replace(/[·×⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function tokenize(text: string): Token[] | null {
  const out: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/[0-9.]/.test(ch)) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(text.slice(i));
      if (!m) return null;
      // "2e" is two times e, not an exponent with nothing after it
      out.push({ t: 'num', v: Number(m[1]) * (m[2] ? 10 ** Number(m[2].slice(1)) : 1) });
      i += m[0].length;
    } else if ('+-*/^()'.includes(ch)) {
      out.push({ t: 'op', v: ch as '+' });
      i += 1;
    } else if (ch === '√') {
      out.push({ t: 'op', v: '√' });
      i += 1;
    } else if (ch === 'π') {
      out.push({ t: 'id', v: 'pi' });
      i += 1;
    } else if (/[a-z]/.test(ch)) {
      const m = /^[a-z]+/.exec(text.slice(i))!;
      let word = m[0];
      // "2pi", "ipi" and the like run together: split known words off the front
      const parts: string[] = [];
      while (word.length > 0) {
        const known = ['sqrt', 'exp', 'cos', 'sin', 'pi', 'i', 'e'].find((k) => word.startsWith(k));
        if (!known) return null;
        parts.push(known);
        word = word.slice(known.length);
      }
      for (const p of parts) out.push({ t: 'id', v: p });
      i += m[0].length;
    } else {
      return null;
    }
  }
  return out;
}

const add = Complex.add;
const mul = Complex.mul;
const re = (x: number): Complex => Complex.create(x, 0);

function cexp(z: Complex): Complex {
  return Complex.scale(Complex.exp(z.im), Math.exp(z.re));
}

function clog(z: Complex): Complex | null {
  const r = Complex.abs(z);
  return r === 0 ? null : Complex.create(Math.log(r), Complex.phase(z));
}

function csqrt(z: Complex): Complex {
  const r = Complex.abs(z);
  const re_ = Math.sqrt((r + z.re) / 2);
  const im_ = Math.sqrt(Math.max(0, (r - z.re) / 2));
  return Complex.create(re_, z.im < 0 ? -im_ : im_);
}

function cpow(a: Complex, b: Complex): Complex | null {
  if (b.im === 0 && Number.isInteger(b.re) && Math.abs(b.re) <= 64) {
    let result = re(1);
    for (let k = 0; k < Math.abs(b.re); k++) result = mul(result, a);
    if (b.re >= 0) return result;
    return Complex.abs(result) === 0 ? null : Complex.div(re(1), result);
  }
  if (Complex.abs(a) === 0) return b.re > 0 ? re(0) : null;
  const l = clog(a);
  return l ? cexp(mul(b, l)) : null;
}

/** Parses one answer. Returns null when it cannot be read, or the value is not a finite number. */
export function parseComplex(input: string): Complex | null {
  if (input.length > MAX_LENGTH) return null;
  const found = tokenize(tidy(input));
  if (!found || found.length === 0) return null;
  const tokens: Token[] = found;
  let pos = 0;
  let depth = 0;

  const peek = () => tokens[pos];
  const isOp = (v: string) => peek()?.t === 'op' && (peek() as { v: string }).v === v;
  const startsAtom = () => {
    const tk = peek();
    if (!tk) return false;
    if (tk.t === 'num') return true;
    if (tk.t === 'id') return true;
    return tk.v === '(' || tk.v === '√';
  };

  const fail = (): never => {
    throw new Error('x');
  };

  function expression(): Complex {
    if (++depth > MAX_DEPTH) fail();
    let value = term();
    while (isOp('+') || isOp('-')) {
      const op = (tokens[pos++] as { v: string }).v;
      const rhs = term();
      value = op === '+' ? add(value, rhs) : Complex.sub(value, rhs);
    }
    depth -= 1;
    return value;
  }

  function term(): Complex {
    let value = unary();
    for (;;) {
      if (isOp('*')) {
        pos += 1;
        value = mul(value, unary());
      } else if (isOp('/')) {
        pos += 1;
        const d = unary();
        if (Complex.abs(d) === 0) fail();
        value = Complex.div(value, d);
      } else if (startsAtom() && peek()?.t !== 'num') {
        // implicit multiplication: 2i, 1/2 i, 3(1+i). Two numbers side by side ("1 2", "1..2") are not a product.
        value = mul(value, power());
      } else {
        return value;
      }
    }
  }

  function unary(): Complex {
    if (isOp('-')) {
      pos += 1;
      return Complex.scale(unary(), -1);
    }
    if (isOp('+')) {
      pos += 1;
      return unary();
    }
    return power();
  }

  function power(): Complex {
    const base = atom();
    if (isOp('^')) {
      pos += 1;
      const exponent = unary();
      const result = cpow(base, exponent);
      if (!result) fail();
      return result as Complex;
    }
    return base;
  }

  function atom(): Complex {
    const tk = tokens[pos++];
    if (!tk) return fail();
    if (tk.t === 'num') return re(tk.v);
    if (tk.t === 'op') {
      if (tk.v === '(') {
        const inner = expression();
        if (!isOp(')')) fail();
        pos += 1;
        return inner;
      }
      if (tk.v === '√') {
        return csqrt(isOp('(') ? atom() : power());
      }
      return fail();
    }
    switch (tk.v) {
      case 'i':
        return Complex.i();
      case 'pi':
        return re(Math.PI);
      case 'e':
        return re(Math.E);
      case 'sqrt':
      case 'exp':
      case 'cos':
      case 'sin': {
        // "sqrt2" is read like "√2"
        if (tk.v === 'sqrt' && !isOp('(')) return csqrt(power());
        if (!isOp('(')) fail();
        pos += 1;
        const inner = expression();
        if (!isOp(')')) fail();
        pos += 1;
        if (tk.v === 'sqrt') return csqrt(inner);
        if (tk.v === 'exp') return cexp(inner);
        if (inner.im !== 0) fail();
        return re(tk.v === 'cos' ? Math.cos(inner.re) : Math.sin(inner.re));
      }
      default:
        return fail();
    }
  }

  try {
    const value = expression();
    if (pos !== tokens.length) return null;
    return Number.isFinite(value.re) && Number.isFinite(value.im) ? value : null;
  } catch {
    return null;
  }
}
