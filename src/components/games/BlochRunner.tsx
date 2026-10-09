import React, { useMemo, useState } from 'react';
import { Undo2, RotateCcw, Lightbulb, Star, ChevronRight, Flag } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { Banner } from '../shared/Arcade';
import { frameStyle, THEMES, PIXEL, rowChip } from '../shared/arcadeTheme';
import { BlochSphereVisualizer } from '../simulations/BlochSphereVisualizer';
import { sound } from '../../utils/audio';
import {
  LEVELS, GATE_INFO, levelTarget, playerState, isSolved, parFor, moveLimit, starRating,
} from '../../core/games/blochRunner';
import type { GateName } from '../../core/games/blochRunner';

const ACCENT = THEMES.orange.accent;
const EDGE = THEMES.orange.edge;

const fmt = (n: number) => (Math.abs(n) < 0.0005 ? '0' : n.toFixed(2));
const amp = (c: { re: number; im: number }) => {
  if (Math.abs(c.im) < 0.0005) return fmt(c.re);
  if (Math.abs(c.re) < 0.0005) return `${fmt(c.im)}i`;
  return `${fmt(c.re)}${c.im < 0 ? '−' : '+'}${fmt(Math.abs(c.im))}i`;
};

export const BlochRunner: React.FC = () => {
  const { completeGame } = useProgress();

  const [levelIdx, setLevelIdx] = useState(0);
  const [moves, setMoves] = useState<GateName[]>([]);
  const [stars, setStars] = useState<Record<number, 1 | 2 | 3>>({});
  const [showHint, setShowHint] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [finished, setFinished] = useState(false);

  const level = LEVELS[levelIdx];
  const par = useMemo(() => parFor(level), [level]);
  const limit = useMemo(() => moveLimit(level), [level]);
  const target = useMemo(() => levelTarget(level), [level]);

  const state = playerState(level, moves);
  const solved = isSolved(level, moves);
  const outOfMoves = !solved && moves.length >= limit;
  const earned = solved ? starRating(moves.length, par) : 0;
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  const bloch = state.getBlochCoordinates();
  const targetBloch = target.getBlochCoordinates();
  const [p0, p1] = state.getProbabilities();

  const play = (g: GateName) => {
    if (solved || outOfMoves) return;
    sound.playGate();
    const next = [...moves, g];
    setMoves(next);
    if (isSolved(level, next)) {
      sound.playSuccess();
      const r = starRating(next.length, par);
      setStars((s) => ({ ...s, [level.id]: Math.max(s[level.id] ?? 0, r) as 1 | 2 | 3 }));
    } else if (next.length >= limit) {
      sound.playAlarm();
    }
  };

  const undo = () => {
    if (solved || moves.length === 0) return;
    sound.playClick();
    setMoves(moves.slice(0, -1));
  };

  const reset = () => {
    sound.playClick();
    setMoves([]);
  };

  const nextLevel = () => {
    sound.playClick();
    setMoves([]);
    setShowHint(false);
    if (levelIdx + 1 >= LEVELS.length) {
      setFinished(true);
      completeGame('bloch_runner', 'concept_gates');
    } else {
      setLevelIdx(levelIdx + 1);
    }
  };

  const restartAll = () => {
    setLevelIdx(0);
    setMoves([]);
    setStars({});
    setFinished(false);
    setShowHint(false);
  };

  // what the AI tutor is told if the learner asks about this game: the screen, never the solution
  useActivityReport(
    finished
      ? { id: 'bloch_runner', status: 'finished', step: `All ${LEVELS.length} levels cleared`, state: `Stars earned: ${totalStars} of ${LEVELS.length * 3}.` }
      : {
          id: 'bloch_runner',
          status: 'playing',
          step: `Level ${level.id} of ${LEVELS.length}: ${level.title}`,
          mission: level.story,
          state:
            `Gates used so far: ${moves.length ? moves.map((g) => GATE_INFO[g].label).join(', ') : 'none'} (${moves.length} of ${limit} allowed; the shortest solution is ${par}). ` +
            `Gates on offer: ${level.allowed.map((g) => GATE_INFO[g].label).join(', ')}. If measured now the qubit would read 0 ${Math.round(p0 * 100)}% of the time.` +
            `${solved ? ` Level solved, ${earned} of 3 stars.` : outOfMoves ? ' Out of moves.' : ''}`,
          hint: level.hint,
        },
  );

  const frame = frameStyle(THEMES.orange);

  if (finished) {
    return (
      <div style={frame}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: '2.6rem' }}>🏁</div>
          <h2 style={{ fontFamily: PIXEL, fontSize: '0.9rem', color: ACCENT, lineHeight: 1.6 }}>TRACK COMPLETE!</h2>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: '2rem', color: '#ffd23f' }}>
            ★ {totalStars} / {LEVELS.length * 3}
          </div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            You steered a qubit around the whole Bloch sphere using nothing but gates. Every gate you used is a
            <b style={{ color: '#fff' }}> rotation</b>: X, Y and Z are half-turns, S and T are smaller twists around
            the vertical axis, and H tips you between the poles and the equator.
          </p>
          <button className="btn btn-orange" onClick={restartAll}>
            <RotateCcw size={18} /> <span>Run again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={frame}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: PIXEL, fontSize: '0.58rem', color: ACCENT }}>
          LEVEL {level.id}/{LEVELS.length}
        </span>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: '1.4rem', color: '#ffd23f' }}>★ {totalStars}</span>
        <HonestyTagBadge tag="Accurate" />
      </div>

      {/* Runner track */}
      <div role="img" aria-label={`Level ${level.id} of ${LEVELS.length}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {LEVELS.map((l, i) => {
          const done = stars[l.id] !== undefined && i < levelIdx;
          const current = i === levelIdx;
          return (
            <React.Fragment key={l.id}>
              <div style={{
                width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: current ? ACCENT : done ? 'rgba(255, 159, 28, 0.35)' : 'rgba(255, 255, 255, 0.1)',
                color: current ? '#2a0f5c' : '#fff', fontSize: current ? '1rem' : '0.7rem', fontFamily: PIXEL,
                boxShadow: current ? `0 3px 0 ${EDGE}` : 'none',
              }}>
                {current ? '🏃' : i === LEVELS.length - 1 ? <Flag size={14} /> : done ? '✓' : i + 1}
              </div>
              {i < LEVELS.length - 1 && (
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: done ? ACCENT : 'rgba(255, 255, 255, 0.15)' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mission */}
      <div>
        <h2 style={{ fontFamily: PIXEL, fontSize: '0.78rem', lineHeight: 1.6, marginBottom: 6 }}>{level.title}</h2>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>{level.story}</p>
      </div>

      {/* Sphere */}
      <div style={{
        background: 'radial-gradient(circle at 50% 30%, #4a26a0 0%, #1d0848 80%)',
        border: '2px solid rgba(255, 255, 255, 0.14)', borderRadius: 18, display: 'flex',
        flexDirection: 'column', alignItems: 'center', padding: '8px 0 12px',
      }}>
        <BlochSphereVisualizer coordinates={bloch} targetCoordinates={targetBloch} size={250} />
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Red arrow = you · Ghost marker = target
        </div>
      </div>

      {/* Readout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: '|0⟩', p: p0, color: '#38c8ff' },
          { label: '|1⟩', p: p1, color: '#ff5c8a' },
        ].map((b) => (
          <div key={b.label} style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: 14, padding: '8px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.85rem' }}>
              <span style={{ color: b.color }}>{b.label}</span>
              <span>{Math.round(b.p * 100)}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255, 255, 255, 0.12)', marginTop: 6 }}>
              <div style={{ width: `${b.p * 100}%`, height: '100%', borderRadius: 4, background: b.color }} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowMath((v) => !v)}
        aria-expanded={showMath}
        className="chip"
        style={{ alignSelf: 'flex-start' }}
      >
        {showMath ? 'Hide the math' : 'Show the math'}
      </button>
      {showMath && (
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: 14, padding: 12, fontFamily: "'VT323', monospace", fontSize: '1.2rem', lineHeight: 1.4 }}>
          <div>|ψ⟩ = ({amp(state.amplitudes[0])})|0⟩ + ({amp(state.amplitudes[1])})|1⟩</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Bloch: x={fmt(bloch.x)} y={fmt(bloch.y)} z={fmt(bloch.z)}
          </div>
          {moves.length > 0 && (
            <div style={{ color: ACCENT }}>
              |ψ⟩ = {[...moves].reverse().map((g) => GATE_INFO[g].label).join('·')}
              {level.prep.length ? ' (start)' : '|0⟩'}
            </div>
          )}
        </div>
      )}

      {/* Moves */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: PIXEL, fontSize: '0.58rem' }}>MOVES {moves.length}/{limit}</span>
        <span style={{ fontFamily: PIXEL, fontSize: '0.58rem', color: '#ffd23f' }}>PAR {par}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, minHeight: 34, flexWrap: 'wrap' }} aria-label="Moves so far">
        {moves.map((g, i) => (
          <span key={i} style={{
            fontFamily: PIXEL, fontSize: '0.6rem', padding: '8px 10px', borderRadius: 10,
            background: 'rgba(255, 159, 28, 0.2)', border: `2px solid ${ACCENT}`,
          }}>{GATE_INFO[g].label}</span>
        ))}
      </div>

      {/* Result */}
      {solved && (
        <Banner tone="good" title="CHECKPOINT!" center>
          <div aria-label={`${earned} of 3 stars`} style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {[1, 2, 3].map((n) => (
              <Star key={n} size={28} color="#ffd23f" fill={n <= earned ? '#ffd23f' : 'none'} />
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            {earned === 3 ? 'Perfect path!' : `Done in ${moves.length} moves. The shortest path is ${par}.`}
          </div>
          <button className="btn btn-mint" onClick={nextLevel}>
            <span>{levelIdx + 1 >= LEVELS.length ? 'Finish' : 'Next level'}</span>
            <ChevronRight size={18} />
          </button>
        </Banner>
      )}

      {outOfMoves && (
        <Banner tone="bad" title="OUT OF MOVES" center>
          No timer here, just a move limit. Undo a step or restart and try another route.
        </Banner>
      )}

      {/* Gate pad */}
      {!solved && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 10 }}>
            {level.allowed.map((g) => (
              <button
                key={g}
                onClick={() => play(g)}
                disabled={outOfMoves}
                aria-label={`${GATE_INFO[g].label} gate: ${GATE_INFO[g].blurb}`}
                className="btn btn-orange"
                style={{ flexDirection: 'column', gap: 4, minHeight: 64, opacity: outOfMoves ? 0.5 : 1 }}
              >
                <span style={{ fontSize: '1rem' }}>{GATE_INFO[g].label}</span>
                <span style={{ fontFamily: 'var(--font-family)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                  {GATE_INFO[g].blurb.split(':')[0]}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button className="chip" onClick={undo} disabled={moves.length === 0} style={{ ...rowChip, opacity: moves.length ? 1 : 0.5 }}>
              <Undo2 size={16} /> Undo
            </button>
            <button className="chip" onClick={reset} style={rowChip}>
              <RotateCcw size={16} /> Restart
            </button>
            <button className="chip" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint} style={rowChip}>
              <Lightbulb size={16} /> Hint
            </button>
          </div>
          {showHint && (
            <Banner tone="warn">
              💡 {level.hint}
            </Banner>
          )}
        </>
      )}
    </div>
  );
};
