import React, { useMemo, useState } from 'react';
import { RotateCcw, Play, ChevronRight, Minus, Plus, Check, X as XIcon } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { sound } from '../../utils/audio';
import {
  QUESTION_PAIRS, classicalWinsPerPair, classicalWinProbability, quantumWinProbabilityPerPair, quantumWinProbability,
  playClassicalRound, playQuantumRound, CLASSICAL_LIMIT, QUANTUM_LIMIT,
} from '../../core/games/chsh';
import type { Bit, ClassicalStrategy, QuantumStrategy, RoundResult } from '../../core/games/chsh';

const ACCENT = '#ff5c8a';
const EDGE = '#c42e5c';
const PIXEL = "'Press Start 2P', monospace";
const ESCAPE_TARGET = 0.8;
const STEP_DEG = 22.5;
const ROUNDS = 100;

const pct = (p: number) => `${(p * 100).toFixed(1)}%`;
const toRad = (deg: number) => (deg * Math.PI) / 180;

type Stage = 'intro' | 'classical' | 'quantum' | 'done';

export const AliceAndBob: React.FC = () => {
  const { completeGame } = useProgress();
  const [stage, setStage] = useState<Stage>('intro');

  // Classical: answers to question 0 / 1
  const [classical, setClassical] = useState<ClassicalStrategy>({ alice: [0, 0], bob: [0, 0] });
  const [toggleCount, setToggleCount] = useState(0);
  // Unlock part 2 after the player has really explored; the default plan already wins 3 of 4
  const triedPerfect = toggleCount >= 4;
  // Quantum: measurement angles in degrees
  const [angles, setAngles] = useState({ a0: 0, a1: 0, b0: 0, b1: 0 });

  const [runs, setRuns] = useState<RoundResult[]>([]);

  const quantum: QuantumStrategy = useMemo(
    () => ({ alice: [toRad(angles.a0), toRad(angles.a1)], bob: [toRad(angles.b0), toRad(angles.b1)] }),
    [angles],
  );
  const perPairQ = useMemo(() => quantumWinProbabilityPerPair(quantum), [quantum]);
  const avgQ = useMemo(() => quantumWinProbability(quantum), [quantum]);
  const perPairC = classicalWinsPerPair(classical);
  const avgC = classicalWinProbability(classical);

  const toggleAnswer = (who: 'alice' | 'bob', q: 0 | 1) => {
    sound.playClick();
    setClassical((c) => {
      const arr = [...c[who]] as [Bit, Bit];
      arr[q] = (arr[q] ^ 1) as Bit;
      return { ...c, [who]: arr };
    });
    setToggleCount((n) => n + 1);
    setRuns([]);
  };

  const step = (key: keyof typeof angles, dir: 1 | -1) => {
    sound.playGate();
    setAngles((a) => ({ ...a, [key]: Math.max(-90, Math.min(90, a[key] + dir * STEP_DEG)) }));
    setRuns([]);
  };

  const run = (mode: 'classical' | 'quantum') => {
    sound.playLaser();
    const out: RoundResult[] = [];
    for (let i = 0; i < ROUNDS; i++) out.push(mode === 'classical' ? playClassicalRound(classical) : playQuantumRound(quantum));
    setRuns(out);
  };

  const winRate = runs.length ? runs.filter((r) => r.won).length / runs.length : null;
  const escaped = avgQ >= ESCAPE_TARGET;

  const frame: React.CSSProperties = {
    background: '#1d0848',
    border: `3px solid ${ACCENT}`,
    borderRadius: 20,
    padding: 16,
    boxShadow: `0 6px 0 ${EDGE}, 0 0 30px rgba(255, 92, 138, 0.25)`,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };

  const header = (label: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: PIXEL, fontSize: '0.58rem', color: ACCENT }}>{label}</span>
      <HonestyTagBadge tag="Simplified model" />
    </div>
  );

  const pairTable = (wonList: boolean[], perPair?: number[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }} role="table" aria-label="Win or lose for each pair of questions">
      {QUESTION_PAIRS.map(([x, y], i) => {
        const ok = perPair ? perPair[i] >= 0.5 : wonList[i];
        return (
          <div key={i} role="cell" style={{
            textAlign: 'center', padding: '8px 2px', borderRadius: 12,
            background: ok ? 'rgba(46,230,166,0.15)' : 'rgba(255,92,138,0.15)',
            border: `2px solid ${ok ? '#2ee6a6' : '#ff5c8a'}`,
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>A:{x} B:{y}</div>
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
              {ok ? <Check size={16} color="#2ee6a6" /> : <XIcon size={16} color="#ff5c8a" />}
            </div>
            {perPair && <div style={{ fontFamily: "'VT323', monospace", fontSize: '1.15rem' }}>{Math.round(perPair[i] * 100)}%</div>}
          </div>
        );
      })}
    </div>
  );

  const bitToggle = (who: 'alice' | 'bob', q: 0 | 1) => (
    <button key={`${who}${q}`} className="btn btn-pink" onClick={() => toggleAnswer(who, q)}
      aria-label={`${who === 'alice' ? 'Alice' : 'Bob'} answers ${classical[who][q]} to question ${q}. Tap to flip.`}
      style={{ minHeight: 56, flexDirection: 'column', gap: 2, padding: '6px 4px' }}>
      <span style={{ fontSize: '0.5rem' }}>IF ASKED {q}</span>
      <span style={{ fontSize: '1rem' }}>SAY {classical[who][q]}</span>
    </button>
  );

  const angleRow = (label: string, key: keyof typeof angles) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '6px 8px' }}>
      <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="chip" aria-label={`Decrease ${label}`} onClick={() => step(key, -1)} style={{ padding: 0, width: 44, justifyContent: 'center' }}><Minus size={18} /></button>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', minWidth: 62, textAlign: 'center' }}>{angles[key].toFixed(1)}°</span>
        <button className="chip" aria-label={`Increase ${label}`} onClick={() => step(key, 1)} style={{ padding: 0, width: 44, justifyContent: 'center' }}><Plus size={18} /></button>
      </div>
    </div>
  );

  if (stage === 'intro') {
    return (
      <div style={frame}>
        {header("ALICE & BOB")}
        <h2 style={{ fontFamily: PIXEL, fontSize: '0.78rem', lineHeight: 1.6 }}>Escape Together</h2>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', fontSize: '2.4rem' }} aria-hidden="true">🧑‍🚀 <span style={{ fontSize: '1.4rem', alignSelf: 'center' }}>⛓️</span> 👩‍🚀</div>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          Alice and Bob are locked in separate cells and cannot talk. A guard asks each one a question: <b style={{ color: '#fff' }}>0 or 1</b>.
          They each shout back an answer, <b style={{ color: '#fff' }}>0 or 1</b>.
        </p>
        <div style={{ background: 'rgba(255,210,63,0.12)', border: '2px solid #ffd23f', borderRadius: 14, padding: 12, fontSize: '0.9rem', lineHeight: 1.5 }}>
          <b>The door opens when:</b><br />
          Alice's answer and Bob's answer are <b>different</b> only if BOTH were asked <b>1</b>. Otherwise they must be the <b>same</b>.
        </div>
        <button className="btn btn-pink" onClick={() => { sound.playClick(); setStage('classical'); }}>
          <Play size={18} fill="currentColor" /> <span>Start</span>
        </button>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div style={{ ...frame, textAlign: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '2.6rem' }}>🚪✨</div>
        <h2 style={{ fontFamily: PIXEL, fontSize: '0.85rem', color: ACCENT, lineHeight: 1.6 }}>ESCAPED TOGETHER!</h2>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: '2rem', color: '#ffd23f' }}>{pct(avgQ)} win chance</div>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          No strategy using only shared plans can beat <b style={{ color: '#fff' }}>75%</b>. Sharing an entangled pair let you reach about
          <b style={{ color: '#fff' }}> 85%</b> without sending any message. This is a <b style={{ color: '#fff' }}>Bell test</b>: the correlations
          are stronger than any classical explanation allows. It still cannot be used to send messages faster than light.
        </p>
        <button className="btn btn-pink" onClick={() => { setStage('intro'); setRuns([]); setToggleCount(0); setClassical({ alice: [0, 0], bob: [0, 0] }); setAngles({ a0: 0, a1: 0, b0: 0, b1: 0 }); }}>
          <RotateCcw size={18} /> <span>Play again</span>
        </button>
      </div>
    );
  }

  if (stage === 'classical') {
    return (
      <div style={frame}>
        {header("PART 1 · NO ENTANGLEMENT")}
        <h2 style={{ fontFamily: PIXEL, fontSize: '0.78rem', lineHeight: 1.6 }}>Plan a classical strategy</h2>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
          Agree on answers in advance. Then try to win all four question pairs. Tap a button to flip an answer.
        </p>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>🧑‍🚀 Alice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{bitToggle('alice', 0)}{bitToggle('alice', 1)}</div>
        </div>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>👩‍🚀 Bob</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{bitToggle('bob', 0)}{bitToggle('bob', 1)}</div>
        </div>

        {pairTable(perPairC)}
        <div style={{ textAlign: 'center', fontFamily: "'VT323', monospace", fontSize: '1.6rem', color: '#ffd23f' }}>
          Wins {perPairC.filter(Boolean).length} of 4 · {pct(avgC)}
        </div>

        <button className="btn btn-pink" onClick={() => run('classical')}>
          <Play size={18} fill="currentColor" /> <span>Run {ROUNDS} rounds</span>
        </button>
        {winRate !== null && (
          <div role="status" style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Won {Math.round(winRate * ROUNDS)} of {ROUNDS} ({pct(winRate)}) with random questions.
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 12, fontSize: '0.88rem', lineHeight: 1.45 }}>
          {triedPerfect
            ? <>You can win <b>3 of 4</b> but never all 4. We checked all 16 possible plans: <b>75% is the classical limit</b>.</>
            : <>Can you win all four? Flip at least four answers to find out.</>}
        </div>

        <button className="btn btn-pink" disabled={!triedPerfect} onClick={() => { sound.playSuccess(); setRuns([]); setStage('quantum'); }}
          style={{ opacity: triedPerfect ? 1 : 0.5 }}>
          <span>Share an entangled pair</span> <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  // quantum stage
  return (
    <div style={frame}>
      {header("PART 2 · ENTANGLED")}
      <h2 style={{ fontFamily: PIXEL, fontSize: '0.78rem', lineHeight: 1.6 }}>Measure the shared pair</h2>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
        Each of you holds one half of an entangled pair. When asked, you measure your half at an angle that depends on your question, and say the result.
        Tune the angles to win at least <b style={{ color: '#fff' }}>{pct(ESCAPE_TARGET)}</b> of the time.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {angleRow('Alice, asked 0', 'a0')}
        {angleRow('Alice, asked 1', 'a1')}
        {angleRow('Bob, asked 0', 'b0')}
        {angleRow('Bob, asked 1', 'b1')}
      </div>

      {pairTable([], perPairQ)}
      <div style={{ textAlign: 'center', fontFamily: "'VT323', monospace", fontSize: '1.8rem', color: escaped ? '#2ee6a6' : '#ffd23f' }}
        aria-live="polite">
        Win chance {pct(avgQ)}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Classical limit {pct(CLASSICAL_LIMIT)} · Quantum limit {pct(QUANTUM_LIMIT)}
      </div>

      <button className="btn btn-pink" onClick={() => run('quantum')}>
        <Play size={18} fill="currentColor" /> <span>Run {ROUNDS} rounds</span>
      </button>
      {winRate !== null && (
        <div role="status" style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Won {Math.round(winRate * ROUNDS)} of {ROUNDS} ({pct(winRate)}). Luck makes this wobble around the true chance.
        </div>
      )}

      {escaped ? (
        <button className="btn btn-mint" onClick={() => { sound.playSuccess(); completeGame('alice_and_bob', 'concept_entanglement'); setStage('done'); }}>
          <span>Open the door</span> <ChevronRight size={18} />
        </button>
      ) : (
        <div style={{ background: 'rgba(255,210,63,0.12)', border: '2px solid #ffd23f', borderRadius: 14, padding: 12, fontSize: '0.88rem', lineHeight: 1.45 }}>
          💡 Hint: Alice's two angles should be {STEP_DEG * 2}° apart. Bob's should sit halfway, one on each side. Try Alice 0° and 45°, Bob 22.5° and −22.5°.
        </div>
      )}

      <button className="chip" style={{ alignSelf: 'flex-start' }} onClick={() => { setRuns([]); setStage('classical'); }}>
        <RotateCcw size={16} /> Back to part 1
      </button>
    </div>
  );
};
