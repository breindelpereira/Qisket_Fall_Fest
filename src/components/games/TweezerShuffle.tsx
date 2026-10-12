import React, { useState } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle, stageStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, NextButton } from '../shared/LevelKit';
import { starWords, useLevelRun } from '../shared/levelRun';
import type { StarCount } from '../shared/levelRun';
import { sound } from '../../utils/audio';
import { LEVELS, move, moveProblem, neighbourPairs, par, siteIndex, solved, startSites, stars as starsFor, targetSites } from '../../core/games/tweezers';
import type { Occupied, TweezerLevel } from '../../core/games/tweezers';

const THEME = THEMES.orange;

const Level: React.FC<{
  level: TweezerLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const parMoves = par(level) ?? 0;
  const [history, setHistory] = useState<Occupied[]>([startSites(level)]);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [earned, setEarned] = useState<StarCount | null>(null);
  const occupied = history[history.length - 1];
  const moves = history.length - 1;
  const target = new Set(targetSites(level));
  const blocked = new Set(level.blocked.map(([x, y]) => siteIndex(level, x, y)));
  const inPlace = occupied.filter((s) => target.has(s)).length;
  const pairs = neighbourPairs(level, occupied).length;

  const tap = (site: number) => {
    if (earned !== null) return;
    if (occupied.includes(site)) {
      setSelected(selected === site ? null : site);
      setMessage(null);
      return;
    }
    if (selected === null) {
      setMessage(blocked.has(site) ? 'That site is blocked.' : 'Tap an atom first, then a free site next to it.');
      return;
    }
    const problem = moveProblem(level, occupied, selected, site);
    if (problem) {
      setMessage(problem);
      sound.playAlarm();
      return;
    }
    const after = move(level, occupied, selected, site)!;
    sound.playClick();
    setHistory((h) => [...h, after]);
    setSelected(null);
    setMessage(null);
    if (solved(level, after)) {
      const s = starsFor(parMoves, moves + 1) as StarCount;
      setEarned(s);
      onClear(s);
      sound.playSuccess();
    }
  };

  useActivityReport({
    id: 'tweezer_shuffle',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: 'Rearrange the atoms into the target pattern with the fewest moves. An atom moves one site at a time onto a free, unblocked neighbour.',
    state: `${occupied.length} atoms on a ${level.width} by ${level.height} grid, ${inPlace} of them already on a target site. Moves used: ${moves}. ${level.blocked.length} blocked site${level.blocked.length === 1 ? '' : 's'}.${earned !== null ? ' Finished.' : ''}`,
    hint: 'Work out which atoms end on which target sites so that nobody has to double back, and move the ones in the way first.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.86rem', lineHeight: 1.5 }}>
        <b>◎</b> marks the target pattern, <b>✕</b> is a blocked site, <b>●</b> is an atom. {inPlace} of {occupied.length} atoms are on target.
      </div>

      <div style={{ ...stageStyle, padding: 10, display: 'grid', gridTemplateColumns: `repeat(${level.width}, minmax(0, 1fr))`, gap: 6 }}>
        {Array.from({ length: level.width * level.height }, (_, site) => {
          const has = occupied.includes(site);
          const isTarget = target.has(site);
          const isBlocked = blocked.has(site);
          const sel = selected === site;
          const x = site % level.width;
          const y = Math.floor(site / level.width);
          return (
            <button
              key={site}
              onClick={() => tap(site)}
              aria-label={`Column ${x + 1}, row ${y + 1}: ${isBlocked ? 'blocked' : has ? 'atom' : 'empty'}${isTarget ? ', target' : ''}${sel ? ', selected' : ''}`}
              aria-pressed={sel}
              style={{
                minHeight: 52, borderRadius: 12, fontFamily: RETRO, fontSize: '1.6rem', color: '#fff',
                background: isBlocked ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 6px, rgba(0,0,0,0.3) 6px 12px)' : 'rgba(0,0,0,0.3)',
                border: `3px ${isTarget ? 'dashed' : 'solid'} ${sel ? '#ffd23f' : isTarget ? '#ffffff' : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              {isBlocked ? '✕' : has ? <span style={{ color: has && isTarget ? '#2ee6a6' : THEME.accent }}>●</span> : isTarget ? <span style={{ color: '#fff', opacity: 0.8 }}>◎</span> : ''}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, fontFamily: RETRO, fontSize: '1.3rem' }}>Moves {moves} · Par {parMoves}</div>
        <button className="chip" disabled={history.length < 2 || earned !== null} onClick={() => { setHistory((h) => h.slice(0, -1)); setSelected(null); setMessage(null); }} style={{ minHeight: 48 }}>
          <Undo2 size={16} /> Undo
        </button>
        <button className="chip" disabled={earned !== null} onClick={() => { setHistory([startSites(level)]); setSelected(null); setMessage(null); }} style={{ minHeight: 48 }}>
          <RotateCcw size={16} /> Restart
        </button>
      </div>
      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }} role="status">
        {selected !== null ? 'Atom picked up. Tap a free site next to it to set it down.' : 'Tap an atom to pick it up with a tweezer.'} Atoms on touching sites right now: {pairs} pair{pairs === 1 ? '' : 's'}.
      </div>
      {message && <Banner tone="warn">{message}</Banner>}

      {earned !== null && (
        <>
          <Banner tone="good" title="PATTERN COMPLETE!">
            {starWords(earned)} {moves} move{moves === 1 ? '' : 's'} against a par of {parMoves}. Touching atoms are close enough to feel the Rydberg blockade, which is how neighbours get entangled.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const TweezerShuffle: React.FC = () => {
  const r = useLevelRun('tweezer_shuffle', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="ARRAY ASSEMBLED" total={r.total} levelCount={LEVELS.length}
        summary="You rearranged atoms into target patterns, around blocked sites, with as few moves as possible."
        honest="Real arrays move whole rows of atoms at once with moving tweezers, and lose a few atoms along the way, so they check and refill. The game keeps only the idea that the arrangement is programmable, and that where atoms sit decides who can interact."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="ARRAY" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
