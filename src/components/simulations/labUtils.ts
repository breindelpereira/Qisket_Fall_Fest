import { useCallback, useRef } from 'react';
import { useProgress } from '../../hooks/useProgress';

/** Small helpers shared by the labs (components live in labKit.tsx). */

export const pct = (p: number, digits = 0): string => `${(p * 100).toFixed(digits)}%`;
export const deg = (rad: number): number => Math.round((rad * 180) / Math.PI);

/** Rounds tiny float noise to 0 and writes a complex amplitude compactly, e.g. 0.71, 0.71i, 0.50−0.50i. */
export function fmtAmp(c: { re: number; im: number }): string {
  const f = (n: number) => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(2);
  if (Math.abs(c.im) < 0.0005) return f(c.re);
  if (Math.abs(c.re) < 0.0005) return `${f(c.im)}i`;
  return `${f(c.re)}${c.im < 0 ? '−' : '+'}${f(Math.abs(c.im))}i`;
}

/** Marks a lab as explored the first time the learner does something real (fires, samples, builds). Idempotent. */
export function useExplored(simId: string, conceptId: string): () => void {
  const { runSimulation } = useProgress();
  const done = useRef(false);
  return useCallback(() => {
    if (done.current) return;
    done.current = true;
    runSimulation(simId, conceptId);
  }, [runSimulation, simId, conceptId]);
}
