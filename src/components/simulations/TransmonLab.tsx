import React, { useMemo, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { decayTime, idealP1, peakP1, piPulseTime, rabiCurve } from '../../core/hardware/transmon';
import { InfoBox, LabSlider, LineChart, MathBox, ReadoutGrid } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.violet;

export const TransmonLab: React.FC = () => {
  const markExplored = useExplored('transmon_lab', 'concept_hardware');
  const [freq, setFreq] = useState(5); // Rabi frequency in MHz
  const [noisy, setNoisy] = useState(true);
  const [t1, setT1] = useState(20);
  const [t2Wanted, setT2Wanted] = useState(20);
  const [span, setSpan] = useState(2);
  const [showMath, setShowMath] = useState(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    markExplored();
    set(v);
  };

  const omega = 2 * Math.PI * freq; // rad/us
  const t2 = Math.min(t2Wanted, 2 * t1);
  const curve = useMemo(() => rabiCurve(noisy ? { omega, t1, t2 } : { omega, t1: Infinity, t2: Infinity }, span, 160), [omega, noisy, t1, t2, span]);
  const ideal = useMemo(() => curve.map((c) => ({ x: c.t, y: idealP1(omega, c.t) })), [curve, omega]);
  const tPi = piPulseTime(omega);
  const best = peakP1(curve);
  const decay = decayTime(t1, t2);

  useActivityReport({
    id: 'transmon_lab',
    status: 'playing',
    step: noisy ? 'Driving a noisy qubit' : 'Driving a perfect qubit',
    state:
      `Drive ${freq} MHz, so a pi pulse takes ${(tPi * 1000).toFixed(0)} ns. ${noisy ? `T1 ${t1} us, T2 ${Math.round(t2)} us. The oscillation fades with a time constant of ${decay.toFixed(1)} us.` : 'Noise is switched off.'} ` +
      `The best chance of finding the qubit in 1 within ${span} us is ${pct(best, 0)}.`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · SUPERCONDUCTING QUBIT" tag="Simplified model" />
      <GameTitle
        title="Transmon Lab"
        story="A microwave pulse tilts the qubit between 0 and 1 and back. The chance of finding it in 1 swings up and down (a Rabi oscillation), until the qubit's short memory washes it out."
      />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="DRIVE STRENGTH (RABI FREQUENCY)" value={freq} min={1} max={25} step={0.5} accent={THEME.accent}
          display={`${freq} MHz`} onChange={touch(setFreq)} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="chip" aria-pressed={noisy} onClick={() => { markExplored(); setNoisy(true); }} style={groupChip}>Noise on</button>
          <button className="chip" aria-pressed={!noisy} onClick={() => { markExplored(); setNoisy(false); }} style={groupChip}>Noise off</button>
        </div>
        {noisy && (
          <>
            <LabSlider label="T1: ENERGY RELAXATION" value={t1} min={1} max={100} step={1} accent={THEME.accent}
              display={`${t1} µs`} onChange={touch(setT1)} />
            <LabSlider label="T2: PHASE MEMORY (MAX 2 × T1)" value={t2Wanted} min={1} max={200} step={1} accent={THEME.accent}
              display={`${Math.round(t2)} µs`} onChange={touch(setT2Wanted)} />
          </>
        )}
        <div>
          <Eyebrow>TIME SPAN</Eyebrow>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {[0.5, 2, 10].map((w) => (
              <button key={w} className="chip" aria-pressed={span === w} onClick={() => { markExplored(); setSpan(w); }} style={groupChip}>{w} µs</button>
            ))}
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <LineChart
          series={[
            { label: noisy ? 'with noise' : 'no noise', points: curve.map((c) => ({ x: c.t, y: c.p1 })), color: THEME.accent },
            ...(noisy ? [{ label: 'ideal (no noise)', points: ideal, color: '#ffffff', dashed: true }] : []),
          ]}
          xLabel="time (µs)" yLabel="chance of 1" xMax={span} yMax={1}
          markers={tPi <= span ? [{ x: tPi, label: 'π pulse' }] : []}
          formatY={(y) => pct(y, 0)}
          summary={`The best chance of 1 is ${pct(best, 0)}. A π pulse takes ${(tPi * 1000).toFixed(0)} nanoseconds.`}
        />
      </div>

      <ReadoutGrid items={[
        { label: 'π pulse (a full flip)', value: `${(tPi * 1000).toFixed(0)} ns`, note: 'time of one half-turn' },
        { label: 'Best flip chance in span', value: pct(best, 0) },
        ...(noisy ? [{ label: 'Oscillation fades in', value: `${decay.toFixed(1)} µs`, note: '2 ÷ (1/T1 + 1/T2)' }] : []),
        { label: 'Flips before it fades', value: noisy ? (decay / (2 * tPi)).toFixed(1) : '∞', note: 'about, in pi pulses' },
      ]} />

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>no noise: P(1) = sin²(Ω t / 2)</div>
        <div>Ω = 2π × {freq} MHz = {omega.toFixed(1)} rad/µs</div>
        <div>π pulse: t = π / Ω = {(tPi * 1000).toFixed(0)} ns</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          With noise the curve solves the Bloch equations (T1 pulls the qubit to 0, T2 shrinks the sideways part), so the peaks sink towards 50%.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        This treats the transmon as a two-level qubit. A real transmon is a many-level circuit, and a hard or fast pulse can push it into a third level (leakage), which this lab does not show. The T1, T2 and drive values are illustrative.
      </InfoBox>
    </ArcadeFrame>
  );
};
