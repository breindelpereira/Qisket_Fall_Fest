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
  /** `lesson` chunks are taken from the lesson page itself; `notes` are the richer hand-written ones. */
  from: 'lesson' | 'notes';
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
} as const;
