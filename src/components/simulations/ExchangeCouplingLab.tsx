import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { entanglementAfter, exchangeMHz, pulseCurve, sqrtSwapTimeNs, swapChance, swapTimeNs } from '../../core/hardware/exchange';
import { InfoBox, LabSlider, LineChart, MathBox, ReadoutGrid } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.mint;

const fmtNs = (ns: number) => (ns >= 1000 ? `${(ns / 1000).toFixed(2)} µs` : `${ns.toFixed(ns < 10 ? 1 : 0)} ns`);

export const ExchangeCouplingLab: React.FC = () => {
  const markExplored = useExplored('exchange_coupling_lab', 'concept_hardware');
  const [barrier, setBarrier] = useState(3);
  const [fraction, setFraction] = useState(0.5); // pulse length as a fraction of twice the full-swap time
  const [showMath, setShowMath] = useState(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    markExplored();
    set(v);
  };

  const j = exchangeMHz(barrier);
  const full = swapTimeNs(j);
  const half = sqrtSwapTimeNs(j);
  const t = fraction * 2 * full;
  const swap = swapChance(j, t);
  const ent = entanglementAfter(j, t);
  const curve = pulseCurve(j, 2 * full, 120);
  const atSqrt = Math.abs(t - half) < full * 0.03;
  const atFull = Math.abs(t - full) < full * 0.03;

  useActivityReport({
    id: 'exchange_coupling_lab',
    status: 'playing',
    step: 'Setting the barrier and the pulse',
    state:
      `Barrier ${barrier.toFixed(1)}, so the exchange coupling is ${j.toFixed(2)} MHz and a full swap takes ${fmtNs(full)}. ` +
      `The pulse is ${fmtNs(t)} long: swap chance ${pct(swap, 0)}, entanglement ${pct(ent, 0)}.`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · SILICON SPINS" tag="Simplified model" />
      <GameTitle
        title="Exchange-Coupling Lab"
        story="Two electron spins sit in neighbouring dots. Lower the wall between them and they swap, raise it and they stay put. A pulse of exactly the right length makes an entangling gate."
      />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="BARRIER BETWEEN THE DOTS (HIGHER = SMALLER COUPLING)" value={barrier} min={0} max={8} step={0.1} accent={THEME.accent}
          display={barrier.toFixed(1)} onChange={touch(setBarrier)} />
        <LabSlider label="PULSE LENGTH" value={fraction} min={0} max={1} step={0.005} accent={THEME.accent}
          display={fmtNs(t)} onChange={touch(setFraction)} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="chip" style={groupChip} onClick={() => { markExplored(); setFraction(half / (2 * full)); }}>Set to √SWAP</button>
          <button className="chip" style={groupChip} onClick={() => { markExplored(); setFraction(full / (2 * full)); }}>Set to full swap</button>
        </div>
      </div>

      <ReadoutGrid items={[
        { label: 'Exchange coupling J/h', value: `${j.toFixed(j < 1 ? 2 : 1)} MHz` },
        { label: 'Full swap takes', value: fmtNs(full), note: `√SWAP at ${fmtNs(half)}` },
        { label: 'Spins swapped', value: pct(swap, 0) },
        { label: 'Entanglement', value: pct(ent, 0), note: '100% is a maximally entangled pair' },
      ]} />

      {(atSqrt || atFull) && (
        <div style={{ ...panelStyle, fontSize: '0.9rem', lineHeight: 1.45 }}>
          {atSqrt
            ? '√SWAP: half a swap leaves the two spins in an equal mix of "swapped" and "not swapped", fully entangled. Two of these (with single-spin rotations) make a CNOT.'
            : 'A full swap: the spins have traded places. That is useful, but it produces no entanglement.'}
        </div>
      )}

      <div style={panelStyle}>
        <LineChart
          series={[
            { label: 'chance swapped', points: curve.map((c) => ({ x: c.t, y: c.swap })), color: THEME.accent },
            { label: 'entanglement', points: curve.map((c) => ({ x: c.t, y: c.entanglement })), color: '#ffffff', dashed: true },
          ]}
          xLabel="pulse length" yLabel="value" xMax={2 * full} yMax={1}
          markers={[{ x: t, label: 'now' }]}
          formatX={fmtNs} formatY={(y) => pct(y, 0)}
          summary={`At this pulse length ${pct(swap, 0)} of the spins have swapped and the entanglement is ${pct(ent, 0)}.`}
        />
      </div>

      <div style={{ ...panelStyle, fontSize: '0.88rem', lineHeight: 1.5 }}>
        <Eyebrow>WHY THE BARRIER IS A DELICATE KNOB</Eyebrow>
        <div style={{ marginTop: 4 }}>
          Each step of 1 on the barrier changes J by a factor of about {Math.exp(0.9).toFixed(1)}. A small error in the barrier voltage is a large error in the pulse length that makes a clean gate.
        </div>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>J/h = {j.toFixed(2)} MHz</div>
        <div>swap chance = sin²(π · J/h · t) = sin²(π · {j.toFixed(2)} · {(t / 1000).toFixed(3)}) = {swap.toFixed(3)}</div>
        <div>full swap: t = 1 / (2 J/h) = {fmtNs(full)}; √SWAP: half of that</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          State: cos φ |01⟩ − i sin φ |10⟩ with φ = π J t / h. It is maximally entangled at φ = π/4.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        This is the textbook exchange model with an illustrative exponential J(barrier). Real devices also suffer from charge noise on the barrier, from valley states in silicon, and from magnetic-field differences between the dots, all of which spoil the clean oscillation drawn here.
      </InfoBox>
    </ArcadeFrame>
  );
};
