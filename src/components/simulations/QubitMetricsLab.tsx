import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { budget, clampT2, cleanChance, maxT2 } from '../../core/hardware/metrics';
import { InfoBox, LabSlider, MathBox, ReadoutGrid } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.yellow;
const fmt = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : 'no limit');

interface Preset {
  id: string;
  label: string;
  t1: number;
  t2: number;
  gate: number;
  error: number;
  note: string;
}

/** Illustrative settings, not measurements. The Willow-like one uses two figures from Google's spec sheet (T1 and the two-qubit error); the gate time is a round number of ours. */
const PRESETS: Preset[] = [
  { id: 'fast', label: 'Fast, noisy', t1: 30, t2: 40, gate: 25, error: 0.01, note: 'Quick gates, but an error every hundred gates.' },
  { id: 'slow', label: 'Slow, clean', t1: 5000, t2: 5000, gate: 5000, error: 0.001, note: 'Long-lived qubits and slow gates, as in trapped ions (illustrative numbers).' },
  { id: 'willow', label: 'Willow-like', t1: 68, t2: 68, gate: 50, error: 0.0033, note: 'T1 68 µs and error 0.33% are from Google\'s Willow spec sheet (Dec 2024). T2 and the 50 ns gate time are our round numbers.' },
];

export const QubitMetricsLab: React.FC = () => {
  const markExplored = useExplored('qubit_metrics_lab', 'concept_hardware');
  const [t1, setT1] = useState(100);
  const [t2Wanted, setT2Wanted] = useState(100);
  const [gate, setGate] = useState(50);
  const [errExp, setErrExp] = useState(-3);
  const [preset, setPreset] = useState<string | null>(null);
  const [showMath, setShowMath] = useState(false);

  const t2 = clampT2(t2Wanted, t1);
  const error = Math.pow(10, errExp);
  const b = budget(t2, gate, error);
  const clamped = t2Wanted > maxT2(t1);

  const touch = () => {
    markExplored();
    setPreset(null);
  };
  const apply = (p: Preset) => {
    markExplored();
    setPreset(p.id);
    setT1(p.t1);
    setT2Wanted(p.t2);
    setGate(p.gate);
    setErrExp(Math.log10(p.error));
  };

  const longest = Math.max(b.byTime, Number.isFinite(b.byError) ? b.byError : b.byTime, 1);
  const width = (n: number) => `${Math.max(2, (Math.log10(Math.max(1, n)) / Math.log10(longest * 1.2)) * 100)}%`;

  useActivityReport({
    id: 'qubit_metrics_lab',
    status: 'playing',
    step: 'Setting the four numbers',
    state:
      `T1 ${t1} us, T2 ${Math.round(t2)} us${clamped ? ' (pulled down to twice T1)' : ''}, gate time ${gate} ns, error per gate ${(error * 100).toFixed(3)}%. ` +
      `Gates by time: ${fmt(b.byTime)}. Gates by error: ${fmt(b.byError)}. The budget is ${fmt(b.usable)}, set by ${b.limit === 'time' ? 'the coherence time' : 'the error rate'}.`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · QUBIT QUALITY" tag="Simplified model" />
      <GameTitle
        title="Qubit Metrics Lab"
        story="A qubit has a limited lifetime and every gate has a chance to go wrong. How many gates fit before the answer is spoiled? Two limits compete, and the smaller one is your budget."
      />

      <div>
        <Eyebrow>START FROM AN ILLUSTRATIVE MACHINE</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {PRESETS.map((p) => (
            <button key={p.id} className="chip" aria-pressed={preset === p.id} onClick={() => apply(p)} style={groupChip}>{p.label}</button>
          ))}
        </div>
        {preset && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>{PRESETS.find((p) => p.id === preset)?.note}</div>}
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="T1: HOW LONG A 1 LASTS" value={Math.log10(t1)} min={0} max={4} step={0.05} accent={THEME.accent}
          display={`${fmt(t1)} µs`} onChange={(v) => { touch(); setT1(Math.pow(10, v)); }} />
        <LabSlider label="T2: HOW LONG PHASE LASTS" value={Math.log10(t2Wanted)} min={0} max={4} step={0.05} accent={THEME.accent}
          display={`${fmt(t2)} µs`} onChange={(v) => { touch(); setT2Wanted(Math.pow(10, v)); }} />
        <LabSlider label="TIME PER GATE" value={Math.log10(gate)} min={1} max={4} step={0.05} accent={THEME.accent}
          display={gate >= 1000 ? `${(gate / 1000).toFixed(1)} µs` : `${Math.round(gate)} ns`} onChange={(v) => { touch(); setGate(Math.pow(10, v)); }} />
        <LabSlider label="ERROR PER GATE" value={errExp} min={-5} max={-1} step={0.05} accent={THEME.accent}
          display={`${(error * 100).toFixed(error < 0.001 ? 4 : 3)}%`} onChange={(v) => { touch(); setErrExp(v); }} />
      </div>

      {clamped && (
        <Banner tone="info" title="T2 CAPPED">
          T2 can never be more than twice T1, so it is held at {fmt(t2)} µs. Phase cannot outlast the energy of the qubit by more than that.
        </Banner>
      )}

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>HOW MANY GATES FIT (BARS ON A LOG SCALE)</Eyebrow>
        {([
          { label: 'By time', value: b.byTime, text: `T2 ÷ gate time = ${fmt(b.byTime)}` },
          { label: 'By error', value: b.byError, text: `1 ÷ error = ${fmt(b.byError)}` },
        ] as const).map((row) => (
          <div key={row.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>{row.label}{(row.label === 'By time') === (b.limit === 'time') ? ' ◀ the limit' : ''}</span>
              <span>{row.text}</span>
            </div>
            <div style={{ height: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', marginTop: 3 }}>
              <div style={{ width: width(row.value), height: '100%', background: THEME.accent, transition: 'width .2s' }} />
            </div>
          </div>
        ))}
      </div>

      <ReadoutGrid items={[
        { label: 'Usable circuit depth', value: fmt(b.usable), note: b.limit === 'time' ? 'set by how long the qubit lasts' : 'set by how often gates fail' },
        { label: 'A circuit that long runs error-free', value: pct(cleanChance(b.usable, error), 0), note: 'about 37% at the error limit' },
      ]} />

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>by time:  T2 ÷ t_gate = {fmt(t2 * 1000)} ns ÷ {Math.round(gate)} ns = {fmt(b.byTime)}</div>
        <div>by error: 1 ÷ ε = 1 ÷ {error.toPrecision(2)} = {fmt(b.byError)}</div>
        <div>budget = the smaller one = {fmt(b.usable)}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Check with the lesson: T2 = 100 µs and 50 ns gates give 100,000 ns ÷ 50 ns = 2,000 gates.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        These are two rules of thumb, not a measurement. Real gate errors have several causes (decoherence during the gate, control errors, crosstalk), and they are not independent of T1 and T2. The presets are illustrative, except where a figure is marked as coming from a source.
      </InfoBox>
    </ArcadeFrame>
  );
};
