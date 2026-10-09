import React, { useMemo, useState } from 'react';
import { Undo2, RotateCcw, Lightbulb, Star, ChevronRight, Send, BookOpen } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { PIXEL, RETRO, THEMES, panelStyle, rowChip, stageStyle } from '../shared/arcadeTheme';
import { BlochSphereVisualizer } from '../simulations/BlochSphereVisualizer';
import { sound } from '../../utils/audio';
import { RELAY_LEVELS, describeFix, relayHop, starRating } from '../../core/games/teleportRelay';
import type { FixGate, HopResult } from '../../core/games/teleportRelay';
import { messageVector } from '../../core/labs/teleport';
import type { Message } from '../../core/labs/teleport';

const THEME = THEMES.sky;

const toCoords = (m: Message) => {
  const [x, y, z] = messageVector(m);
  return { x, y, z, theta: m.theta, phi: m.phi };
};

const NODE_NAMES = ['Alice', 'Relay 1', 'Relay 2', 'Relay 3', 'Bob'];

export const TeleportRelay: React.FC = () => {
  const { completeGame } = useProgress();
  const [levelIdx, setLevelIdx] = useState(0);
  const [hop, setHop] = useState(0);
  const [current, setCurrent] = useState<Message>(RELAY_LEVELS[0].message);
  const [fix, setFix] = useState<FixGate[]>([]);
  const [attempt, setAttempt] = useState<HopResult | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState<Record<number, 1 | 2 | 3>>({});
  const [showHint, setShowHint] = useState(false);
  const [showRule, setShowRule] = useState(false);
  const [finished, setFinished] = useState(false);

  const level = RELAY_LEVELS[levelIdx];
  const hops = level.hops.length;
  const levelDone = hop >= hops;
  const bits = level.hops[Math.min(hop, hops - 1)];
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const earned = levelDone ? starRating(mistakes) : 0;
  const shown = attempt ? attempt.next : current;
  const names = useMemo(() => {
    const mid = NODE_NAMES.slice(1, 4).slice(0, hops - 1);
    return ['Alice', ...mid, 'Bob'];
  }, [hops]);

  const addGate = (g: FixGate) => {
    if (attempt || fix.length >= 3) return;
    sound.playGate();
    setFix([...fix, g]);
  };

  const send = () => {
    const result = relayHop(current, bits, fix);
    setAttempt(result);
    if (result.correct) {
      sound.playSuccess();
    } else {
      sound.playAlarm();
      setMistakes((m) => m + 1);
    }
  };

  const retry = () => { sound.playClick(); setFix([]); setAttempt(null); };

  /** Moves the qubit on to the next repeater once a hop has been fixed correctly. */
  const afterCorrect = () => {
    if (!attempt?.correct) return;
    sound.playClick();
    const nextHop = hop + 1;
    setCurrent(attempt.next);
    setHop(nextHop);
    setFix([]);
    setAttempt(null);
    if (nextHop >= hops) setStars((s) => ({ ...s, [level.id]: Math.max(s[level.id] ?? 0, starRating(mistakes)) as 1 | 2 | 3 }));
  };

  const loadLevel = (idx: number) => {
    setLevelIdx(idx);
    setHop(0);
    setCurrent(RELAY_LEVELS[idx].message);
    setFix([]);
    setAttempt(null);
    setMistakes(0);
    setShowHint(false);
    setShowRule(false);
  };

  const nextLevel = () => {
    sound.playClick();
    if (levelIdx + 1 >= RELAY_LEVELS.length) {
      setFinished(true);
      completeGame('teleport_relay', 'concept_teleportation');
    } else {
      loadLevel(levelIdx + 1);
    }
  };

  const restartAll = () => { setStars({}); setFinished(false); loadLevel(0); };

  // what the AI tutor is told if the learner asks about this game: the screen, never the solution
  useActivityReport(
    finished
      ? { id: 'teleport_relay', status: 'finished', step: `All ${RELAY_LEVELS.length} levels delivered`, state: `Stars earned: ${totalStars} of ${RELAY_LEVELS.length * 3}.` }
      : {
          id: 'teleport_relay',
          status: 'playing',
          step: `Level ${level.id} of ${RELAY_LEVELS.length}: ${level.title}${levelDone ? ' (message delivered)' : `, hop ${hop + 1} of ${hops}`}`,
          mission: level.story,
          state: levelDone
            ? `Message delivered with ${mistakes} wrong ${mistakes === 1 ? 'try' : 'tries'}.`
            : `The sender's two bits are ${bits[0]}${bits[1]}. Fix gates chosen so far: ${describeFix(fix)}. Gates on offer: ${level.allowed.join(', ')}. ` +
              `${attempt ? (attempt.correct ? 'The last send matched the message.' : `The last send matched the message only ${Math.round(attempt.fidelity * 100)}% (50% is a coin flip).`) : 'Nothing sent yet on this hop.'} ` +
              `Wrong tries on this level: ${mistakes}.`,
          hint: level.hint,
        },
  );

  if (finished) {
    return (
      <ArcadeFrame theme={THEME}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: '2.6rem' }}>📡</div>
          <h2 style={{ fontFamily: PIXEL, fontSize: '0.9rem', color: THEME.accent, lineHeight: 1.6 }}>RELAY COMPLETE!</h2>
          <div style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>★ {totalStars} / {RELAY_LEVELS.length * 3}</div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            Each hop used up a Bell pair and sent only <b style={{ color: '#fff' }}>two ordinary bits</b>. The qubit itself never travelled, and the sender kept no copy. Chains of hops like this are the idea behind a quantum internet.
          </p>
          <button className="btn btn-sky" onClick={restartAll}><RotateCcw size={18} /> <span>Run the relay again</span></button>
        </div>
      </ArcadeFrame>
    );
  }

  const justCorrect = attempt?.correct === true;

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label={`LEVEL ${level.id}/${RELAY_LEVELS.length}`} tag="Accurate"
        middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>★ {totalStars}</span>} />

      <GameTitle title={level.title} story={level.story} />

      {/* the chain */}
      <div role="img" aria-label={`Relay: ${names.join(' to ')}. Hop ${Math.min(hop + 1, hops)} of ${hops}.`}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {names.map((name, i) => {
          const here = i === Math.min(hop, hops);
          const passed = i < hop;
          return (
            <React.Fragment key={name}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: here ? THEME.accent : passed ? 'rgba(56,200,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: here ? '#2a0f5c' : '#fff', fontFamily: PIXEL, fontSize: '0.7rem',
                  boxShadow: here ? `0 3px 0 ${THEME.edge}` : 'none',
                }}>{here ? '📡' : passed ? '✓' : i + 1}</div>
                <span style={{ fontSize: '0.64rem', fontWeight: 700, color: here ? '#fff' : 'var(--text-secondary)' }}>{name}</span>
              </div>
              {i < names.length - 1 && <div style={{ flex: 1, height: 4, borderRadius: 2, marginBottom: 16, background: i < hop ? THEME.accent : 'rgba(255,255,255,0.15)' }} />}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ ...stageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 12px' }}>
        <BlochSphereVisualizer coordinates={toCoords(shown)} targetCoordinates={toCoords(level.message)} size={230} showReadout={false} />
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', padding: '0 10px' }}>
          Red arrow = the qubit at {levelDone ? names[hops] : names[hop + 1]} · Ghost marker = the original message
        </div>
      </div>

      {!levelDone && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow color="#ffd23f">HOP {hop + 1} OF {hops}: {names[hop].toUpperCase()} → {names[hop + 1].toUpperCase()}</Eyebrow>
          <div style={{ fontSize: '0.84rem', color: '#f1eaff' }}>
            A new Bell pair links them. {names[hop]} measures and reads two bits:
          </div>
          <div style={{ fontFamily: RETRO, fontSize: '2.4rem', color: '#ffd23f', lineHeight: 1 }} aria-label={`Alice's bits: ${bits[0]} and ${bits[1]}`}>
            {bits[0]}{bits[1]}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#f1eaff' }}>
            {names[hop]}'s copy is destroyed by the measurement. Fix {names[hop + 1]}'s qubit:
          </div>
        </div>
      )}

      {!levelDone && (
        <>
          <div style={{ display: 'flex', gap: 6, minHeight: 44, flexWrap: 'wrap', alignItems: 'center' }} aria-label="Fix so far">
            {fix.length === 0 && <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>No gates yet. Sending now means "no fix".</span>}
            {fix.map((g, i) => (
              <span key={i} style={{ fontFamily: PIXEL, fontSize: '0.7rem', padding: '10px 12px', borderRadius: 10, background: 'rgba(56,200,255,0.2)', border: `2px solid ${THEME.accent}` }}>{g}</span>
            ))}
          </div>

          {!attempt && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${level.allowed.length}, 1fr)`, gap: 8 }}>
                {level.allowed.map((g) => (
                  <button key={g} className="btn btn-sky" onClick={() => addGate(g)} disabled={fix.length >= 3}
                    aria-label={`Add ${g} gate to the fix`} style={{ minHeight: 56, opacity: fix.length >= 3 ? 0.5 : 1 }}>{g}</button>
                ))}
              </div>
              <button className="btn" onClick={send}><Send size={18} /> <span>Send it on</span></button>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="chip" onClick={() => setFix(fix.slice(0, -1))} disabled={fix.length === 0} style={{ ...rowChip, opacity: fix.length ? 1 : 0.5 }}>
                  <Undo2 size={16} /> Undo
                </button>
                <button className="chip" onClick={() => setShowRule((v) => !v)} aria-expanded={showRule} style={rowChip}>
                  <BookOpen size={16} /> Rule
                </button>
                <button className="chip" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint} style={rowChip}>
                  <Lightbulb size={16} /> Hint
                </button>
              </div>
              {showHint && <Banner tone="warn">💡 {level.hint}</Banner>}
              {showRule && (
                <Banner tone="info" title="THE RULE (A SPOILER)">
                  <div style={{ fontFamily: RETRO, fontSize: '1.2rem', lineHeight: 1.5 }}>
                    00 → nothing<br />01 → X<br />10 → Z<br />11 → X, then Z
                  </div>
                </Banner>
              )}
            </>
          )}

          {attempt && !attempt.correct && (
            <Banner tone="bad" title="NOT THE MESSAGE">
              After {describeFix(fix)} the qubit matches the original only {Math.round(attempt.fidelity * 100)}% (50% is a coin flip). The red arrow shows what {names[hop + 1]} really has.
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-pink" onClick={retry}><RotateCcw size={18} /> <span>Try again</span></button>
              </div>
            </Banner>
          )}
          {justCorrect && (
            <Banner tone="good" title="HOP COMPLETE!" center>
              <div style={{ marginBottom: 10 }}>The qubit has arrived intact: the red arrow sits on the ghost.</div>
              <button className="btn btn-mint" onClick={afterCorrect}><span>{hop + 1 >= hops ? 'Deliver' : 'Next hop'}</span><ChevronRight size={18} /></button>
            </Banner>
          )}
        </>
      )}

      {levelDone && (
        <Banner tone="good" title="MESSAGE DELIVERED!" center>
          <div aria-label={`${earned} of 3 stars`} style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {[1, 2, 3].map((n) => <Star key={n} size={28} color="#ffd23f" fill={n <= earned ? '#ffd23f' : 'none'} />)}
          </div>
          <div style={{ marginBottom: 10 }}>
            {mistakes === 0 ? 'Every hop right the first time!' : `Delivered with ${mistakes} wrong ${mistakes === 1 ? 'try' : 'tries'}.`}
          </div>
          <button className="btn btn-mint" onClick={nextLevel}>
            <span>{levelIdx + 1 >= RELAY_LEVELS.length ? 'Finish' : 'Next level'}</span>
            <ChevronRight size={18} />
          </button>
        </Banner>
      )}

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        No timer. Wrong tries only cost stars. Bits are fixed so every level plays the same way each time; the lab lets you try random outcomes.
      </div>
    </ArcadeFrame>
  );
};
