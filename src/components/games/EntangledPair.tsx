import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { sensorMessage, useOrientation } from '../../hooks/useMotion';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { PIXEL, RETRO, THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, Stars } from '../shared/LevelKit';
import { sound } from '../../utils/audio';
import { CLASSICAL_LIMIT, HINTS, QUANTUM_LIMIT, ROUNDS, angleFromTilt, longRunWin, playRound, questionList, stars as starsFor, winRate } from '../../core/games/entangledPair';
import type { Played } from '../../core/games/entangledPair';
import { LabSlider } from '../simulations/labKit';
import { pct } from '../simulations/labUtils';

const THEME = THEMES.pink;

type Phase = 'alice' | 'handover' | 'bob' | 'reveal';

/** A dial with a needle at the chosen measurement angle. */
const Dial: React.FC<{ angle: number; locked?: boolean; who: string }> = ({ angle, locked, who }) => {
  const a = (angle * Math.PI) / 180;
  return (
    <svg viewBox="-70 -70 140 140" width="160" height="160" style={{ alignSelf: 'center' }} role="img"
      aria-label={locked ? `${who}'s angle is locked` : `${who}'s measurement angle is ${angle} degrees`}>
      <circle r="60" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      <line x1="-60" y1="0" x2="60" y2="0" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
      <line x1="0" y1="-60" x2="0" y2="60" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
      {locked ? (
        <text y="8" fontSize="26" textAnchor="middle" fill="#fff">🔒</text>
      ) : (
        <>
          <line x1={-Math.cos(a) * 56} y1={Math.sin(a) * 56} x2={Math.cos(a) * 56} y2={-Math.sin(a) * 56} stroke={THEME.accent} strokeWidth="5" strokeLinecap="round" />
          <circle cx={Math.cos(a) * 56} cy={-Math.sin(a) * 56} r="6" fill="#fff" />
        </>
      )}
      <text x="0" y="-62" fontSize="9" fill="#ddd0fa" textAnchor="middle">0°</text>
    </svg>
  );
};

export const EntangledPair: React.FC = () => {
  const { completeGame } = useProgress();
  const [questions, setQuestions] = useState(() => questionList());
  const [rounds, setRounds] = useState<Played[]>([]);
  const [phase, setPhase] = useState<Phase>('alice');
  const [aliceAngle, setAliceAngle] = useState(0);
  const [lockedAlice, setLockedAlice] = useState<number | null>(null);
  const [bobAngle, setBobAngle] = useState(0);
  const [last, setLast] = useState<Played | null>(null);
  const [hints, setHints] = useState(0);
  const [finished, setFinished] = useState(false);
  const phaseRef = useRef<Phase>('alice');
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const roundIndex = rounds.length;
  const [x, y] = questions[Math.min(roundIndex, questions.length - 1)];

  // the tilt of the phone (left and right) is the angle whoever's turn it is; the sliders do the same without a sensor
  const { status, enable } = useOrientation((r) => {
    if (r.gamma === null) return;
    const angle = angleFromTilt(r.gamma);
    if (phaseRef.current === 'alice') setAliceAngle(angle);
    else if (phaseRef.current === 'bob') setBobAngle(angle);
  });
  const sensing = status === 'on';

  const lockAlice = () => {
    sound.playClick();
    setLockedAlice(aliceAngle);
    setPhase('handover');
  };
  const lockBob = () => {
    if (lockedAlice === null) return;
    const round = playRound(x, y, lockedAlice, bobAngle);
    sound.playClick();
    if (round.won) sound.playSuccess();
    setLast(round);
    setRounds((r) => [...r, round]);
    setPhase('reveal');
  };
  const next = () => {
    if (rounds.length >= ROUNDS) {
      setFinished(true);
      completeGame('entangled_pair', 'concept_entanglement');
      return;
    }
    setLockedAlice(null);
    setLast(null);
    setPhase('alice');
  };
  const restart = () => {
    setQuestions(questionList());
    setRounds([]);
    setPhase('alice');
    setLockedAlice(null);
    setLast(null);
    setHints(0);
    setFinished(false);
  };

  const longRun = useMemo(() => longRunWin(rounds), [rounds]);
  const rate = winRate(rounds);

  useActivityReport(
    finished
      ? { id: 'entangled_pair', status: 'finished', step: 'All rounds played', state: `Won ${rounds.filter((r) => r.won).length} of ${rounds.length} rounds. The strategy the angles add up to wins about ${pct(longRun, 0)} of the time in the long run.` }
      : {
          id: 'entangled_pair',
          status: 'playing',
          step: `Round ${Math.min(roundIndex + 1, ROUNDS)} of ${ROUNDS}, ${phase === 'alice' ? "Alice's turn" : phase === 'bob' ? "Bob's turn" : phase === 'handover' ? 'passing the phone' : 'result'}`,
          mission: 'Two players, one entangled pair, no talking. Each tilts the phone (or uses the slider) to choose an angle to measure at. They win when the two answers differ exactly when both questions were 1.',
          state:
            `Won ${rounds.filter((r) => r.won).length} of ${rounds.length} rounds so far. ${rounds.length >= 6 ? `The angles used so far add up to a strategy that wins about ${pct(longRun, 0)} of the time.` : ''} ` +
            `The best that answers decided beforehand can do is ${pct(CLASSICAL_LIMIT, 0)}.`,
          hint: HINTS[Math.max(0, Math.min(hints, HINTS.length) - 1)] ?? 'Play a few rounds first and watch how often you win with different angles.',
        },
  );

  if (finished) {
    const s = starsFor(longRun);
    return (
      <FinishPanel theme={THEME} title="PAIR MEASURED" total={s} levelCount={1}
        summary={`You won ${rounds.filter((r) => r.won).length} of ${ROUNDS} rounds (${pct(rate, 0)}). The angles you used add up to a strategy that wins about ${pct(longRun, 0)} of the time. No strategy decided beforehand can beat ${pct(CLASSICAL_LIMIT, 0)}; the quantum limit is about ${pct(QUANTUM_LIMIT, 0)}.`}
        honest="Analogy: the phone's tilt is an ordinary sensor that only picks a number. The entangled pair, the correlations and the answers are computed by the app's quantum engine, and the CHSH result is real physics (tested in real labs). Pass-the-phone is one device playing both sides, so it shows the statistics, not the 'no communication' part of the proof."
        onAgain={restart} />
    );
  }

  const need = phase === 'alice' ? 'Alice' : 'Bob';
  const angle = phase === 'alice' ? aliceAngle : bobAngle;
  const setAngle = phase === 'alice' ? setAliceAngle : setBobAngle;

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label={`ROUND ${Math.min(roundIndex + 1, ROUNDS)}/${ROUNDS}`} tag="Analogy"
        middle={<span style={{ fontFamily: RETRO, fontSize: '1.3rem', color: '#ffd23f' }}>{rounds.filter((r) => r.won).length} won</span>} />
      <GameTitle
        title="Entangled Pair"
        story="Two players share an entangled pair and may not talk. A referee gives each a question bit. They win when their two answers differ exactly when both questions were 1. Pass the phone, tilt to choose an angle, lock it in."
      />

      <div style={{ ...panelStyle, fontSize: '0.84rem', lineHeight: 1.45 }}>
        Your phone's tilt is a <b>classical sensor</b> that only picks an angle. The pair, the correlations and the answers are computed by the app's quantum engine.
      </div>

      {(phase === 'alice' || phase === 'bob') && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Eyebrow>{need.toUpperCase()}'S TURN</Eyebrow>
          <div style={{ fontFamily: PIXEL, fontSize: '0.8rem', lineHeight: 1.6 }}>
            {need}'s question: <span style={{ color: THEME.accent }}>{phase === 'alice' ? x : y}</span>
          </div>
          <Dial angle={angle} who={need} />
          <div style={{ textAlign: 'center', fontFamily: RETRO, fontSize: '1.8rem' }}>{angle}°</div>
          <div role="status" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{sensorMessage(status, 'tilt the phone left and right to choose the angle')}</div>
          {status === 'needs-tap' && <button className="btn btn-mint" onClick={() => void enable()}><span>Allow the motion sensor</span></button>}
          {!sensing && (
            <LabSlider label="MEASUREMENT ANGLE" value={angle} min={-90} max={90} step={1} accent={THEME.accent} display={`${angle}°`} onChange={setAngle} />
          )}
          <button className="btn btn-mint" onClick={phase === 'alice' ? lockAlice : lockBob}><span>Lock in {need}'s angle</span></button>
        </div>
      )}

      {phase === 'handover' && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
          <Dial angle={0} locked who="Alice" />
          <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>Alice's angle is locked and hidden. Pass the phone to Bob, who must not look at Alice's choice.</p>
          <button className="btn" onClick={() => { setBobAngle(0); setPhase('bob'); }}><span>I'm Bob</span></button>
        </div>
      )}

      {phase === 'reveal' && last && (
        <>
          <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.92rem', lineHeight: 1.5 }}>
            <Eyebrow>THE RESULT</Eyebrow>
            <div>Questions: Alice {last.x}, Bob {last.y}. Angles: Alice {last.alpha}°, Bob {last.beta}°.</div>
            <div>Answers: Alice <b>{last.a}</b>, Bob <b>{last.b}</b>. {last.a !== last.b ? 'They differ.' : 'They are the same.'} A win needs them to {last.x === 1 && last.y === 1 ? 'differ' : 'match'}.</div>
          </div>
          <Banner tone={last.won ? 'good' : 'bad'} title={last.won ? 'WON THIS ROUND' : 'LOST THIS ROUND'}>
            {last.won ? 'The answers did what the rule asked.' : 'The answers broke the rule this time. Each answer is random, and only the pattern over many rounds tells you whether your angles are good.'}
          </Banner>
          <button className="btn" onClick={next}><span>{rounds.length >= ROUNDS ? 'See the result' : 'Next round'}</span></button>
        </>
      )}

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Eyebrow>YOUR SCORE</Eyebrow>
        <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
          Won {rounds.filter((r) => r.won).length} of {rounds.length}{rounds.length ? ` (${pct(rate, 0)})` : ''}.
          {rounds.length >= 6 && <> The angles you have used so far add up to a strategy that wins about <b>{pct(longRun, 0)}</b> of the time.</>}
        </div>
        <div style={{ position: 'relative', height: 18, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }} aria-hidden="true">
          <div style={{ width: `${longRun * 100}%`, height: '100%', background: longRun > CLASSICAL_LIMIT ? '#2ee6a6' : THEME.accent, transition: 'width .3s' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${CLASSICAL_LIMIT * 100}%`, borderLeft: '3px dashed #fff' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${QUANTUM_LIMIT * 100}%`, borderLeft: '3px solid #ffd23f' }} />
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Dashed line: 75%, the most that answers decided beforehand can win. Gold line: about 85%, the most anyone can win.</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="chip" onClick={() => setHints((h) => Math.min(HINTS.length, h + 1))} disabled={hints >= HINTS.length} style={{ minHeight: 48 }}>
          <Lightbulb size={16} /> {hints === 0 ? 'Hint' : hints < HINTS.length ? 'Another hint' : 'No more hints'}
        </button>
        <button className="chip" onClick={restart} style={{ minHeight: 48 }}><RotateCcw size={16} /> Start over</button>
      </div>
      {hints > 0 && (
        <Banner tone="info">
          <Stars n={0} max={0} />
          {HINTS.slice(0, hints).map((h, i) => <div key={i} style={{ marginBottom: 4 }}>Hint {i + 1}: {h}</div>)}
          {hints === HINTS.length && <div style={{ fontSize: '0.8rem' }}>That last hint gives the angles away.</div>}
        </Banner>
      )}
    </ArcadeFrame>
  );
};
