import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, MeterBar, NextButton, starWords, useLevelRun } from '../shared/LevelKit';
import type { StarCount } from '../shared/LevelKit';
import { sound } from '../../utils/audio';
import {
  BARRIER_MAX, LEVELS, PULSE_MAX, PULSE_MIN, VOLTAGE_MAX, couplingMHz, evaluate, stars as starsFor,
} from '../../core/games/dotTuner';
import type { DotLevel } from '../../core/games/dotTuner';
import { swapTimeNs } from '../../core/hardware/exchange';
import { LabSlider } from '../simulations/labKit';
import { pct } from '../simulations/labUtils';

const THEME = THEMES.pink;
const electronWords = ['no electron', 'one electron', 'two electrons'];

const Level: React.FC<{
  level: DotLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [v1, setV1] = useState(5);
  const [v2, setV2] = useState(5);
  const [barrier, setBarrier] = useState(6);
  const [pulse, setPulse] = useState(100);
  const [done, setDone] = useState<StarCount | null>(null);
  const [tried, setTried] = useState(false);

  const settings = { v1, v2, barrier, pulseNs: pulse };
  const result = evaluate(level, settings);
  const j = couplingMHz(level, barrier);
  const pulseNs = level.fixedPulseNs ?? pulse;
  const full = swapTimeNs(j);
  const wanted = level.gate === 'swap' ? 'a full swap' : 'half a swap (the square root of SWAP)';
  const gap = <T,>(set: (v: T) => void) => (v: T) => {
    if (done === null) {
      setTried(false);
      set(v);
    }
  };

  const check = () => {
    setTried(true);
    if (!result.passed) {
      sound.playAlarm();
      return;
    }
    const s = starsFor(level, result) as StarCount;
    sound.playSuccess();
    setDone(s);
    onClear(s);
  };

  useActivityReport({
    id: 'dot_tuner',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Get one electron in each dot, then tune the barrier${level.fixedPulseNs === null ? ' and the pulse' : ` (the pulse is fixed at ${level.fixedPulseNs} ns)`} to make ${wanted}, with a gate quality of at least ${pct(level.quality, 0)}.`,
    state:
      `Dot 1 holds ${electronWords[result.occupancy[0]]}, dot 2 holds ${electronWords[result.occupancy[1]]}. Barrier ${barrier.toFixed(2)}, coupling ${j.toFixed(1)} MHz, pulse ${pulseNs} ns, ` +
      `so a full swap would take ${full >= 1000 ? `${(full / 1000).toFixed(1)} µs` : `${full.toFixed(0)} ns`}. Gate quality ${pct(result.quality, 0)}.`,
    hint: 'Do the electrons first: each dot has a window of voltage where it holds exactly one. Then match the coupling to the pulse you have.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Goal: <b>one electron in each dot</b>, then <b>{wanted}</b> with a quality of <b>{pct(level.quality, 0)}</b> or more.
        {level.fixedPulseNs !== null && <> The electronics only make a <b>{level.fixedPulseNs} ns</b> pulse.</>}
        {level.noise > 0 && <> The barrier wobbles a little (charge noise).</>}
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>STEP 1: CHARGE THE DOTS</Eyebrow>
        <LabSlider label="DOT 1 VOLTAGE" value={v1} min={0} max={VOLTAGE_MAX} step={1} accent={THEME.accent} display={`${v1} mV`} onChange={gap(setV1)} />
        <LabSlider label="DOT 2 VOLTAGE" value={v2} min={0} max={VOLTAGE_MAX} step={1} accent={THEME.accent} display={`${v2} mV`} onChange={gap(setV2)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {result.occupancy.map((n, i) => (
            <div key={i} style={{ ...panelStyle, textAlign: 'center', borderColor: n === 1 ? '#2ee6a6' : '#ff5c8a', padding: 8 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Dot {i + 1}</div>
              <div style={{ fontSize: '1.3rem' }} aria-hidden="true">{'●'.repeat(n) || '○'}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{n === 1 ? '✓ ' : '✗ '}{electronWords[n]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>STEP 2: THE GATE</Eyebrow>
        <LabSlider label="BARRIER BETWEEN THE DOTS" value={barrier} min={0} max={BARRIER_MAX} step={0.02} accent={THEME.accent}
          display={barrier.toFixed(2)} onChange={gap(setBarrier)} />
        {level.fixedPulseNs === null && (
          <LabSlider label="PULSE LENGTH" value={pulse} min={PULSE_MIN} max={PULSE_MAX} step={1} accent={THEME.accent}
            display={`${pulse} ns`} onChange={gap(setPulse)} />
        )}
        <div style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
          Coupling J: <b>{j.toFixed(1)} MHz</b>. A full swap would take <b>{full >= 1000 ? `${(full / 1000).toFixed(1)} µs` : `${full.toFixed(0)} ns`}</b>;
          your pulse is <b>{pulseNs} ns</b>.
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MeterBar label="Gate quality" value={result.quality} max={1} ok={result.quality >= level.quality} text={`${pct(result.quality, 0)} (need ${pct(level.quality, 0)})`} color="#2ee6a6" />
        {level.gate === 'sqrt' && (
          <MeterBar label="Entanglement" value={result.entanglement} max={1} ok={result.entanglement >= 0.9} text={pct(result.entanglement, 0)} color={THEME.accent} />
        )}
      </div>

      {done === null && (
        <>
          {tried && !result.passed && (
            <Banner tone="bad" title={result.charged ? 'THE GATE IS OFF' : 'THE DOTS ARE NOT READY'}>
              {result.charged
                ? 'The pulse does not give the gate you want at this coupling. Compare the swap time with your pulse and adjust the barrier.'
                : 'Each dot must hold exactly one electron: too low and it has none, too high and it takes a second.'}
            </Banner>
          )}
          <button className="btn btn-mint" onClick={check}><span>Run the gate</span></button>
        </>
      )}

      {done !== null && (
        <>
          <Banner tone="good" title="TUNED!">
            {starWords(done)} Every device has its own offsets, so these voltages would not work on the next chip. That is why tuning many dots at once is the hard part of this approach.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const DotTuner: React.FC = () => {
  const r = useLevelRun('dot_tuner', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="DEVICE TUNED" total={r.total} levelCount={LEVELS.length}
        summary="You set the voltages for one electron per dot, then matched the exchange coupling to a pulse, on five different devices."
        honest="Real devices have many dots whose settings depend on one another, plus valley states, charge noise and magnetic-field differences that this two-dot model leaves out. Automating this tuning is an active research area."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="DEVICE" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
