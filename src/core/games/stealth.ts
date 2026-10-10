import { Complex } from '../circuit';

/**
 * Schrödinger's Stealth: each laser checkpoint is a measurement that asks "is the agent in the state this slot is shaped
 * for?". The Born rule says the answer is yes with probability |<slot|agent>|², and after the measurement the agent is in
 * the slot's state (yes) or in the state orthogonal to it (no). This module is that rule, kept out of the component so it
 * can be tested.
 */
export type SlotState = '0' | '1' | '+' | '-';

const INV = 1 / Math.SQRT2;

/** The state a slot is shaped for, as amplitudes of |0> and |1>. */
export function slotAmplitudes(slot: SlotState): [Complex, Complex] {
  switch (slot) {
    case '0':
      return [Complex.one(), Complex.zero()];
    case '1':
      return [Complex.zero(), Complex.one()];
    case '+':
      return [Complex.create(INV, 0), Complex.create(INV, 0)];
    case '-':
      return [Complex.create(INV, 0), Complex.create(-INV, 0)];
  }
}

/** The state that is certain NOT to pass a slot: |0>/|1> and |+>/|-> are each other's partners. */
export const PARTNER: Record<SlotState, SlotState> = { '0': '1', '1': '0', '+': '-', '-': '+' };

/** The chance that a laser set to `slot` finds an agent with amplitudes (alpha, beta) in the slot's state: |<slot|agent>|². */
export function matchProbability(alpha: Complex, beta: Complex, slot: SlotState): number {
  const [ta, tb] = slotAmplitudes(slot);
  const overlap = Complex.add(Complex.mul(Complex.conj(ta), alpha), Complex.mul(Complex.conj(tb), beta));
  return Math.max(0, Math.min(1, Complex.absSq(overlap)));
}

/** At or above this the stance counts as a match, which hides tiny rounding in the amplitudes. */
export const MATCH_AT = 0.95;

/** Does the agent slip through this time? A match always does; otherwise it is a gamble with the Born-rule chance. */
export function slipsThrough(probability: number, rng: () => number = Math.random): boolean {
  return probability > MATCH_AT || rng() < probability;
}

/** What the agent is like after the laser has measured them: in the slot's state if they slipped through, in its partner if not. */
export function afterScan(slot: SlotState, slipped: boolean): [Complex, Complex] {
  return slotAmplitudes(slipped ? slot : PARTNER[slot]);
}
