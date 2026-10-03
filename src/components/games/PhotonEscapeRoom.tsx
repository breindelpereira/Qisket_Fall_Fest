import React, { useMemo, useState } from 'react';
import { RotateCcw, Lightbulb, ChevronRight, Zap, Check, X as XIcon } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { Banner } from '../shared/Arcade';
import { frameStyle, THEMES, PIXEL, rowChip } from '../shared/arcadeTheme';
import { sound } from '../../utils/audio';
import { simulate, fireOnePhoton } from '../../core/optical/interferometer';
import {
  LEVELS, buildLayout, defaultPicks, describeChoice, levelSolved, runGoal, goalMet,
} from '../../core/games/photonEscape';
import type { Choice } from '../../core/games/photonEscape';

const ACCENT = THEMES.sky.accent;

const W = 340;
const H = 190;
const Y_TOP = 55;
const Y_BOT = 135;
const X_START = 24;
const X_END = 296;

const pct = (p: number) => `${Math.round(p * 100)}%`;
const shortLabel = (c: Choice) =>
  c.type === 'empty' ? 'Empty' : c.type === 'bs' ? 'Splitter' : c.type === 'phase' ? `φ ${Math.round((c.phi * 180) / Math.PI)}°` : 'Block';

const fmtAmp = (c: { re: number; im: number }) => {
  const f = (n: number) => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(2);
  if (Math.abs(c.im) < 0.0005) return f(c.re);
  if (Math.abs(c.re) < 0.0005) return `${f(c.im)}i`;
  return `${f(c.re)}${c.im < 0 ? '−' : '+'}${f(Math.abs(c.im))}i`;
};

export const PhotonEscapeRoom: React.FC = () => {
  const { completeGame } = useProgress();

  const [levelIdx, setLevelIdx] = useState(0);
  const level = LEVELS[levelIdx];
  const [choiceIdx, setChoiceIdx] = useState<number[]>(() => LEVELS[0].slots.map(() => 0));
  const [showHint, setShowHint] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [finished, setFinished] = useState(false);
  const [tally, setTally] = useState<{ top: number; bottom: number; lost: number }>({ top: 0, bottom: 0, lost: 0 });
  const [lastClick, setLastClick] = useState<0 | 1 | 'absorbed' | null>(null);

  const picks: Choice[] = useMemo(
    () => level.slots.map((s, i) => s.choices[choiceIdx[i] ?? 0] ?? defaultPicks(level)[i]),
    [level, choiceIdx],
  );
  const result = useMemo(() => simulate(buildLayout(picks)), [picks]);
  const solved = levelSolved(level, picks);

  const cycle = (i: number) => {
    if (solved) return;
    sound.playGate();
    setChoiceIdx((prev) => prev.map((v, k) => (k === i ? (v + 1) % level.slots[i].choices.length : v)));
    setTally({ top: 0, bottom: 0, lost: 0 });
    setLastClick(null);
  };

  const fire = () => {
    sound.playLaser();
    const hit = fireOnePhoton(result);
    setLastClick(hit);
    setTally((t) => ({
      top: t.top + (hit === 0 ? 1 : 0),
      bottom: t.bottom + (hit === 1 ? 1 : 0),
      lost: t.lost + (hit === 'absorbed' ? 1 : 0),
    }));
  };

  const resetLevel = (idx: number) => {
    setChoiceIdx(LEVELS[idx].slots.map(() => 0));
    setTally({ top: 0, bottom: 0, lost: 0 });
    setLastClick(null);
    setShowHint(false);
  };

  const next = () => {
    sound.playSuccess();
    if (levelIdx + 1 >= LEVELS.length) {
      setFinished(true);
      completeGame('photon_escape_room', 'concept_interference');
      return;
    }
    setLevelIdx(levelIdx + 1);
    resetLevel(levelIdx + 1);
  };

  const restartAll = () => {
    setLevelIdx(0);
    resetLevel(0);
    setFinished(false);
  };

  const frame = frameStyle(THEMES.sky);

  if (finished) {
    return (
      <div style={{ ...frame, textAlign: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '2.6rem' }}>🔓</div>
        <h2 style={{ fontFamily: PIXEL, fontSize: '0.85rem', color: ACCENT, lineHeight: 1.6 }}>YOU ESCAPED!</h2>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          A single photon took <b style={{ color: '#fff' }}>both paths at once</b>. Where the two paths agreed (in phase) the
          photon could exit; where they cancelled (out of phase) the door stayed dark. That is
          <b style={{ color: '#fff' }}> interference</b>, and it is exactly what quantum algorithms exploit.
        </p>
        <button className="btn btn-sky" onClick={restartAll}>
          <RotateCcw size={18} /> <span>Play again</span>
        </button>
      </div>
    );
  }

  // x position of slot i (centres) and of the segment boundaries
  const n = level.slots.length;
  const slotX = (i: number) => X_START + 40 + ((X_END - X_START - 80) * (n === 1 ? 0.5 : i / (n - 1)));
  const boundaries = [X_START, ...level.slots.map((_, i) => slotX(i)), X_END];
  const beam = (p: number) => 0.12 + 0.88 * Math.min(1, p);

  return (
    <div style={frame}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: PIXEL, fontSize: '0.58rem', color: ACCENT }}>ROOM {level.id}/{LEVELS.length}</span>
        <HonestyTagBadge tag="Accurate" />
      </div>

      <div>
        <h2 style={{ fontFamily: PIXEL, fontSize: '0.78rem', lineHeight: 1.6, marginBottom: 6 }}>{level.title}</h2>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>{level.story}</p>
      </div>

      {/* Lab bench */}
      <div style={{ background: 'radial-gradient(circle at 50% 30%, #3b1b82 0%, #1d0848 85%)', border: '2px solid rgba(255,255,255,0.14)', borderRadius: 18, padding: 6 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
          aria-label={`Interferometer. Top detector ${pct(result.out[0])}, bottom detector ${pct(result.out[1])}.`}>
          <text x={X_START} y={14} fill="#ddd0fa" fontSize="11" fontWeight="700">Photon source</text>
          <text x={X_END - 36} y={14} fill="#ddd0fa" fontSize="11" fontWeight="700">Doors</text>

          {/* beams, brightness = probability of finding the photon on that path */}
          {boundaries.slice(0, -1).map((x0, k) => {
            const [p0, p1] = result.stages[k];
            const x1 = boundaries[k + 1];
            return (
              <g key={k}>
                <line x1={x0} y1={Y_TOP} x2={x1} y2={Y_TOP} stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" opacity={beam(p0)} />
                <line x1={x0} y1={Y_BOT} x2={x1} y2={Y_BOT} stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" opacity={beam(p1)} />
              </g>
            );
          })}

          {/* source */}
          <circle cx={X_START - 6} cy={Y_TOP} r="9" fill="#ff5c8a" stroke="#fff" strokeWidth="2" />

          {/* elements */}
          {level.slots.map((_, i) => {
            const c = picks[i];
            const x = slotX(i);
            return (
              <g key={i} onClick={() => cycle(i)} style={{ cursor: 'pointer' }}>
                <rect x={x - 22} y={Y_TOP - 24} width="44" height={Y_BOT - Y_TOP + 48} rx="10"
                  fill={c.type === 'empty' ? 'transparent' : 'rgba(56,200,255,0.12)'}
                  stroke={c.type === 'empty' ? 'rgba(255,255,255,0.3)' : ACCENT}
                  strokeWidth="2" strokeDasharray={c.type === 'empty' ? '4 4' : undefined} />
                {c.type === 'bs' && (
                  <line x1={x - 16} y1={Y_TOP - 14} x2={x + 16} y2={Y_BOT + 14} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
                )}
                {c.type === 'phase' && (
                  <g>
                    <rect x={x - 16} y={Y_BOT - 11} width="32" height="22" rx="6" fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
                    <text x={x} y={Y_BOT + 4} fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">
                      {Math.round((c.phi * 180) / Math.PI)}°
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* detectors */}
          {([0, 1] as const).map((port) => {
            const y = port === 0 ? Y_TOP : Y_BOT;
            const p = result.out[port];
            const clicked = lastClick === port;
            return (
              <g key={port}>
                <circle cx={X_END + 18} cy={y} r="18" fill={`rgba(255,210,63,${0.1 + 0.8 * p})`}
                  stroke={clicked ? '#fff' : '#ffd23f'} strokeWidth={clicked ? 4 : 2} />
                <text x={X_END + 18} y={y + 4} fill={p > 0.5 ? '#2a0f5c' : '#fff'} fontSize="12" fontWeight="800" textAnchor="middle">{pct(p)}</text>
                <text x={X_END + 18} y={y + (port === 0 ? -24 : 34)} fill="#ddd0fa" fontSize="10" fontWeight="700" textAnchor="middle">
                  {port === 0 ? 'TOP' : 'BOTTOM'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Slot controls */}
      <div>
        <div style={{ fontFamily: PIXEL, fontSize: '0.55rem', marginBottom: 8, color: 'var(--text-secondary)' }}>TAP A SLOT TO CHANGE IT</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 6 }}>
          {level.slots.map((s, i) => (
            <button key={i} className="btn btn-sky" disabled={solved || s.choices.length < 2}
              onClick={() => cycle(i)}
              aria-label={`Slot ${i + 1}: ${describeChoice(picks[i])}. Tap to change.`}
              style={{ minHeight: 56, padding: '6px 2px', fontSize: n > 3 ? '0.5rem' : '0.58rem', opacity: s.choices.length < 2 ? 0.6 : 1 }}>
              {shortLabel(picks[i])}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {level.goals.map((g) => {
          const ok = goalMet(picks, g);
          const val = runGoal(picks, g).out[g.port];
          return (
            <div key={g.label} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 12,
              background: ok ? 'rgba(46,230,166,0.15)' : 'rgba(0,0,0,0.25)',
              border: `2px solid ${ok ? '#2ee6a6' : 'rgba(255,255,255,0.12)'}`, fontSize: '0.85rem', fontWeight: 700,
            }}>
              {ok ? <Check size={18} color="#2ee6a6" /> : <XIcon size={18} color="#ff5c8a" />}
              <span style={{ flex: 1 }}>{g.label}</span>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem' }}>{pct(val)}</span>
            </div>
          );
        })}
        {level.minBeamSplitters && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Needs at least {level.minBeamSplitters} beam splitters.
          </div>
        )}
      </div>

      {/* Fire */}
      <button className="btn" onClick={fire} disabled={solved}>
        <Zap size={18} fill="currentColor" /> <span>Fire a photon</span>
      </button>
      {tally.top + tally.bottom + tally.lost > 0 && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Clicks so far: top {tally.top} · bottom {tally.bottom}{tally.lost ? ` · absorbed ${tally.lost}` : ''}
        </div>
      )}

      <button className="chip" style={{ alignSelf: 'flex-start' }} aria-expanded={showMath} onClick={() => setShowMath((v) => !v)}>
        {showMath ? 'Hide the math' : 'Show the math'}
      </button>
      {showMath && (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 12, fontFamily: "'VT323', monospace", fontSize: '1.15rem', lineHeight: 1.4 }}>
          {result.amplitudes.map((a, k) => (
            <div key={k}>
              {k === 0 ? 'start' : `after ${k}`}: ({fmtAmp(a[0])}, {fmtAmp(a[1])})
            </div>
          ))}
          <div style={{ color: 'var(--text-secondary)' }}>
            P(top) = |amp₀|² · P(bottom) = |amp₁|². A splitter mixes the paths, a phase shifter turns the lower one.
          </div>
        </div>
      )}

      {solved && (
        <Banner tone="good" title="DOOR UNLOCKED!" center>
          <button className="btn btn-mint" onClick={next}>
            <span>{levelIdx + 1 >= LEVELS.length ? 'Escape' : 'Next room'}</span>
            <ChevronRight size={18} />
          </button>
        </Banner>
      )}

      {!solved && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="chip" onClick={() => resetLevel(levelIdx)}
            style={rowChip}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="chip" aria-expanded={showHint} onClick={() => setShowHint((v) => !v)}
            style={rowChip}>
            <Lightbulb size={16} /> Hint
          </button>
        </div>
      )}
      {showHint && !solved && (
        <Banner tone="warn">
          💡 {level.hint}
        </Banner>
      )}
    </div>
  );
};
