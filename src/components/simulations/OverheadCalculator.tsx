import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import {
  THRESHOLD, belowThreshold, distanceCurve, logicalError, physicalQubits, plan, suppressionFactor,
} from '../../core/hardware/overhead';
import { InfoBox, LabSlider, LineChart, MathBox, ReadoutGrid } from './labKit';
import { useExplored } from './labUtils';

const THEME = THEMES.pink;
const pctText = (p: number) => `${(p * 100).toFixed(p < 0.001 ? 3 : 2)}%`;
const sci = (x: number) => (x === 0 ? '0' : x < 0.001 ? x.toExponential(1) : x.toFixed(4));

export const OverheadCalculator: React.FC = () => {
  const markExplored = useExplored('overhead_calculator', 'concept_hardware');
  const [pExp, setPExp] = useState(Math.log10(0.001));
  const [targetExp, setTargetExp] = useState(-9);
  const [showMath, setShowMath] = useState(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    markExplored();
    set(v);
  };

  const p = Math.pow(10, pExp);
  const target = Math.pow(10, targetExp);
  const result = plan(p, target);
  const below = belowThreshold(p);
  const curve = distanceCurve(p, 21);

  useActivityReport({
    id: 'overhead_calculator',
    status: 'playing',
    step: 'Physical error against target logical error',
    state:
      `Physical error ${pctText(p)} per step (threshold ${pctText(THRESHOLD)}), target logical error ${target.toExponential(0)}. ` +
      (below
        ? `The plan needs distance ${result.distance ?? 'more than 201'}, about ${result.qubits?.toLocaleString('en-US') ?? 'too many'} physical qubits per logical qubit.`
        : 'The physical error is at or above the threshold, so a bigger code does not help.'),
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · ERROR-CORRECTION COST" tag="Simplified model" />
      <GameTitle
        title="Overhead Calculator"
        story="Error correction turns many noisy qubits into one good one. How many? It depends on how noisy the physical qubits are, and there is a threshold where it stops working at all."
      />

      <div>
        <Eyebrow>TRY A POINT FROM A SOURCE</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button className="chip" style={groupChip} onClick={() => { markExplored(); setPExp(Math.log10(0.0033)); }}>0.33% (Google Willow CZ)</button>
          <button className="chip" style={groupChip} onClick={() => { markExplored(); setPExp(Math.log10(THRESHOLD)); }}>At the threshold</button>
          <button className="chip" style={groupChip} onClick={() => { markExplored(); setPExp(Math.log10(0.0005)); }}>0.05% (very good)</button>
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="PHYSICAL ERROR PER STEP" value={pExp} min={-4} max={-1.5} step={0.02} accent={THEME.accent}
          display={pctText(p)} onChange={touch(setPExp)} />
        <LabSlider label="TARGET LOGICAL ERROR" value={targetExp} min={-15} max={-3} step={1} accent={THEME.accent}
          display={`1 in 10^${-targetExp}`} onChange={touch(setTargetExp)} />
      </div>

      {!below ? (
        <Banner tone="bad" title="ABOVE THRESHOLD">
          At {pctText(p)} the physical error is at or above the {pctText(THRESHOLD)} threshold. Adding more qubits to the code makes the logical error worse, not better, so no distance reaches the target.
        </Banner>
      ) : (
        <ReadoutGrid items={[
          { label: 'Code distance', value: result.distance ? String(result.distance) : '> 201', note: 'odd numbers only' },
          { label: 'Physical qubits for ONE logical qubit', value: result.qubits ? result.qubits.toLocaleString('en-US') : 'too many' },
          { label: 'Error drops by', value: `${suppressionFactor(p).toFixed(1)}×`, note: 'for every +2 in distance' },
          { label: 'Logical error reached', value: result.logicalError !== null ? sci(result.logicalError) : '—' },
        ]} />
      )}

      <div style={panelStyle}>
        <LineChart
          series={[{
            label: 'logical error (a log scale would show it better; here 0 to 3%)',
            points: curve.map((c) => ({ x: c.d, y: Math.min(c.logical, 0.03) })),
            color: THEME.accent,
          }]}
          xLabel="code distance d" yLabel="logical error" xMax={21} yMax={0.03}
          formatX={(x) => String(Math.round(x))} formatY={(y) => `${(y * 100).toFixed(1)}%`}
          summary={below ? 'The logical error falls as the distance grows.' : 'The logical error rises as the distance grows, because the physical error is above threshold.'}
        />
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>logical error ≈ 0.03 × (p / p_th)^((d+1)/2)</div>
        <div>p = {pctText(p)}, p_th = {pctText(THRESHOLD)}, p/p_th = {(p / THRESHOLD).toFixed(2)}</div>
        <div>d = 3: {sci(logicalError(p, 3))}   d = 7: {sci(logicalError(p, 7))}   d = 11: {sci(logicalError(p, 11))}</div>
        <div>qubits = (2d − 1)² → d = 7 needs {physicalQubits(7)}, d = 25 needs {physicalQubits(25).toLocaleString('en-US')}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Google reported a factor of 2.14 per +2 in distance on its Willow chip (spec sheet, Dec 2024). The formula gives {suppressionFactor(0.0033).toFixed(2)} at 0.33%: the same size, from a different, simpler model.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        The formula is a fit from one numerical study of the surface code (Fowler et al., 2012): threshold 0.57% and prefactor 0.03 are for that noise model and decoder. Other codes, layouts and noise give different numbers (newer layouts need roughly half the qubits). Use it to see the shape of the trade-off: huge gains below the threshold, none above.
      </InfoBox>
    </ArcadeFrame>
  );
};
