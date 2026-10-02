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
  misconceptionTag?: string;
}

export interface QuizRecord {
  id: string;
  lessonId: string;
  passingScore: number; // e.g. 0.8 (80%)
  questions: QuizQuestion[];
}

export interface LessonRecord {
  id: string;
  part: 1 | 2 | 3;
  moduleNumber: number;
  title: string;
  ahaMoment: string;
  misconceptionToFix: string;
  textNotes: string;
  videoUrl?: string;
  linkedConceptId: string;
  linkedGameId?: string;
  linkedSimId?: string;
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
