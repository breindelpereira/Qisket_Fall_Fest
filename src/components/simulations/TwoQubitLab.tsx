import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { QuantumStateVector } from '../../core/circuit';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { applyPlaced, basisLabel } from '../../core/labs/circuitBuilder';
import type { GateName } from '../../core/labs/circuitBuilder';
import { agreement, concurrence, describeEntanglement, reducedQubit } from '../../core/labs/twoQubit';
import { BarChart, InfoBox, MathBox } from './labKit';
import { fmtAmp, pct, useExplored } from './labUtils';

const THEME = THEMES.pink;
const GATES: GateName[] = ['H', 'X', 'Z', 'S', 'T'];
const NAMES = ['Alice', 'Bob'] as const;

type Step = { text: string };

export const TwoQubitLab: React.FC = () => {
  const markExplored = useExplored('two_qubit_lab', 'concept_entanglement');
  const [state, setState] = useState(() => new QuantumStateVector(2));
  const [steps, setSteps] = useState<Step[]>([]);
  const [pairs, setPairs] = useState<string[] | null>(null);
  const [showMath, setShowMath] = useState(false);

  const c = useMemo(() => concurrence(state), [state]);
  const alice = useMemo(() => reducedQubit(state, 0), [state]);
  const bob = useMemo(() => reducedQubit(state, 1), [state]);
  const probs = state.getProbabilities();
  const bellMade = c > 0.98 && agreement(state) > 0.98;

  const apply = (text: string, fn: (s: QuantumStateVector) => void) => {
    const next = state.clone();
    fn(next);
    setState(next);
    setSteps((s) => [...s, { text }]);
    setPairs(null);
    markExplored();
  };

  const gate = (g: GateName, q: 0 | 1) => apply(`${g} on ${NAMES[q]}`, (s) => applyPlaced(s, { kind: 'gate', gate: g, qubit: q }));
  const cnot = (from: 0 | 1) => apply(`CNOT ${NAMES[from]}→${NAMES[1 - from]}`, (s) => s.applyCNOT(from, 1 - from));

  const measure = (q: 0 | 1) => {
    const next = state.clone();
    const out = next.measureQubit(q);
    setState(next);
    setSteps((s) => [...s, { text: `measure ${NAMES[q]} → ${out}` }]);
    setPairs(null);
    markExplored();
  };

  const reset = () => { setState(new QuantumStateVector(2)); setSteps([]); setPairs(null); };

  const measureTwenty = () => {
    markExplored();
    const out: string[] = [];
    for (let i = 0; i < 20; i++) {
      const copy = state.clone();
      const a = copy.measureQubit(0);
      const b = copy.measureQubit(1);
      out.push(`${a}${b}`);
    }
    setPairs(out);
  };

  const agreed = pairs ? pairs.filter((p) => p[0] === p[1]).length : 0;
  const qubitRow = (q: 0 | 1) => (
    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Eyebrow color={THEME.accent}>{NAMES[q].toUpperCase()}'S QUBIT (q{q})</Eyebrow>
      <div style={{ display: 'flex', gap: 6 }}>
        {GATES.map((g) => (
          <button key={g} className="chip" aria-label={`${g} gate on ${NAMES[q]}`} onClick={() => gate(g, q)}
            style={{ ...groupChip, minWidth: 44, fontFamily: RETRO, fontSize: '1.3rem' }}>{g}</button>
        ))}
      </div>
      <button className="chip" onClick={() => measure(q)} style={groupChip}>Measure {NAMES[q]}</button>
    </div>
  );

  const alone = (label: string, r: typeof alice) => (
    <div style={{ flex: 1, ...panelStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Eyebrow>{label} ALONE</Eyebrow>
      <span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: r.length < 0.02 ? '#ff5c8a' : '#2ee6a6' }}>
        {r.length < 0.02 ? 'no state' : r.length > 0.98 ? 'definite' : 'blurry'}
      </span>
      <span style={{ fontFamily: RETRO, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
        Bloch length {r.length.toFixed(2)}
      </span>
      <span style={{ fontFamily: RETRO, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>P(0) {pct(r.p0)} · P(1) {pct(r.p1)}</span>
    </div>
  );

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · ENTANGLEMENT" tag="Accurate" />
      <GameTitle
        title="Two-Qubit Lab"
        story="Give Alice and Bob a qubit each, apply gates, and watch the pair. When the pair has a state but neither qubit does, that is entanglement."
      />

      <Banner tone="info" title="GOAL">
        Make a Bell pair: both qubits start at 0. Put <b>H</b> on Alice, then use <b>CNOT</b> with Alice as the control.
      </Banner>

      {qubitRow(0)}
      {qubitRow(1)}
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-pink" style={{ flex: 1, flexDirection: 'column', gap: 4 }} aria-label="CNOT, Alice controls Bob" onClick={() => cnot(0)}>
          <span>CNOT</span><span style={{ fontFamily: 'var(--font-family)', fontSize: '0.78rem', fontWeight: 700 }}>Alice → Bob</span>
        </button>
        <button className="btn btn-violet" style={{ flex: 1, flexDirection: 'column', gap: 4 }} aria-label="CNOT, Bob controls Alice" onClick={() => cnot(1)}>
          <span>CNOT</span><span style={{ fontFamily: 'var(--font-family)', fontSize: '0.78rem', fontWeight: 700 }}>Bob → Alice</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="chip" onClick={reset}><RotateCcw size={16} /> Reset to 00</button>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, overflowWrap: 'anywhere' }}>
          {steps.length === 0 ? 'No steps yet.' : steps.map((s) => s.text).join('  ›  ')}
        </span>
      </div>

      <div style={panelStyle}>
        <Eyebrow>ENTANGLEMENT METER (CONCURRENCE)</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div style={{ flex: 1, position: 'relative', height: 22, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${c * 100}%`, height: '100%', background: THEME.accent, transition: 'width .25s' }} />
          </div>
          <span style={{ fontFamily: RETRO, fontSize: '1.4rem', minWidth: 44, textAlign: 'right' }}>{c.toFixed(2)}</span>
        </div>
        <p style={{ fontSize: '0.86rem', lineHeight: 1.45, marginTop: 8, color: '#f1eaff' }}>{describeEntanglement(c)}</p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {alone('ALICE', alice)}
        {alone('BOB', bob)}
      </div>

      <div style={panelStyle}>
        <Eyebrow>THE PAIR TOGETHER: CHANCE OF EACH ANSWER</Eyebrow>
        <div style={{ marginTop: 10 }}>
          <BarChart theme={THEME} showObserved={false}
            bars={probs.map((p, i) => ({ label: i.toString(2).padStart(2, '0'), expected: p }))} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>Left digit is Bob (q1), right digit is Alice (q0).</div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>DO THEY AGREE? MEASURE THE PAIR 20 TIMES</Eyebrow>
        <button className="btn btn-sky" onClick={measureTwenty}><span>Measure the pair 20 times</span></button>
        {pairs && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {pairs.map((p, i) => (
                <span key={i} style={{
                  fontFamily: RETRO, fontSize: '1.1rem', padding: '2px 6px', borderRadius: 6,
                  background: p[0] === p[1] ? 'rgba(46,230,166,0.2)' : 'rgba(255,92,138,0.2)',
                  border: `2px ${p[0] === p[1] ? 'solid' : 'dashed'} ${p[0] === p[1] ? '#2ee6a6' : '#ff5c8a'}`,
                }}>{p[0] === p[1] ? '=' : '≠'} {p}</span>
              ))}
            </div>
            <div style={{ fontFamily: RETRO, fontSize: '1.3rem' }}>agreed {agreed} / 20</div>
          </>
        )}
      </div>

      {bellMade && (
        <Banner tone="good" title="BELL PAIR!">
          The pair always agrees, yet each qubit on its own is a pure coin flip with nothing to describe. Measure either one and the other is instantly decided: that correlation is what no shared script can imitate (see the Bell &amp; CHSH Explorer).
        </Banner>
      )}

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        {state.amplitudes.map((a, i) => (Math.abs(a.re) + Math.abs(a.im) > 0.0005 ? <div key={i}>amp {basisLabel(i, 2)} = {fmtAmp(a)}</div> : null))}
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Concurrence C = 2|a₀₀·a₁₁ − a₀₁·a₁₀|. It is 0 when the state factorises into one state per qubit. Each qubit alone has Bloch length √(1 − C²).
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        The meter measures entanglement for a pure two-qubit state. Measuring a qubit collapses the pair, so after a measurement the state is no longer entangled. Reset to try again.
      </InfoBox>
    </ArcadeFrame>
  );
};
