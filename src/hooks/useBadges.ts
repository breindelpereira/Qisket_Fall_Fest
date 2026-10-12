import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { LESSONS, QUIZZES } from '../content/lessons';
import { computeBadges, newBadges, rankFor } from '../core/learn/badges';
import type { Badge } from '../core/learn/badges';
import { readSeenBadges, subscribeSeenBadges, writeSeenBadges } from '../utils/badgeStore';
import { useProgress } from './useProgress';

/**
 * The badges for the saved progress, which of them are new since the learner last looked, and a way to say "I have seen
 * them". `games` and `sims` are the ids the app has built.
 */
export function useBadges(games: string[], sims: string[]) {
  const { progress } = useProgress();
  const seen = useSyncExternalStore(subscribeSeenBadges, readSeenBadges);
  const gamesKey = games.join(',');
  const simsKey = sims.join(',');

  const badges: Badge[] = useMemo(
    () => computeBadges({ progress, lessons: LESSONS, quizzes: QUIZZES, games: gamesKey ? gamesKey.split(',') : [], sims: simsKey ? simsKey.split(',') : [] }),
    [progress, gamesKey, simsKey],
  );
  const earned = badges.filter((b) => b.earned);
  const fresh = newBadges(badges, seen);

  const markSeen = useCallback(() => {
    writeSeenBadges(badges.filter((b) => b.earned).map((b) => b.id));
  }, [badges]);

  return { badges, earned, fresh, rank: rankFor(earned.length), markSeen };
}
