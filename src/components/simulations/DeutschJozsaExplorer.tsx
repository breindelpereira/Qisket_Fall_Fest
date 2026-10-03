import React, { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import {
  MAX_INPUTS, classicalWorstCase, classify, constantOracle, inputDistribution, parityOracle, randomBalanced, runDeutschJozsa,
} from '../../core/labs/deutschJozsa';
import type { Bit } from '../../core/labs/deutschJozsa';
import { BarChart, InfoBox, MathBox } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.mint;
const bitsOf = (x: number, n: number) => x.toString(2).padStart(n, '0');

type Preset = { id: string; label: string; make: (n: number) => Bit[] };
const PRESETS: Preset[] = [
  { id: 'c0', label: 'Always 0', make: (n) => constantOracle(n, 0) },
  { id: 'c1', label: 'Always 1', make: (n) => constantOracle(n, 1) },
  { id: 'p', label: 'Copy first bit', make: (n) => parityOracle(n, 1) },
  { id: 'xor', label: 'XOR of all bits', make: (n) => parityOracle(n, (1 << n) - 1) },
  { id: 'rb', label: 'Random balanced', make: (n) => randomBalanced(n) },
];

export const DeutschJozsaExplorer: React.FC = () => {
  const markExplored = useExplored('deutsch_jozsa_explorer', 'concept_algorithms');
  const [n, setN] = useState(2);
  const [f, setF] = useState<Bit[]>(() => parityOracle(2, 1));
  const [runs, setRuns] = useState<string[]>([]);
  const [showMath, setShowMath] = useState(false);

  const kind = classify(f);
  const stages = useMemo(() => runDeutschJozsa(f, n), [f, n]);
  const dist = useMemo(() => inputDistribution(stages.final, n), [stages, n]);
  const signs = useMemo(() => f.map((_, x) => (stages.afterOracle.amplitudes[x].re >= 0 ? '+' : '−')), [stages, f]);
  const allZero = '0'.repeat(n);

  const pickN = (k: number) => { setN(k); setF(parityOracle(k, 1)); setRuns([]); };
  const setPreset = (p: Preset) => { setF(p.make(n)); setRuns([]); };
  const toggle = (x: number) => { setF((old) => old.map((v, i) => (i === x ? ((1 - v) as Bit) : v))); setRuns([]); };

  const runOnce = () => {
    markExplored();
    let r = Math.random();
    let hit = dist.length - 1;
    for (let i = 0; i < dist.length; i++) {
      if (r < dist[i]) { hit = i; break; }
      r -= dist[i];
    }
    setRuns((old) => [bitsOf(hit, n), ...old].slice(0, 12));
  };

  const last = runs[0];
  const verdict = last === undefined ? null : last === allZero ? 'constant' : 'balanced';

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · ALGORITHMS" tag="Accurate" />
      <GameTitle
        title="Deutsch–Jozsa Explorer"
        story="A black-box function is either constant (same answer for every input) or balanced (0 for half, 1 for half). One quantum question tells you which."
      />

      <div>
        <Eyebrow>INPUT BITS</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {Array.from({ length: MAX_INPUTS }, (_, i) => i + 1).map((k) => (
            <button key={k} className="chip" aria-pressed={n === k} onClick={() => pickN(k)} style={groupChip}>{k} bit{k > 1 ? 's' : ''} ({1 << k} inputs)</button>
          ))}
        </div>
      </div>

      <div>
        <Eyebrow>PICK A FUNCTION</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button key={p.id} className="chip" onClick={() => setPreset(p)} style={{ ...groupChip, flex: '1 1 28%' }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>TRUTH TABLE: TAP A CELL TO FLIP f(x)</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(1 << n, 4)}, 1fr)`, gap: 6, marginTop: 8 }}>
          {f.map((v, x) => (
            <button key={x} onClick={() => toggle(x)} aria-label={`f of ${bitsOf(x, n)} equals ${v}. Tap to flip.`}
              style={{
                minHeight: 56, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: v ? THEME.accent : 'rgba(255,255,255,0.08)', color: v ? '#2a0f5c' : '#fff',
                border: `2px ${v ? 'solid' : 'dashed'} ${v ? THEME.edge : 'rgba(255,255,255,0.3)'}`,
              }}>
              <span style={{ fontFamily: RETRO, fontSize: '1rem', opacity: 0.85 }}>f({bitsOf(x, n)})</span>
              <span style={{ fontFamily: RETRO, fontSize: '1.7rem', lineHeight: 1 }}>{v}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: '0.86rem', fontWeight: 700, color: kind === 'neither' ? '#ffd23f' : '#f1eaff' }}>
          This function is {kind === 'neither' ? 'neither constant nor balanced (the promise is broken)' : kind}.
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>THE QUANTUM QUESTION: ONE QUERY</Eyebrow>
        <div style={{ fontFamily: RETRO, fontSize: '1.15rem', lineHeight: 1.45, color: '#f1eaff' }}>
          inputs |{allZero}⟩ → H on all → ask f once → H on inputs → read
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>After the oracle, each input carries a sign (−1)^f(x):</span>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            {signs.map((sg, x) => (
              <span key={x} style={{
                fontFamily: RETRO, fontSize: '1.1rem', padding: '2px 8px', borderRadius: 8,
                border: `2px ${sg === '+' ? 'solid' : 'dashed'} ${sg === '+' ? '#2ee6a6' : '#ff5c8a'}`,
                background: sg === '+' ? 'rgba(46,230,166,0.15)' : 'rgba(255,92,138,0.15)',
              }}>{bitsOf(x, n)} {sg}</span>
            ))}
          </div>
        </div>
        <Eyebrow>WHAT THE READOUT WILL SHOW</Eyebrow>
        <BarChart theme={THEME} showObserved={false}
          bars={dist.map((p, x) => ({ label: bitsOf(x, n), expected: p }))} />
        <button className="btn btn-mint" onClick={runOnce}><Play size={18} fill="currentColor" /> <span>Run the circuit once</span></button>
        {runs.length > 0 && (
          <div style={{ fontFamily: RETRO, fontSize: '1.3rem' }}>
            readout: {runs.join('  ')}
          </div>
        )}
      </div>

      {verdict && kind !== 'neither' && (
        <Banner tone="good" title={verdict === 'constant' ? 'ALL ZEROS: CONSTANT' : 'NOT ALL ZEROS: BALANCED'}>
          One query, and the answer is certain.
          {` A classical detective could need ${classicalWorstCase(n)} queries to be sure of the same thing.`}
        </Banner>
      )}
      {verdict && kind === 'neither' && (
        <Banner tone="warn" title="PROMISE BROKEN">
          This function is neither constant nor balanced, so the algorithm makes no promise. It reads all zeros with probability {pct(stages.probAllZero, 1)}, so the readout is not reliable. Make the table all 0s, all 1s, or half and half.
        </Banner>
      )}

      <div style={panelStyle}>
        <Eyebrow>QUERIES TO BE SURE</Eyebrow>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '8px 10px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Classical, worst case</div>
            <div style={{ fontFamily: RETRO, fontSize: '1.8rem' }}>{classicalWorstCase(n)}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(46,230,166,0.12)', borderRadius: 12, padding: '8px 10px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Quantum</div>
            <div style={{ fontFamily: RETRO, fontSize: '1.8rem' }}>1</div>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          Classically you must see more than half the inputs (2^(n−1) + 1) to rule out a lucky run of equal answers. The gap grows exponentially with n, though it is only a speed-up against a classical algorithm that must be certain.
        </p>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>amplitude of |x⟩ after the oracle: (−1)^f(x) / √N</div>
        <div>P(read all zeros) = ( Σₓ (−1)^f(x) / N )² = {pct(stages.probAllZero, 1)}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          The ancilla in |−⟩ turns "flip the ancilla when f = 1" into a sign on each input (phase kickback). The last layer of H gates makes those signs interfere: all equal signs land on |0…0⟩, half-and-half signs cancel it exactly.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        Exact simulation with n input qubits plus one ancilla. The oracle is handed to us as a truth table; real speed-ups need an oracle that is cheap to build as a circuit, and Deutsch–Jozsa itself has no practical use. It shows interference beating classical certainty.
      </InfoBox>
    </ArcadeFrame>
  );
};
