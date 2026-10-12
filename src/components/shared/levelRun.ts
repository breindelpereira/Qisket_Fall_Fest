import { useCallback, useState } from 'react';
import { useProgress } from '../../hooks/useProgress';

/**
 * The state of one play-through of a level-based game (which level, how many stars, finished). The pieces that draw it are
 * in LevelKit.tsx.
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

/** Words for a star count, so the result never relies on the stars alone. */
export const starWords = (n: number): string => (n >= 3 ? 'Three stars: as good as it gets.' : n === 2 ? 'Two stars: a good solution, with room to do better.' : n === 1 ? 'One star: it works, but not efficiently.' : 'No stars yet.');

