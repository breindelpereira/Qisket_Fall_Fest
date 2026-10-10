import { QUIZ_PASS_SCORE } from '../content/quizzes';

export type MasteryTier = 'locked' | 'familiar' | 'explored' | 'mastered';

export interface ProgressState {
  completedGames: string[];
  exploredSims: string[];
  conceptGames: Record<string, string[]>;
  conceptSims: Record<string, string[]>;
  quizScores: Record<string, number>; // quizId -> best score [0.0 - 1.0]
  conceptQuizzes: Record<string, string[]>; // conceptId -> ids of the quizzes taken for it
  readLessons: string[]; // lessons marked as read (for lessons that have no quiz)
  conceptMastery: Record<string, MasteryTier>;
  lastUpdated: string;
}

const STORAGE_KEY = 'qisket_progress_v1';

// In-memory fallback for environments without native localStorage (e.g. Node tests)
let memoryStorage: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return memoryStorage[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // ignore
  }
  memoryStorage[key] = value;
}

function removeStorageItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // ignore
  }
  delete memoryStorage[key];
}

// Cached snapshot + listeners let every useProgress() consumer re-render when any one saves.
let snapshot: ProgressState | null = null;
const listeners = new Set<() => void>();
const completionListeners = new Set<(gameId: string) => void>();

function notify(): void {
  snapshot = null;
  listeners.forEach((l) => l());
}

const createDefaultState = (): ProgressState => ({
  completedGames: [],
  exploredSims: [],
  conceptGames: {},
  conceptSims: {},
  quizScores: {},
  conceptQuizzes: {},
  readLessons: [],
  conceptMastery: {},
  lastUpdated: new Date().toISOString(),
});

/** Best score over the quizzes taken for a concept. Also honours old saves that keyed scores by concept. */
export function bestConceptQuizScore(conceptId: string, state: ProgressState): number {
  const ids = state.conceptQuizzes?.[conceptId] ?? [];
  return Math.max(state.quizScores[conceptId] ?? 0, ...ids.map((id) => state.quizScores[id] ?? 0));
}

/**
 * Evaluates mastery tier for a concept based on user evidence:
 * - Familiar: completed relevant game
 * - Explored: completed simulation task
 * - Mastered: quiz passed (the course pass mark, 70%) AND simulation task run
 */
export function deriveConceptMastery(
  conceptId: string,
  state: ProgressState,
  quizThreshold = QUIZ_PASS_SCORE
): MasteryTier {
  const hasGame = (state.conceptGames[conceptId]?.length ?? 0) > 0;
  const hasSim = (state.conceptSims[conceptId]?.length ?? 0) > 0;
  const quizScore = bestConceptQuizScore(conceptId, state);
  const hasPassedQuiz = quizScore >= quizThreshold;

  if (hasPassedQuiz && hasSim) {
    return 'mastered';
  }
  if (hasSim) {
    return 'explored';
  }
  if (hasGame) {
    return 'familiar';
  }
  return 'locked';
}

export const ProgressStore = {
  get: (): ProgressState => {
    try {
      const raw = getStorageItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        ...createDefaultState(),
        ...parsed,
        conceptGames: parsed.conceptGames || {},
        conceptSims: parsed.conceptSims || {},
        conceptMastery: parsed.conceptMastery || {},
        quizScores: parsed.quizScores || {},
        conceptQuizzes: parsed.conceptQuizzes || {},
        readLessons: parsed.readLessons || [],
      };
    } catch {
      return createDefaultState();
    }
  },

  save: (state: ProgressState): void => {
    try {
      state.lastUpdated = new Date().toISOString();
      setStorageItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save progress', e);
    }
    notify();
  },

  /** Stable between changes (required by useSyncExternalStore); treat as read-only. */
  getSnapshot: (): ProgressState => (snapshot ??= ProgressStore.get()),

  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** Called every time a game reports it was completed (including replays), so the app can offer what to do next. */
  subscribeCompletions: (listener: (gameId: string) => void): (() => void) => {
    completionListeners.add(listener);
    return () => {
      completionListeners.delete(listener);
    };
  },

  recordGameCompletion: (gameId: string, conceptId: string): ProgressState => {
    const state = ProgressStore.get();
    if (!state.completedGames.includes(gameId)) {
      state.completedGames.push(gameId);
    }
    if (!state.conceptGames[conceptId]) {
      state.conceptGames[conceptId] = [];
    }
    if (!state.conceptGames[conceptId].includes(gameId)) {
      state.conceptGames[conceptId].push(gameId);
    }
    state.conceptMastery[conceptId] = deriveConceptMastery(conceptId, state);
    ProgressStore.save(state);
    completionListeners.forEach((l) => l(gameId));
    return state;
  },

  recordSimulationRun: (simId: string, conceptId: string): ProgressState => {
    const state = ProgressStore.get();
    if (!state.exploredSims.includes(simId)) {
      state.exploredSims.push(simId);
    }
    if (!state.conceptSims[conceptId]) {
      state.conceptSims[conceptId] = [];
    }
    if (!state.conceptSims[conceptId].includes(simId)) {
      state.conceptSims[conceptId].push(simId);
    }
    state.conceptMastery[conceptId] = deriveConceptMastery(conceptId, state);
    ProgressStore.save(state);
    return state;
  },

  recordQuizScore: (quizId: string, conceptId: string, score: number): ProgressState => {
    const state = ProgressStore.get();
    const currentBest = state.quizScores[quizId] ?? 0;
    if (score > currentBest) {
      state.quizScores[quizId] = score;
    }
    if (!state.conceptQuizzes[conceptId]) {
      state.conceptQuizzes[conceptId] = [];
    }
    if (!state.conceptQuizzes[conceptId].includes(quizId)) {
      state.conceptQuizzes[conceptId].push(quizId);
    }
    state.conceptMastery[conceptId] = deriveConceptMastery(conceptId, state);
    ProgressStore.save(state);
    return state;
  },

  setLessonRead: (lessonId: string, read: boolean): ProgressState => {
    const state = ProgressStore.get();
    const has = state.readLessons.includes(lessonId);
    if (read && !has) state.readLessons.push(lessonId);
    if (!read && has) state.readLessons = state.readLessons.filter((id) => id !== lessonId);
    ProgressStore.save(state);
    return state;
  },

  reset: (): ProgressState => {
    removeStorageItem(STORAGE_KEY);
    memoryStorage = {};
    notify();
    return createDefaultState();
  },
};
