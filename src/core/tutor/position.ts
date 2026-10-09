import type { LessonRecord, QuizRecord } from '../../content/types.ts';
import { lessonStatus, nextUpLesson } from '../learn/curriculum.ts';
import type { ProgressState } from '../../utils/progressStore.ts';

export interface TutorPosition {
  /** The lesson the tutor treats as current: the one open now, otherwise the next one to do. */
  lessonId: string;
  /** How far the tutor may look: the furthest of the open lesson, the next one to do, and anything already started. */
  order: number;
}

/**
 * Where the learner is in the course, for the tutor's "no spoilers" rule.
 * A lesson counts as reached when it is open, is the next one to do, or has any progress (a quiz, a game or a lab).
 */
export function tutorPosition(
  lessons: LessonRecord[],
  quizzes: Record<string, QuizRecord>,
  progress: ProgressState,
  openLessonId?: string,
): TutorPosition {
  const last = lessons.length - 1;
  const open = openLessonId ? lessons.findIndex((l) => l.id === openLessonId) : -1;
  const next = nextUpLesson(lessons, quizzes, progress);
  const nextOrder = next ? lessons.indexOf(next) : last;

  let furthest = 0;
  lessons.forEach((l, order) => {
    const touched =
      lessonStatus(l, quizzes, progress).status !== 'new' ||
      (l.part === 1 && ((progress.conceptGames[l.linkedConceptId]?.length ?? 0) > 0 || (progress.conceptSims[l.linkedConceptId]?.length ?? 0) > 0));
    if (touched) furthest = Math.max(furthest, order);
  });

  const order = Math.max(furthest, nextOrder, open);
  const current = open >= 0 ? lessons[open] : (next ?? lessons[last]);
  return { lessonId: current.id, order };
}
