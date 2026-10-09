import type { HonestyTag } from '../../content/types.ts';

/** The kinds of passage in the tutor's notes. FAQ headings are written as the question a learner would ask. */
export const CHUNK_KINDS = ['explain', 'example', 'faq', 'glossary', 'misconception', 'links'] as const;
export type ChunkKind = (typeof CHUNK_KINDS)[number];

/** One passage of the tutor's knowledge: roughly 100 to 300 words about a single idea. */
export interface TutorChunk {
  id: string;
  lessonId: string;
  lessonTitle: string;
  /** How to say where it is taught: "Module 3", "Hardware module 2", "Math lesson 4". */
  where: string;
  /** Position of the lesson in the whole course (0 is the first lesson). Search never goes past the learner's position. */
  order: number;
  part: 1 | 2 | 3;
  heading: string;
  kind: ChunkKind;
  tag?: HonestyTag;
  text: string;
  /** `lesson` chunks are taken from the lesson page itself; `notes` are the richer hand-written ones; `game` are about one game. */
  from: 'lesson' | 'notes' | 'game';
  /**
   * Set on passages about a game (from `content/gameHelp.ts`). They are used only while that game is open or was just left,
   * and then they ignore the learner's position in the course, because they explain the game the learner is looking at.
   */
  activityId?: string;
}

export interface CourseMapEntry {
  lessonId: string;
  order: number;
  part: 1 | 2 | 3;
  where: string;
  title: string;
  /** One short sentence, only for pointing at the right module. */
  summary: string;
}

/** The generated file `tutor/index.json`. */
export interface TutorIndex {
  version: 1;
  courseMap: CourseMapEntry[];
  chunks: TutorChunk[];
}

export const TUTOR_LEVELS = ['beginner', 'intermediate', 'math'] as const;
export type TutorLevel = (typeof TUTOR_LEVELS)[number];

export const LEVEL_LABELS: Record<TutorLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  math: 'Math-ready',
};

export interface TutorTurn {
  role: 'user' | 'tutor';
  text: string;
}

/** `playing`: the game is open. `finished`: they just completed it. `left`: they were in it a few minutes ago. */
export const ACTIVITY_STATUSES = ['playing', 'finished', 'left'] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

/**
 * What the app tells the tutor about the game the learner is playing (or just played), so it can answer doubts about it.
 * It describes the screen, never the solution. Every text is short, and the function treats all of it as data.
 */
export interface ActivityRef {
  /** The game's id, for example "bloch_runner". */
  id: string;
  status: ActivityStatus;
  /** Where they are: "Level 3 of 8: The Other Side". */
  step?: string;
  /** What the game is asking of them right now. */
  mission?: string;
  /** What is on the screen now: moves made, a result, a count. */
  state?: string;
  /** The hint the game itself offers for this step. */
  hint?: string;
}

export interface TutorRequest {
  question: string;
  /** The lesson the learner has open (or is on). Its passages count for more. */
  lessonId?: string;
  /** How far into the course the learner is: only passages up to this lesson are used. */
  order: number;
  level: TutorLevel;
  history: TutorTurn[];
  /** The learner has a quiz open: explain ideas, but never say which option is right. */
  inQuiz?: boolean;
  /** The game the learner is playing or has just played. */
  activity?: ActivityRef;
}

export interface TutorSource {
  lessonId: string;
  heading: string;
  where?: string;
}

/** `gemini`: written by the model from the notes. `prepared`: pre-written, no model used. `offline`: the notes, shown directly. */
export type TutorProvider = 'gemini' | 'prepared' | 'offline';

export interface TutorResponse {
  answer: string;
  sources: TutorSource[];
  provider: TutorProvider;
  /** Why the online tutor was not used, when it was wanted. */
  reason?: 'rate_limited' | 'unavailable' | 'busy' | 'off';
  /** For the team, not the learner: what went wrong (for example "server 503"). Never contains a key. */
  detail?: string;
}

/** Input limits, shared by the app (to stop typing) and the function (to refuse anything bigger). */
export const LIMITS = {
  questionChars: 500,
  historyTurns: 4,
  turnChars: 500,
  /** Each of the game's text fields (step, mission, state, hint). */
  activityChars: 400,
} as const;
