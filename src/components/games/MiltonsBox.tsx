import React, { useMemo, useState } from 'react';
import { ChevronRight, Lightbulb, Minus, Plus, RotateCcw, Star, Undo2 } from 'lucide-react';
import type { QuantumStateVector } from '../../core/circuit';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { PIXEL, RETRO, THEMES, panelStyle, stageStyle } from '../shared/arcadeTheme';
import { Milton } from '../shared/Milton';
import { sound } from '../../utils/audio';
import {
  GATE_LABEL, LEVELS, OUTCOME_LABEL, boxFromAmplitudes, chanceAwake, diagnoseGuess, isPrepared, judgeGuess, openMany, openOnce,
  parGates, prepared, reopen, starsFor,
} from '../../core/games/miltonsBox';
import type { AgainLevel, BoxGate, BoxLevel, Outcome, PredictLevel, PrepareLevel } from '../../core/games/miltonsBox';

const THEME = THEMES.orange;
const SAMPLE = 20;

const signed = (n: number) => (n < 0 ? `−${Math.abs(n).toFixed(2)}` : n.toFixed(2));

/** The box and what is in it. `open` is null while the box is closed. A word always says what the picture shows. */
const BoxStage: React.FC<{ open: Outcome | null; caption: string }> = ({ open, caption }) => (
  <div style={{ ...stageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px 12px', gap: 6 }}>
    <div style={{ position: 'relative', width: 150, height: 132 }}>
      {open && (
        <div style={{ position: 'absolute', left: 25, top: 0 }}>
          <Milton size={100} mood={open === 'awake' ? 'happy' : 'asleep'} float={false} />
        </div>
      )}
      <svg width="150" height="132" viewBox="0 0 150 132" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        {!open && <rect x="14" y="30" width="122" height="22" rx="7" fill="#b07a3e" stroke="#6b4519" strokeWidth="3" />}
        <rect x="18" y={open ? 80 : 50} width="114" height={open ? 44 : 74} rx="9" fill="#8a5a2b" stroke="#6b4519" strokeWidth="3" />
        <path d={`M18 ${open ? 94 : 64} H132`} stroke="#6b4519" strokeWidth="3" />
        {!open && <text x="75" y="104" textAnchor="middle" fontFamily={PIXEL} fontSize="26" fill="#ffe3b8">?</text>}
      </svg>
    </div>
    <div role="status" style={{ fontFamily: PIXEL, fontSize: '0.62rem', lineHeight: 1.6, textAlign: 'center' }}>{caption}</div>
  </div>
);

/** Awake and Asleep chances as two labelled bars: the words carry the meaning, the colours only help. */
const ChanceBars: React.FC<{ awake: number }> = ({ awake }) => {
  const asleep = 100 - awake;
  const row = (label: string, value: number, color: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 70, fontSize: '0.8rem', fontWeight: 800 }}>{label}</span>
      <div style={{ flex: 1, height: 18, background: 'rgba(255,255,255,0.1)', borderRadius: 9, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(0, value)}%`, height: '100%', background: color, transition: 'width 0.25s' }} />
      </div>
      <span style={{ width: 52, textAlign: 'right', fontFamily: RETRO, fontSize: '1.3rem' }}>{Math.round(value)}%</span>
    </div>
  );
  return (
    <div role="img" aria-label={`Chance Awake ${Math.round(awake)} percent, Asleep ${Math.round(asleep)} percent`} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {row('Awake', awake, '#2ee6a6')}
      {row('Asleep', asleep, '#38c8ff')}
    </div>
  );
};

/** 20 identical boxes, opened one after another: a row of faces and the count in words. "Open 20 more" shows the numbers move. */
const Sample: React.FC<{ box: QuantumStateVector; initial: Record<Outcome, number> }> = ({ box, initial }) => {
  const [counts, setCounts] = useState(initial);
  const [batches, setBatches] = useState(1);
  return (
    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Eyebrow>{SAMPLE} IDENTICAL BOXES, OPENED ONE BY ONE</Eyebrow>
      <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontSize: '1.15rem' }}>
        {Array.from({ length: counts.awake }, (_, i) => <span key={`a${i}`}>😺</span>)}
        {Array.from({ length: counts.asleep }, (_, i) => <span key={`s${i}`}>😴</span>)}
      </div>
      <div role="status" style={{ fontSize: '0.9rem', fontWeight: 700 }}>Batch {batches}: {counts.awake} Awake, {counts.asleep} Asleep.</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        Each opening is a fresh box prepared the same way. A new batch lands a little differently: the chance is the long-run share, not a promise for any one box.
      </div>
      <button className="chip" onClick={() => { sound.playClick(); setCounts(openMany(box, SAMPLE)); setBatches((n) => n + 1); }} style={{ minHeight: 48, alignSelf: 'flex-start' }}>
        <RotateCcw size={16} /> Open {SAMPLE} more
      </button>
    </div>
  );
};

interface LevelProps<L extends BoxLevel> {
  level: L;
  index: number;
  isLast: boolean;
  onClear: (stars: 1 | 2 | 3) => void;
  onNext: () => void;
}

const NextButton: React.FC<{ isLast: boolean; onNext: () => void }> = ({ isLast, onNext }) => (
  <button className="btn" onClick={() => { sound.playClick(); onNext(); }}>
    <span>{isLast ? 'See how it went' : 'Next box'}</span>
    <ChevronRight size={18} />
  </button>
);

const SLIPS = {
  amplitude: 'That is the amplitude itself, read as a percentage. The chance is the amplitude squared.',
  'other-outcome': 'That is the chance of the other outcome. Look at which amplitude belongs to Awake.',
  'too-high': 'Too high.',
  'too-low': 'Too low.',
} as const;

const PredictBox: React.FC<LevelProps<PredictLevel>> = ({ level, index, isLast, onClear, onNext }) => {
  const [guess, setGuess] = useState(50);
  const [tries, setTries] = useState(0);
  const [slip, setSlip] = useState<keyof typeof SLIPS | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [sample, setSample] = useState<Record<Outcome, number> | null>(null);
  const cleared = sample !== null;

  const move = (delta: number) => {
    setGuess((g) => Math.min(100, Math.max(0, g + delta)));
    setSlip(null);
  };

  const lockIn = () => {
    const attempt = tries + 1;
    setTries(attempt);
    if (judgeGuess(level, guess).correct) {
      sound.playSuccess();
      setSample(openMany(boxFromAmplitudes(level.alpha, level.beta), SAMPLE));
      onClear(starsFor(attempt, 0));
    } else {
      sound.playAlarm();
      setSlip(diagnoseGuess(level, guess));
    }
  };

  useActivityReport({
    id: 'miltons_box',
    status: 'playing',
    step: `Box ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: level.story,
    state: cleared
      ? 'The learner locked in a correct guess and has seen the sample of 20 boxes.'
      : `The recipe on screen: Awake amplitude ${signed(level.alpha)}, Asleep amplitude ${signed(level.beta)}. The slider is on ${guess}% Awake${tries ? `, after ${tries} wrong guess${tries === 1 ? '' : 'es'}` : ''}.${slip ? ` The game told them: ${SLIPS[slip]}` : ''}`,
    hint: level.hint,
  });

  return (
    <>
      <BoxStage open={null} caption={cleared ? 'Opened, 20 times over' : 'Box closed'} />
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Eyebrow>THE RECIPE</Eyebrow>
        <div style={{ fontFamily: RETRO, fontSize: '1.5rem' }}>Awake amplitude {signed(level.alpha)}</div>
        <div style={{ fontFamily: RETRO, fontSize: '1.5rem' }}>Asleep amplitude {signed(level.beta)}</div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>YOUR GUESS: THE CHANCE OF AWAKE</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="chip" onClick={() => move(-5)} disabled={cleared || guess <= 0} aria-label="5 percent lower" style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}>
            <Minus size={18} />
          </button>
          <input
            type="range" min={0} max={100} step={5} value={guess} disabled={cleared}
            aria-label="Chance of Awake, in percent" aria-valuetext={`${guess} percent`}
            onChange={(e) => { setGuess(Number(e.target.value)); setSlip(null); }}
            style={{ flex: 1, minHeight: 44, accentColor: THEME.accent }}
          />
          <button className="chip" onClick={() => move(5)} disabled={cleared || guess >= 100} aria-label="5 percent higher" style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}>
            <Plus size={18} />
          </button>
        </div>
        <div style={{ textAlign: 'center', fontFamily: RETRO, fontSize: '2rem' }}>{guess}% Awake</div>
        {!cleared && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-mint" onClick={lockIn} style={{ flex: '1 1 150px' }}><span>Open the box</span></button>
            <button className="chip" onClick={() => setHintShown(true)} style={{ minHeight: 48 }}><Lightbulb size={16} /> Hint</button>
          </div>
        )}
      </div>

      {hintShown && !cleared && <Banner tone="info">💡 {level.hint}</Banner>}
      {slip && !cleared && <Banner tone="bad" title="NOT QUITE">{SLIPS[slip]}</Banner>}
      {cleared && sample && (
        <>
          <Banner tone="good" title="RIGHT!">{level.why}</Banner>
          <Sample box={boxFromAmplitudes(level.alpha, level.beta)} initial={sample} />
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

const PrepareBox: React.FC<LevelProps<PrepareLevel>> = ({ level, index, isLast, onClear, onNext }) => {
  const [gates, setGates] = useState<BoxGate[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [sample, setSample] = useState<Record<Outcome, number> | null>(null);
  const par = useMemo(() => parGates(level) ?? level.maxGates, [level]);
  const chance = chanceAwake(prepared(gates));
  const cleared = sample !== null;

  const press = (g: BoxGate) => {
    if (cleared || gates.length >= level.maxGates) return;
    sound.playGate();
    const next = [...gates, g];
    setGates(next);
    if (isPrepared(level, next)) {
      sound.playSuccess();
      setSample(openMany(prepared(next), SAMPLE));
      onClear(starsFor(1, next.length - par));
    }
  };

  useActivityReport({
    id: 'miltons_box',
    status: 'playing',
    step: `Box ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `${level.story} Goal: ${level.targetText}.`,
    state: cleared
      ? `The learner reached the goal with ${gates.length} gate${gates.length === 1 ? '' : 's'}.`
      : `Buttons available: ${level.gates.join(', ')}. Gates pressed so far: ${gates.length ? gates.join(', then ') : 'none'}. The chance of Awake is now ${Math.round(chance)}%. At most ${level.maxGates} gates fit.`,
    hint: level.hint,
  });

  return (
    <>
      <BoxStage open={null} caption={cleared ? 'Goal reached' : 'Box closed. Chances shown below.'} />
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Eyebrow>GOAL</Eyebrow>
        <div style={{ fontFamily: RETRO, fontSize: '1.5rem' }}>{level.targetText}</div>
      </div>
      <ChanceBars awake={chance} />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>GATES · {gates.length} OF {level.maxGates} USED</Eyebrow>
        <div role="group" aria-label="Gates" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {level.gates.map((g) => (
            <button key={g} className="btn btn-violet" onClick={() => press(g)} disabled={cleared || gates.length >= level.maxGates}
              style={{ flex: '1 1 130px', minHeight: 56 }}>
              <span>{GATE_LABEL[g]}</span>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: RETRO, fontSize: '1.4rem', minHeight: 30 }}>
          {gates.length ? gates.join(' → ') : 'No gates yet: Milton is certainly Awake.'}
        </div>
        {!cleared && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="chip" onClick={() => setGates((s) => s.slice(0, -1))} disabled={gates.length === 0} style={{ minHeight: 48 }}>
              <Undo2 size={16} /> Undo
            </button>
            <button className="chip" onClick={() => setGates([])} disabled={gates.length === 0} style={{ minHeight: 48 }}>
              <RotateCcw size={16} /> Start over
            </button>
            <button className="chip" onClick={() => setHintShown(true)} style={{ minHeight: 48 }}><Lightbulb size={16} /> Hint</button>
          </div>
        )}
      </div>

      {hintShown && !cleared && <Banner tone="info">💡 {level.hint}</Banner>}
      {!cleared && gates.length >= level.maxGates && (
        <Banner tone="warn" title="OUT OF GATES">That is all the gates this box takes. Undo some, or start over.</Banner>
      )}
      {cleared && sample && (
        <>
          <Banner tone="good" title="DONE!">{level.why}</Banner>
          <Sample box={prepared(gates)} initial={sample} />
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

const AgainBox: React.FC<LevelProps<AgainLevel>> = ({ level, index, isLast, onClear, onNext }) => {
  const [box, setBox] = useState<QuantumStateVector | null>(null);
  const [log, setLog] = useState<Outcome[]>([]);
  const [done, setDone] = useState(false);
  const looks = Math.max(0, log.length - 1);

  const first = () => {
    sound.playClick();
    const result = openOnce(prepared(['H']));
    setBox(result.box);
    setLog([result.outcome]);
  };

  const again = () => {
    if (!box) return;
    sound.playClick();
    const next = [...log, reopen(box)];
    setLog(next);
    if (!done && next.length - 1 >= level.looks) {
      setDone(true);
      sound.playSuccess();
      onClear(3);
    }
  };

  const fresh = () => {
    sound.playClick();
    setBox(null);
    setLog([]);
  };

  const last = log.length ? log[log.length - 1] : null;

  useActivityReport({
    id: 'miltons_box',
    status: 'playing',
    step: `Box ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: level.story,
    state: log.length === 0
      ? 'The box is sealed and has not been opened yet. It is a 50/50 box.'
      : `This box has been opened ${log.length} time${log.length === 1 ? '' : 's'}. The results in order: ${log.map((o) => OUTCOME_LABEL[o]).join(', ')}.`,
    hint: 'Open it once, then keep pressing Look again and compare each result with the first.',
  });

  return (
    <>
      <BoxStage open={last} caption={last ? `Milton is ${OUTCOME_LABEL[last]}` : 'Box sealed: a 50/50 box'} />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>LOOKS · {looks} OF {level.looks} REPEAT LOOKS</Eyebrow>
        <ol style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6, margin: 0, padding: 0 }}>
          {log.length === 0 && <li style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No looks yet.</li>}
          {log.map((o, i) => (
            <li key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 10px', fontWeight: 800, fontSize: '0.85rem' }}>
              {i === 0 ? 'First' : `Look ${i + 1}`}: {o === 'awake' ? '😺' : '😴'} {OUTCOME_LABEL[o]}
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {box === null ? (
            <button className="btn btn-mint" onClick={first} style={{ flex: '1 1 160px' }}><span>Open the box</span></button>
          ) : (
            <>
              <button className="btn btn-mint" onClick={again} style={{ flex: '1 1 160px' }}><span>Look again</span></button>
              <button className="chip" onClick={fresh} style={{ minHeight: 48 }}><RotateCcw size={16} /> New 50/50 box</button>
            </>
          )}
        </div>
      </div>

      {box !== null && !done && (
        <Banner tone="info">The first look is a fair coin. Keep looking at this same box and compare every answer with the first.</Banner>
      )}
      {done && (
        <>
          <Banner tone="good" title="EVERY LOOK AGREED">{level.why}</Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

const Finished: React.FC<{ stars: Record<number, 1 | 2 | 3>; onAgain: () => void }> = ({ stars, onAgain }) => {
  const total = Object.values(stars).reduce((a, b) => a + b, 0);
  const best = LEVELS.length * 3;
  useActivityReport({
    id: 'miltons_box',
    status: 'finished',
    step: 'All five boxes opened',
    state: `Stars: ${total} of ${best}. The game showed that the chance of an outcome is its amplitude squared, that gates and interference change those chances, and that opening a box changes it.`,
  });
  return (
    <ArcadeFrame theme={THEME}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <Milton size={110} mood="happy" />
        <h2 style={{ fontFamily: PIXEL, fontSize: '0.9rem', color: THEME.accent, lineHeight: 1.6 }}>ALL BOXES OPENED</h2>
        <div aria-label={`${total} of ${best} stars`} style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>{total} / {best} stars</div>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          You read odds off amplitudes, built a superposition, used a sign flip to steer a qubit, and saw that opening a box changes it.
        </p>
        <Banner tone="info" title="THE HONEST PART">
          In the 1935 thought experiment the cat is alive or dead, and the point was how odd it would be to put something that big in a superposition. A real cat never is: its surroundings keep measuring it. Milton here is a picture of one qubit. The numbers and rules are real.
        </Banner>
        <button className="btn" onClick={onAgain}><RotateCcw size={18} /> <span>Play again</span></button>
      </div>
    </ArcadeFrame>
  );
};

export const MiltonsBox: React.FC = () => {
  const { completeGame } = useProgress();
  const [levelIdx, setLevelIdx] = useState(0);
  const [stars, setStars] = useState<Record<number, 1 | 2 | 3>>({});
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(0);

  const level = LEVELS[levelIdx];
  const isLast = levelIdx === LEVELS.length - 1;
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  const onClear = (s: 1 | 2 | 3) => setStars((prev) => ({ ...prev, [levelIdx]: prev[levelIdx] ? (Math.max(prev[levelIdx], s) as 1 | 2 | 3) : s }));

  const next = () => {
    if (isLast) {
      setFinished(true);
      completeGame('miltons_box', 'concept_measurement');
      return;
    }
    setLevelIdx(levelIdx + 1);
  };

  const again = () => {
    setLevelIdx(0);
    setStars({});
    setFinished(false);
    setRound((r) => r + 1);
  };

  if (finished) return <Finished stars={stars} onAgain={again} />;

  const common = { index: levelIdx, isLast, onClear, onNext: next };

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label={`BOX ${levelIdx + 1}/${LEVELS.length}`} tag="Analogy"
        middle={<span aria-label={`${totalStars} stars`} style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={16} fill="#ffd23f" /> {totalStars}</span>} />

      <GameTitle title={level.title} story={level.story} />

      {levelIdx === 0 && (
        <Banner tone="info" title="THE ANALOGY">
          In the famous thought experiment a cat is alive or dead. Milton is only ever Awake or Asleep. The cat stands for one qubit: Awake is |0⟩ and Asleep is |1⟩. There is no timer.
        </Banner>
      )}

      {level.kind === 'predict' && <PredictBox key={`${round}-${level.id}`} level={level} {...common} />}
      {level.kind === 'prepare' && <PrepareBox key={`${round}-${level.id}`} level={level} {...common} />}
      {level.kind === 'again' && <AgainBox key={`${round}-${level.id}`} level={level} {...common} />}
    </ArcadeFrame>
  );
};
