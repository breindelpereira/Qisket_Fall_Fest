import React, { useState } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import {
  MAX_QUBITS, classicalExpectedGuesses, optimalIterations, runGrover, successProbability, theoreticalProbability,
} from '../../core/labs/grover';
import { BarChart, InfoBox, MathBox } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.orange;
const bitsOf = (x: number, n: number) => x.toString(2).padStart(n, '0');

export const GroverExplorer: React.FC = () => {
  const markExplored = useExplored('grover_explorer', 'concept_algorithms');
  const [n, setN] = useState(3);
  const [marked, setMarked] = useState<number[]>([5]);
  const [k, setK] = useState(0);
  const [showMath, setShowMath] = useState(false);

  const N = 1 << n;
  const state = runGrover(n, marked, k);
  const p = successProbability(state, marked);
  const markedCount = marked.length;
  const best = optimalIterations(n, markedCount);
  const amps = state.amplitudes;
  const mean = amps.reduce((s, a) => s + a.re, 0) / N;
  const overshoot = k > best && p < theoreticalProbability(n, marked.length, best) - 0.02;

  const curve = Array.from({ length: Math.max(8, best * 2 + 3) }, (_, i) => theoreticalProbability(n, markedCount, i));

  const pickN = (q: number) => { setN(q); setMarked([Math.min(5, (1 << q) - 1)]); setK(0); };
  const toggleMark = (x: number) => {
    setMarked((old) => {
      if (old.includes(x)) return old.length > 1 ? old.filter((m) => m !== x) : old;
      return old.length < N / 2 ? [...old, x].sort((a, b) => a - b) : old;
    });
    setK(0);
  };
  const step = () => { markExplored(); setK((v) => v + 1); };

  // amplitude bars: signed, so the sign flips of the oracle are visible
  const AW = 320;
  const AH = 150;
  const mid = AH / 2;
  const maxAmp = 1;
  const bw = (AW - 20) / N;
  const ay = (v: number) => mid - (v / maxAmp) * (mid - 14);

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · ALGORITHMS" tag="Accurate" />
      <GameTitle
        title="Grover Explorer"
        story="Find the marked item in an unsorted list. Each Grover round flips the marked amplitude, then reflects everything about the average, nudging the answer up."
      />

      <div>
        <Eyebrow>LIST SIZE</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {Array.from({ length: MAX_QUBITS - 1 }, (_, i) => i + 2).map((q) => (
            <button key={q} className="chip" aria-pressed={n === q} onClick={() => pickN(q)} style={groupChip}>{1 << q} items ({q} qubits)</button>
          ))}
        </div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>TAP THE ITEM(S) TO HIDE THE PRIZE UNDER</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(N, 4)}, 1fr)`, gap: 6, marginTop: 8 }}>
          {Array.from({ length: N }, (_, x) => {
            const isMarked = marked.includes(x);
            return (
              <button key={x} onClick={() => toggleMark(x)} aria-pressed={isMarked} aria-label={`Item ${bitsOf(x, n)}${isMarked ? ', marked' : ''}`}
                style={{
                  minHeight: 48, borderRadius: 12, fontFamily: RETRO, fontSize: '1.3rem',
                  background: isMarked ? THEME.accent : 'rgba(255,255,255,0.08)', color: isMarked ? '#2a0f5c' : '#fff',
                  border: `2px ${isMarked ? 'solid' : 'dashed'} ${isMarked ? THEME.edge : 'rgba(255,255,255,0.3)'}`,
                }}>
                {isMarked ? '★ ' : ''}{bitsOf(x, n)}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>Up to half the list can be marked.</div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>AMPLITUDES (BARS UP = POSITIVE, DOWN = NEGATIVE)</Eyebrow>
        <svg viewBox={`0 0 ${AW} ${AH + 18}`} width="100%" role="img" style={{ marginTop: 6 }}
          aria-label={`Amplitudes after ${k} Grover rounds. Chance of the marked item: ${pct(p, 1)}`}>
          <line x1="10" y1={mid} x2={AW - 10} y2={mid} stroke="rgba(255,255,255,0.3)" />
          <line x1="10" y1={ay(mean)} x2={AW - 10} y2={ay(mean)} stroke="#38c8ff" strokeWidth="2" strokeDasharray="6 4" />
          <text x={AW - 12} y={ay(mean) - 4} fill="#38c8ff" fontSize="9" fontWeight="700" textAnchor="end">average</text>
          {amps.map((a, x) => {
            const isMarked = marked.includes(x);
            const y = ay(a.re);
            return (
              <g key={x}>
                <rect x={10 + x * bw + bw * 0.12} y={Math.min(y, mid)} width={bw * 0.76} height={Math.max(1, Math.abs(y - mid))}
                  fill={isMarked ? THEME.accent : '#8b5cf6'} stroke={isMarked ? '#fff' : 'none'} strokeWidth="1.5" rx="2" />
                {N <= 8 && <text x={10 + x * bw + bw / 2} y={AH + 12} fill="#ddd0fa" fontSize="9" textAnchor="middle">{bitsOf(x, n)}</text>}
              </g>
            );
          })}
        </svg>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gold bars with a white outline are the marked items. The dashed line is the average amplitude.</div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Eyebrow>ROUNDS DONE</Eyebrow>
          <span style={{ fontFamily: RETRO, fontSize: '1.6rem' }}>{k}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-orange" style={{ flex: 1 }} onClick={step}><Zap size={18} fill="currentColor" /> <span>Grover round</span></button>
          <button className="chip" aria-label="Back to the start" onClick={() => setK(0)} style={{ minWidth: 44, justifyContent: 'center' }}><RotateCcw size={16} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 22, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${p * 100}%`, height: '100%', background: p > 0.9 ? '#2ee6a6' : THEME.accent, transition: 'width .25s' }} />
          </div>
          <span style={{ fontFamily: RETRO, fontSize: '1.5rem', minWidth: 64, textAlign: 'right' }}>{pct(p, 1)}</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chance a measurement finds a marked item. The best number of rounds here is {best}.</div>
      </div>

      {overshoot && (
        <Banner tone="warn" title="TOO MANY ROUNDS">
          Grover is a rotation. Past the best round it keeps turning and carries the answer away again. Go back and stop at {best}.
        </Banner>
      )}
      {k === best && p > 0.9 && (
        <Banner tone="good" title="BEST ROUND">
          {pct(p, 1)} to find a marked item after {k} quantum round{k === 1 ? '' : 's'}. A classical search needs about {classicalExpectedGuesses(n, marked.length).toFixed(1)} guesses on average.
        </Banner>
      )}

      <div style={panelStyle}>
        <Eyebrow>SUCCESS CHANCE VS ROUNDS</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 90, marginTop: 8 }} aria-hidden="true">
          {curve.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ height: `${Math.max(2, v * 100)}%`, background: i === k ? '#fff' : i === best ? '#2ee6a6' : '#8b5cf6', borderRadius: 3, outline: i === k ? '2px solid #ffd23f' : 'none' }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
          Round 0 on the left. Green = best round, white = where you are. It rises, peaks, then falls: the chance is sin²((2k+1)θ).
        </div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>HOW THE ODDS COMPARE</Eyebrow>
        <BarChart theme={THEME} showObserved={false} bars={[
          { label: 'RAND', expected: marked.length / N },
          { label: 'GROV', expected: theoreticalProbability(n, marked.length, best) },
        ]} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          RAND: one random guess. GROV: one measurement after {best} quantum round{best === 1 ? '' : 's'}. The quantum search needs about √N rounds, a classical one about N/2 guesses.
        </div>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>start: every amplitude = 1/√N = {(1 / Math.sqrt(N)).toFixed(3)}</div>
        <div>round: marked amplitude × (−1), then every a → 2·mean − a</div>
        <div>now: marked = {amps[marked[0]].re.toFixed(3)}, others ≈ {amps[marked.includes(0) ? 1 : 0].re.toFixed(3)}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          With M of N items marked, sin θ = √(M/N) and each round turns the state by 2θ, so about (π/4)√(N/M) rounds are best.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        Exact simulation. Grover gives a square-root speed-up, not an exponential one, and it needs a way to check an answer inside a quantum circuit. For a handful of items classical search is just as good; the gap only matters for huge lists.
      </InfoBox>
    </ArcadeFrame>
  );
};
