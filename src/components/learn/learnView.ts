/** Where the learner is inside the Learn tab. */
export type LearnView =
  | { kind: 'home' }
  | { kind: 'part'; part: 1 | 2 | 3 }
  | { kind: 'lesson'; lessonId: string }
  | { kind: 'quiz'; lessonId: string };
