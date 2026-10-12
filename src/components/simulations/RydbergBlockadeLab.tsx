import React, { useMemo, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, GameTitle } from '../shared/Arcade';
import { THEMES, panelStyle } from '../shared/arcadeTheme';
import { C6_DEFAULT, blockadeRadius, interaction, pairCurve, pairPiTime, peakRr } from '../../core/hardware/rydberg';
import { InfoBox, LabSlider, LineChart, MathBox, ReadoutGrid } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.orange;
const SPAN_US = 0.5;

export const RydbergBlockadeLab: React.FC = () => {
  const markExplored = useExplored('rydberg_blockade_lab', 'concept_hardware');
  const [distance, setDistance] = useState(3);
  const [freq, setFreq] = useState(4.6); // Omega / 2pi in MHz
  const [showMath, setShowMath] = useState(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    markExplored();
    set(v);
  };

  const omega = 2 * Math.PI * freq;
  const rb = blockadeRadius(omega, C6_DEFAULT);
  const v = interaction(distance, C6_DEFAULT);
  const blockaded = distance < rb;
  const curve = useMemo(() => pairCurve(omega, v, SPAN_US, 160), [omega, v]);
  const peak = peakRr(curve);
  const tPair = pairPiTime(omega);

  // a picture of the two atoms and the blockade ring, to scale for distances up to 10 um
  const scale = 12;
  const cx = 160;
  const ax = cx - (distance * scale) / 2;
  const bx = cx + (distance * scale) / 2;

  useActivityReport({
    id: 'rydberg_blockade_lab',
    status: 'playing',
    step: blockaded ? 'Atoms closer than the blockade radius' : 'Atoms farther apart than the blockade radius',
    state:
      `Atom distance ${distance.toFixed(1)} um, laser Rabi frequency ${freq} MHz, blockade radius ${rb.toFixed(1)} um. ` +
      `The chance of both atoms excited at once peaks at ${pct(peak, 0)} in the window. A blockaded pair would take ${(tPair * 1000).toFixed(0)} ns for a full pair pulse.`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · NEUTRAL ATOMS" tag="Simplified model" />
      <GameTitle
        title="Rydberg Blockade Lab"
        story="Two atoms, one laser. Excited to a Rydberg state, atoms push on each other so hard that a close neighbour cannot be excited at the same time. That blockade is how entangling gates are made."
      />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="DISTANCE BETWEEN THE ATOMS" value={distance} min={1} max={10} step={0.1} accent={THEME.accent}
          display={`${distance.toFixed(1)} µm`} onChange={touch(setDistance)} />
        <LabSlider label="LASER STRENGTH (RABI FREQUENCY)" value={freq} min={1} max={10} step={0.1} accent={THEME.accent}
          display={`${freq.toFixed(1)} MHz`} onChange={touch(setFreq)} />
      </div>

      <div style={panelStyle}>
        <svg viewBox="0 0 320 140" width="100%" role="img"
          aria-label={`Two atoms ${distance.toFixed(1)} micrometres apart. The blockade radius is ${rb.toFixed(1)} micrometres, so the pair is ${blockaded ? 'blockaded' : 'not blockaded'}.`}>
          <circle cx={ax} cy={58} r={Math.min(rb * scale, 54)} fill="rgba(255,159,28,0.14)" stroke="#ff9f1c" strokeWidth="2" strokeDasharray="5 4" />
          <circle cx={ax} cy={58} r="9" fill="#fff" stroke="#ff9f1c" strokeWidth="2.5" />
          <circle cx={bx} cy={58} r="9" fill={blockaded ? '#2a0f5c' : '#fff'} stroke="#ff9f1c" strokeWidth="2.5" />
          <line x1={ax} y1={108} x2={bx} y2={108} stroke="#fff" strokeWidth="1.5" />
          <text x={cx} y={122} fontSize="10" fill="#f1eaff" textAnchor="middle">{distance.toFixed(1)} µm apart</text>
          <text x={cx} y={136} fontSize="9" fill="#ffb347" textAnchor="middle">dashed ring: blockade radius {rb.toFixed(1)} µm</text>
        </svg>
      </div>

      <Banner tone={blockaded ? 'good' : 'info'} title={blockaded ? 'BLOCKADED' : 'NOT BLOCKADED'}>
        {blockaded
          ? 'The second atom sits inside the first one\'s ring, so only one of the two can be excited at a time. The pair acts like one big atom that swings faster.'
          : 'The atoms are far enough apart to be excited together. They behave as two independent atoms.'}
      </Banner>

      <div style={panelStyle}>
        <LineChart
          series={[
            { label: 'both excited', points: curve.map((c) => ({ x: c.t, y: c.rr })), color: '#ffffff' },
            { label: 'exactly one excited', points: curve.map((c) => ({ x: c.t, y: c.plus })), color: THEME.accent, dashed: true },
          ]}
          xLabel="time (µs)" yLabel="chance" xMax={SPAN_US} yMax={1}
          markers={blockaded ? [{ x: tPair, label: 'pair π pulse' }] : []}
          formatY={(y) => pct(y, 0)}
          summary={`The chance of both atoms excited peaks at ${pct(peak, 0)}.`}
        />
      </div>

      <ReadoutGrid items={[
        { label: 'Blockade radius', value: `${rb.toFixed(1)} µm`, note: 'where the push equals the laser strength' },
        { label: 'Push at this distance', value: `${(v / (2 * Math.PI)).toFixed(0)} MHz`, note: `${(v / omega).toFixed(1)}× the laser strength` },
        { label: 'Both excited at most', value: pct(peak, 0), note: blockaded ? 'suppressed by the blockade' : 'the atoms are independent' },
        { label: 'Pair swings in', value: `${(tPair * 1000).toFixed(0)} ns`, note: '√2 faster than one atom' },
      ]} />

      <MathBox open={showMath} onToggle={() => setShowMath((v2) => !v2)}>
        <div>push: V(R) = C6 / R⁶, V/2π = 450 MHz at 2 µm</div>
        <div>radius: R_b = (C6 / Ω)^(1/6) = {rb.toFixed(2)} µm</div>
        <div>blockaded pair: swings between |gg⟩ and (|gr⟩+|rg⟩)/√2 at √2·Ω</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Defaults follow Evered et al., Nature 2023 (Ω/2π = 4.6 MHz, 53S Rydberg state). The curves are an exact solution of the three-level pair.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        The "blockaded or not" label is a sharp cut at the radius, which is a convenient name for something gradual: the push grows smoothly as 1/R⁶, and you can see in the chart that just inside the radius a little double excitation leaks through. Real atoms also have many more levels, laser noise and finite temperature, none of which are here.
      </InfoBox>
    </ArcadeFrame>
  );
};
