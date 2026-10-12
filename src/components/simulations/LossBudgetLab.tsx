import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, GameTitle } from '../shared/Arcade';
import { THEMES, panelStyle } from '../shared/arcadeTheme';
import { allSurvive, chainLossDb, expectedAttempts, maxComponents, photonSurvival } from '../../core/hardware/loss';
import { InfoBox, LabSlider, LineChart, MathBox, ReadoutGrid } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.sky;
const MAX_COMPONENTS = 60;

const tries = (n: number) => (!Number.isFinite(n) ? 'practically never' : n >= 1e6 ? `${(n / 1e6).toFixed(1)} million` : n >= 1000 ? Math.round(n).toLocaleString('en-US') : n.toFixed(n < 10 ? 1 : 0));

export const LossBudgetLab: React.FC = () => {
  const markExplored = useExplored('loss_budget_lab', 'concept_hardware');
  const [perDb, setPerDb] = useState(0.2);
  const [components, setComponents] = useState(20);
  const [photons, setPhotons] = useState(4);
  const [target, setTarget] = useState(0.5);
  const [showMath, setShowMath] = useState(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    markExplored();
    set(v);
  };

  const one = photonSurvival(perDb, components);
  const all = allSurvive(perDb, components, photons);
  const total = chainLossDb(perDb, components);
  const room = maxComponents(perDb, photons, target);
  const curve = Array.from({ length: MAX_COMPONENTS + 1 }, (_, k) => ({ x: k, y: allSurvive(perDb, k, photons) }));

  useActivityReport({
    id: 'loss_budget_lab',
    status: 'playing',
    step: `${photons} photons through ${components} components`,
    state:
      `Loss per component ${perDb.toFixed(2)} dB, so ${total.toFixed(1)} dB in total. One photon survives with ${pct(one, 1)}. ` +
      `All ${photons} survive with ${pct(all, 2)}, which takes about ${tries(expectedAttempts(all))} tries. For a ${pct(target, 0)} target there is room for ${Number.isFinite(room) ? room : 'any number of'} components.`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · PHOTON LOSS" tag="Simplified model" />
      <GameTitle
        title="Loss Budget Lab"
        story="Photons are not flipped, they are lost. Every component takes a small share, the shares multiply, and a computation needs several photons to all arrive. Watch how fast success disappears."
      />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="LOSS PER COMPONENT" value={perDb} min={0.02} max={1} step={0.01} accent={THEME.accent}
          display={`${perDb.toFixed(2)} dB`} onChange={touch(setPerDb)} />
        <LabSlider label="COMPONENTS IN THE PATH" value={components} min={1} max={MAX_COMPONENTS} step={1} accent={THEME.accent}
          display={String(components)} onChange={touch(setComponents)} />
        <LabSlider label="PHOTONS THAT MUST ALL ARRIVE" value={photons} min={1} max={12} step={1} accent={THEME.accent}
          display={String(photons)} onChange={touch(setPhotons)} />
      </div>

      <ReadoutGrid items={[
        { label: 'Total loss', value: `${total.toFixed(1)} dB`, note: total >= 3 ? 'more than half the light is gone' : 'under half lost' },
        { label: 'One photon arrives', value: pct(one, 1) },
        { label: `All ${photons} arrive`, value: pct(all, all < 0.01 ? 3 : 1), note: 'the chance a run works' },
        { label: 'Tries per success', value: tries(expectedAttempts(all)), note: 'on average' },
      ]} />

      {all < 0.01 && (
        <Banner tone="bad" title="BELOW 1%">
          With these settings fewer than 1 run in 100 gets every photon through. Either the loss per part or the number of parts has to come down, or the machine needs a way to make up for lost photons.
        </Banner>
      )}

      <div style={panelStyle}>
        <LineChart
          series={[{ label: `chance all ${photons} photons arrive`, points: curve, color: THEME.accent }]}
          xLabel="components in the path" yLabel="success chance" xMax={MAX_COMPONENTS} yMax={1}
          markers={[{ x: components, label: `${components} now` }, { y: target, label: `target ${pct(target, 0)}` }]}
          formatY={(y) => pct(y, 0)}
          summary={`With ${components} components the chance is ${pct(all, 1)}.`}
        />
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="MY TARGET SUCCESS CHANCE" value={target} min={0.05} max={0.95} step={0.05} accent={THEME.accent}
          display={pct(target, 0)} onChange={touch(setTarget)} />
        <div style={{ fontSize: '0.88rem', lineHeight: 1.45 }}>
          {Number.isFinite(room)
            ? room >= 1
              ? `To keep ${pct(target, 0)} with ${photons} photons at ${perDb.toFixed(2)} dB each, the path can hold at most ${room} component${room === 1 ? '' : 's'}.`
              : `Even one component at ${perDb.toFixed(2)} dB is too lossy for ${photons} photons to reach ${pct(target, 0)}.`
            : 'With no loss there is no limit.'}
        </div>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>decibels add: {perDb.toFixed(2)} dB × {components} = {total.toFixed(2)} dB</div>
        <div>one photon: 10^(−{total.toFixed(2)}/10) = {one.toFixed(4)}</div>
        <div>all {photons}: {one.toFixed(4)}^{photons} = {all.toExponential(2)}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>3 dB is a factor of two: 10^(−0.3) ≈ 0.5.</div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        This assumes every component loses the same amount, independently. Real chips have different parts, and some designs add extra photons or correction steps to tolerate loss. The curve shows why loss is the central problem for photonic machines, not how any particular machine performs.
      </InfoBox>
    </ArcadeFrame>
  );
};
