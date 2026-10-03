import type { LessonRecord, QuizRecord } from './types';
import { PART1_LESSONS } from './lessonsPart1';
import { PART2_LESSONS, HARDWARE_SNAPSHOT_NOTE } from './lessonsPart2';
import { PART3_LESSONS } from './lessonsPart3';
import { QUIZZES } from './quizzes';

export { QUIZZES, QUIZ_PASS_SCORE } from './quizzes';
export { HARDWARE_SNAPSHOT_NOTE };

export interface PartInfo {
  part: 1 | 2 | 3;
  title: string;
  /** One-line description from the course overview. */
  summary: string;
  heading: string;
  blurb?: string;
  optional?: boolean;
}

export const COURSE_INTRO =
  'This curriculum is designed to take you from a curious beginner to someone who understands the physical reality and mathematical foundations of quantum computers.';

export const PARTS: PartInfo[] = [
  {
    part: 1,
    title: 'Concepts',
    summary: 'The rules of the quantum world.',
    heading: 'Concepts Through Games and Simulations',
  },
  {
    part: 2,
    title: 'Hardware',
    summary: 'How we actually build these machines.',
    heading: 'Types of Quantum Computers (Hardware)',
    blurb: HARDWARE_SNAPSHOT_NOTE,
  },
  {
    part: 3,
    title: 'Math Companion',
    summary: 'Optional deep-dives to check your intuition with calculation.',
    heading: 'Math Companion (Optional)',
    blurb: 'For those who want to see the numbers behind the simulations.',
    optional: true,
  },
];

/** All lessons in curriculum order. */
export const LESSONS: LessonRecord[] = [...PART1_LESSONS, ...PART2_LESSONS, ...PART3_LESSONS];

export const LESSON_BY_ID: Record<string, LessonRecord> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

export const lessonsForPart = (part: 1 | 2 | 3): LessonRecord[] => LESSONS.filter((l) => l.part === part);

export const quizForLesson = (lesson: LessonRecord): QuizRecord | undefined =>
  lesson.quizId ? QUIZZES[lesson.quizId] : undefined;
