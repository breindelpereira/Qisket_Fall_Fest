import React, { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { sensorMessage, useShake } from '../../hooks/useMotion';
import { Banner, Eyebrow } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, NextButton } from '../shared/LevelKit';
import { starWords, useLevelRun } from '../shared/levelRun';
import type { StarCount } from '../shared/levelRun';
import { sound } from '../../utils/audio';
import { buzz } from '../../utils/motion';
import {
  EMPTY_TALLY, LEVELS, addToTally, estimateOfZero, measureAgain, measureFresh, pickHidden, prepare, stars as starsFor, total, wobble,
} from '../../core/games/shakeMeasure';
import type { AgainLevel, EstimateLevel, Outcome, ShakeLevel, Tally } from '../../core/games/shakeMeasure';
import { LabSlider } from '../simulations/labKit';

const THEME = THEMES.mint;

const BUZZ: Record<Outcome, number[]> = { 0: [60], 1: [60, 70, 60] };

const Histogram: React.FC<{ tally: Tally }> = ({ tally }) => {
  const n = Math.max(1, total(tally));
  return (
    <div role="img" aria-label={`Measured ${tally.zeros} zeros and ${tally.ones} ones`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {([['0', tally.zeros], ['1', tally.ones]] as const).map(([label, count]) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ height: 90, width: '100%', display: 'flex', alignItems: 'flex-end', background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: `${(count / n) * 100}%`, background: label === '0' ? THEME.accent : '#38c8ff', transition: 'height .2s' }} />
          </div>
          <div style={{ fontFamily: RETRO, fontSize: '1.4rem' }}>{label}: {count}</div>
        </div>
      ))}
    </div>
  );
};

/** The two ways to measure: shake the phone (where there is a sensor) or tap the button. Both call `measure`. */
const MeasureControls: React.FC<{ onMeasure: () => void; label: string; disabled?: boolean; status: ReturnType<typeof useShake>['status']; enable: () => void }> = ({
  onMeasure, label, disabled, status, enable,
}) => (
  <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div role="status" style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{sensorMessage(status, 'shake the phone to measure')}</div>
    {status === 'needs-tap' && <button className="btn btn-mint" onClick={enable}><span>Allow the motion sensor</span></button>}
    <button className="btn btn-orange" onClick={onMeasure} disabled={disabled}><span>{label}</span></button>
  </div>
);

const EstimateStage: React.FC<{
  level: EstimateLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [hidden, setHidden] = useState(() => pickHidden());
  const [tally, setTally] = useState<Tally>(EMPTY_TALLY);
  const [last, setLast] = useState<Outcome | null>(null);
  const [guess, setGuess] = useState(50);
  const [result, setResult] = useState<{ stars: StarCount; close: boolean } | null>(null);
  const done = total(tally) >= level.shakes;
  const left = Math.max(0, level.shakes - total(tally));

  const measure = () => {
    if (done || result) return;
    const o = measureFresh(hidden);
    sound.playClick();
    buzz(BUZZ[o]);
    setLast(o);
    setTally((t) => addToTally(t, o));
  };
  const { status, enable } = useShake(measure);

  const check = () => {
    const s = starsFor(guess / 100, hidden, level.tolerance) as StarCount;
    if (s > 0) {
      sound.playSuccess();
      setResult({ stars: s, close: true });
      onClear(s);
    } else {
      sound.playAlarm();
      setResult({ stars: 0, close: false });
    }
  };

  const again = () => {
    setHidden(pickHidden());
    setTally(EMPTY_TALLY);
    setLast(null);
    setResult(null);
    setGuess(50);
  };

  useActivityReport({
    id: 'shake_to_measure',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Measure a hidden qubit ${level.shakes} times, then guess its chance of reading 0 to within ${level.tolerance} points.`,
    state: done
      ? `All ${level.shakes} measurements made: ${tally.zeros} zeros and ${tally.ones} ones. ${result ? (result.close ? 'The guess was close enough.' : 'The guess was too far off.') : 'Now guessing.'}`
      : `${total(tally)} of ${level.shakes} measurements made so far: ${tally.zeros} zeros and ${tally.ones} ones.`,
    hint: 'Each measurement is random, but over many of them the share of zeros settles near the hidden chance. A small sample is noisy, so the margin is wide on the early levels.',
  });

  return (
    <>
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>HIDDEN QUBIT · {total(tally)} OF {level.shakes} MEASURED</Eyebrow>
        <Histogram tally={tally} />
        <div style={{ textAlign: 'center', fontFamily: RETRO, fontSize: '1.6rem' }} aria-live="polite">
          {last === null ? 'Not measured yet' : `Last result: ${last}`}
        </div>
      </div>

      {!done && (
        <MeasureControls onMeasure={measure} label={`Measure (${left} to go)`} status={status} enable={() => void enable()} />
      )}

      {done && !result?.close && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>YOUR GUESS: THE CHANCE OF READING 0</Eyebrow>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            You measured {Math.round(estimateOfZero(tally) * 100)}% zeros. With {level.shakes} measurements the share typically wobbles by about ±{Math.round(wobble(0.5, level.shakes) * 100)} points, so use your judgement.
          </div>
          <LabSlider label="CHANCE OF 0" value={guess} min={0} max={100} step={1} accent={THEME.accent} display={`${guess}%`} onChange={setGuess} />
          <button className="btn btn-mint" onClick={check}><span>Check my guess</span></button>
        </div>
      )}

      {result && !result.close && (
        <>
          <Banner tone="bad" title="TOO FAR OFF">
            Close, but not within {level.tolerance} points. The hidden chance was {Math.round(hidden * 100)}%. Each hidden qubit is a new one, so try again with a fresh set of measurements.
          </Banner>
          <button className="btn" onClick={again}><RotateCcw size={18} /> <span>Try a new qubit</span></button>
        </>
      )}

      {result?.close && (
        <>
          <Banner tone="good" title="CLOSE ENOUGH!">
            {starWords(result.stars)} The hidden chance was {Math.round(hidden * 100)}%. Each measurement was random, yet the histogram found the odds: that is the Born rule.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

const AgainStage: React.FC<{
  level: AgainLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const qubit = useRef(prepare(0.5));
  const [results, setResults] = useState<Outcome[]>([]);
  const [cleared, setCleared] = useState(false);
  const repeats = Math.max(0, results.length - 1);

  const measure = () => {
    if (cleared) return;
    // the first measurement is made on the prepared qubit itself, which leaves it in the state it was found in
    const o: Outcome = results.length === 0 ? qubit.current.measureQubit(0) : measureAgain(qubit.current);
    sound.playClick();
    buzz(BUZZ[o]);
    const next = [...results, o];
    setResults(next);
    if (next.length - 1 >= level.repeats) {
      sound.playSuccess();
      setCleared(true);
      onClear(3);
    }
  };
  const { status, enable } = useShake(measure);

  const fresh = () => {
    qubit.current = prepare(0.5);
    setResults([]);
  };

  useActivityReport({
    id: 'shake_to_measure',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Measure a fifty-fifty qubit once, then ${level.repeats} more times, and see whether the answer changes.`,
    state: results.length === 0 ? 'Not measured yet.' : `Results in order: ${results.join(', ')}.`,
    hint: 'The first measurement is a fair coin. Keep measuring the same qubit and compare each result with the first.',
  });

  return (
    <>
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>ONE QUBIT, MEASURED OVER AND OVER · {repeats} OF {level.repeats} REPEATS</Eyebrow>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {results.length === 0 && <li style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No measurements yet.</li>}
          {results.map((o, i) => (
            <li key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 10px', fontWeight: 800 }}>
              {i === 0 ? 'First' : `Again ${i}`}: {o}
            </li>
          ))}
        </ol>
      </div>

      {!cleared && (
        <MeasureControls onMeasure={measure} label={results.length === 0 ? 'Measure the qubit' : 'Measure the same qubit again'} status={status} enable={() => void enable()} />
      )}

      {results.length > 0 && !cleared && (
        <button className="chip" onClick={fresh} style={{ minHeight: 48, alignSelf: 'flex-start' }}><RotateCcw size={16} /> New fifty-fifty qubit</button>
      )}

      {cleared && (
        <>
          <Banner tone="good" title="THE ANSWER NEVER CHANGED">
            The first measurement was a coin flip, but the qubit was left in the state it was found in, so every later one gave the same answer. To get a new random result you need a new, freshly prepared qubit.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const ShakeToMeasure: React.FC = () => {
  const r = useLevelRun('shake_to_measure', LEVELS.length, 'concept_measurement');
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="MEASURED" total={r.total} levelCount={LEVELS.length}
        summary="You found hidden odds from random results, and saw that measuring the same qubit again always gives the same answer."
        honest="Analogy: the shake is an ordinary sensor and just means 'measure now'. A real measurement is not caused by shaking anything. The randomness and the odds come from the app's quantum engine, and the Born rule is real."
        onAgain={r.again} />
    );
  }
  const level: ShakeLevel = LEVELS[r.levelIdx];
  const props = { index: r.levelIdx, isLast: r.isLast, onClear: r.clear, onNext: r.next };
  return (
    <LevelFrame theme={THEME} tag="Analogy" label="SHAKE" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      {level.kind === 'estimate' ? (
        <EstimateStage key={`${r.round}-${level.id}`} level={level} {...props} />
      ) : (
        <AgainStage key={`${r.round}-${level.id}`} level={level} {...props} />
      )}
    </LevelFrame>
  );
};

