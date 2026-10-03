import type { LessonRecord, QuizRecord } from '../../content/types';
import type { ProgressState } from '../../utils/progressStore';
import { passes } from './quiz';

export type ModuleStatus = 'new' | 'attempted' | 'done';

export interface LessonStatus {
  status: ModuleStatus;
  /** Best quiz score so far, when the lesson has a quiz that has been taken. */
  bestScore?: number;
}

type Quizzes = Record<string, QuizRecord>;

/**
 * A module with a quiz is done when the quiz is passed; one without a quiz is done when the learner
 * marks it as read.
 */
export function lessonStatus(lesson: LessonRecord, quizzes: Quizzes, progress: ProgressState): LessonStatus {
  const quiz = lesson.quizId ? quizzes[lesson.quizId] : undefined;
  if (quiz) {
    const best = progress.quizScores[quiz.id];
    if (best === undefined) return { status: 'new' };
    return { status: passes(quiz, best) ? 'done' : 'attempted', bestScore: best };
  }
  return { status: progress.readLessons.includes(lesson.id) ? 'done' : 'new' };
}

export function partProgress(
  lessons: LessonRecord[],
  quizzes: Quizzes,
  progress: ProgressState,
  part?: 1 | 2 | 3,
): { done: number; total: number } {
  const inPart = part ? lessons.filter((l) => l.part === part) : lessons;
  const done = inPart.filter((l) => lessonStatus(l, quizzes, progress).status === 'done').length;
  return { done, total: inPart.length };
}

/** Share of the core course (Parts 1 and 2; Part 3 is optional) that is done, 0 to 100. */
export function courseProgressPercent(lessons: LessonRecord[], quizzes: Quizzes, progress: ProgressState): number {
  const core = lessons.filter((l) => l.part !== 3);
  if (core.length === 0) return 0;
  const done = core.filter((l) => lessonStatus(l, quizzes, progress).status === 'done').length;
  return Math.round((done / core.length) * 100);
}

/** The first module that is not done: the core course first, then the optional Math Companion. */
export function nextUpLesson(lessons: LessonRecord[], quizzes: Quizzes, progress: ProgressState): LessonRecord | undefined {
  const notDone = (l: LessonRecord) => lessonStatus(l, quizzes, progress).status !== 'done';
  return lessons.find((l) => l.part !== 3 && notDone(l)) ?? lessons.find((l) => l.part === 3 && notDone(l));
}

/** Previous and next lesson inside the same part, for the page footer. */
export function adjacentLessons(lessons: LessonRecord[], id: string): { prev?: LessonRecord; next?: LessonRecord } {
  const index = lessons.findIndex((l) => l.id === id);
  if (index < 0) return {};
  const part = lessons[index].part;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  return { prev: prev?.part === part ? prev : undefined, next: next?.part === part ? next : undefined };
}

/** The three pieces of evidence behind a concept's Familiar / Explored / Mastered tier. */
export function conceptEvidence(
  conceptId: string,
  progress: ProgressState,
  quizzes: Quizzes,
  lesson?: LessonRecord,
): { played: boolean; explored: boolean; quizPassed: boolean } {
  const quiz = lesson?.quizId ? quizzes[lesson.quizId] : undefined;
  const best = quiz ? progress.quizScores[quiz.id] : undefined;
  return {
    played: (progress.conceptGames[conceptId]?.length ?? 0) > 0,
    explored: (progress.conceptSims[conceptId]?.length ?? 0) > 0,
    quizPassed: quiz !== undefined && best !== undefined && passes(quiz, best),
  };
}

/** "PART 1 · MODULE 5A" or, for the Math Companion, "PART 3 · LESSON 2". */
export const moduleEyebrow = (lesson: LessonRecord): string =>
  lesson.part === 3 ? `PART 3 · ${lesson.moduleLabel.toUpperCase()}` : `PART ${lesson.part} · MODULE ${lesson.moduleLabel}`;
