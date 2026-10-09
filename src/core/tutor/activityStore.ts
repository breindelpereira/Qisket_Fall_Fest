import { LIMITS } from './types.ts';
import type { ActivityRef } from './types.ts';

/**
 * Where the games tell the tutor what the learner is doing. A game reports what is on its screen (see
 * `hooks/useActivityReport.ts`); when it closes, the last report is kept for a while, so a learner who has just walked out
 * of a game can still ask about it. Nothing here is stored on disk or sent anywhere by itself: the tutor drawer reads
 * it when a question is asked.
 */

/** What a game reports: a status of `playing` (still going) or `finished` (completed). The store adds `left`. */
export type ActivityReport = Omit<ActivityRef, 'status'> & { status: 'playing' | 'finished' };

/** How long after leaving a game a learner's doubts are still taken to be about it. */
export const RECENT_MS = 20 * 60 * 1000;

export interface ActivityStore {
  /** The open game says what is on its screen now (call again whenever that changes). */
  report(report: ActivityReport): void;
  /** The game was closed. Its last report is kept for `RECENT_MS`. */
  leave(id: string): void;
  /** What the tutor should be told about, or null when there is nothing recent. */
  read(): ActivityRef | null;
  subscribe(listener: () => void): () => void;
  clear(): void;
}

const clip = (text: string | undefined): string | undefined => {
  const t = text?.replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, LIMITS.activityChars) : undefined;
};

function tidyReport(report: ActivityReport): ActivityReport {
  const out: ActivityReport = { id: report.id, status: report.status };
  for (const key of ['step', 'mission', 'state', 'hint'] as const) {
    const value = clip(report[key]);
    if (value) out[key] = value;
  }
  return out;
}

export function createActivityStore(now: () => number = Date.now): ActivityStore {
  let current: ActivityReport | null = null;
  let recent: { report: ActivityReport; endedAt: number } | null = null;
  const listeners = new Set<() => void>();
  const changed = () => listeners.forEach((l) => l());

  return {
    report(report) {
      current = tidyReport(report);
      changed();
    },
    leave(id) {
      if (current && current.id === id) {
        recent = { report: current, endedAt: now() };
        current = null;
        changed();
      }
    },
    read() {
      if (current) return { ...current };
      if (recent && now() - recent.endedAt <= RECENT_MS) {
        const { report } = recent;
        return { ...report, status: report.status === 'finished' ? 'finished' : 'left' };
      }
      return null;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    clear() {
      current = null;
      recent = null;
      changed();
    },
  };
}

/** The one store the app uses. */
export const activityStore = createActivityStore();
