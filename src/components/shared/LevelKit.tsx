import React, { useCallback, useState } from 'react';
import { ChevronRight, RotateCcw, Star } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import type { HonestyTag } from '../../content/types';
import { Banner, ArcadeFrame, ArcadeHeader, GameTitle } from './Arcade';
import { PIXEL, RETRO } from './arcadeTheme';
import type { Theme } from './arcadeTheme';
import { Milton } from './Milton';

/**
 * Shared pieces of the level-based games in Part 2: the run (which level, how many stars, finished), the frame with its
 * header, the "next" button and the finish screen. A game keeps only its own rules and board.
 */
export type StarCount = 0 | 1 | 2 | 3;

export interface LevelRun {
  levelIdx: number;
  stars: Record<number, number>;
  total: number;
  finished: boolean;
  /** Changes when the learner plays again, so each level's state starts fresh (use it in a React key). */
  round: number;
  isLast: boolean;
  clear: (s: StarCount) => void;
  next: () => void;
  again: () => void;
}

/** Keeps track of one play-through of `levelCount` levels, and records the game as completed at the end. */
export function useLevelRun(gameId: string, levelCount: number, conceptId = 'concept_hardware'): LevelRun {
  const { completeGame } = useProgress();
  const [levelIdx, setLevelIdx] = useState(0);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(0);

  const clear = useCallback((s: StarCount) => setStars((prev) => ({ ...prev, [levelIdx]: Math.max(prev[levelIdx] ?? 0, s) })), [levelIdx]);
  const isLast = levelIdx === levelCount - 1;
  const next = useCallback(() => {
    if (isLast) {
      setFinished(true);
      completeGame(gameId, conceptId);
    } else {
      setLevelIdx((i) => i + 1);
    }
  }, [isLast, completeGame, gameId, conceptId]);
  const again = useCallback(() => {
    setLevelIdx(0);
    setStars({});
    setFinished(false);
    setRound((r) => r + 1);
  }, []);

  return { levelIdx, stars, total: Object.values(stars).reduce((a, b) => a + b, 0), finished, round, isLast, clear, next, again };
}

export const Stars: React.FC<{ n: number; max?: number; size?: number }> = ({ n, max = 3, size = 20 }) => (
  <span role="img" aria-label={`${n} of ${max} stars`} style={{ display: 'inline-flex', gap: 3 }}>
    {Array.from({ length: max }, (_, i) => <Star key={i} size={size} color="#ffd23f" fill={i < n ? '#ffd23f' : 'none'} />)}
  </span>
);

interface LevelFrameProps {
  theme: Theme;
  tag: HonestyTag;
  label: string;
  levelIdx: number;
  levelCount: number;
  total: number;
  title: string;
  story: string;
  children: React.ReactNode;
}

/** The frame of a level: header with progress and stars, the title and story, then the level's own board. */
export const LevelFrame: React.FC<LevelFrameProps> = ({ theme, tag, label, levelIdx, levelCount, total, title, story, children }) => (
  <ArcadeFrame theme={theme}>
    <ArcadeHeader theme={theme} label={`${label} ${levelIdx + 1}/${levelCount}`} tag={tag}
      middle={<span aria-label={`${total} stars`} style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={16} fill="#ffd23f" /> {total}</span>} />
    <GameTitle title={title} story={story} />
    {children}
  </ArcadeFrame>
);

export const NextButton: React.FC<{ isLast: boolean; onNext: () => void; label?: string }> = ({ isLast, onNext, label }) => (
  <button className="btn" onClick={onNext}>
    <span>{isLast ? 'See how it went' : label ?? 'Next level'}</span>
    <ChevronRight size={18} />
  </button>
);

interface FinishProps {
  theme: Theme;
  title: string;
  total: number;
  levelCount: number;
  /** What the learner did, in a sentence or two. */
  summary: string;
  /** What real engineers do, or what the game left out. */
  honest: string;
  onAgain: () => void;
}

export const FinishPanel: React.FC<FinishProps> = ({ theme, title, total, levelCount, summary, honest, onAgain }) => (
  <ArcadeFrame theme={theme}>
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
      <Milton size={104} mood="happy" />
      <h2 style={{ fontFamily: PIXEL, fontSize: '0.9rem', color: theme.accent, lineHeight: 1.6 }}>{title}</h2>
      <div aria-label={`${total} of ${levelCount * 3} stars`} style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>{total} / {levelCount * 3} stars</div>
      <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{summary}</p>
      <Banner tone="info" title="THE HONEST PART">{honest}</Banner>
      <button className="btn" onClick={onAgain}><RotateCcw size={18} /> <span>Play again</span></button>
    </div>
  </ArcadeFrame>
);

/** Words for a star count, so the result never relies on the stars alone. */
export const starWords = (n: number): string => (n >= 3 ? 'Three stars: as good as it gets.' : n === 2 ? 'Two stars: a good solution, with room to do better.' : n === 1 ? 'One star: it works, but not efficiently.' : 'No stars yet.');

/** A labelled horizontal bar with the value written out, for resource and load readouts. */
export const MeterBar: React.FC<{ label: string; value: number; max: number; text: string; ok: boolean; color: string }> = ({ label, value, max, text, ok, color }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.8rem', fontWeight: 700 }}>
      <span>{label}</span>
      <span>{ok ? '✓ ' : '✗ '}{text}</span>
    </div>
    <div style={{ height: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: ok ? color : '#ff5c8a', transition: 'width .2s' }} />
    </div>
  </div>
);
