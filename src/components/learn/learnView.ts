import type { LessonStep } from '../../content/types';

/** Where the learner is inside the Learn tab. */
export type LearnView =
  | { kind: 'home' }
  | { kind: 'part'; part: 1 | 2 | 3 }
  /** `focus` scrolls to that stage of the lesson (e.g. 'watch' after finishing a game). */
  | { kind: 'lesson'; lessonId: string; focus?: LessonStep }
  | { kind: 'quiz'; lessonId: string };
