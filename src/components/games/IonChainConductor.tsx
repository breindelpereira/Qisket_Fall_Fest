import React, { useState } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner, Eyebrow } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle, stageStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, NextButton } from '../shared/LevelKit';
import { starWords, useLevelRun } from '../shared/levelRun';
import type { StarCount } from '../shared/levelRun';
import { sound } from '../../utils/audio';
import { LEVELS, finished, initial, move, moveProblem, occupancy, par, stars as starsFor } from '../../core/games/ionChain';
import type { IonLevel, IonState } from '../../core/games/ionChain';

const THEME = THEMES.mint;
const LETTERS = 'ABCDEFGHIJ';

const Level: React.FC<{
  level: IonLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const parMoves = par(level) ?? 0;
  const [history, setHistory] = useState<IonState[]>([initial(level)]);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [earned, setEarned] = useState<StarCount | null>(null);
  const state = history[history.length - 1];
  const moves = history.length - 1;
  const counts = occupancy(level, state.assign);

  const place = (trap: number) => {
    if (earned !== null || selected === null) return;
    const problem = moveProblem(level, state, selected, trap);
    if (problem) {
      setMessage(problem);
      sound.playAlarm();
      return;
    }
    const after = move(level, state, selected, trap)!;
    sound.playClick();
    setHistory((h) => [...h, after]);
    setSelected(null);
    setMessage(null);
    if (finished(level, after)) {
      const s = starsFor(parMoves, moves + 1) as StarCount;
      setEarned(s);
      onClear(s);
      sound.playSuccess();
    }
  };

  const restart = () => {
    setHistory([initial(level)]);
    setSelected(null);
    setMessage(null);
  };

  useActivityReport({
    id: 'ion_chain_conductor',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: 'Run every gate in the list, in order, using as few shuttle moves as you can.',
    state:
      `Traps hold: ${Array.from({ length: level.traps }, (_, t) => `trap ${t + 1}: ${state.assign.flatMap((a, i) => (a === t ? [LETTERS[i]] : [])).join(' ') || 'empty'}`).join('; ')}. ` +
      `Gates done: ${state.done} of ${level.gates.length}. Moves used: ${moves}.${earned !== null ? ' Finished.' : ''}`,
    hint: 'Look at the next gate that has not run, and ask which single ion would have to move to meet its partner. Mind which traps are full.',
  });

  return (
    <>
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Eyebrow>GATES, IN ORDER</Eyebrow>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {level.gates.map(([a, b], i) => (
            <li key={i} style={{
              padding: '6px 10px', borderRadius: 10, fontWeight: 800, fontSize: '0.85rem',
              background: i < state.done ? 'rgba(46,230,166,0.2)' : i === state.done ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
              border: `2px ${i === state.done ? 'solid' : 'dashed'} rgba(255,255,255,0.3)`,
            }}>
              {i < state.done ? '✓ ' : i === state.done ? '▶ ' : ''}{LETTERS[a]}–{LETTERS[b]}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ ...stageStyle, padding: 10, display: 'grid', gridTemplateColumns: `repeat(${level.traps}, minmax(0, 1fr))`, gap: 8 }}>
        {Array.from({ length: level.traps }, (_, t) => (
          <div
            key={t}
            role="group"
            aria-label={`Trap ${t + 1}, holds ${counts[t]} of ${level.capacity}`}
            style={{
              borderRadius: 14, padding: 8, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch',
              background: 'rgba(0,0,0,0.3)', border: `2px solid ${selected !== null ? THEME.accent : 'rgba(255,255,255,0.2)'}`,
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>TRAP {t + 1} · {counts[t]}/{level.capacity}</span>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', alignContent: 'center', minHeight: 56, flex: 1 }}>
              {state.assign.map((a, i) => (a === t ? (
                <button
                  key={i}
                  aria-pressed={selected === i}
                  aria-label={`Ion ${LETTERS[i]}${selected === i ? ', selected' : ''}`}
                  disabled={earned !== null}
                  onClick={() => { setSelected(selected === i ? null : i); setMessage(null); }}
                  style={{
                    width: 48, height: 48, borderRadius: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: RETRO, fontSize: '1.4rem', color: '#1d0848',
                    background: selected === i ? '#fff' : THEME.accent, border: `3px solid ${selected === i ? '#ffd23f' : THEME.edge}`,
                    boxShadow: selected === i ? '0 0 0 3px rgba(255,210,63,0.5)' : 'none',
                  }}
                >
                  {LETTERS[i]}
                </button>
              ) : null))}
            </span>
            <button className="chip" disabled={selected === null || earned !== null} onClick={() => place(t)} aria-label={`Move the selected ion to trap ${t + 1}`}
              style={{ minHeight: 48, justifyContent: 'center', fontSize: '0.55rem' }}>
              Move here
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, fontFamily: RETRO, fontSize: '1.3rem' }}>Moves {moves} · Par {parMoves}</div>
        <button className="chip" disabled={history.length < 2 || earned !== null} onClick={() => { setHistory((h) => h.slice(0, -1)); setSelected(null); setMessage(null); }} style={{ minHeight: 48 }}>
          <Undo2 size={16} /> Undo
        </button>
        <button className="chip" disabled={earned !== null} onClick={restart} style={{ minHeight: 48 }}><RotateCcw size={16} /> Restart</button>
      </div>

      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }} role="status">
        {selected !== null ? `Ion ${LETTERS[selected]} is selected. Tap a trap to shuttle it there.` : 'Tap an ion to pick it up, then tap the trap to move it to.'}
      </div>
      {message && <Banner tone="warn">{message}</Banner>}

      {earned !== null && (
        <>
          <Banner tone="good" title="ALL GATES RUN!">
            {starWords(earned)} {moves} move{moves === 1 ? '' : 's'} against a par of {parMoves}. Inside a trap every ion talks to every other, so only the shuttling cost anything.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const IonChainConductor: React.FC = () => {
  const r = useLevelRun('ion_chain_conductor', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="CHAIN CONDUCTED" total={r.total} levelCount={LEVELS.length}
        summary="You ran lists of gates across several traps with as few shuttles as possible, and learned that planning the order of moves is the whole game."
        honest="Real ion machines also have special gate zones, cooling steps and ordering inside each chain, and shuttling heats the ions. This game keeps only the central idea: all-to-all connectivity within a trap, and a price for moving between traps."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="ZONE" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
