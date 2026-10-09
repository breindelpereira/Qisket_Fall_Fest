import { useEffect } from 'react';
import { activityStore } from '../core/tutor/activityStore';
import type { ActivityReport } from '../core/tutor/activityStore';

/**
 * A game calls this with a short description of its screen, so the AI tutor can help with doubts about it.
 * Describe what is shown and what the learner has done; never include the answer to a level.
 */
export function useActivityReport(report: ActivityReport): void {
  // compare by content, so a game that builds a new object on every render does not report on every render
  const key = JSON.stringify(report);
  const { id } = report;

  useEffect(() => {
    activityStore.report(JSON.parse(key) as ActivityReport);
  }, [key]);

  useEffect(
    () => () => {
      activityStore.leave(id);
    },
    [id],
  );
}
