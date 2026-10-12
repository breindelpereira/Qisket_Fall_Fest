import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, MeterBar, NextButton } from '../shared/LevelKit';
import { starWords, useLevelRun } from '../shared/levelRun';
import type { StarCount } from '../shared/levelRun';
import { sound } from '../../utils/audio';
import { LEVELS, run, stars as starsFor } from '../../core/games/coherenceRace';
import type { RaceLevel, RaceResult } from '../../core/games/coherenceRace';
import { pct } from '../simulations/labUtils';

const THEME = THEMES.yellow;
const fmtT = (ns: number) => (ns >= 1000 ? `${ns / 1000} µs` : `${ns} ns`);

const Level: React.FC<{
  level: RaceLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState<StarCount | null>(null);
  const result: RaceResult | null = picked === null ? null : run(level, picked);

  const choose = (t: number) => {
    if (done !== null) return;
    sound.playClick();
    setPicked(t);
  };

  const launch = () => {
    if (!result || done !== null) return;
    setTries((n) => n + 1);
    const base = starsFor(level, result);
    if (result.passed) {
      sound.playSuccess();
      const s = (base > 0 && tries + 1 > 3 ? Math.max(1, base - 1) : base) as StarCount;
      setDone(s);
      onClear(s);
    } else {
      sound.playAlarm();
    }
  };

  useActivityReport({
    id: 'coherence_race',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Run ${level.gates} gates on a qubit with T2 of ${level.t2Us} µs and keep the whole circuit clean with a chance of at least ${pct(level.target, 0)}.`,
    state: result
      ? `Gate time picked: ${fmtT(result.t)}. The circuit takes ${result.totalUs.toFixed(1)} µs (${result.fits ? 'inside' : 'longer than'} T2). Error per gate ${(result.error * 100).toFixed(3)}%. Chance of a clean run ${pct(result.success, 0)}. ${done !== null ? 'Passed.' : 'Not locked in yet.'} Tries so far: ${tries}.`
      : 'No gate time picked yet.',
    hint: 'Slow gates run into the qubit\'s lifetime and give it time to decohere; fast gates are driven hard and are less accurate. The best speed is in between.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.9rem', lineHeight: 1.5 }}>
        <b>{level.gates} gates</b> on a qubit whose phase lasts <b>T2 = {level.t2Us} µs</b>. The circuit has to finish inside T2, and its chance of
        running with no error must reach <b>{pct(level.target, 0)}</b>.
      </div>

      <div role="group" aria-label="Gate time" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
        {level.options.map((t) => (
          <button key={t} className="chip" aria-pressed={picked === t} disabled={done !== null} onClick={() => choose(t)}
            style={{ minHeight: 52, justifyContent: 'center', fontSize: '0.62rem', padding: '6px 2px' }}>{fmtT(t)}</button>
        ))}
      </div>

      {result && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Eyebrow>YOUR CHOICE: {fmtT(result.t)} PER GATE</Eyebrow>
          <MeterBar label="Circuit time against T2" value={result.totalUs} max={level.t2Us} ok={result.fits}
            text={`${result.totalUs.toFixed(1)} of ${level.t2Us} µs`} color={THEME.accent} />
          <MeterBar label="Chance the whole circuit is clean" value={result.success} max={1} ok={result.success >= level.target}
            text={`${pct(result.success, 0)} (need ${pct(level.target, 0)})`} color="#2ee6a6" />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Error per gate: {(result.error * 100).toFixed(3)}%.{' '}
            {!result.fits ? 'The circuit is longer than the qubit lasts, so it cannot finish.' : ''}
          </div>
        </div>
      )}

      {done === null ? (
        <button className="btn btn-mint" onClick={launch} disabled={picked === null}><span>Run the circuit</span></button>
      ) : null}

      {result && done === null && tries > 0 && !result.passed && (
        <Banner tone="bad" title={result.fits ? 'TOO MANY ERRORS' : 'OUT OF TIME'}>
          {!result.fits
            ? 'These gates are too slow: the qubit has forgotten before the circuit ends. Try a faster setting.'
            : result.t <= 40 || (result.error * level.gates > 1 && result.t < 100)
              ? 'The errors add up. Fast gates are driven hard and are sloppy, so look for a slower setting.'
              : 'The errors add up. Slow gates give the qubit time to decohere during each gate, so look for a faster setting.'}
        </Banner>
      )}

      {done !== null && (
        <>
          <Banner tone="good" title="THROUGH!">
            {starWords(done)} The best setting for this circuit is about {fmtT(level.options.reduce((a, b) => (run(level, b).success > run(level, a).success ? b : a)))} per gate.
            Faster gates lose accuracy to control errors, slower gates lose it to the qubit fading, and the two together have a sweet spot.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const CoherenceRace: React.FC = () => {
  const r = useLevelRun('coherence_race', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="RACE COMPLETE" total={r.total} levelCount={LEVELS.length}
        summary="You balanced gate speed against accuracy and against the lifetime of the qubit, five times over."
        honest="Real gate errors have more causes than the two in this game, and the numbers are illustrative. Hardware teams make exactly this trade-off, and the Qubit Metrics Lab shows the two budget limits side by side."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="LAP" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
