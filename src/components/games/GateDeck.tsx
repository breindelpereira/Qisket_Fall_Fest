import React, { useMemo, useState } from 'react';
import { Undo2, RotateCcw, Lightbulb, Star, ChevronRight, Check, X as XIcon } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { PIXEL, RETRO, THEMES, panelStyle, rowChip, stageStyle } from '../shared/arcadeTheme';
import { sound } from '../../utils/audio';
import { LEVELS, cardLabel, checkInputs, handItems, isSolved, parFor, starRating } from '../../core/games/gateDeck';
import type { Placed } from '../../core/labs/circuitBuilder';

const THEME = THEMES.violet;
const CELL = 34;

const symbol = (p: Placed, wire: number): string => (p.kind === 'gate' ? (p.qubit === wire ? p.gate : '') : p.control === wire ? '●' : p.target === wire ? '⊕' : '');

/** A small picture of the circuit built so far: one row per qubit, one column per card. */
const CircuitPreview: React.FC<{ qubits: number; items: Placed[] }> = ({ qubits, items }) => (
  <div role="img" aria-label={items.length ? `Circuit: ${items.map(cardLabel).join(', then ')}` : 'Empty circuit'}
    style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowX: 'auto', minHeight: qubits * (CELL + 4) }}>
    {Array.from({ length: qubits }, (_, wire) => (
      <div key={wire} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontFamily: RETRO, fontSize: '1.2rem', width: 26, color: 'var(--text-secondary)' }}>q{wire}</span>
        {items.length === 0 && <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.2)' }} />}
        {items.map((p, i) => {
          const s = symbol(p, wire);
          const crossed = p.kind === 'cnot' && !s && wire > Math.min(p.control, p.target) && wire < Math.max(p.control, p.target);
          return (
            <div key={i} style={{
              width: CELL, height: CELL, flex: '0 0 auto', borderRadius: 8, fontFamily: RETRO, fontSize: '1.3rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: s ? THEME.accent : 'rgba(255,255,255,0.06)', color: s ? '#fff' : 'var(--text-secondary)',
              border: `2px ${s ? 'solid' : 'dashed'} ${s ? THEME.edge : 'rgba(255,255,255,0.2)'}`,
            }}>{s || (crossed ? '│' : '')}</div>
          );
        })}
      </div>
    ))}
  </div>
);

export const GateDeck: React.FC = () => {
  const { completeGame } = useProgress();
  const [levelIdx, setLevelIdx] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [stars, setStars] = useState<Record<number, 1 | 2 | 3>>({});
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);

  const level = LEVELS[levelIdx];
  const par = useMemo(() => parFor(level), [level]);
  const items = handItems(level, picks);
  const solved = isSolved(level, picks);
  const earned = solved ? starRating(picks.length, par) : 0;
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const checks = useMemo(() => (picks.length ? checkInputs(level, picks) : []), [level, picks]);

  const play = (i: number) => {
    if (solved || picks.includes(i)) return;
    sound.playGate();
    const next = [...picks, i];
    setPicks(next);
    if (isSolved(level, next)) {
      sound.playSuccess();
      const r = starRating(next.length, par);
      setStars((s) => ({ ...s, [level.id]: Math.max(s[level.id] ?? 0, r) as 1 | 2 | 3 }));
    }
  };

  const undo = () => { if (!solved && picks.length) { sound.playClick(); setPicks(picks.slice(0, -1)); } };
  const reset = () => { sound.playClick(); setPicks([]); };

  const next = () => {
    sound.playClick();
    setPicks([]);
    setShowHint(false);
    if (levelIdx + 1 >= LEVELS.length) {
      setFinished(true);
      completeGame('gate_deck', 'concept_gates');
    } else {
      setLevelIdx(levelIdx + 1);
    }
  };

  const restartAll = () => { setLevelIdx(0); setPicks([]); setStars({}); setFinished(false); setShowHint(false); };

  // what the AI tutor is told if the learner asks about this game: the screen, never the solution
  useActivityReport(
    finished
      ? { id: 'gate_deck', status: 'finished', step: `All ${LEVELS.length} levels built`, state: `Stars earned: ${totalStars} of ${LEVELS.length * 3}.` }
      : {
          id: 'gate_deck',
          status: 'playing',
          step: `Level ${level.id} of ${LEVELS.length}: ${level.title}`,
          mission: `${level.story} The gate to build: ${level.targetName}.`,
          state:
            `Hand: ${level.hand.map(cardLabel).join(', ')}. Played so far, in order: ${items.length ? items.map(cardLabel).join(', then ') : 'nothing'}. ` +
            `${checks.length ? `Test inputs matching the target: ${checks.filter((c) => c.ok).length} of ${checks.length}.` : ''}` +
            `${solved ? ` Gate built with ${picks.length} cards, ${earned} of 3 stars (the shortest recipe uses ${par}).` : ''}`,
          hint: level.hint,
        },
  );

  if (finished) {
    return (
      <ArcadeFrame theme={THEME}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: '2.6rem' }}>🃏</div>
          <h2 style={{ fontFamily: PIXEL, fontSize: '0.9rem', color: THEME.accent, lineHeight: 1.6 }}>DECK MASTERED!</h2>
          <div style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>★ {totalStars} / {LEVELS.length * 3}</div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            You built gates out of other gates. That is how real quantum computers work: hardware offers a few <b style={{ color: '#fff' }}>native gates</b> and everything else, from Z to SWAP, is a recipe built from them. Changing your point of view with H turns bit flips into phase flips, and the other way round.
          </p>
          <button className="btn btn-violet" onClick={restartAll}><RotateCcw size={18} /> <span>Shuffle again</span></button>
        </div>
      </ArcadeFrame>
    );
  }

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label={`LEVEL ${level.id}/${LEVELS.length}`} tag="Accurate"
        middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>★ {totalStars}</span>} />

      <GameTitle title={level.title} story={level.story} />

      <Banner tone="info" title="BUILD THIS GATE">
        <span style={{ fontFamily: RETRO, fontSize: '1.4rem' }}>{level.targetName}</span>
      </Banner>

      <div style={{ ...stageStyle, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>YOUR CIRCUIT (LEFT TO RIGHT)</Eyebrow>
        <CircuitPreview qubits={level.qubits} items={items} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: PIXEL, fontSize: '0.55rem' }}>CARDS {picks.length}</span>
          <span style={{ fontFamily: PIXEL, fontSize: '0.55rem', color: '#ffd23f' }}>PAR {par}</span>
        </div>
      </div>

      {checks.length > 0 && (
        <div style={panelStyle}>
          <Eyebrow>DOES IT ACT LIKE THE TARGET ON EACH TEST INPUT?</Eyebrow>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {checks.map((c) => (
              <span key={c.label} role="img" aria-label={`Input ${c.label}: ${c.ok ? 'matches the target' : 'does not match the target'}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: RETRO, fontSize: '1.1rem', padding: '2px 8px', borderRadius: 8,
                background: c.ok ? 'rgba(46,230,166,0.18)' : 'rgba(255,92,138,0.18)',
                border: `2px ${c.ok ? 'solid' : 'dashed'} ${c.ok ? '#2ee6a6' : '#ff5c8a'}`,
              }}>
                {c.ok ? <Check size={14} color="#2ee6a6" /> : <XIcon size={14} color="#ff5c8a" />}
                {c.label}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            A gate is defined by what it does to every input. When every test input matches, your circuit is the target.
          </div>
        </div>
      )}

      {solved && (
        <Banner tone="good" title="GATE BUILT!" center>
          <div aria-label={`${earned} of 3 stars`} style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {[1, 2, 3].map((n) => <Star key={n} size={28} color="#ffd23f" fill={n <= earned ? '#ffd23f' : 'none'} />)}
          </div>
          <div style={{ marginBottom: 10 }}>
            {earned === 3 ? 'The shortest recipe!' : `Built with ${picks.length} cards. The shortest recipe uses ${par}.`}
          </div>
          <button className="btn btn-mint" onClick={next}>
            <span>{levelIdx + 1 >= LEVELS.length ? 'Finish' : 'Next level'}</span>
            <ChevronRight size={18} />
          </button>
        </Banner>
      )}

      {!solved && (
        <>
          <div>
            <Eyebrow>YOUR HAND: TAP A CARD TO PLAY IT (EACH ONCE)</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 10, marginTop: 8 }}>
              {level.hand.map((card, i) => {
                const used = picks.includes(i);
                return (
                  <button key={i} className="btn btn-violet" disabled={used} onClick={() => play(i)}
                    aria-label={`Card: ${cardLabel(card)}${used ? ', already played' : ''}`}
                    style={{ minHeight: 60, opacity: used ? 0.35 : 1, fontSize: '0.8rem' }}>
                    {cardLabel(card)}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button className="chip" onClick={undo} disabled={picks.length === 0} style={{ ...rowChip, opacity: picks.length ? 1 : 0.5 }}>
              <Undo2 size={16} /> Undo
            </button>
            <button className="chip" onClick={reset} style={rowChip}><RotateCcw size={16} /> Clear</button>
            <button className="chip" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint} style={rowChip}>
              <Lightbulb size={16} /> Hint
            </button>
          </div>
          {showHint && <Banner tone="warn">💡 {level.hint}</Banner>}
        </>
      )}
    </ArcadeFrame>
  );
};
