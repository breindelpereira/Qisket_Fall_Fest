import React, { useMemo, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import {
  PRESET_QUBITS, addCounts, buildState, histogramRows, maxDeviation, shotsForPrecision, standardError, totalShots,
} from '../../core/labs/shots';
import type { ShotsPreset } from '../../core/labs/shots';
import { BarChart, InfoBox, LabSlider, MathBox } from './labKit';
import { deg, pct, useExplored } from './labUtils';

const THEME = THEMES.mint;

const PRESETS: { id: ShotsPreset; label: string; blurb: string }[] = [
  { id: 'tilted', label: '1 qubit, tilted', blurb: 'One qubit rotated by an angle you choose.' },
  { id: 'bell', label: 'Bell pair', blurb: 'Two entangled qubits: only 00 and 11 ever appear.' },
  { id: 'uniform3', label: '3 qubits, all H', blurb: 'Eight outcomes, each with the same chance.' },
];

const SHOT_CHOICES = [10, 100, 1000, 10000];

export const ShotsHistogramLab: React.FC = () => {
  const markExplored = useExplored('shots_histogram_lab', 'concept_measurement');
  const [preset, setPreset] = useState<ShotsPreset>('tilted');
  const [theta, setTheta] = useState(Math.PI / 2);
  const [shots, setShots] = useState(100);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showMath, setShowMath] = useState(false);

  const state = useMemo(() => buildState(preset, theta), [preset, theta]);
  const rows = useMemo(() => histogramRows(state, counts), [state, counts]);
  const n = totalShots(counts);
  const worst = rows.reduce((a, b) => (Math.abs(b.observed - b.expected) > Math.abs(a.observed - a.expected) ? b : a), rows[0]);

  const reset = () => setCounts({});
  const changePreset = (p: ShotsPreset) => { setPreset(p); reset(); };

  const run = () => {
    markExplored();
    setCounts((c) => addCounts(c, state.sampleCounts(shots)));
  };

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · MEASUREMENT" tag="Accurate" />
      <GameTitle
        title="Shots + Histogram Lab"
        story="A measurement gives one answer. To see the odds you have to repeat it many times, like a pollster. Run shots and watch the histogram settle onto the prediction."
      />

      <div>
        <Eyebrow>CHOOSE A STATE</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button key={p.id} className="chip" aria-pressed={preset === p.id} onClick={() => changePreset(p.id)}
              style={groupChip}>{p.label}</button>
          ))}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 6 }}>{PRESETS.find((p) => p.id === preset)!.blurb}</p>
      </div>

      {preset === 'tilted' && (
        <LabSlider label="TILT θ" accent={THEME.accent} value={deg(theta)} min={0} max={180} step={5}
          display={`${deg(theta)}° → P(1) = ${pct(Math.sin(theta / 2) ** 2)}`}
          onChange={(v) => { setTheta((v * Math.PI) / 180); reset(); }} />
      )}

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>SHOTS PER RUN</Eyebrow>
        <div style={{ display: 'flex', gap: 6 }}>
          {SHOT_CHOICES.map((c) => (
            <button key={c} className="chip" aria-pressed={shots === c} onClick={() => setShots(c)}
              style={groupChip}>{c.toLocaleString()}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-mint" style={{ flex: 1 }} onClick={run}>
            <Play size={18} fill="currentColor" /> <span>Run {shots.toLocaleString()}</span>
          </button>
          <button className="chip" aria-label="Clear all shots" onClick={reset} style={{ minWidth: 44, justifyContent: 'center' }}><RotateCcw size={16} /></button>
        </div>
        <div style={{ fontFamily: RETRO, fontSize: '1.3rem' }}>total shots: {n.toLocaleString()}</div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>OUTCOMES: MEASURED BARS, DASHED LINE = PREDICTION</Eyebrow>
        <div style={{ marginTop: 10 }}>
          <BarChart theme={THEME} bars={rows.map((r) => ({
            label: r.outcome,
            expected: r.expected,
            observed: n ? r.observed : undefined,
            note: n ? `${r.count.toLocaleString()} shots` : undefined,
          }))} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          {PRESET_QUBITS[preset] > 1 ? 'Bitstrings read left to right as qubit ' + (PRESET_QUBITS[preset] - 1) + ' … qubit 0.' : 'Each bar is the share of shots that gave that answer.'}
        </div>
      </div>

      {n === 0 ? (
        <Banner tone="info">Press Run. Even a perfect 50/50 state will not give exactly half and half.</Banner>
      ) : (
        <Banner tone={maxDeviation(rows) <= 2 * standardError(0.5, n) ? 'good' : 'warn'} title={`OFF BY ${pct(maxDeviation(rows), 1)} AT WORST`}>
          Largest gap: outcome <b>{worst.outcome}</b> was seen {pct(worst.observed, 1)} of the time, the maths says {pct(worst.expected, 1)}.
          With {n.toLocaleString()} shots a wobble of about <b>±{pct(standardError(0.5, n), 1)}</b> is normal. Ten times the shots shrinks it only about threefold.
          {n < 1000 && ` To pin a 50/50 outcome down to ±1% you would need around ${shotsForPrecision(0.01).toLocaleString()} shots.`}
        </Banner>
      )}

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>exact: {rows.map((r) => `P(${r.outcome}) = ${r.expected.toFixed(3)}`).join(' · ')}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Each shot is one draw from these probabilities (the Born rule). The standard error of a frequency is √(p(1−p)/N), so it falls like 1/√N.
        </div>
      </MathBox>

      <InfoBox title="WHY SHOTS?">
        A real quantum computer returns one bitstring per run, so every result you see on hardware is a histogram like this one. This lab samples the exact probabilities, so it is accurate but has no hardware noise.
      </InfoBox>
    </ArcadeFrame>
  );
};
