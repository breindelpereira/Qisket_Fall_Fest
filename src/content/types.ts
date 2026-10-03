export type HonestyTag = 
  | 'Analogy' 
  | 'Simplified model' 
  | 'Accurate' 
  | 'Experimental/Contested';

export type EngineType = 
  | 'state-vector' 
  | 'optical' 
  | 'stabilizer';

export interface ConceptRecord {
  id: string;
  name: string;
  summary: string;
  prerequisites: string[];
  relatedGames: string[];
  relatedSims: string[];
  relatedLessons: string[];
  honestyTag: HonestyTag;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Set when the question targets a common misconception (shown as a "Misconception check"). */
  misconceptionTag?: string;
}

export interface QuizRecord {
  id: string;
  lessonId: string;
  passingScore: number; // e.g. 0.8 (80%)
  questions: QuizQuestion[];
}

/**
 * Small structured maths for the Math Companion, rendered without a maths library.
 * A plain string is inline text; the objects draw a column vector, a matrix or a fraction.
 */
export type MathPart =
  | string
  | { vec: string[] }
  | { mat: string[][] }
  | { frac: [string, string] };

export type MathExpr = MathPart[];

export interface LessonBullet {
  /** Bold lead-in, e.g. "The Born Rule". */
  label?: string;
  text: string;
  /** Equation shown under the bullet. */
  math?: MathExpr;
}

export type LessonBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: LessonBullet[] }
  | { type: 'note'; text: string };

export interface ReferenceLink {
  kind: 'video' | 'reading';
  title: string;
  source: string;
  url: string;
  /** For videos that can be played in the app (YouTube id, with an optional segment to watch). */
  youtubeId?: string;
  startSeconds?: number;
  endSeconds?: number;
}

export interface ActivityLink {
  kind: 'game' | 'sim';
  id: string;
}

export interface LessonRecord {
  id: string;
  part: 1 | 2 | 3;
  moduleNumber: number;
  /** Label shown to learners, e.g. "5A" or "8 & 9". */
  moduleLabel: string;
  title: string;
  ahaMoment?: string;
  misconceptionToFix?: string;
  blocks: LessonBlock[];
  /** Plain-text version of the notes (derived from blocks); also what the AI Tutor retrieves from. */
  textNotes: string;
  references: ReferenceLink[];
  videoUrl?: string;
  linkedConceptId: string;
  linkedGameId?: string;
  linkedSimId?: string;
  /** Games and labs that practise this lesson, in suggested order. */
  activities: ActivityLink[];
  quizId?: string;
  /** Only set when a lesson itself needs one (e.g. Frontier ideas is Experimental/Contested). */
  honestyTag?: HonestyTag;
}

export interface GameRecord {
  id: string;
  title: string;
  conceptId: string;
  honestyTag: HonestyTag;
  description: string;
  mechanicsSummary: string;
}

export interface SimulationRecord {
  id: string;
  title: string;
  engineType: EngineType;
  conceptId: string;
  description: string;
}
